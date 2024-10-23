import ip from "ip";

const ipAddress = ip.address("public","ipv4");

export const PISTON_URL = `http://${ipAddress}:2000`;