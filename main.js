// ==========================
// Scene
// ==========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

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


// ==========================
// Lighting
// ==========================
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);


// ==========================
// Pointer Lock Controls
// ==========================
const controls = new THREE.PointerLockControls(camera, document.body);
scene.add(controls.getObject());

controls.getObject().position.set(0, 2, 5);

// click to lock mouse
document.body.addEventListener("click", () => controls.lock());


// ==========================
// Ground blocks
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
// Movement flags
// ==========================
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

const speed = 0.1;
const verticalSpeed = 0.1;


// ==========================
// Keyboard
// ==========================
document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW": moveForward = true; break;
    case "KeyS": moveBackward = true; break;
    case "KeyA": moveLeft = true; break;
    case "KeyD": moveRight = true; break;
    case "Space": moveUp = true; break;
    case "ShiftLeft": moveDown = true; break;
  }
});

document.addEventListener("keyup", (e) => {
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
// Game loop
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
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

