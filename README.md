![Screenshot](screenshot.png)

# Server-Status
Rest API for JK Series Games

**** Instructions ****
  1) npm install
  2) run cmd: node ./dst/index.js
  3) ./serverlist/servers.json contains all server addresses

**** INFORMATION ****
  * http://your_site/api/serverlist/<getstatus | getinfo> to ping all servers
  * http://your_site/api/serverlist/<getstatus | getinfo>/<port>/<host> to ping a particular server
  * http//your_site/api/addserver/<port>/<host> to add a server to the server list
  * http//your_site/api/removeserver/<port>/<host> to remove a server from the server list
