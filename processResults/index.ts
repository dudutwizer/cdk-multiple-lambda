import * as AWS from 'aws-sdk';

const SOURCE_TABLE = process.env.DDB_APIS!;
const DEST_TABLE = process.env.DDB_TABLE_NAME!;

const dynamodb = new AWS.DynamoDB();

exports.handler = async (event: any) => {
  console.log(event);
  const headers = {
    'Access-Control-Allow-Origin': '*',
  };
  // read the event (From Source_Table should be pulled from event object ! ) and do some magic and than put it in the new DEST_TABLE

  return {
    statusCode: 200,
    body: `${SOURCE_TABLE} : ${DEST_TABLE}`,
    headers,
  };
};
