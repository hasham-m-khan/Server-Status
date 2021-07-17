import { devLogger } from "./dev-logger";
import { prodLogger } from "./prod-logger";

let logger = null;
if (process.env.NODE_ENV === 'development') {
    logger = devLogger;
} else {
    logger = prodLogger;
}

export function log(data: any) {
    console.log(data);
}