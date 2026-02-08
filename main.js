// ==========================
// Scene Setup
// ==========================
const container = document.getElementById('game-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer attached to container
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
  constructor(camera, domElement) {
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

  getObject() {
    return this.yawObject;
  }

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
    if (!this.isLocked) return;
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;
    this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
  }

  // ==========================
  // Minecraft-style movement
  // ==========================
  moveForward(distance) {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.pitchObject.quaternion);
    direction.applyQuaternion(this.yawObject.quaternion);
    direction.normalize();
    this.yawObject.position.add(direction.multiplyScalar(distance));
  }

  moveRight(distance) {
    const vector = new THREE.Vector3(1, 0, 0).applyQuaternion(this.yawObject.quaternion);
    vector.normalize();
    this.yawObject.position.add(vector.multiplyScalar(distance));
  }
}

// Attach controls to container
const controls = new PointerLockControlsCustom(camera, container);
scene.add(controls.getObject());

// ==========================
// Ground Blocks
// ==========================
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const worldSize = 20;
for (let x = -worldSize / 2; x < worldSize / 2; x++) {
  for (let z = -worldSize / 2; z < worldSize / 2; z++) {
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, 0, z);
    scene.add(block);
  }
}

// ==========================
// Movement
// ==========================
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
const speed = 0.1, verticalSpeed = 0.1;

document.addEventListener('keydown', e => {
  switch (e.code) {
    case "KeyW": moveForward = true; break;
    case "KeyS": moveBackward = true; break;
    case "KeyA": moveLeft = true; break;
    case "KeyD": moveRight = true; break;
    case "Space": moveUp = true; break;
    case "ShiftLeft": moveDown = true; break;
  }
});

document.addEventListener('keyup', e => {
  switch (e.code) {
    case "KeyW": moveForward = false; break;
    case "KeyS": moveBackward = false; break;
    case "KeyA": moveLeft = false; break;
    case "KeyD": moveRight = false; break;
    case "Space": moveUp = false; break;
    case "ShiftLeft": moveDown = false; break;
  }
});

// ==========================
// Animation loop
// ==========================
function animate() {
  requestAnimationFrame(animate);

  if (moveForward) controls.moveForward(speed);
  if (moveBackward) controls.moveForward(-speed);
  if (moveLeft) controls.moveRight(-speed);
  if (moveRight) controls.moveRight(speed);

  if (moveUp) controls.getObject().position.y += verticalSpeed;
  if (moveDown) controls.getObject().position.y -= verticalSpeed;

  renderer.render(scene, camera);
}
animate();

// ==========================
// Resize
// ==========================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================
// Click to lock pointer AND go full-screen
// ==========================
container.addEventListener("click", async () => {
  controls.lock();
  if (container.requestFullscreen) {
    await container.requestFullscreen();
  } else if (container.webkitRequestFullscreen) {
    await container.webkitRequestFullscreen();
  }
});

// Default mouse sensitivity and inversion
let mouseSensitivity = 0.002;
let invertY = false;

// Update controls on mouse move
controls.onMouseMove = function(event) {
  if (!this.isLocked) return;
  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;

  this.yawObject.rotation.y -= movementX * mouseSensitivity;
  this.pitchObject.rotation.x -= movementY * mouseSensitivity * (invertY ? -1 : 1);
  this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
}.bind(controls);

// Settings panel logic
const panel = document.getElementById('settings-panel');
document.getElementById('open-settings').addEventListener('click', () => panel.style.display = 'block');
document.getElementById('close-settings').addEventListener('click', () => panel.style.display = 'none');

// Sensitivity slider
document.getElementById('sensitivity').addEventListener('input', e => {
  mouseSensitivity = parseFloat(e.target.value);
});

// Invert Y checkbox
document.getElementById('invertY').addEventListener('change', e => {
  invertY = e.target.checked;
});


