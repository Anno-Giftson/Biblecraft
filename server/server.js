const WebSocket = require("ws")
const fs = require("fs")

const server = new WebSocket.Server({port:3000})

let players={}

server.on("connection",(ws,req)=>{

const id=req.socket.remoteAddress

players[id]={x:0,y:0,z:0}

ws.on("message",(msg)=>{

const data=JSON.parse(msg)

players[id]=data

fs.writeFileSync(
"worldsave.json",
JSON.stringify(players,null,2)
)

})

})
