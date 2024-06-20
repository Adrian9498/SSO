import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({
    path: resolve(__dirname, `application.env`)
});


export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const CLIENT_ID = process.env.CLIENT_ID;
export const REDIRECT_URI = process.env.REDIRECT_URI;
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const APIHUB_URL = process.env.APIHUB_URL;