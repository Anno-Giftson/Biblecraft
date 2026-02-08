// ==========================
// Variables
// ==========================
let mouseSensitivity = 0.002;
let invertY = false;

let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false;
const speed = 0.1;

// ==========================
// Scene Setup
// ==========================
const container = document.getElementById('game-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
window.scene = scene;  // Make scene global so collisions.js can access it


const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// ==========================
// Lighting
// ==========================
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);

// ==========================
// PointerLockControlsCustom
// ==========================
class PointerLockControlsCustom {
  constructor(camera, domElement){
    this.camera = camera;
    this.domElement = domElement || document.body;

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(camera);

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 2;
    this.yawObject.add(this.pitchObject);

    this.isLocked = false;
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  getObject() { return this.yawObject; }

  lock() {
    if (this.isLocked) return;
    this.isLocked = true;
    document.addEventListener('mousemove', this.onMouseMove, false);
  }

  unlock() {
    this.isLocked = false;
    document.removeEventListener('mousemove', this.onMouseMove, false);
  }

  onMouseMove(event) {
    if(!this.isLocked) return;
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.yawObject.rotation.y -= movementX * mouseSensitivity;
    this.pitchObject.rotation.x -= movementY * mouseSensitivity * (invertY ? -1 : 1);
    this.pitchObject.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitchObject.rotation.x));
  }

  moveForward(distance) {
    const dir = new THREE.Vector3(0,0,-1);
    dir.applyQuaternion(this.pitchObject.quaternion);
    dir.applyQuaternion(this.yawObject.quaternion);
    dir.normalize();
    this.yawObject.position.add(dir.multiplyScalar(distance));
  }

  moveRight(distance) {
    const vec = new THREE.Vector3(1,0,0).applyQuaternion(this.yawObject.quaternion);
    vec.normalize();
    this.yawObject.position.add(vec.multiplyScalar(distance));
  }
}

const controls = new PointerLockControlsCustom(camera, container);
scene.add(controls.getObject());

// ==========================
// Ground Blocks
// ==========================
const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshStandardMaterial({color:0x228B22});
const worldSize = 20;

for(let x=-worldSize/2;x<worldSize/2;x++){
  for(let z=-worldSize/2; z<worldSize/2; z++){
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x,0,z);
    scene.add(block);
  }
}

// Keep track of block positions for collisions
const blocks = [];
scene.traverse(obj => {
  if(obj.isMesh && obj.geometry.type === "BoxGeometry") {
    blocks.push(obj.position.clone());
  }
});


// ==========================
// Movement
// ==========================
document.addEventListener('keydown', e=>{
  switch(e.code){
    case "KeyW": moveForward=true; break;
    case "KeyS": moveBackward=true; break;
    case "KeyA": moveLeft=true; break;
    case "KeyD": moveRight=true; break;
    case "Space": jump(); break; // handled in collisions.js
  }
});

document.addEventListener('keyup', e=>{
  switch(e.code){
    case "KeyW": moveForward=false; break;
    case "KeyS": moveBackward=false; break;
    case "KeyA": moveLeft=false; break;
    case "KeyD": moveRight=false; break;
  }
});

// ==========================
// Animate loop
// ==========================
function animate() {
  requestAnimationFrame(animate);

  updatePlayerPhysics();  // handles movement, collisions, gravity


  renderer.render(scene, camera);
}
animate();

// ==========================
// Resize
// ==========================
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================
// Full-screen + pointer lock
// ==========================
container.addEventListener('click', e=>{
  if(e.target.id === 'open-settings' || e.target.closest('#settings-panel')) return;
  controls.lock();
  if(container.requestFullscreen) container.requestFullscreen();
  else if(container.webkitRequestFullscreen) container.webkitRequestFullscreen();
});

// ==========================
// Settings drop-down logic
// ==========================
const panel = document.getElementById('settings-panel');
const button = document.getElementById('open-settings');

let panelOpen=false;

button.addEventListener('click', e=>{
  e.stopPropagation();
  panelOpen = !panelOpen;
  if(panelOpen){
    panel.style.display='block';
    requestAnimationFrame(()=>{
      panel.style.opacity=1;
      panel.style.transform='translateY(0)';
    });
  } else {
    panel.style.opacity=0;
    panel.style.transform='translateY(-10px)';
    setTimeout(()=>{if(!panelOpen) panel.style.display='none';},200);
  }
});

document.addEventListener('click', ()=>{
  if(panelOpen){
    panelOpen=false;
    panel.style.opacity=0;
    panel.style.transform='translateY(-10px)';
    setTimeout(()=>{panel.style.display='none';},200);
  }
});

panel.addEventListener('click', e=>e.stopPropagation());

// ==========================
// Sensitivity + Invert Y
// ==========================
document.getElementById('sensitivity').addEventListener('input', e=>{
  mouseSensitivity=parseFloat(e.target.value);
});
document.getElementById('invertY').addEventListener('change', e=>{
  invertY=e.target.checked;
});





