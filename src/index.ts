import express from 'express';
import fs from 'fs-extra';

import { log } from './log.js';
import { Server } from './types/types.js';
import { HandleResponse } from './handleResponse.js';
import { validate } from './validate.js';

const app = express();
const port = process.env.PORT || "3000";

app.get('/api/serverlist/:cmd/', async (req, res) => { 

    const requests:Server[] = await fs.readJson('./serverlist/servers.json');
    const rs = new HandleResponse;
    res.send(await rs.process(requests, req.params.cmd));
});

app.get('/api/serverlist/:cmd/:port/:host', async (req, res) => { 

    const request: Server[] = [
        {
            "host": req.params.host,
            "port": req.params.port
        },
    ];

    const rs = new HandleResponse;
    res.send(await rs.process(request, req.params.cmd));
});

app.get('/api/addserver/:port/:host', async (req, res) => {
    const address: Server = { "host": req.params.host, "port": req.params.port };
    const validateAddress = validate(address);
    
    if (validateAddress.isValid) {
        const serverlist: Server[] =  await fs.readJson('./serverlist/servers.json');
        let isServerInList = serverlist.filter((object: any) => {
            return (object.host === address.host && object.port === address.port)
        });
        if (isServerInList[0]) {
            res.status(500).send({'err': 500, 'desc': 'Server already exists in the database.'});
        } else {
            const rs = new HandleResponse;
            const pingServer = await rs.process([address], 'getinfo');
            if (pingServer[0].status.statusCode === 200) {
                serverlist.push(address);
                await fs.writeJson('./serverlist/servers.json', serverlist, {'spaces': 4});
                res.status(200).send({'status': 200, 'desc': 'Server has been successfully added'})
            } else {
                res.status(500).send({'err': 500, 'desc': 'Server did not ping back. Please make sure the server is active and try again.'});
            }
        }
    } else {
        res.status(422).send({'err': 422, 'desc': 'Invalid server address'});
    }
});

app.get('/api/removeserver/:port/:host', async (req, res) => {
    const address: Server = { "host": req.params.host, "port": req.params.port };
    const validateAddress = validate(address);
    
    if (validateAddress.isValid) {
        const serverlist: Server[] =  await fs.readJson('./serverlist/servers.json');
        let isServerInList = serverlist.filter((object: any) => {
            return (object.host === address.host && object.port === address.port)
        });
        if (isServerInList[0]) {
            const serverPos = serverlist.findIndex(server => {
                return (server.host === address.host && server.port === address.port)
            });
            serverlist.splice(serverPos, 1);
            await fs.writeJson('./serverlist/servers.json', serverlist, {'spaces': 4});
            res.status(200).send({'status': 200, 'desc': 'Server has been successfully removed'})
        } else {
            res.status(422).send({'err': 422, 'desc': 'Server is not in database'});    
        }
    } else {
        res.status(422).send({'err': 422, 'desc': 'Invalid server address'});
    }
});

app.listen(port, () => {
    log(`Server running on: ${port}`);
});