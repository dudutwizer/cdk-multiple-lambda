import * as AWS from 'aws-sdk';

const SOURCE_TABLE = process.env.DDB_APIS!;
const DEST_TABLE = process.env.DDB_TABLE_NAME!;

const dynamodb = new AWS.DynamoDB();

exports.handler = (event: any, context: any, callback: any) => {
  event.Records.forEach((record: any) => {
    console.log('Steam record: ', JSON.stringify(record, null, 2));
    if (record.eventName == 'MODIFY') {
      var newImage = JSON.stringify(record.dynamodb.NewImage); //example of how to read the data
      var oldImage = JSON.stringify(record.dynamodb.OldImage); //example of how to read the data
      console.log(newImage, oldImage);
      // add here logic to putItem in DEST_TABLE
    }
  });
  callback(null, `Successfully processed ${event.Records.length} records.`);
};
