import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { InvocationType, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const REGION = 'ap-southeast-2';

const BUCKET_NAME = process.env.BUCKET_NAME as string;
const PROCESS_ORDER_FUNCTION = process.env.PROCESS_ORDER_FUNCTION as string;
const QUEUE_URL = process.env.QUEUE_URL as string;

const s3Client = new S3Client({ region: REGION });

export const storeMessageInS3 = async (messageId: string, messageBody: string) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `failed-messages/${messageId}.txt`,
    Body: messageBody,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
};

const lambdaClient = new LambdaClient({ region: REGION });

export const invokeLambdaFunction = async (messageBody: string) => {
  const params = {
    FunctionName: PROCESS_ORDER_FUNCTION,
    InvocationType: InvocationType.RequestResponse,
    Payload: messageBody,
  };

  const command = new InvokeCommand(params);
  await lambdaClient.send(command);
};

const sqsClient = new SQSClient({ region: REGION });

export const receiveMessagesFromSQS = async () => {
  const params = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 1,
  };

  const command = new ReceiveMessageCommand(params);

  const { Messages } = await sqsClient.send(command);

  let event;
  let receiptHandle;

  if (Messages && Messages.length > 0) {
    const { Body, MessageId, ReceiptHandle } = Messages[0];
    const message = { messageId: MessageId as string, body: Body as string };
    event = { Records: [message] };
    receiptHandle = ReceiptHandle as string;
  }
  return { event, receiptHandle };
};

export const deleteMessageFromSQS = async (receiptHandle: string) => {
  const params = {
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  };

  const command = new DeleteMessageCommand(params);

  try {
    await sqsClient.send(command);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
