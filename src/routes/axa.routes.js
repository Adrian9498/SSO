import { Router } from "express";
import { test } from "../controllers/controllers.js";

const router = Router();

router.post("/test",test)

router.get("/authorized",(req,res)=>{
    const cookieValue = req.cookies; 

    if(!cookieValue.auth_verification){
        res.send('https://sso-production.up.railway.app/login')
        return 
    }
    res.send("OK")
})

export default router;