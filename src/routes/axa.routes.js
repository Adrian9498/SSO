import { Router } from "express";
import { test } from "../controllers/controllers.js";

const router = Router();

router.post("/test",test)

router.get("/authorized",(req,res)=>{
    const cookieValue = req.cookies; 

    if(!cookieValue.auth_verification){
        res.send('http://localhost:3000/login')
        return 
    }
    res.send("OK")
})

export default router;