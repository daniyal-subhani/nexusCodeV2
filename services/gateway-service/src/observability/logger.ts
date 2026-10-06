import { createLogger } from "@nexus/common";
import { Logger } from "pino";

export const gatewayLogger:Logger = createLogger({
    serviceName: "Gateway Service",
    level: process.env.LOG_LEVEL
    
},)
