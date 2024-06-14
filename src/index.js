import express from 'express';
import cors from 'cors';
import router from './routes/axa.routes.js';
import { auth } from 'express-openid-connect';  
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import session from 'express-session';

const app = express();
const config = {
    authRequired:false,
    auth0Logout:true,
    baseURL: 'https://sso-production.up.railway.app/login',
    clientID: '00ZNI7ED2VfOZ4g2M4mgje81lg1EsqDE',
    clientSecret:"sUWDDvELTKmg4sbZ1FebregIZFooao-15A03EcJBhVVjTdPMtX15GDuILjaXpYaQ",
    secret: 'SUPERMEGACALIFRAGILISTICSPIR',
    issuerBaseURL: 'https://visabenefits-auth-test.axa-assistance.us',
    authorizationParams: {
        response_type: 'code',
        redirect_uri: 'https://qa.conciergeforplatinum.com'
    },
    session: (
        {
            cookie: {
                sameSite: 'None', 
                secure: false
            }
        })
};



async function iniciarServidor(){
    
    app.use(morgan('combined'));
    app.use(auth(config));
    app.use(cors({
        origin: 'https://qa.conciergeforplatinum.com', // Reemplaza con el origen de tu aplicación React
        credentials: true // Permite el envío de cookies y encabezados de autorización
    }));
    app.use(cookieParser());
    app.use(express.json())
    app.use(express.urlencoded({extended: false}))
    app.use(router)
    app.listen(3000)
    console.log("Servidor prendido en el puerto 3000")
}

iniciarServidor()