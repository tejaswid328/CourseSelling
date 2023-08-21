import jwt from 'jsonwebtoken';
export const secretKey = 'T3sT1ng'; //This is key for encryption and decryption

//Generally it's a middleware where without next function code hangs or can't move forward
import {Request,Response,NextFunction} from "express";

//This is authentication
export const authJWT=(req:Request,res:Response,next:NextFunction)=>{
    //Getting authHeader from header section
    const authHeader=req.headers.authorization;
    if(authHeader)
    {
        //Splitting token as we have bearer+token
        const token=authHeader.split(' ')[1];
        //This is verify function
        jwt.verify(token,secretKey,(err,verifiedJwt)=>{
            if(err)
            {
                return res.sendStatus(403);
            }
            if(!verifiedJwt)
            {
                return res.sendStatus(403);
            }
            //This is a special case in typescript as we can
            // check type of our data.
            if(typeof verifiedJwt === "string")
            {
                return res.sendStatus(403);
            }
            //This is just appending id to header map
            req.headers["userId"]=verifiedJwt.id;
            next();
        })
    }
    else
    {
        res.status(401).json({message:"Authentication Failed"});
    }
}
