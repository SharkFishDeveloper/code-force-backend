import express, { json } from "express";
import cors from "cors";
import axios, { all } from "axios";
// import { fileName,versions, fileExtensions, code_body } from "./util/code_body/code_body";
// import ip from "ip";


interface contestBody {
allproblems?:number,
contest:string,
score:number,
solvedProblems?:number,
time:number,
user:string,
username:string
}

import { createClient } from "redis";
import { PISTON_URL } from "./util/PISTON_URL";

const redis = createClient();

redis.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
    await redis.connect();
}

connectRedis().catch(console.error);

export interface submitReq {
    selectedLanguage:string,
    code:string,
    userId:string,
    stdin?:string
}


const app = express();
app.use(cors());
app.use(express.json())
app.get("/",(req,res)=>{
    return res.json({message:"This is a get request"})
})


    // {
    //     "language": "c",
    //     "code": "#include <stdio.h>\r\nint main() {    \r\n\r\n    int number1, number2, sum;\r\n    \r\n    printf(\"Enter two integers: \\");\r\n    scanf(\"%d %d\", &number1, &number2);\r\n\r\n    // calculate the sum\r\n    sum = number1 + number2;      \r\n    \r\n    printf(\"%d + %d = %d\", number1, number2, sum);\r\n    return 0;\r\n}\r\n",
    //     "stdin": "1\n100"
    //   }  


app.post("/submit-code",async(req,res)=>{

    try {
    const {code,selectedLanguage,userId,stdin}:submitReq = req.body;
    console.log("CODE",code, selectedLanguage,userId)
    // let selectedlanguage ;
    // let version;
    // if(!versions.hasOwnProperty(selectedLanguage)){
    //     version = versions[selectedLanguage];
    //     console.log("Please select any other language !!");
    //     return res.status(300).json({message:"Please select any other language !!"});
    // }
    // version = versions[selectedLanguage];
    // console.log("This reaches here !!");
    // if(selectedLanguage === "c++"){
    //     selectedlanguage = "cpp"
    // }else{
    //     selectedlanguage = selectedLanguage;
    // }
    // var extension = fileExtensions[selectedlanguage];
    
    // const filename = `index.${extension}`;
    // console.log("This is file name ",filename,"version ",version);
    // let dummy_code = code_body;
    // dummy_code.language = selectedlanguage;
    // dummy_code.files[0].name = filename;
    // dummy_code.version = version;
    // dummy_code.files[0].content = code;
    // console.log(selectedLanguage)
    
             const submit = await axios.post(`${PISTON_URL}/submit-code`, 
            {code,language:selectedLanguage,stdin});
            
            // return res.json({message:"This reached herre",result:submit.data,userId})


            // /return res.json({stdout:"",executionTime,stderr:stdout,language:lowerCaseLanguage})
        //!for catalyst 
       return res.json({
        message:"Catalyst starts ",
        result:submit.data.stdout,
        executionTime:submit.data.executionTime,
        stderr:submit.data.stderr,
        userId})

    } catch (error) {
        console.log("error");
        return res.status(400).json({message:error})
    }
})

app.post(`/contest/:id`,async(req,res)=>{
    console.log("ME")
const id = req.params['id']
const userData:contestBody = req.body; 
const score = userData.score;
const userKey = userData.user;
try {

    await redis.zAdd(`contest-${id}`, [{ score, value: JSON.stringify({ userKey, user: userData.username }) }]);
    await redis.expire(`contest-${id}`, 172800);
    const alldata = await redis.zRangeWithScores(`contest-${id}`, 0, -1); 
    console.log("#########",alldata)
    return res.json({message:"Submitted contest,now wait"})
  } catch (error) {
    console.error('Error adding user to leaderboard:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post(`/contest/all-contests/:user`, async (req, res) => {
    console.log("NOW ME")
    const { user } = req.params;
    try {
      const contestKeys = await redis.keys('contest-*'); // Get all keys matching
        const userRanks:number[] = [];
       for (const key of contestKeys) {
           const contestId = key.split('-')[1]; // Extract contest ID from key
           const contestData = await redis.zRangeWithScores(`contest-${contestId}`, 0, -1);
           const parsedData = contestData.map((c,index)=>{
            const parsedValue:{userKey:string,user:string} = JSON.parse(c.value);
            if(parsedValue.userKey === user){
               userRanks.push(contestData.length-index);
            }
        })
        }
    //    console.log(userRanks);
       return res.status(200).json({contestKeys,userRanks,message:"Operation successfull"})
    } catch (error) {
      console.log('Error fetching user ranks:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });


app.post(`/leaderboard/contest/:id/data`, async (req, res) => {
    console.log("NOW ME LEADERBOARD ->")
    const id = req.params['id'];
    const {userId,user} = req.body; 
   
    try {
        let userRankMessage = `User ${userId} not found in contest-${id}`;
        let foundUser = false;
        const contestData = await redis.zRangeWithScores(`contest-${id}`, 0, -1);
        contestData.reverse();
        const parsedData = contestData.map((c,index)=>{
            const parsedValue:{userKey:string,user:string} = JSON.parse(c.value);
            if(parsedValue.userKey === userId){
                userRankMessage = `Your rank in contest-${id} is ${index +1}`;
                foundUser = true;
            }
            else{
                console.log(c.score,parsedValue);
            }
        })
        // try {
            contestData.slice(0,10)
            // console.log(contestData.slice(0,10))
        // } catch (error) {
        //     console.log(error);
        // }
        if (foundUser) {
            // console.log("User found")
            return res.json({ message: userRankMessage,contestData });
          } else {
            
            return res.json({ message: userRankMessage,contestData }); // Or handle not found case
          }

      
      // Return the parsed contest data
    } catch (error) {
      console.error('Error fetching contest data:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });



  app.get('/redis/details', async (req, res) => {
    try {
        const keys = await redis.keys('*'); // Get all keys
        const allData = {};

        for (const key of keys) {
            const type = await redis.type(key);
            let value;
            if (type === 'string') {
                value = await redis.get(key);
            } else if (type === 'list') {
                value = await redis.lRange(key, 0, -1);
            } else if (type === 'set') {
                value = await redis.sMembers(key);
            } else if (type === 'zset') {
                value = await redis.zRangeWithScores(key, 0, -1);
            } else if (type === 'hash') {
                value = await redis.hGetAll(key);
            }
            //@ts-ignore
            allData[key] = { type, value };
        }

        return res.status(200).json({ allData, message: "Operation successful" });
    } catch (error) {
        console.error('Error fetching Redis details:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});



app.delete('/contest/delete/:id',async(req,res)=>{
   try {
    const id = req.params['id'];
    const a = await redis.zRemRangeByScore(`contest-${id}`, '-inf', '+inf');
    // console.log(a)
    return res.json({message:`Successfully deleted contest-${id}`})
   } catch (error) {
    // console.log(error);
    return res.json({message:`Error in deleting`,error})
   }
})

app.get("/",(req,res)=>{
    return res.json({message:"IT is running"})
})

app.listen(4000,()=>console.log("Server running on 4000 !"))