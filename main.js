window.blocks = [];
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
renderer.setPixelRatio(window.devicePixelRatio); // ← optional, smoother
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

    this.isLocked = false; // ← start unlocked
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  getObject() { return this.yawObject; }

  lock() {
    if (this.isLocked) return;
    this.isLocked = true;
    document.addEventListener('mousemove', this.onMouseMove, false); // ← listen to mouse
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
controls.getObject().position.set(0, 2, 5);

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

    blocks.push(block.position.clone());
  }
}

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
// Settings drop-down logic (BEFORE click listener)
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

// ==========================
// Fullscreen + pointer lock
// ==========================
container.addEventListener('click', e=>{
  // Don't lock if clicking settings button or panel
  if(e.target.id === 'open-settings' || e.target.closest('#settings-panel')) return;

  // Request pointer lock FIRST
  if(document.pointerLockElement === null) {
    if(container.requestPointerLock) {
      container.requestPointerLock();
    } else if(container.mozRequestPointerLock) {
      container.mozRequestPointerLock();
    }
  }

  // Request fullscreen
  if(container.requestFullscreen) container.requestFullscreen().catch(err => {});
  else if(container.webkitRequestFullscreen) container.webkitRequestFullscreen();
});

// Handle pointer lock change event
document.addEventListener('pointerlockchange', () => {
  if(document.pointerLockElement === container) {
    controls.lock();
  } else {
    controls.unlock();
  }
});

document.addEventListener('mozpointerlockchange', () => {
  if(document.mozPointerLockElement === container) {
    controls.lock();
  } else {
    controls.unlock();
  }
});

// ==========================
// Sensitivity + Invert Y
// ==========================
document.getElementById('sensitivity').addEventListener('input', e=>{
  mouseSensitivity=parseFloat(e.target.value);
});
document.getElementById('invertY').addEventListener('change', e=>{
  invertY=e.target.checked;
});







