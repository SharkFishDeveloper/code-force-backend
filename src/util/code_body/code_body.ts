

const code_body =
    {
        "language": "",
        "version": "",
        "files": [
          {
            "name": "",
            "content": ""
          }
        ],
        "stdin": "",
        "args": [],
        "compile_timeout": 10000,
        "run_timeout": 3000,
        "compile_memory_limit": -1,
        "run_memory_limit": -1
}
const versions: Record<string, string> = {
    "c": "10.2.0",
    "java": "15.0.2",
    "typescript": "5.0.3",
    "python": "3.10.0",
    "c++": "10.2.0"
};


const fileName = "index.cpp";

const fileExtensions: Record<string, string> = {
 "cpp": "cpp",
 "c": "c",
 "java":"java",
 "typescript":"ts",
 "python":"py"
};

// ,
//     
//     "java": "java",
//     "typescript": "ts",
//     "python": "py"

export {versions,code_body,fileName,fileExtensions};