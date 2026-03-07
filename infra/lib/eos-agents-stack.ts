import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { HttpApi, CorsHttpMethod, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import * as path from 'path';

export class EosAgentsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function
    const routeAgentFn = new NodejsFunction(this, 'RouteAgentFn', {
      entry: path.join(__dirname, '../../lambda/route-agent/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(60),
      memorySize: 256,
      bundling: {
        format: OutputFormat.ESM,
        target: 'node20',
        mainFields: ['module', 'main'],
        externalModules: [],
      },
    });

    // IAM policy granting bedrock:InvokeModel
    routeAgentFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: ['*'],
      }),
    );

    // HTTP API Gateway
    const httpApi = new HttpApi(this, 'EosAgentsApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
        allowHeaders: ['Content-Type'],
      },
    });

    // Lambda integration
    const lambdaIntegration = new HttpLambdaIntegration(
      'RouteAgentIntegration',
      routeAgentFn,
    );

    // POST route
    httpApi.addRoutes({
      path: '/api/route-agent',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    });

    // Output
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.apiEndpoint,
    });
  }
}
