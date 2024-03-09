# deploy on a linux virtual machine with docker installed
1. copy the project to linux server
2. edit the hostname in the serverConfig.json; the ip should be the ip address of the server, the port number should be the same as the port number used by the python server
3. in the frontend folder, run "docker build ibankex-frontend ."
4. in the pythonServer folder, run "docker build ibankex-python-server ."
5. run "docker run -dp {portnumber for the webpage}:3000/tcp ibankex-frontend"
6. run "docker run -dp {portnumber for the python server}:81/tcp ibankex-python-server"