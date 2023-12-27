import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const REGION = 'ap-southeast-2';
const sqsUrl = process.env.SQS_URL;

const client = new SQSClient({ region: REGION });
export const sendMessageToSQS = async (message: string, messageGroupId: string) => {
  try {
    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: sqsUrl,
      MessageBody: message,
      MessageGroupId: messageGroupId,
    });

    await client.send(sendMessageCommand);
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to push message ${message} to the queue`);
  }
};
