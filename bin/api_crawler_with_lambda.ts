#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiCrawlerWithLambdaStack } from '../lib/api_crawler_with_lambda-stack';

const app = new cdk.App();
new ApiCrawlerWithLambdaStack(app, 'ApiCrawlerWithLambdaStack');
