import { SQSHandler } from 'aws-lambda';
import { createOrder } from './service/order';

export const handler: SQSHandler = async (event) => {
    const record = event.Records[0];

    if (record.messageId === 'order-created') {
        await createOrder(JSON.parse(record.body).order);
    }

    return new Response('succeed ', { headers: { 'Content-Type': 'application/json' } });
};
