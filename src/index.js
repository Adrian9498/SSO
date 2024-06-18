import express from 'express';
import cors from 'cors';
import router from './routes/axa.routes.js';
import { auth } from 'express-openid-connect';  
import cookieParser from 'cookie-parser'
import session from 'express-session';

const app = express();
const config = {};
const sessionConfig = session({
    secret: 'SUPERMEGACALIFRAGILISTICSPIR', 
    resave: false,
    saveUninitialized: true,
    store: new session.MemoryStore(), 
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 
    }
  })

async function iniciarServidor(){

    app.use(sessionConfig)

    app.use(auth({
        authRequired:false,
        idpLogout:true,
        auth0Logout:true,
        baseURL: 'https://sso-production.up.railway.app/login',
        clientID: '00ZNI7ED2VfOZ4g2M4mgje81lg1EsqDE',
        clientSecret:"sUWDDvELTKmg4sbZ1FebregIZFooao-15A03EcJBhVVjTdPMtX15GDuILjaXpYaQ",
        secret: 'SUPERMEGACALIFRAGILISTICSPIR',
        issuerBaseURL: 'https://visabenefits-auth-test.axa-assistance.us',
        authorizationParams: {
            response_type: 'code',
            redirect_uri: 'https://qa.conciergeforplatinum.com',
            scope: 'openid urn:axa.partners.specific.visagateway.customers.read_only profile email offline_access'
        },
        session: { store: new session.MemoryStore() }
    }));
    app.use(cors({
        origin: 'https://qa.conciergeforplatinum.com',
        credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json())
    app.use(express.urlencoded({extended: false}))
    app.use(router)
    app.listen(3000)
    console.log("Servidor prendido en el puerto 3000")
}

iniciarServidor()