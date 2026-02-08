// ==========================
// Collision & Physics (Minecraft-style)
// ==========================

const playerHeight = 1.8;    // Player/camera height
const playerRadius = 0.3;    // Horizontal collision radius
let velocityY = 0;           // Vertical speed
const gravity = -0.01;       // Gravity per frame
let canJump = false;

// Keep track of block positions
const blocks = [];
scene.traverse(obj => {
  if (obj.isMesh && obj.geometry.type === "BoxGeometry") {
    blocks.push(obj.position.clone());
  }
});

// ==========================
// Collision check
// ==========================
function checkCollision(pos) {
  for (const blockPos of blocks) {
    const dx = pos.x - blockPos.x;
    const dz = pos.z - blockPos.z;
    const dy = pos.y - blockPos.y;

    const collideX = Math.abs(dx) < 0.5 + playerRadius;
    const collideZ = Math.abs(dz) < 0.5 + playerRadius;
    const collideY = dy >= 0 && dy <= playerHeight;

    if (collideX && collideZ && collideY) return true;
  }
  return false;
}

// ==========================
// Gravity & vertical collisions
// ==========================
function applyGravity() {
  velocityY += gravity;
  const nextPos = controls.getObject().position.clone();
  nextPos.y += velocityY;

  let collided = false;

  for (const blockPos of blocks) {
    const dx = nextPos.x - blockPos.x;
    const dz = nextPos.z - blockPos.z;
    const dy = nextPos.y - blockPos.y;

    if (Math.abs(dx) < 0.5 + playerRadius &&
        Math.abs(dz) < 0.5 + playerRadius) {

      // Landing on top of block
      if (velocityY <= 0 && dy <= playerHeight && dy > 0) {
        nextPos.y = blockPos.y + playerHeight;
        velocityY = 0;
        canJump = true;
        collided = true;
        break;
      }

      // Hitting head on block above
      if (velocityY > 0 && dy <= playerHeight && dy > 0) {
        nextPos.y = blockPos.y - 0.01;
        velocityY = 0;
        collided = true;
        break;
      }
    }
  }

  controls.getObject().position.y = nextPos.y;
  if (!collided) canJump = false;
}

// ==========================
// Horizontal collisions
// ==========================
function moveWithCollision(forwardVec, rightVec, speedZ, speedX) {
  const nextPos = controls.getObject().position.clone();

  // Move separately to allow sliding along walls
  const forwardStep = forwardVec.clone().multiplyScalar(speedZ);
  const rightStep = rightVec.clone().multiplyScalar(speedX);

  // Forward/back
  const posForward = nextPos.clone().add(forwardStep);
  if (!checkCollision(posForward)) nextPos.copy(posForward);

  // Left/right
  const posRight = nextPos.clone().add(rightStep);
  if (!checkCollision(posRight)) nextPos.copy(posRight);

  controls.getObject().position.copy(nextPos);
}

// ==========================
// Player physics integration
// ==========================
function updatePlayerPhysics() {
  applyGravity();

  const yaw = controls.getObject().rotation.y;
  const forward = new THREE.Vector3(Math.sin(-yaw), 0, Math.cos(-yaw));
  const right = new THREE.Vector3(Math.sin(Math.PI/2 - yaw), 0, Math.cos(Math.PI/2 - yaw));

  let moveX = 0, moveZ = 0;
  if (moveForward) moveZ -= speed;
  if (moveBackward) moveZ += speed;
  if (moveRight) moveX += speed;
  if (moveLeft) moveX -= speed;

  moveWithCollision(forward, right, moveZ, moveX);
}

// ==========================
// Jump
// ==========================
function jump() {
  if (canJump) {
    velocityY = 0.2;
    canJump = false;
  }
}

document.addEventListener('keydown', e => {
  if (e.code === "Space") jump();
});


