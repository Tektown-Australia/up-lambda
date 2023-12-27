import { SQSEvent, SQSHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const lambda = new AWS.Lambda();
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.BUCKET_NAME as string;
const PROCESS_ORDER_FUNCTION = process.env.PROCESS_ORDER_FUNCTION as string;

export const handler: SQSHandler = async (event) => {
  const messageBody = JSON.stringify(event);
  try {
    await invokeLambdaFunction(messageBody);
  } catch (error) {
    console.log(`Error invoking ${PROCESS_ORDER_FUNCTION}:`, error);
    await handleInvocationError(event, messageBody, error);
  }
};

async function invokeLambdaFunction(messageBody: string) {
  const params = {
    FunctionName: PROCESS_ORDER_FUNCTION,
    InvocationType: 'RequestResponse',
    Payload: messageBody,
  };

  await lambda.invoke(params).promise();
}

async function handleInvocationError(event: SQSEvent, messageBody: string, error: unknown) {
  const messageId = event.Records[0].messageId;
  try {
    await storeMessageInS3(messageId, messageBody);
    console.log(`Message ${messageId} stored in S3 after error:`, error);
  } catch (s3Error) {
    console.error(`Error storing message ${messageId} in S3:`, s3Error);
    throw s3Error;
  }
}

async function storeMessageInS3(messageId: string, messageBody: string) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `failed-messages/${messageId}.txt`,
    Body: messageBody,
  };

  await s3.putObject(params).promise();
}
