export function connectServer(player){

const socket = new WebSocket("ws://localhost:3000")

socket.onopen=()=>{

setInterval(()=>{

socket.send(JSON.stringify({
x:player.position.x,
y:player.position.y,
z:player.position.z
}))

},50)

}

}
