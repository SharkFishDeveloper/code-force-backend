"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("redis");
const PISTON_URL_1 = require("./util/PISTON_URL");
const redis = (0, redis_1.createClient)();
redis.on('error', (err) => console.log('Redis Client Error', err));
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        yield redis.connect();
    });
}
connectRedis().catch(console.error);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    return res.json({ message: "This is a get request" });
});
// {
//     "language": "c",
//     "code": "#include <stdio.h>\r\nint main() {    \r\n\r\n    int number1, number2, sum;\r\n    \r\n    printf(\"Enter two integers: \\");\r\n    scanf(\"%d %d\", &number1, &number2);\r\n\r\n    // calculate the sum\r\n    sum = number1 + number2;      \r\n    \r\n    printf(\"%d + %d = %d\", number1, number2, sum);\r\n    return 0;\r\n}\r\n",
//     "stdin": "1\n100"
//   }  
app.post("/submit-code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, selectedLanguage, userId, stdin } = req.body;
        console.log("CODE", code, selectedLanguage, userId);
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
        const submit = yield axios_1.default.post(`${PISTON_URL_1.PISTON_URL}/submit-code`, { code, language: selectedLanguage, stdin });
        // return res.json({message:"This reached herre",result:submit.data,userId})
        // /return res.json({stdout:"",executionTime,stderr:stdout,language:lowerCaseLanguage})
        //!for catalyst 
        return res.json({
            message: "Catalyst starts ",
            result: submit.data.stdout,
            executionTime: submit.data.executionTime,
            stderr: submit.data.stderr,
            userId
        });
    }
    catch (error) {
        console.log("error");
        return res.status(400).json({ message: error });
    }
}));
app.post(`/contest/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("ME");
    const id = req.params['id'];
    const userData = req.body;
    const score = userData.score;
    const userKey = userData.user;
    try {
        yield redis.zAdd(`contest-${id}`, [{ score, value: JSON.stringify({ userKey, user: userData.username }) }]);
        yield redis.expire(`contest-${id}`, 172800);
        const alldata = yield redis.zRangeWithScores(`contest-${id}`, 0, -1);
        console.log("#########", alldata);
        return res.json({ message: "Submitted contest,now wait" });
    }
    catch (error) {
        console.error('Error adding user to leaderboard:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.post(`/contest/all-contests/:user`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("NOW ME");
    const { user } = req.params;
    try {
        const contestKeys = yield redis.keys('contest-*'); // Get all keys matching
        const userRanks = [];
        for (const key of contestKeys) {
            const contestId = key.split('-')[1]; // Extract contest ID from key
            const contestData = yield redis.zRangeWithScores(`contest-${contestId}`, 0, -1);
            const parsedData = contestData.map((c, index) => {
                const parsedValue = JSON.parse(c.value);
                if (parsedValue.userKey === user) {
                    userRanks.push(contestData.length - index);
                }
            });
        }
        //    console.log(userRanks);
        return res.status(200).json({ contestKeys, userRanks, message: "Operation successfull" });
    }
    catch (error) {
        console.log('Error fetching user ranks:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.post(`/leaderboard/contest/:id/data`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("NOW ME LEADERBOARD ->");
    const id = req.params['id'];
    const { userId, user } = req.body;
    try {
        let userRankMessage = `User ${userId} not found in contest-${id}`;
        let foundUser = false;
        const contestData = yield redis.zRangeWithScores(`contest-${id}`, 0, -1);
        contestData.reverse();
        const parsedData = contestData.map((c, index) => {
            const parsedValue = JSON.parse(c.value);
            if (parsedValue.userKey === userId) {
                userRankMessage = `Your rank in contest-${id} is ${index + 1}`;
                foundUser = true;
            }
            else {
                console.log(c.score, parsedValue);
            }
        });
        // try {
        contestData.slice(0, 10);
        // console.log(contestData.slice(0,10))
        // } catch (error) {
        //     console.log(error);
        // }
        if (foundUser) {
            // console.log("User found")
            return res.json({ message: userRankMessage, contestData });
        }
        else {
            return res.json({ message: userRankMessage, contestData }); // Or handle not found case
        }
        // Return the parsed contest data
    }
    catch (error) {
        console.error('Error fetching contest data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.get('/redis/details', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keys = yield redis.keys('*'); // Get all keys
        const allData = {};
        for (const key of keys) {
            const type = yield redis.type(key);
            let value;
            if (type === 'string') {
                value = yield redis.get(key);
            }
            else if (type === 'list') {
                value = yield redis.lRange(key, 0, -1);
            }
            else if (type === 'set') {
                value = yield redis.sMembers(key);
            }
            else if (type === 'zset') {
                value = yield redis.zRangeWithScores(key, 0, -1);
            }
            else if (type === 'hash') {
                value = yield redis.hGetAll(key);
            }
            //@ts-ignore
            allData[key] = { type, value };
        }
        return res.status(200).json({ allData, message: "Operation successful" });
    }
    catch (error) {
        console.error('Error fetching Redis details:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.delete('/contest/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params['id'];
        const a = yield redis.zRemRangeByScore(`contest-${id}`, '-inf', '+inf');
        // console.log(a)
        return res.json({ message: `Successfully deleted contest-${id}` });
    }
    catch (error) {
        // console.log(error);
        return res.json({ message: `Error in deleting`, error });
    }
}));
app.get("/", (req, res) => {
    return res.json({ message: "IT is running" });
});
app.listen(4000, () => console.log("Server running on 4000 !"));
