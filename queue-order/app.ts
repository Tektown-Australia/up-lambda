import { APIGatewayProxyHandler } from 'aws-lambda';
import { verifySaleorSignature } from './auth/authentication';
import { sendMessageToSQS } from './sqs/client';

export const handler: APIGatewayProxyHandler = async (event) => {
    const jws = event.headers['saleor-signature'];
    const body = event.body || '';
    await verifySaleorSignature(jws, body);

    const messageGroupId = JSON.parse(body).__typename;
    await sendMessageToSQS(body, messageGroupId);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Order is already queued' }),
    };
};
