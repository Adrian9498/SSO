import { Router } from "express";
import { test } from "../controllers/controllers.js";

const router = Router();

router.post("/test",test)

router.get("/authorized",(req,res)=>{
    const cookieValue = req.cookies; 
    console.log("cookieValue", cookieValue);
    if(!cookieValue.auth_verification){
        res.send('https://sso-production.up.railway.app/login')
        return 
    }
    res.send("OK")
})

router.get("/logout",(req,res)=>{
    res.redirect("https://visabenefits-auth-test.axa-assistance.us/logout");
})

export default router;