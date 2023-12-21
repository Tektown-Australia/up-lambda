import axios from 'axios';

const appToken = process.env.GOODCANG_APP_TOKEN as string;
const appKey = process.env.GOODCANG_APP_KEY as string;

export const axiosClient = axios.create({
    baseURL: process.env.ThreePL_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'app-token': appToken,
        'app-key': appKey,
    },
});
