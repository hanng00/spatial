import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface EcsTasksStackProps extends cdk.StackProps {
  ecrRepositories: {
    ingestion: ecr.Repository;
    transformationsDbt: ecr.Repository;
  };
}

export class EcsTasksStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly vpc: ec2.Vpc;
  public readonly ingestionTaskDef: ecs.FargateTaskDefinition;
  public readonly transformationsDbtTaskDef: ecs.FargateTaskDefinition;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly secretsArn: string;

  constructor(scope: Construct, id: string, props: EcsTasksStackProps) {
    super(scope, id, props);

    // Create minimal VPC with only public subnets (cheaper, no NAT)
    // Workers need internet to reach MotherDuck
    this.vpc = new ec2.Vpc(this, 'SpatialVpc', {
      maxAzs: 2,
      natGateways: 0, // No NAT = cheaper
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // Security group for ECS tasks
    this.securityGroup = new ec2.SecurityGroup(this, 'TasksSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ECS worker tasks',
      allowAllOutbound: true, // Need to reach MotherDuck
    });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'SpatialCluster', {
      vpc: this.vpc,
      clusterName: 'spatial-cluster',
      containerInsightsV2: ecs.ContainerInsights.DISABLED, // Cheaper
      enableFargateCapacityProviders: true,
    });

    // Secrets in Secrets Manager for MotherDuck token
    const secrets = new secretsmanager.Secret(this, 'SpatialSecrets', {
      secretName: 'spatial/secrets',
      description: 'Secrets for spatial data pipeline',
      secretObjectValue: {
        MOTHERDUCK_ACCESS_TOKEN: cdk.SecretValue.unsafePlainText('PLACEHOLDER_REPLACE_ME'),
        DATABASE_NAME: cdk.SecretValue.unsafePlainText('spatial_dagster'),
      },
    });
    this.secretsArn = secrets.secretArn;

    // Shared task execution role
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Allow reading secrets
    secrets.grantRead(executionRole);

    // Shared task role (for the container itself)
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Allow task role to read secrets (for runtime access)
    secrets.grantRead(taskRole);

    // Log group for all tasks
    const logGroup = new logs.LogGroup(this, 'TasksLogGroup', {
      logGroupName: '/ecs/spatial-tasks',
      retention: logs.RetentionDays.ONE_WEEK, // Cheap retention
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ============================================
    // Ingestion Task Definition (Fargate Spot)
    // ============================================
    this.ingestionTaskDef = new ecs.FargateTaskDefinition(this, 'IngestionTaskDef', {
      family: 'spatial-ingestion',
      memoryLimitMiB: 2048,
      cpu: 512,
      executionRole,
      taskRole,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    this.ingestionTaskDef.addContainer('ingestion', {
      containerName: 'container', // Keep as 'container' for ContainerExecutor compatibility
      image: ecs.ContainerImage.fromEcrRepository(props.ecrRepositories.ingestion, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'ingestion',
      }),
      secrets: {
        MOTHERDUCK_ACCESS_TOKEN: ecs.Secret.fromSecretsManager(secrets, 'MOTHERDUCK_ACCESS_TOKEN'),
        DATABASE_NAME: ecs.Secret.fromSecretsManager(secrets, 'DATABASE_NAME'),
      },
      essential: true,
    });

    // ============================================
    // Transformations DBT Task Definition (Fargate Spot)
    // ============================================
    this.transformationsDbtTaskDef = new ecs.FargateTaskDefinition(this, 'TransformationsDbtTaskDef', {
      family: 'spatial-transformations-dbt',
      memoryLimitMiB: 2048,
      cpu: 512,
      executionRole,
      taskRole,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    this.transformationsDbtTaskDef.addContainer('transformations-dbt', {
      containerName: 'container', // Keep as 'container' for ContainerExecutor compatibility
      image: ecs.ContainerImage.fromEcrRepository(props.ecrRepositories.transformationsDbt, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'transformations-dbt',
      }),
      secrets: {
        MOTHERDUCK_ACCESS_TOKEN: ecs.Secret.fromSecretsManager(secrets, 'MOTHERDUCK_ACCESS_TOKEN'),
        DATABASE_NAME: ecs.Secret.fromSecretsManager(secrets, 'DATABASE_NAME'),
      },
      essential: true,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS cluster name',
    });

    new cdk.CfnOutput(this, 'ClusterArn', {
      value: this.cluster.clusterArn,
      description: 'ECS cluster ARN',
    });

    new cdk.CfnOutput(this, 'IngestionTaskDefArn', {
      value: this.ingestionTaskDef.taskDefinitionArn,
      description: 'Ingestion task definition ARN',
    });

    new cdk.CfnOutput(this, 'TransformationsDbtTaskDefArn', {
      value: this.transformationsDbtTaskDef.taskDefinitionArn,
      description: 'Transformations DBT task definition ARN',
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
    });

    new cdk.CfnOutput(this, 'PublicSubnets', {
      value: this.vpc.publicSubnets.map(s => s.subnetId).join(','),
      description: 'Public subnet IDs (comma-separated)',
    });

    new cdk.CfnOutput(this, 'SecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      description: 'Security group ID for ECS tasks',
    });

    new cdk.CfnOutput(this, 'SecretsArn', {
      value: this.secretsArn,
      description: 'Secrets Manager ARN',
    });
  }
}

