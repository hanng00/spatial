import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Aurora DSQL is very new (re:Invent 2024) and CDK L2 constructs don't exist yet.
 * We use CloudFormation L1 constructs directly.
 * 
 * DSQL is serverless PostgreSQL that scales to zero - perfect for Dagster metadata.
 * 
 * Note: DSQL is in preview and may have limited region availability.
 * As of Dec 2024, available in: us-east-1, us-east-2
 */
export class DsqlStack extends cdk.Stack {
  public readonly cluster: cdk.CfnResource;
  public readonly clusterEndpoint: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DSQL Cluster using L1 CloudFormation construct
    // DSQL doesn't require VPC - it's a fully managed serverless service
    this.cluster = new cdk.CfnResource(this, 'DsqlCluster', {
      type: 'AWS::DSQL::Cluster',
      properties: {
        DeletionProtectionEnabled: false, // Set to true for production
        Tags: [
          {
            Key: 'Project',
            Value: 'spatial',
          },
          {
            Key: 'Environment',
            Value: 'production',
          },
        ],
      },
    });

    // Get cluster attributes
    this.clusterEndpoint = this.cluster.getAtt('Endpoint').toString();

    // Outputs
    new cdk.CfnOutput(this, 'DsqlClusterEndpoint', {
      value: this.clusterEndpoint,
      description: 'DSQL cluster endpoint for Dagster connection',
    });
  }
}

