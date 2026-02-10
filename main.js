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
window.scene = scene;

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
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
    this.pitchObject.rotation.x = Math.max(
      -Math.PI/2,
      Math.min(Math.PI/2, this.pitchObject.rotation.x)
    );
  }
}

const controls = new PointerLockControlsCustom(camera, renderer.domElement);
scene.add(controls.getObject());
controls.getObject().position.set(0, 2, 5);
window.controls = controls;

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
    case "Space": jump(); break;
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

  if (controls.isLocked) {
    updatePlayerPhysics();
  }

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
// Pointer Lock
// ==========================
renderer.domElement.addEventListener('click', e=>{
  if(e.target.id === 'open-settings' || e.target.closest('#settings-panel')) return;
  renderer.domElement.requestPointerLock();
});

const handlePointerLockChange = () => {
  if(document.pointerLockElement === renderer.domElement) {
    controls.lock();
  } else {
    controls.unlock();
  }
};

document.addEventListener('pointerlockchange', handlePointerLockChange);

// ==========================
// Settings panel
// ==========================
const panel = document.getElementById('settings-panel');
const button = document.getElementById('open-settings');
let panelOpen=false;

button.addEventListener('click', e=>{
  e.stopPropagation();

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  panelOpen = !panelOpen;
  if(panelOpen){
    panel.style.display='block';
    requestAnimationFrame(()=>{
      panel.style.opacity='1';
      panel.style.transform='translateY(0)';
    });
  } else {
    panel.style.opacity='0';
    panel.style.transform='translateY(-10px)';
    setTimeout(()=>{if(!panelOpen) panel.style.display='none';},200);
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
