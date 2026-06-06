import { config } from './config';

const prefix = (level: "debug" | "info" | "warn" | "error") => 
    `[${level.toUpperCase()} ${new Date().toISOString()}]` ;

export const logger = {
  debug: (msg: string, ...args: any[]) => 
    config.PRODUCT_TYPE && console.debug(prefix("debug"), msg, ...args),
  info: (msg: string, ...args: any[]) => 
    console.info(prefix("info"), msg, ...args),
  warn: (msg: string, ...args: any[]) => 
    console.warn(prefix("warn"), msg, ...args),
  error: (msg: string, ...args: any[]) => 
    console.error(prefix("error"), msg, ...args),
};

export type LogFunc = (
    message: string,
    details?: Record<string, any>
) => void

