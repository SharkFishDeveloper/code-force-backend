"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PISTON_URL = void 0;
const ip_1 = __importDefault(require("ip"));
const ipAddress = ip_1.default.address("public", "ipv4");
exports.PISTON_URL = `http://${ipAddress}:2000`;
