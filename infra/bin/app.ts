#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EosAgentsStack } from '../lib/eos-agents-stack';

const app = new cdk.App();
new EosAgentsStack(app, 'EosAgentsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});
