import express from 'express';
import cors from 'cors';
import router from './routes/axa.routes.js';
import cookieParser from 'cookie-parser'
import { NODE_ENV, PORT, CLIENT_ID, AUTH0_DOMAIN } from '../config.js'

const app = express();

async function iniciarServidor(){
    app.use(cors({
        origin: 'https://qa.conciergeforplatinum.com',
        credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json())
    app.use(express.urlencoded({extended: false}))
    app.use(router)
    app.listen(8080)
    console.log(`Servidor prendido en el puerto ${PORT}`)
    console.log('Environment Variables:', {
      Ambiente: NODE_ENV,
      Puerto: PORT,
      Cliente: CLIENT_ID,
      Dominio: AUTH0_DOMAIN
    });
}

iniciarServidor()