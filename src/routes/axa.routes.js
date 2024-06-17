import { Router } from "express";
import { test } from "../controllers/controllers.js";
import axios from "axios";
import querystring from 'querystring'
import getCodeVerifier from '../utils/getCodeVerifier.js'
import { jwtDecode } from "jwt-decode";

const router = Router();

router.post("/test",test)

router.post("/authorized",async (req,res)=>{
    const cookieValue = req.cookies; 
    const datos = req.body;

    if(!cookieValue.auth_verification){
        res.send('https://sso-production.up.railway.app/login')
        return 
    }
    
    if(datos.code !== ''){
        const tokenUrl = `https://visabenefits-auth-test.axa-assistance.us/oauth/token`;
        const code_verifier = getCodeVerifier(cookieValue.auth_verification);
        const data = {
            grant_type: 'authorization_code',
            client_id: '00ZNI7ED2VfOZ4g2M4mgje81lg1EsqDE',
            code: datos.code,
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

            console.log("Respuesta de axa: ", tokens);
            const customerId = decoded.sub.split('|', 2)[1];
            const apihubUrl = `https://apiserviceaxa-qa.conciergeforplatinum.com/apihub/${customerId}/infoCustomer`

            console.log("Customer id: ", customerId);
            console.log("Token: ",tokens.access_token);

            // const customer_data_petition = await axios.get(apihubUrl, {
            //     headers: {
            //         Authorization: `Bearer ${tokens.access_token}`
            //     }
            // })
            // const customer_data = customer_data_petition.data;

            // console.log(customer_data);

        } catch (error) {
            console.error('Error al obtener el token:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to get token' });
        }
    }
    
    res.send("OK")
})

router.get("/logout",(req,res)=>{
    res.redirect("https://visabenefits-auth-test.axa-assistance.us/logout");
})

export default router;