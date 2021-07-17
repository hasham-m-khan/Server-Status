import express from 'express';
import cors from 'cors';
import { readJson, writeJson } from 'fs-extra';
import { log } from './logger/index';
import { HandleResponse } from './handleResponse';
import { validate } from './validate';
const app = express();
const port = process.env.PORT || "3000";
app.use(cors({
    origin: '*',
}));
/* TO DO

    - Logging through winston

*/
// Path to get request statuses for all servers in the json (serverlist/servers.json)
app.get('/api/serverlist/:cmd/', async (req, res) => {
    // Get all server addresses
    const requests = await readJson('./serverlist/servers.json');
    // and send them as a list to handleResponse.process method
    // to receive JSON output as a promise
    const rs = new HandleResponse;
    res.send(await rs.process(requests, req.params.cmd));
});
// Path to get status for a single server
app.get('/api/serverlist/:cmd/:port/:host', async (req, res) => {
    const request = [
        {
            "host": req.params.host,
            "port": req.params.port
        },
    ];
    const rs = new HandleResponse;
    res.send(await rs.process(request, req.params.cmd));
});
// Adding a server to serverlist/servers.json
app.get('/api/addserver/:port/:host', async (req, res) => {
    const address = { "host": req.params.host, "port": req.params.port };
    // Server address validation
    const validateAddress = validate(address);
    if (validateAddress.isValid) {
        const serverlist = await readJson('./serverlist/servers.json');
        // Check if server already exists in our list
        let isServerInList = serverlist.filter((object) => {
            return (object.host === address.host && object.port === address.port);
        });
        if (isServerInList[0]) {
            res.status(500).send({ 'err': 500, 'desc': 'Server already exists in the database.' });
        }
        else {
            const rs = new HandleResponse;
            // Even with a valid IP and port, the address givem might not
            // be running a game server or could be a random IP...
            // so ping the server and wait for response to check if
            // the IP is actually an IP of a server that belongs to the game
            const pingServer = await rs.process([address], 'getinfo');
            // If server responds back ...
            if (pingServer[0].status.statusCode === 200) {
                serverlist.push(address);
                // write the server address to our list ...
                await writeJson('./serverlist/servers.json', serverlist, { 'spaces': 4 });
                res.status(200).send({ 'status': 200, 'desc': 'Server has been successfully added' });
            }
            else {
                // else return an error
                res.status(500).send({ 'err': 500, 'desc': 'Server did not ping back. Please make sure the server is active and try again.' });
            }
        }
    }
    else {
        // If an invalid host or ip was provided in the req.params ...
        res.status(422).send({ 'err': 422, 'desc': 'Invalid server address' });
    }
});
// Path to remove a server from the server list
app.get('/api/removeserver/:port/:host', async (req, res) => {
    const address = { "host": req.params.host, "port": req.params.port };
    const validateAddress = validate(address);
    if (validateAddress.isValid) {
        const serverlist = await readJson('./serverlist/servers.json');
        let isServerInList = serverlist.filter((object) => {
            return (object.host === address.host && object.port === address.port);
        });
        // If server is in list ...
        if (isServerInList[0]) {
            // get the index of the server object from our json array...
            const serverPos = serverlist.findIndex(server => {
                return (server.host === address.host && server.port === address.port);
            });
            // remove the object and write the new json to servers.json
            serverlist.splice(serverPos, 1);
            await writeJson('./serverlist/servers.json', serverlist, { 'spaces': 4 });
            res.status(200).send({ 'status': 200, 'desc': 'Server has been successfully removed' });
        }
        else {
            res.status(422).send({ 'err': 422, 'desc': 'Server is not in database' });
        }
    }
    else {
        // invalid IP or port provided:
        res.status(422).send({ 'err': 422, 'desc': 'Invalid server address' });
    }
});
app.listen(port, () => {
    log(`Server running on: ${port}`);
});
