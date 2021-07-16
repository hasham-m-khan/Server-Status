import dgram from 'dgram';
import { validate } from './validate.js';
import { log } from './log.js';
export class HandleResponse {
    constructor() { }
    async process(addresses, query) {
        const promises = [];
        for (const address of addresses) {
            const checkAddress = validate(address);
            if (checkAddress.isValid) {
                promises.push(this.udp(address, query));
            }
            else {
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
    udp(address, query) {
        return new Promise((resolve, reject) => {
            const cmdPrefix = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0x02]);
            const cmd = Buffer.from(query);
            const udp = dgram.createSocket('udp4');
            udp.on('message', (msg, rinfo) => {
                return resolve(this.handleResponse(msg, rinfo));
            });
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
    handleResponse(msg, rinfo) {
        const address = { "host": rinfo.address, "port": '' + rinfo.port };
        // Clean up the response from the server
        let msgStr = msg.toString();
        msgStr = msgStr.replace(/\^[0-9]/g, '');
        msgStr = msgStr.replace(/\"/g, '');
        msgStr = msgStr.replace(/[^\x00-\x7F]+/g, '');
        let msgArr = msgStr.slice(msgStr.indexOf('\\') + 1, msgStr.length).split('\\');
        // Convert the array to an object with key-value pairs
        let cleanResponse = {
            "address": address,
            "players": [],
            "status": { "statusCode": 200, "statusDesc": "OK" },
            "totalBots": 0,
            "totalPlayers": 0
        };
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
        // log(cleanResponse);
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
