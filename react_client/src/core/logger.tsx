import { config } from './config';

const notProduction = !import.meta.env.PROD

const prefix = (level: "debug" | "info" | "warn" | "error") => 
    `[${level.toUpperCase()} ${new Date().toISOString()}]` ;

export const logger = notProduction ? {
  debug: (msg: string, ...args: any[]) => 
    config.PRODUCT_TYPE && console.debug(prefix("debug"), msg, ...args),
  info: (msg: string, ...args: any[]) => 
    console.info(prefix("info"), msg, ...args),
  warn: (msg: string, ...args: any[]) => 
    console.warn(prefix("warn"), msg, ...args),
  error: (msg: string, ...args: any[]) => 
    console.error(prefix("error"), msg, ...args),
} : {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};


