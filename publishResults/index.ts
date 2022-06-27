import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.DDB_TABLE_NAME!;
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event: any) => {
  console.log(TABLE_NAME);
  const headers = {
    'Access-Control-Allow-Origin': '*',
  };

  const APIs = ['API1', 'API2', 'API3'];
  // to build the crawling logic

  const params: AWS.DynamoDB.PutItemInput = {
    TableName: TABLE_NAME,
    Item: {
      api_id: { S: APIs[Math.floor(Math.random() * 3)] },
      hex: { S: Math.floor(Math.random() * 1000).toString() }, // from 0..1000
      alt: { S: Math.floor(Math.random() * 1000).toString() },
      lat: { S: Math.floor(Math.random() * 1000).toString() },
    },
  };

  console.log(params);

  await dynamodb.putItem(params).promise();

  return { statusCode: 200, body: 'success', headers };
};
