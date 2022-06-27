import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WgetLayer } from 'cdk-lambda-layer-wget';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LambdaToDynamoDB } from '@aws-solutions-constructs/aws-lambda-dynamodb';
import { AttributeType, StreamViewType } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaSubminute } from 'cdk-lambda-subminute';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as path from 'path';

export class ApiCrawlerWithLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Publish Results (Crawling from APIs)
    const publishResults = new LambdaToDynamoDB(this, 'publishResults', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('publishResults', {
          bundling: {
            command: [
              'bash',
              '-c',
              'npm install && npm run build  && cp -rT /asset-input /asset-output/', //The asset path will be mounted at /asset-input. The Docker container is responsible for putting content at /asset-output. The content at /asset-output will be zipped and used as Lambda code.
            ],
            image: lambda.Runtime.NODEJS_16_X.bundlingImage,
            user: 'root',
          },
        }),
      },
      dynamoTableProps: {
        tableName: 'table1',
        partitionKey: { name: 'api_id', type: AttributeType.STRING },
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
      },
    });

    const cronJob = 'cron(*/1 * ? * * *)'; // Statemachine Cron every minute (not the function)
    const subminuteMaster = new LambdaSubminute(this, 'LambdaSubminute', {
      targetFunction: publishResults.lambdaFunction,
      cronjobExpression: cronJob,
      frequency: 15,
      intervalTime: 4,
    });

    // Process Results
    const processResults = new LambdaToDynamoDB(this, 'processResults', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('processResults', {
          bundling: {
            command: [
              'bash',
              '-c',
              'npm install && npm run build  && cp -rT /asset-input /asset-output/', //The asset path will be mounted at /asset-input. The Docker container is responsible for putting content at /asset-output. The content at /asset-output will be zipped and used as Lambda code.
            ],
            image: lambda.Runtime.NODEJS_16_X.bundlingImage,
            user: 'root',
          },
        }),
      },
      dynamoTableProps: {
        tableName: 'api_results',
        partitionKey: { name: 'id', type: AttributeType.STRING },
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
      },
    });

    // Adding trigger change in the source
    processResults.lambdaFunction.addEventSource(
      new DynamoEventSource(publishResults.dynamoTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    processResults.lambdaFunction.addEnvironment(
      'DDB_APIS',
      publishResults.dynamoTable.tableName
    );

    // Push results to the remote APIs
    const pushResults = new LambdaToDynamoDB(this, 'pushResults', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('pushResults', {
          bundling: {
            command: [
              'bash',
              '-c',
              'npm install && npm run build && cp -rT /asset-input /asset-output/', //The asset path will be mounted at /asset-input. The Docker container is responsible for putting content at /asset-output. The content at /asset-output will be zipped and used as Lambda code.
            ],
            image: lambda.Runtime.NODEJS_16_X.bundlingImage,
            user: 'root',
          },
        }),
        layers: [new WgetLayer(this, 'WgetLayer')],
      },
      existingTableObj: processResults.dynamoTable,
    });

    pushResults.lambdaFunction.addEventSource(
      new DynamoEventSource(processResults.dynamoTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );
  }
}
