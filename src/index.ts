import express, { json } from "express";
import cors from "cors";
import axios from "axios";
import { fileName,versions, fileExtensions, code_body } from "./util/code_body/code_body";
// import { createClient } from "redis";

// const redis = createClient();

// redis.on('error', (err) => console.log('Redis Client Error', err));

// async function connectRedis() {
//     await redis.connect();
// }

// connectRedis().catch(console.error);

export interface submitReq {
    selectedLanguage:string,
    code:string,
    userId:string
}


const app = express();
app.use(cors());
app.use(express.json())
app.get("/",(req,res)=>{
    return res.json({message:"This is a get request"})
})

app.post("/submit-code",async(req,res)=>{
    try {
    const {code,selectedLanguage,userId}:submitReq = req.body;
    let selectedlanguage ;
    let version;
    if(!versions.hasOwnProperty(selectedLanguage)){
        version = versions[selectedLanguage];
        console.log("Please select any other language !!");
        return res.status(300).json({message:"Please select any other language !!"});
    }
    version = versions[selectedLanguage];
    console.log("This reaches here !!");
    if(selectedLanguage === "c++"){
        selectedlanguage = "cpp"
    }else{
        selectedlanguage = selectedLanguage;
    }
    var extension = fileExtensions[selectedlanguage];
    
    const filename = `index.${extension}`;
    console.log("This is file name ",filename,"version ",version);
    let dummy_code = code_body;
    dummy_code.language = selectedlanguage;
    dummy_code.files[0].name = filename;
    dummy_code.version = version;
    dummy_code.files[0].content = code;
    console.log(dummy_code);

        // console.log(code);
    // await redis.rPush("codeQ", JSON.stringify({ code_body, userId }));
    
    // var bodyStr = await redis.lPop("codeQ");
    // if (bodyStr) {
        // const body = JSON.parse(bodyStr);
        // const codeContent = body.code_body.files[0].content;
        // const retrievedUserId = body.userId;
        // // console.log(body);
        // console.log(codeContent, retrievedUserId);
        // const cody  = await JSON.stringify(codeContent);
        // console.log(cody);
        // 
        // @ts-ignore
        // const body = JSON.parse(bodyStr);
        // const codeContent = body.code_body;
        // const retrievedUserId = body.userId;
        //docker start my-redis &&
        // console.log("code_body ",code_body);
        // console.log(codeContent,retrievedUserId);
        const submit = await axios.post("http://localhost:2000/api/v2/execute", code_body);
        console.log(submit.data);
        return res.json({message:"This reached herre",result:submit.data,userId})
        // return res.json({message:"Pushed from middleware",result:submit.data,userId})
    // }
    } catch (error) {
        console.log(error);
        return res.status(400).json({messge:error})
    }
    // await redis.hSet(userId,{"code":code,"language":selectedLanguage}); 
    //   const redisPop = await redis.lPop();



      
})
app.listen(4000,()=>console.log("Server running on 4000 !"))