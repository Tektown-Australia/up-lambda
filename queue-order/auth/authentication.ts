import * as jose from 'jose';

const JWKS_URL = process.env.JWKS_URL;

if (!JWKS_URL) {
    throw new Error('The JWKS_URL environment variable is not set.');
}
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URL));
export const verifySaleorSignature = async (jws: string | undefined, rawBody: string) => {
    try {
        if (jws) {
            const [header, _, signature] = jws.split('.');
            await jose.flattenedVerify({ protected: header, payload: rawBody, signature }, JWKS);
        } else {
            throw new Error('Invalid Request due to lack of Saleor signature');
        }
    } catch (e) {
        console.debug(e);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'JWS Verification Failed' }),
        };
    }
};
