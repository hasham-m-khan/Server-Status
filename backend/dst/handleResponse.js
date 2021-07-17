import dgram from 'dgram';
import { validate } from './validate';
import { log } from './logger/dev-logger';
/*
    The main function of this class is to open a UDP
    connection with the host provided in the request params,
    send a message (which is also provided in the request params)
    and listen for server response.

    Once a response is received from the server, handleResponse
    method will convert the response to JSON format
    (interface: ServerResponse) and return it as a promise
*/
export class HandleResponse {
    constructor() { }
    async process(addresses, query) {
        // The promise array (which will contain server responses)
        const promises = [];
        // Server addresress are sent as an array from index.js
        for (const address of addresses) {
            // address validator
            const checkAddress = validate(address);
            if (checkAddress.isValid) {
                promises.push(this.udp(address, query));
            }
            else {
                // If address is invalid then return an error promise
                const errObj = this.createErrorResponse(address, checkAddress.status.statusCode, checkAddress.status.statusDesc);
                const errPromise = new Promise((resolve, reject) => {
                    resolve(errObj);
                });
                promises.push(errPromise);
            }
        }
        return await Promise.all(promises);
    }
    ;
    // This method is responsible for pinging the server and 
    // listening for response
    udp(address, query) {
        return new Promise((resolve, reject) => {
            const cmdPrefix = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0x02]);
            const cmd = Buffer.from(query);
            // Create new udp connection
            const udp = dgram.createSocket('udp4');
            // On server response, send the response to processMessage
            // to convert to JSON format
            udp.on('message', (msg, rinfo) => {
                return resolve(this.processMessage(msg, rinfo));
            });
            // Send the requst as a buffer
            udp.send([cmdPrefix, cmd], +address.port, address.host, (err) => {
                if (err) {
                    log(err);
                }
                else {
                    // log(`Query: ${cmdPrefix.toString()}${cmd}\nAddress: ${host}:${port}`);
                    setTimeout(() => {
                        udp.close();
                        return resolve(this.createErrorResponse(address, 408, 'Server timed out'));
                    }, 300);
                }
            });
        });
    }
    ;
    processMessage(msg, rinfo) {
        // Example message from server:
        // serverResponse\n\\sv_gametype\\8\\mapname\\somemap\\...
        const address = { "host": rinfo.address, "port": '' + rinfo.port };
        // See ServerResponse for output format
        let cleanResponse = {
            "address": address,
            "players": [],
            "status": { "statusCode": 200, "statusDesc": "OK" },
            "totalBots": 0,
            "totalPlayers": 0
        };
        // Clean up the response from the server
        let msgStr = msg.toString();
        msgStr = msgStr.replace(/\^[0-9]/g, '');
        msgStr = msgStr.replace(/\"/g, '');
        msgStr = msgStr.replace(/[^\x00-\x7F]+/g, '');
        let msgArr = msgStr.slice(msgStr.indexOf('\\') + 1, msgStr.length).split('\\');
        // Convert the array to an object with key-value pairs
        msgArr.forEach(function (a, i, aa) {
            if (i & 1) {
                cleanResponse[aa[i - 1]] = a;
            }
        });
        // Remove player info from last key
        let lastKey = Object.keys(cleanResponse)[Object.keys(cleanResponse).length - 1];
        let lastValue = cleanResponse[Object.keys(cleanResponse)[Object.keys(cleanResponse).length - 1]];
        cleanResponse[lastKey] = lastValue.slice(0, lastValue.indexOf('\n'));
        // Player info
        let playersStr = lastValue.slice(lastValue.indexOf('\n') + 1, lastValue.length);
        let playersArr = playersStr.split('\n');
        let bots = 0;
        let players = 0;
        playersArr.forEach(player => {
            let playerInfo = player.split(' ', 3);
            if (!playerInfo[1]) {
                // do nothing - this is to ignore empty player strings
            }
            else {
                let isBot;
                if (+playerInfo[1] === 0) {
                    isBot = true;
                    bots++;
                }
                else {
                    isBot = false;
                    players++;
                }
                cleanResponse.players.push({
                    "ping": playerInfo[1],
                    "score": playerInfo[0],
                    "name": playerInfo[2],
                    "isBot": isBot
                });
            }
        });
        cleanResponse["totalBots"] = bots;
        cleanResponse["totalPlayers"] = players;
        return cleanResponse;
    }
    ;
    createErrorResponse(address, errorCode, errorDesc) {
        return {
            "address": address,
            "players": [],
            "totalBots": 0,
            "totalPlayers": 0,
            "status": {
                "statusCode": errorCode,
                "statusDesc": errorDesc
            },
            "sv_hostname": "<no_response>",
            "sv_maxclients": "0",
            "gamename": "--",
            "g_gametype": "--",
            "protocol": "--",
            "mapname": "--"
        };
    }
    ;
}
