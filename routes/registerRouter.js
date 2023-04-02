var express=require("express");
var router=express.Router();
const request=require("request");
const axios = require('axios');

/*get the access token*/
const generateToken=async(req,res,next)=>{
    var postData=req.body.values
    let url="https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth=`Basic ${new Buffer.from(`${postData.consumerKey}:${postData.consumerSecret}`).toString("base64")}`
    await axios.get(url,{
        headers:{
            "Content-Type":"application/json",
            "Authorization":auth
        }
    })
    .then((response)=>{
        res.locals.access_token=response.data.access_token
        next()
    })
    .catch((error)=>{
        res.send(error)
    })
}

router.get("/",(req,res)=>{
    res.send("server is working ok.")
})

router.post("/",generateToken,async(req,res)=>{
    var postData=req.body.values
    let access_token=res.locals.access_token
    const url= 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl'
    const auth = `Bearer ${access_token}`
    const data={'ShortCode':postData.payBill,'ResponseType': 'Completed','ConfirmationURL':postData.confirmationUrl,'ValidationURL': postData.validationUrl}
    request.post(
        {
            url:url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            },
            json:data
        },
        (error,response,body)=>{
            if(error){
                res.send(error)
            }else{
                res.status(200).json(body)
            }
        }
    )
})
module.exports = router;
