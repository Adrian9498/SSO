import { Router } from "express";
import { test } from "../controllers/controllers.js";

const router = Router();

router.post("/test",test)

router.get("/authorized",(req,res)=>{
    const cookieValue = req.cookies; 
    console.log("cookieValue", cookieValue);
    if(!cookieValue.auth_verification){
        res.send('https://visabenefits-auth-test.axa-assistance.us/login')
        return 
    }
    res.send("OK")
})

export default router;