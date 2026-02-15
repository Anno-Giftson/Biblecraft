window.blocks = [];
window.blockMeshes = [];

// ==========================
// Variables
// ==========================
let mouseSensitivity = 0.002;
let invertY = false;

let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false;
const speed = 0.1;

window.keys = {};


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

window.camera = camera;


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// ==========================
// Raycaster for block interaction
// ==========================
const raycaster = new THREE.Raycaster();
const interactDistance = 6;


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

window.blockGeometry = geometry;
window.blockMaterial = material;

const worldSize = 20;

for(let x=-worldSize/2;x<worldSize/2;x++){ 
  for(let z=-worldSize/2; z<worldSize/2; z++){ 
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x,0,z);
    scene.add(block);

    window.blocks.push(block.position.clone());
    window.blockMeshes.push(block);
  }
}


// ==========================
// Movement
// ==========================
document.addEventListener('keydown', e => {
  window.keys[e.code] = true;

  // Normal movement flags
  switch(e.code){
    case "KeyW": moveForward=true; break;
    case "KeyS": moveBackward=true; break;
    case "KeyA": moveLeft=true; break;
    case "KeyD": moveRight=true; break;
  }

  // Double space to toggle flying
  if(e.code === "Space") {
    const now = Date.now();
    if(now - spacePressedLast < doubleTapTime){
      isFlying = !isFlying;
      velocityY = 0;  // stop vertical momentum when toggling
    }
    spacePressedLast = now;

    if(!isFlying) jump(); // only jump if not flying
  }
});

document.addEventListener('keyup', e => {
  window.keys[e.code] = false;

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

// ==========================
// Block Interaction
// ==========================

function getIntersectedBlock() {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  raycaster.set(
    controls.getObject().position,
    direction
  );

  const intersects = raycaster.intersectObjects(window.blockMeshes);

  if (intersects.length > 0 && intersects[0].distance <= interactDistance) {
    return intersects[0];
  }

  return null;
}

// Remove block (Left click)
function removeBlock() {
  const hit = getIntersectedBlock();
  if (!hit) return;

  const block = hit.object;

  scene.remove(block);

  // Remove from arrays
  const meshIndex = window.blockMeshes.indexOf(block);
  if (meshIndex > -1) {
    window.blockMeshes.splice(meshIndex, 1);
    window.blocks.splice(meshIndex, 1);
  }
}

// Place block (Right click)
function placeBlock() {
  const hit = getIntersectedBlock();
  if (!hit) return;

  const normal = hit.face.normal.clone();
  normal.applyMatrix3(
    new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)
  ).round();

  const newPosition = hit.object.position.clone().add(normal);

  // Prevent placing inside player
  const playerPos = controls.getObject().position;
  if (newPosition.distanceTo(playerPos) < 1.5) return;

  const newBlock = new THREE.Mesh(
    window.blockGeometry,
    window.blockMaterial
  );

  newBlock.position.copy(newPosition);

  scene.add(newBlock);

  window.blockMeshes.push(newBlock);
  window.blocks.push(newPosition.clone());
}

// Mouse controls
document.addEventListener('mousedown', e => {

  if (!controls.isLocked) return;

  // Left click
  if (e.button === 0) {
    removeBlock();
  }

  // Right click
  if (e.button === 2) {
    placeBlock();
  }

});

// Disable right-click menu
document.addEventListener('contextmenu', e => e.preventDefault());
