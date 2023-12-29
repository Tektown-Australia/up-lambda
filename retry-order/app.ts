import { Handler } from 'aws-lambda';
import { deleteMessageFromSQS, invokeLambdaFunction, receiveMessagesFromSQS, storeMessageInS3 } from './client';

interface SQSEvent {
  Records: SQSRecord[];
}

interface SQSRecord {
  messageId: string;
  body: string;
}

export const handler: Handler = async () => {
  let emptyQueue = false;
  while (!emptyQueue) {
    const { event, receiptHandle } = await receiveMessagesFromSQS();
    if (event && receiptHandle) {
      await retryOrder(event);
      await deleteMessageFromSQS(receiptHandle);
    } else {
      emptyQueue = true;
    }
  }
};

const retryOrder = async (event: SQSEvent) => {
  const messageBody = JSON.stringify(event);
  try {
    await invokeLambdaFunction(messageBody);
  } catch (error) {
    await handleInvocationError(event, messageBody, error);
  }
};

const handleInvocationError = async (event: SQSEvent, messageBody: string, error: unknown) => {
  const messageId = event.Records[0].messageId;
  try {
    await storeMessageInS3(messageId, messageBody);
    console.log(`Message ${messageId} stored in S3 after error:`, error);
  } catch (s3Error) {
    console.error(`Error storing message ${messageId} in S3:`, s3Error);
  }
};
