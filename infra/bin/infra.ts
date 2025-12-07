#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/ecr-stack';
import { DsqlStack } from '../lib/dsql-stack';
import { EcsTasksStack } from '../lib/ecs-tasks-stack';
import { DagsterStack } from '../lib/dagster-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

// Stack 1: ECR Repositories for container images
const ecrStack = new EcrStack(app, 'SpatialEcrStack', {
  env,
  description: 'ECR repositories for spatial container images',
});

// Stack 2: DSQL (Serverless PostgreSQL) for Dagster metadata
const dsqlStack = new DsqlStack(app, 'SpatialDsqlStack', {
  env,
  description: 'Aurora DSQL serverless PostgreSQL for Dagster metadata',
});

// Stack 3: ECS Task Definitions for worker containers (Fargate Spot)
const ecsTasksStack = new EcsTasksStack(app, 'SpatialEcsTasksStack', {
  env,
  ecrRepositories: {
    ingestion: ecrStack.ingestionRepo,
    transformationsDbt: ecrStack.transformationsDbtRepo,
  },
  description: 'ECS task definitions for data pipeline workers',
});
ecsTasksStack.addDependency(ecrStack);

// Stack 4: App Runner for Dagster (webserver + daemon)
const dagsterStack = new DagsterStack(app, 'SpatialDagsterStack', {
  env,
  dagsterRepo: ecrStack.dagsterRepo,
  dsqlEndpoint: dsqlStack.clusterEndpoint,
  ecsCluster: ecsTasksStack.cluster,
  taskDefinitions: {
    ingestion: ecsTasksStack.ingestionTaskDef,
    transformationsDbt: ecsTasksStack.transformationsDbtTaskDef,
  },
  vpc: ecsTasksStack.vpc,
  description: 'App Runner service for Dagster UI with basic auth',
});
dagsterStack.addDependency(ecrStack);
dagsterStack.addDependency(dsqlStack);
dagsterStack.addDependency(ecsTasksStack);

app.synth();
