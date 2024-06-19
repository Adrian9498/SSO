import { Router } from "express";
import axios from "axios";
import querystring from 'querystring'
import getCodeVerifier from '../utils/getCodeVerifier.js'
import { jwtDecode } from "jwt-decode";
import generatePKCEPair from '../utils/generatePKCEpair.js'
import crypto from 'crypto'

const router = Router();

const client_id = '00ZNI7ED2VfOZ4g2M4mgje81lg1EsqDE';
const redirect_uri = 'https://qa.conciergeforplatinum.com';
const auth0_domain = 'visabenefits-auth-test.axa-assistance.us';
const client_secret = 'sUWDDvELTKmg4sbZ1FebregIZFooao-15A03EcJBhVVjTdPMtX15GDuILjaXpYaQ';

router.get("/try_login", async (req, res) => {
    const pkce_data = generatePKCEPair();
    const code_verifier = pkce_data.verifier;
    const code_challenge = pkce_data.challenge;
    const uuid = crypto.randomUUID();
    const authorize_url = `https://${auth0_domain}/authorize`;

    console.log("El verifier para: ", uuid, " es: ", code_verifier);

    const params = {
        response_type: 'code',
        state: uuid,
        client_id: client_id,
        redirect_uri: redirect_uri,
        code_challenge_method: 'S256',
        code_challenge: code_challenge,
        code_verifier: code_verifier
    };

    const redirectUrl = authorize_url + '?' + new URLSearchParams(params);
    res.redirect(redirectUrl);
})

router.post("/authorized",async (req,res)=>{
    const cookieValue = req.cookies; 
    const datos = req.body;

    if(!cookieValue.auth_verification){
        res.json({ status: 'https://sso-production.up.railway.app/login' })
        return 
    }
    
    if(datos.code !== ''){
        const tokenUrl = `https://visabenefits-auth-test.axa-assistance.us/oauth/token`;
        const code_verifier = getCodeVerifier(cookieValue.auth_verification);
        const data = {
            grant_type: 'authorization_code',
            client_id: '00ZNI7ED2VfOZ4g2M4mgje81lg1EsqDE',
            code: datos.code,
            scope: 'openid urn:axa.partners.specific.visagateway.customers.read_only profile email offline_access',
            lang: 'es-ES',
            client_secret: 'sUWDDvELTKmg4sbZ1FebregIZFooao-15A03EcJBhVVjTdPMtX15GDuILjaXpYaQ',
            redirect_uri: 'https://qa.conciergeforplatinum.com',
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
            const apihubUrl = `https://apiserviceaxa-qa.conciergeforplatinum.com/apihub/${customerId}/infoCustomer`

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
            res.status(500).json({ error: 'Failed to get token' });
        }
    }
    
    res.json({
        status: "OK"
    })
})

router.post("/refresh", async (req, res) => {
    const datos = req.body;

    const tokenUrl = `https://visabenefits-auth-test.axa-assistance.us/oauth/token`;
    const data = {
        grant_type: 'refresh_token',
        client_id: '00ZNI7ED2VfOZ4g2M4mgje81lg1EsqDE',
        scope: 'openid urn:axa.partners.specific.visagateway.customers.read_only profile email offline_access',
        lang: 'es-ES',
        client_secret: 'sUWDDvELTKmg4sbZ1FebregIZFooao-15A03EcJBhVVjTdPMtX15GDuILjaXpYaQ',
        redirect_uri: 'https://qa.conciergeforplatinum.com',
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
        const apihubUrl = `https://apiserviceaxa-qa.conciergeforplatinum.com/apihub/${customerId}/infoCustomer`

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
        res.status(500).json({ error: 'Failed to get token' });
    }
})

router.get("/logout",(req,res)=>{
    res.redirect("https://visabenefits-auth-test.axa-assistance.us/logout");
})

export default router;