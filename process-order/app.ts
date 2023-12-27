import { SQSHandler } from 'aws-lambda';
import { createOrder } from './service/order';

const ORDER_CREATED = 'OrderCreated';

export const handler: SQSHandler = async (event) => {
  // batch size in SQS is set to 1
  const record = event.Records[0];

  if (record.messageId === ORDER_CREATED) {
    await createOrder(JSON.parse(record.body).order);
  }
};
