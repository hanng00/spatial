import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class EcrStack extends cdk.Stack {
  public readonly ingestionRepo: ecr.Repository;
  public readonly transformationsDbtRepo: ecr.Repository;
  public readonly dagsterRepo: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR Repository for ingestion container
    this.ingestionRepo = new ecr.Repository(this, 'IngestionRepo', {
      repositoryName: 'spatial/ingestion',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 5,
          description: 'Keep only last 5 images',
        },
      ],
    });

    // ECR Repository for dbt transformations container
    this.transformationsDbtRepo = new ecr.Repository(this, 'TransformationsDbtRepo', {
      repositoryName: 'spatial/transformations-dbt',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 5,
          description: 'Keep only last 5 images',
        },
      ],
    });

    // ECR Repository for Dagster (webserver + daemon)
    this.dagsterRepo = new ecr.Repository(this, 'DagsterRepo', {
      repositoryName: 'spatial/dagster',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 5,
          description: 'Keep only last 5 images',
        },
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'IngestionRepoUri', {
      value: this.ingestionRepo.repositoryUri,
      description: 'Ingestion ECR repository URI',
    });

    new cdk.CfnOutput(this, 'TransformationsDbtRepoUri', {
      value: this.transformationsDbtRepo.repositoryUri,
      description: 'Transformations DBT ECR repository URI',
    });

    new cdk.CfnOutput(this, 'DagsterRepoUri', {
      value: this.dagsterRepo.repositoryUri,
      description: 'Dagster ECR repository URI',
    });
  }
}

