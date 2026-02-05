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
camera.position.set(0, 2, 5); // start slightly above ground

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
let moveLeft = false;
let moveRight = false;

const speed = 0.1;

// Add basic pointer lock controls
let controlsEnabled = false;

document.body.addEventListener('click', () => {
  controlsEnabled = true;
  document.body.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  controlsEnabled = document.pointerLockElement === document.body;
});

// Track mouse movement for camera rotation
let pitch = 0; // up/down
let yaw = 0;   // left/right

document.addEventListener('mousemove', (event) => {
  if (!controlsEnabled) return;
  yaw -= event.movementX * 0.002;
  pitch -= event.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// Keyboard movement
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyA': moveLeft = true; break;
    case 'KeyD': moveRight = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyA': moveLeft = false; break;
    case 'KeyD': moveRight = false; break;
  }
});

// === Animate loop ===
function animate() {
  requestAnimationFrame(animate);

  // Apply camera rotation
  camera.rotation.x = pitch;
  camera.rotation.y = yaw;

  // Movement
  let forwardVector = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );
  let rightVector = new THREE.Vector3(
    Math.cos(yaw),
    0,
    -Math.sin(yaw)
  );

  if (moveForward) camera.position.add(forwardVector.clone().multiplyScalar(speed));
  if (moveBackward) camera.position.add(forwardVector.clone().multiplyScalar(-speed));
  if (moveLeft) camera.position.add(rightVector.clone().multiplyScalar(-speed));
  if (moveRight) camera.position.add(rightVector.clone().multiplyScalar(speed));

  renderer.render(scene, camera);
}

animate();

// === Handle window resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


