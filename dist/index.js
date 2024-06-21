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
const code_body_1 = require("./util/code_body/code_body");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    return res.json({ message: "This is a get request" });
});
app.post("/submit-code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, selectedLanguage, userId } = req.body;
        let selectedlanguage;
        let version;
        if (!code_body_1.versions.hasOwnProperty(selectedLanguage)) {
            version = code_body_1.versions[selectedLanguage];
            console.log("Please select any other language !!");
            return res.status(300).json({ message: "Please select any other language !!" });
        }
        version = code_body_1.versions[selectedLanguage];
        console.log("This reaches here !!");
        if (selectedLanguage === "c++") {
            selectedlanguage = "cpp";
        }
        else {
            selectedlanguage = selectedLanguage;
        }
        var extension = code_body_1.fileExtensions[selectedlanguage];
        const filename = `index.${extension}`;
        console.log("This is file name ", filename, "version ", version);
        let dummy_code = code_body_1.code_body;
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
        const submit = yield axios_1.default.post("http://localhost:2000/api/v2/execute", code_body_1.code_body);
        console.log(submit.data);
        return res.json({ message: "This reached herre", result: submit.data, userId });
        // return res.json({message:"Pushed from middleware",result:submit.data,userId})
        // }
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ messge: error });
    }
    // await redis.hSet(userId,{"code":code,"language":selectedLanguage}); 
    //   const redisPop = await redis.lPop();
}));
app.listen(4000, () => console.log("Server running on 4000 !"));
