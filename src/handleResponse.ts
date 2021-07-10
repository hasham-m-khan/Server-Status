import dgram from 'dgram';

import { Server, ServerResponse } from './types/types';
import { validate } from './validate.js';
import { log } from './log.js';

export class HandleResponse {

    constructor() { }

    async process (addresses: Server[], query: string) {
        const promises:Promise<ServerResponse>[] = [];

        for (const address of addresses) {
            const checkAddress = validate(address);
            if (checkAddress.isValid) {
                promises.push(this.udp(address, query));
            } else {
                const errObj: ServerResponse = this.createErrorResponse(address, checkAddress.status.statusCode, checkAddress.status.statusDesc)
                const errPromise: Promise<ServerResponse> = new Promise((resolve, reject) => {
                    resolve(errObj)
                })
                promises.push(errPromise);
            }
        }
        return await Promise.all(promises);
    };

    private udp (address: Server, query: string): Promise<ServerResponse> {
        return new Promise((resolve, reject) => {
            const cmdPrefix: Buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0x02]);
            const cmd: Buffer = Buffer.from(query);
            const udp: dgram.Socket = dgram.createSocket('udp4');

            udp.on('message', (msg, rinfo) => {
                return resolve(this.handleResponse(msg, rinfo))
            });
    
            udp.send([cmdPrefix, cmd], +address.port, address.host, (err) => {
                if (err) {
                    log(err);
                } else {
                    // log(`Query: ${cmdPrefix.toString()}${cmd}\nAddress: ${host}:${port}`);
                    setTimeout(() => {
                        udp.close();
                        return resolve(this.createErrorResponse(address, 408, 'Server timed out'));
                    }, 300)
                }
            });
        });
    };

    private handleResponse (msg: Buffer | string, rinfo: dgram.RemoteInfo) {
        const address: Server = {"host": rinfo.address, "port": '' + rinfo.port};

        // Clean up the response from the server
        let msgStr: string = msg.toString();
        msgStr = msgStr.replace(/\^[0-9]/g, '');
        msgStr = msgStr.replace(/\"/g, '');
        msgStr = msgStr.replace(/[^\x00-\x7F]+/g, '');

        let msgArr: string[] = msgStr.slice(msgStr.indexOf('\\') + 1, msgStr.length).split('\\');

        // Convert the array to an object with key-value pairs
        let cleanResponse: ServerResponse = {
            "address": address,
            "players": [],
            "status": { "statusCode": 200, "statusDesc": "OK" }
        };

        msgArr.forEach(function (a, i, aa) {
            if (i & 1) {
                cleanResponse[aa[i - 1]] = a;
            }
        });

        // Remove player info from last key
        let lastKey = Object.keys(cleanResponse)[Object.keys(cleanResponse).length-1];
        let lastValue: string = cleanResponse[Object.keys(cleanResponse)[Object.keys(cleanResponse).length-1]] as string;

        cleanResponse[lastKey] = lastValue.slice(0, lastValue.indexOf('\n'));

        // Player info
        let playersStr = lastValue.slice(lastValue.indexOf('\n') + 1, lastValue.length);
        let playersArr = playersStr.split('\n');

        playersArr.forEach(player => {
            let playerInfo = player.split(' ', 3);

            if (!playerInfo[1]) {
            // do nothing - this is to ignore empty player strings
            } else {
                cleanResponse.players.push({
                    "ping": playerInfo[1],
                    "score": playerInfo[0],
                    "name": playerInfo[2],
                    "isBot": (+playerInfo[1] === 0) ? true : false
                });
            }
        });

        // log(cleanResponse);
        return cleanResponse;

    };

    private createErrorResponse (address: Server, errorCode: number, errorDesc: string): ServerResponse {
        return {
            address: address,
            players: [],
            status: { 
                statusCode: errorCode, 
                statusDesc: errorDesc 
            }
        };
    };

}