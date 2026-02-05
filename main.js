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
camera.position.set(0, 2, 5); // slightly above ground

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

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

// === Controls setup ===
let moveForward = false;
let moveBackward = false;
let turnLeft = false;
let turnRight = false;

const speed = 0.1;
const turnSpeed = 0.03;

// Pointer lock on click
let controlsEnabled = false;
document.body.addEventListener('click', () => {
  controlsEnabled = true;
  document.body.requestPointerLock();
});

// Track mouse movement for up/down pitch
let pitch = 0; // up/down
document.addEventListener('mousemove', (event) => {
  if (!controlsEnabled) return;
  pitch -= event.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// Keyboard
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyA': turnLeft = true; break;
    case 'KeyD': turnRight = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyA': turnLeft = false; break;
    case 'KeyD': turnRight = false; break;
  }
});

// === Animate loop ===
let yaw = 0; // left/right rotation

function animate() {
  requestAnimationFrame(animate);

  // Turn left/right with A/D
  if (turnLeft) yaw += turnSpeed;
  if (turnRight) yaw -= turnSpeed;

  // Move forward/back
  const direction = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  if (moveForward) camera.position.add(direction.clone().multiplyScalar(speed));
  if (moveBackward) camera.position.add(direction.clone().multiplyScalar(-speed));

  // Apply rotation
  camera.rotation.set(pitch, yaw, 0);

  renderer.render(scene, camera);
}

animate();

// === Handle window resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



