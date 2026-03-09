export function createPlayer(scene,camera){

const player = new THREE.Object3D()

player.position.set(0,10,0)

scene.add(player)

player.add(camera)

let pitch=0
let yaw=0

document.body.onclick=()=>{
document.body.requestPointerLock()
}

document.addEventListener("mousemove",e=>{

if(document.pointerLockElement){

yaw-=e.movementX*0.002
pitch-=e.movementY*0.002

pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch))

player.rotation.y=yaw
camera.rotation.x=pitch

}

})

const keys={}

document.addEventListener("keydown",e=>keys[e.key]=true)
document.addEventListener("keyup",e=>keys[e.key]=false)

player.update=function(dt){

const speed=6

if(keys["w"]) player.position.z-=speed*dt
if(keys["s"]) player.position.z+=speed*dt
if(keys["a"]) player.position.x-=speed*dt
if(keys["d"]) player.position.x+=speed*dt

document.getElementById("coords").innerText=
"X:"+player.position.x.toFixed(1)+
" Y:"+player.position.y.toFixed(1)+
" Z:"+player.position.z.toFixed(1)

}

return player

}
