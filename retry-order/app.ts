import { Handler } from 'aws-lambda';
import { deleteMessageFromSQS, invokeLambdaFunction, receiveMessagesFromSQS, storeMessageInS3 } from './client';

interface SQSEvent {
  Records: SQSRecord[];
}

interface SQSRecord {
  messageId: string;
  body: string;
  attributes: { MessageGroupId: string };
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
    const messageId = event.Records[0].messageId;
    await storeMessageInS3(messageId, messageBody);
  }
};
