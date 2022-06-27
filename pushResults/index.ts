import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.DDB_TABLE_NAME!;
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
  };

  const params: AWS.DynamoDB.PutItemInput = {
    TableName: TABLE_NAME,
    Item: {
      api_id: { S: '1' },
    },
  };

  dynamodb.putItem(params);

  return { statusCode: 200, body: 'success', headers };
};
