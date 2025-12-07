import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DagsterStackProps extends cdk.StackProps {
  dagsterRepo: ecr.Repository;
  dsqlEndpoint: string;
  ecsCluster: ecs.Cluster;
  taskDefinitions: {
    ingestion: ecs.FargateTaskDefinition;
    transformationsDbt: ecs.FargateTaskDefinition;
  };
  vpc: ec2.Vpc;
}

export class DagsterStack extends cdk.Stack {
  public readonly dagsterUrl: string;

  constructor(scope: Construct, id: string, props: DagsterStackProps) {
    super(scope, id, props);

    // Secrets for Dagster (basic auth + MotherDuck)
    const dagsterSecrets = new secretsmanager.Secret(this, 'DagsterSecrets', {
      secretName: 'spatial/dagster-secrets',
      description: 'Secrets for Dagster UI',
      secretObjectValue: {
        // Basic auth credentials - CHANGE THESE!
        BASIC_AUTH_USERNAME: cdk.SecretValue.unsafePlainText('admin'),
        BASIC_AUTH_PASSWORD: cdk.SecretValue.unsafePlainText('CHANGE_ME_SECURE_PASSWORD'),
        // MotherDuck token (same as workers)
        MOTHERDUCK_ACCESS_TOKEN: cdk.SecretValue.unsafePlainText('PLACEHOLDER_REPLACE_ME'),
        DATABASE_NAME: cdk.SecretValue.unsafePlainText('spatial_dagster'),
      },
    });

    // IAM Role for App Runner to access ECR
    const accessRole = new iam.Role(this, 'AppRunnerAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
    });
    props.dagsterRepo.grantPull(accessRole);

    // IAM Role for App Runner instance (runtime)
    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });

    // Grant instance role permissions
    dagsterSecrets.grantRead(instanceRole);

    // Grant permission to run ECS tasks (for ContainerExecutor)
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ecs:RunTask',
        'ecs:DescribeTasks',
        'ecs:StopTask',
      ],
      resources: [
        props.taskDefinitions.ingestion.taskDefinitionArn,
        props.taskDefinitions.transformationsDbt.taskDefinitionArn,
        `arn:aws:ecs:${this.region}:${this.account}:task/${props.ecsCluster.clusterName}/*`,
      ],
    }));

    // Grant permission to pass task roles
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['iam:PassRole'],
      resources: [
        props.taskDefinitions.ingestion.executionRole!.roleArn,
        props.taskDefinitions.ingestion.taskRole!.roleArn,
        props.taskDefinitions.transformationsDbt.executionRole!.roleArn,
        props.taskDefinitions.transformationsDbt.taskRole!.roleArn,
      ],
    }));

    // Grant DSQL access (IAM auth)
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dsql:DbConnect', 'dsql:DbConnectAdmin'],
      // DSQL CloudFormation resource does not expose an ARN; allow on all for now
      resources: ['*'],
    }));

    // Grant CloudWatch Logs access for reading ECS task logs
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:GetLogEvents',
        'logs:FilterLogEvents',
      ],
      resources: ['*'],
    }));

    // App Runner Service for Dagster
    const appRunnerService = new apprunner.CfnService(this, 'DagsterService', {
      serviceName: 'spatial-dagster',
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        autoDeploymentsEnabled: true,
        imageRepository: {
          imageRepositoryType: 'ECR',
          imageIdentifier: `${props.dagsterRepo.repositoryUri}:latest`,
          imageConfiguration: {
            port: '8080', // nginx proxy port
            runtimeEnvironmentVariables: [
              { name: 'DAGSTER_ENVIRONMENT', value: 'production' },
              { name: 'ECS_CLUSTER', value: props.ecsCluster.clusterName },
              { name: 'ECS_SUBNETS', value: props.vpc.publicSubnets.map(s => s.subnetId).join(',') },
              { name: 'AWS_REGION', value: this.region },
              { name: 'USE_SECRETS_MANAGER', value: 'true' },
              { name: 'SECRETS_MANAGER_SECRET_NAME', value: dagsterSecrets.secretName },
              // DSQL connection
              { name: 'DSQL_CLUSTER_ENDPOINT', value: props.dsqlEndpoint },
              // Task definitions for ContainerExecutor
              { 
                name: 'ECS_TASK_DEFINITIONS', 
                value: `ingestion=${props.taskDefinitions.ingestion.taskDefinitionArn},transformations_dbt=${props.taskDefinitions.transformationsDbt.taskDefinitionArn}` 
              },
              { name: 'USE_FARGATE_SPOT', value: 'true' },
            ],
            runtimeEnvironmentSecrets: [
              {
                name: 'BASIC_AUTH_USERNAME',
                value: `${dagsterSecrets.secretArn}:BASIC_AUTH_USERNAME::`,
              },
              {
                name: 'BASIC_AUTH_PASSWORD',
                value: `${dagsterSecrets.secretArn}:BASIC_AUTH_PASSWORD::`,
              },
              {
                name: 'MOTHERDUCK_ACCESS_TOKEN',
                value: `${dagsterSecrets.secretArn}:MOTHERDUCK_ACCESS_TOKEN::`,
              },
            ],
          },
        },
      },
      instanceConfiguration: {
        cpu: '1024', // 1 vCPU
        memory: '2048', // 2 GB
        instanceRoleArn: instanceRole.roleArn,
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/health', // nginx health endpoint
        interval: 20,
        timeout: 10,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
      // Auto-scaling: min 0 for scale-to-zero, max 1 for cost control
      autoScalingConfigurationArn: this.createAutoScalingConfig(),
    });

    // Get the service URL
    this.dagsterUrl = `https://${appRunnerService.attrServiceUrl}`;

    // Outputs
    new cdk.CfnOutput(this, 'DagsterServiceUrl', {
      value: this.dagsterUrl,
      description: 'Dagster UI URL (basic auth protected)',
    });

    new cdk.CfnOutput(this, 'DagsterSecretsArn', {
      value: dagsterSecrets.secretArn,
      description: 'Dagster secrets ARN - UPDATE THESE VALUES!',
    });
  }

  private createAutoScalingConfig(): string {
    // App Runner does not support minSize=0; set minSize=1 to minimize cost
    const autoScalingConfig = new apprunner.CfnAutoScalingConfiguration(this, 'DagsterAutoScaling', {
      autoScalingConfigurationName: 'spatial-dagster-autoscaling',
      maxConcurrency: 100,
      maxSize: 1, // Cap at 1 instance to control cost
      minSize: 1, // Smallest allowed by App Runner
    });

    return autoScalingConfig.attrAutoScalingConfigurationArn;
  }
}

