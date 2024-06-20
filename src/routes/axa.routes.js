import { Router } from "express";
import axios from "axios";
import querystring from 'querystring'
import { jwtDecode } from "jwt-decode";
import generatePKCEPair from '../utils/generatePKCEpair.js'
import { CLIENT_ID, CLIENT_SECRET, AUTH0_DOMAIN, REDIRECT_URI, APIHUB_URL } from '../../config.js'
import crypto from 'crypto'
import readFromRedis from '../utils/readFromRedis.cjs'
import saveIntoRedis from '../utils/saveIntoRedis.cjs'

const router = Router();

router.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString()
    });
});

router.get("/try_login", async (_req, res) => {
    const pkce_data = generatePKCEPair();
    const code_verifier = pkce_data.verifier;
    const code_challenge = pkce_data.challenge;
    const uuid = crypto.randomUUID();

    const authorize_url = `https://${AUTH0_DOMAIN}/authorize`;
    
    try{
        await saveIntoRedis(uuid, code_verifier)
    } catch(error){
        console.log("Error realizando el guardado en redis");
    }

    const params = {
        response_type: 'code',
        state: uuid,
        scope: 'openid urn:axa.partners.specific.visagateway.customers.read_only profile email offline_access',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: code_challenge
    };

    const redirectUrl = authorize_url + '?' + new URLSearchParams(params);
    res.redirect(redirectUrl);
})

router.post("/authorized",async (req,res)=>{
    const datos = req.body;

    if(datos.code !== '' && datos.state != ''){
        const tokenUrl = `https://${AUTH0_DOMAIN}/oauth/token`;
        const code_verifier = await readFromRedis(datos.state)

        const data = {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code: datos.code,
            scope: 'openid urn:axa.partners.specific.visagateway.customers.read_only profile email offline_access',
            lang: 'es-ES',
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code_verifier: code_verifier
        };

        try {
            const response = await axios.post(tokenUrl, querystring.stringify(data), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const tokens = response.data;
            const decoded = jwtDecode(tokens.id_token);

            const customerId = decoded.sub.split('|', 2)[1];
            const apihubUrl = `${APIHUB_URL}/apihub/${customerId}/infoCustomer`

            const customer_data_petition = await axios.get(apihubUrl, {
                headers: {
                    Authorization: tokens.access_token
                }
            })
            const customer_data = customer_data_petition.data;

            res.json({status: "OK", ...customer_data, refresh_token: tokens.refresh_token})

            return

        } catch (error) {
            console.error('Error al obtener el token:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Error durante obtención de token' });
            return
        }
    }
    
    res.json({
        status: "OK"
    })

    return
})

router.post("/refresh", async (req, res) => {
    const datos = req.body;

    const tokenUrl = `https://${AUTH0_DOMAIN}/oauth/token`;
    const data = {
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        scope: 'openid urn:axa.partners.specific.visagateway.customers.read_only profile email offline_access',
        lang: 'es-ES',
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: datos.refresh_token
    };

    try {
        const response = await axios.post(tokenUrl, querystring.stringify(data), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const tokens = response.data;
        const decoded = jwtDecode(tokens.id_token);

        const customerId = decoded.sub.split('|', 2)[1];
        const apihubUrl = `${APIHUB_URL}/apihub/${customerId}/infoCustomer`

        const customer_data_petition = await axios.get(apihubUrl, {
            headers: {
                Authorization: tokens.access_token
            }
        })
        const customer_data = customer_data_petition.data;

        res.json({status: "OK", ...customer_data, refresh_token: tokens.refresh_token})

        return
    } catch (error) {
        console.error('Error al obtener el token:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error durante obtención de token' });
        return
    }
})

router.get("/attempt_logout",async (req,res)=>{
    const logoutURL = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${CLIENT_ID}`;
    res.redirect(logoutURL)
})

export default router;