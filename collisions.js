// ==========================
// Collision & Physics
// ==========================

const playerHeight = 1.8;    // Player/camera height
const playerRadius = 0.3;    // Horizontal collision radius
let velocityY = 0;           // Vertical speed
const gravity = -0.01;       // Gravity per frame
let canJump = false;

// Keep track of block positions
const blocks = [];
// Fill blocks array based on your existing world blocks
scene.traverse(obj => {
  if (obj.isMesh && obj.geometry.type === "BoxGeometry") {
    blocks.push(obj.position.clone());
  }
});

// Helper: check if position collides with any block
function checkCollision(pos) {
  for (const blockPos of blocks) {
    const dx = pos.x - blockPos.x;
    const dy = pos.y - blockPos.y;
    const dz = pos.z - blockPos.z;

    if (Math.abs(dx) < 0.5 + playerRadius &&
        dy >= 0 && dy <= playerHeight &&
        Math.abs(dz) < 0.5 + playerRadius) {
      return true;
    }
  }
  return false;
}

// Handle gravity & floor collision
function applyGravity() {
  velocityY += gravity;

  const nextPos = controls.getObject().position.clone();
  nextPos.y += velocityY;

  // Check for collision with blocks below/above
  let collision = false;
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
        collision = true;
        break;
      }

      // Hitting head on block above
      if (velocityY > 0 && dy <= playerHeight && dy > 0) {
        nextPos.y = blockPos.y - 0.01;
        velocityY = 0;
        collision = true;
        break;
      }
    }
  }

  controls.getObject().position.y = nextPos.y;

  if (!collision) canJump = false;
}

// Handle horizontal movement collisions
function moveWithCollision(forwardVec, rightVec, speedX, speedZ) {
  const nextPos = controls.getObject().position.clone();
  nextPos.add(forwardVec.multiplyScalar(speedX));
  nextPos.add(rightVec.multiplyScalar(speedZ));

  if (!checkCollision(nextPos)) {
    controls.getObject().position.copy(nextPos);
  }
}

// Integrate into your animate loop
function updatePlayerPhysics() {
  applyGravity();

  // Compute forward/right based on yaw only (ignoring pitch)
  const yaw = controls.getObject().rotation.y;
  const forward = new THREE.Vector3(Math.sin(-yaw),0,Math.cos(-yaw));
  const right = new THREE.Vector3(Math.sin(Math.PI/2 - yaw),0,Math.cos(Math.PI/2 - yaw));

  let moveX = 0, moveZ = 0;
  if (moveForward) moveZ -= speed;
  if (moveBackward) moveZ += speed;
  if (moveRight) moveX += speed;
  if (moveLeft) moveX -= speed;

  moveWithCollision(forward,right,moveZ,moveX);
}

// Jump function
function jump() {
  if (canJump) {
    velocityY = 0.2;
    canJump = false;
  }
}

// Listen for jump key
document.addEventListener('keydown', e=>{
  if(e.code === "Space") jump();
});

