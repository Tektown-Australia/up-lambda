import { SQSHandler } from 'aws-lambda';
import { createOrder } from './service/order';

const ORDER_FULLY_PAID = 'OrderFullyPaid';

export const handler: SQSHandler = async (event) => {
  // batch size in SQS is set to 1
  const record = event.Records[0];

  if (record.attributes.MessageGroupId === ORDER_FULLY_PAID) {
    await createOrder(JSON.parse(record.body).order);
  } else {
    throw new Error(`Format of message ${record.body} is not valid`);
  }
};
