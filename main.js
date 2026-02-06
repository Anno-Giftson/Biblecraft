// === Scene setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// === FPS Camera Rig (prevents flipping & dizziness) ===
const yawObject = new THREE.Object3D();   // left/right rotation
const pitchObject = new THREE.Object3D(); // up/down rotation

yawObject.add(pitchObject);
pitchObject.add(camera);
scene.add(yawObject);

yawObject.position.set(0, 2, 5);

// === Ground blocks ===
const blockSize = 1;
const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
const material = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // grass

const worldSize = 20;
for (let x = -worldSize / 2; x < worldSize / 2; x++) {
  for (let z = -worldSize / 2; z < worldSize / 2; z++) {
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, 0, z);
    scene.add(block);
  }
}

// === Movement flags ===
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let rotateLeft = false;
let rotateRight = false;
let lookUp = false;
let lookDown = false;

// === Speeds ===
const speed = 0.1;
const verticalSpeed = 0.1;
const turnSpeed = 0.03;
const lookSpeed = 0.02;

// === Keyboard controls ===
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyA': moveLeft = true; break;
    case 'KeyD': moveRight = true; break;

    case 'KeyQ': rotateLeft = true; break;
    case 'KeyE': rotateRight = true; break;

    case 'Space': moveUp = true; break;
    case 'ShiftLeft': moveDown = true; break;

    case 'ArrowUp': lookUp = true; break;
    case 'ArrowDown': lookDown = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyA': moveLeft = false; break;
    case 'KeyD': moveRight = false; break;

    case 'KeyQ': rotateLeft = false; break;
    case 'KeyE': rotateRight = false; break;

    case 'Space': moveUp = false; break;
    case 'ShiftLeft': moveDown = false; break;

    case 'ArrowUp': lookUp = false; break;
    case 'ArrowDown': lookDown = false; break;
  }
});

// === Animation loop ===
function animate() {
  requestAnimationFrame(animate);

  // Rotate player (yaw)
  if (rotateLeft) yawObject.rotation.y += turnSpeed;
  if (rotateRight) yawObject.rotation.y -= turnSpeed;

  // Look up/down (pitch)
  if (lookUp) pitchObject.rotation.x -= lookSpeed;
  if (lookDown) pitchObject.rotation.x += lookSpeed;

  // Clamp pitch to prevent flipping
  pitchObject.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, pitchObject.rotation.x)
  );

  // Direction vectors
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(yawObject.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(yawObject.quaternion);

  // Movement
  if (moveForward) yawObject.position.add(forward.clone().multiplyScalar(speed));
  if (moveBackward) yawObject.position.add(forward.clone().multiplyScalar(-speed));
  if (moveLeft) yawObject.position.add(right.clone().multiplyScalar(-speed));
  if (moveRight) yawObject.position.add(right.clone().multiplyScalar(speed));

  // Vertical movement
  if (moveUp) yawObject.position.y += verticalSpeed;
  if (moveDown) yawObject.position.y -= verticalSpeed;

  renderer.render(scene, camera);
}

animate();

// === Window resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
