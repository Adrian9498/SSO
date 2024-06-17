import { Router } from "express";
import { test } from "../controllers/controllers.js";
import axios from "axios";
import querystring from 'querystring'
import getCodeVerifier from '../utils/getCodeVerifier.js'

const router = Router();

router.post("/test",test)

router.post("/authorized",async (req,res)=>{
    const cookieValue = req.cookies; 
    console.log("cookieValue", cookieValue);

    const datos = req.body;
    console.log('Datos recibidos:', datos);

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
            redirect_uri: 'https://qa.conciergeforplatinum.com',
            code_verifier: code_verifier
        };

        console.log("Los datos a enviar son: ", data)

        try {
            const response = await axios.post(tokenUrl, querystring.stringify(data), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const tokens = response.data;
            console.log(tokens)
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