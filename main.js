// ==========================
// Scene Setup
// ==========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ==========================
// Lighting
// ==========================
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5,10,5);
scene.add(sun);

// ==========================
// PointerLockControls (self-contained)
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

    this.domElement.addEventListener('click', () => { this.lock(); });
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  getObject(){ return this.yawObject; }

  lock(){
    this.isLocked = true;
    document.addEventListener('mousemove', this.onMouseMove, false);
  }

  unlock(){
    this.isLocked = false;
    document.removeEventListener('mousemove', this.onMouseMove, false);
  }

  onMouseMove(event){
    if(!this.isLocked) return;
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;
    this.pitchObject.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitchObject.rotation.x));
  }

  // ==========================
  // Minecraft-style movement
  // ==========================
  moveForward(distance){
    // Move along full camera direction (yaw + pitch)
    const direction = new THREE.Vector3(0,0,-1);
    direction.applyQuaternion(this.pitchObject.quaternion); // include pitch
    direction.applyQuaternion(this.yawObject.quaternion);   // include yaw
    direction.normalize();
    this.yawObject.position.add(direction.multiplyScalar(distance));
}

  moveRight(distance){
    // move sideways relative to camera
    const vector = new THREE.Vector3(1,0,0).applyQuaternion(this.yawObject.quaternion);
    vector.normalize();
    this.yawObject.position.add(vector.multiplyScalar(distance));
  }
}

const controls = new PointerLockControlsCustom(camera, document.body);
scene.add(controls.getObject());

// ==========================
// Ground blocks
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

// ==========================
// Movement
// ==========================
let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false, moveUp=false, moveDown=false;
const speed=0.1, verticalSpeed=0.1;

document.addEventListener('keydown', e=>{
  switch(e.code){
    case "KeyW": moveForward=true; break;
    case "KeyS": moveBackward=true; break;
    case "KeyA": moveLeft=true; break;
    case "KeyD": moveRight=true; break;
    case "Space": moveUp=true; break;
    case "ShiftLeft": moveDown=true; break;
  }
});

document.addEventListener('keyup', e=>{
  switch(e.code){
    case "KeyW": moveForward=false; break;
    case "KeyS": moveBackward=false; break;
    case "KeyA": moveLeft=false; break;
    case "KeyD": moveRight=false; break;
    case "Space": moveUp=false; break;
    case "ShiftLeft": moveDown=false; break;
  }
});

// ==========================
// Animate loop
// ==========================
function animate(){
  requestAnimationFrame(animate);

  // Forward/backward along camera direction
  if(moveForward) controls.moveForward(speed);
  if(moveBackward) controls.moveForward(-speed);

  // Sideways
  if(moveLeft) controls.moveRight(-speed);
  if(moveRight) controls.moveRight(speed);

  // Vertical (Space / Shift)
  if(moveUp) controls.getObject().position.y += verticalSpeed;
  if(moveDown) controls.getObject().position.y -= verticalSpeed;

  renderer.render(scene, camera);
}
animate();

// ==========================
// Resize
// ==========================
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
