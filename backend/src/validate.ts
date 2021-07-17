import { Server } from "./types/types";

/*

    This function will validate ip address and hosts and return an object.

    Sample input:
        { host: "255.abc.0.1", port: 00000}

    output:
        isValid: false;
        status: {
            statusCode: 422,
            statusDesc: "Invalid address"
        };
*/

export function validate(address: Server) {
    let isHostValidStr = "VALID";
    let isPortValidStr = "VALID";
    let isHostValid = true;
    let isPortValid = true;
    const validationStatus = {
        isValid: true,
        status: {
            statusCode: 200,
            statusDesc: "OK"
        }
    };

    // Check for valid IP
    if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(address.host)) {
        isHostValid = false;
        isHostValidStr = "INVALID";
    }

    // Check for valid port
    if (+address.port < 0 || +address.port > 65535 || typeof +address.port != 'number' || +address.port % 1 != 0) {
        isPortValid = false;
        isPortValidStr = "INVALID";
    }
    if (isHostValid && isPortValid) {
        return validationStatus;
    }
    else {
        validationStatus.isValid = false;
        validationStatus.status.statusCode = 422;
        validationStatus.status.statusDesc = `INVALID ADDRESS. HOST: ${isHostValidStr}, PORT: ${isPortValidStr}`;
    }
    return validationStatus;
}