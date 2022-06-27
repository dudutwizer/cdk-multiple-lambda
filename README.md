# CDK Multiple Lambda

POC of CDK app compiles and deploys multiple lambda functions. Dynamo streams trigger these functions

# Architecture

[CDK main app](lib/api_crawler_with_lambda-stack.ts)

Microservice 1 [Publish Results](publishResults/index.ts) --> Dynamo DB Table (flightData) --> Dynamo DB Stream --> Microservice 2 [Process Results](processResults/index.ts) --> DynamoDB Table (api_results) --> DynamoDB Stream --> Microservice 3 [pushResults](pushResults/index.ts)

# How to run

- Install CDK
- Install Node.JS

```bash
git clone <repo>
npm install
cdk ls
cdk deploy
```
