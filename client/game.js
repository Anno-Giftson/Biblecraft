import {createWorld} from "./world.js"
import {createPlayer} from "./player.js"
import {connectServer} from "./network.js"

export const scene = new THREE.Scene()

export const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

export const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
)

createWorld(scene)

const player = createPlayer(scene,camera)

connectServer(player)

let last=performance.now()

function animate(){

requestAnimationFrame(animate)

const now=performance.now()

const dt=(now-last)/1000

last=now

player.update(dt)

renderer.render(scene,camera)

}

animate()
