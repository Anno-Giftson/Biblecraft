export function createWorld(scene){

const loader = new THREE.TextureLoader()

const grass = loader.load("./textures/grass.png")
const dirt = loader.load("./textures/dirt.png")
const stone = loader.load("./textures/stone.png")

const materials={
grass:new THREE.MeshLambertMaterial({map:grass}),
dirt:new THREE.MeshLambertMaterial({map:dirt}),
stone:new THREE.MeshLambertMaterial({map:stone})
}

const geo=new THREE.BoxGeometry(1,1,1)

for(let x=-32;x<32;x++){
for(let z=-32;z<32;z++){

const h=Math.floor(Math.sin(x*.2)*3+Math.cos(z*.2)*3+6)

for(let y=0;y<h;y++){

let mat=materials.stone

if(y==h-1) mat=materials.grass
else if(y>h-4) mat=materials.dirt

const cube=new THREE.Mesh(geo,mat)

cube.position.set(x,y,z)

scene.add(cube)

}

}
}

}
