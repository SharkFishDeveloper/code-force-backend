"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExtensions = exports.fileName = exports.code_body = exports.versions = void 0;
const code_body = {
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
};
exports.code_body = code_body;
const versions = {
    "c": "10.2.0",
    "java": "15.0.2",
    "typescript": "5.0.3",
    "javascript": "18.15.0",
    "python": "3.12.0",
    "c++": "10.2.0",
    "rust": "1.68.2"
};
exports.versions = versions;
const fileName = "index.cpp";
exports.fileName = fileName;
const fileExtensions = {
    "cpp": "g++",
    "c": "c",
    "java": "java",
    "typescript": "ts5",
    "javascript": "js",
    "python": "py",
    "rust": "rs"
};
exports.fileExtensions = fileExtensions;
