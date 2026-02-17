// ==========================
// Collision & Physics (Minecraft-style)
// ==========================

const playerHeight = 1.8;
const playerRadius = 0.3;

let velocityY = 0;
const gravity = -0.01;
const jumpForce = 0.22;

let canJump = false;

let isFlying = false; // start walking
let flySpeed = 0.15;

let spacePressedLast = 0;
const doubleTapTime = 400;


// ==========================
// Collision check
// ==========================
function checkCollision(pos) {
  for (const blockPos of window.blocks) {
    const dx = pos.x - blockPos.x;
    const dz = pos.z - blockPos.z;
    const dy = pos.y - blockPos.y;

    const collideX = Math.abs(dx) < 0.5 + playerRadius;
    const collideZ = Math.abs(dz) < 0.5 + playerRadius;
    const collideY = dy > 0.1 && dy < playerHeight - 0.1;

    if (collideX && collideZ && collideY) return true;
  }
  return false;
}


// ==========================
// Gravity & vertical collisions
// ==========================
function applyGravity() {
  if (isFlying) return; // no gravity while flying

  velocityY += gravity;

  const nextPos = window.controls.getObject().position.clone();
  nextPos.y += velocityY;

  let landed = false;

  for (const blockPos of window.blocks) {
    const dx = nextPos.x - blockPos.x;
    const dz = nextPos.z - blockPos.z;
    const dy = nextPos.y - blockPos.y;

    if (
      Math.abs(dx) < 0.5 + playerRadius &&
      Math.abs(dz) < 0.5 + playerRadius
    ) {
      // landing
      if (velocityY <= 0 && dy <= playerHeight && dy > 0) {
        nextPos.y = blockPos.y + playerHeight;
        velocityY = 0;
        canJump = true;
        landed = true;
        break;
      }
      // head hit
      if (velocityY > 0 && dy <= playerHeight && dy > 0) {
        nextPos.y = blockPos.y - 0.01;
        velocityY = 0;
        break;
      }
    }
  }

  if (!landed) canJump = false;

  window.controls.getObject().position.y = nextPos.y;
}


// ==========================
// Horizontal collisions
// ==========================
function moveWithCollision(forwardVec, rightVec, speedZ, speedX) {
  const nextPos = window.controls.getObject().position.clone();

  const forwardStep = forwardVec.clone().multiplyScalar(speedZ);
  const rightStep = rightVec.clone().multiplyScalar(speedX);

  const posForward = nextPos.clone().add(forwardStep);
  if (!checkCollision(posForward)) nextPos.copy(posForward);

  const posRight = nextPos.clone().add(rightStep);
  if (!checkCollision(posRight)) nextPos.copy(posRight);

  window.controls.getObject().position.copy(nextPos);
}


// ==========================
// Main Physics Update
// ==========================
function updatePlayerPhysics() {
  applyGravity();

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  if (isFlying) {
    const nextPos = window.controls.getObject().position.clone();

    // Horizontal
    const forwardStep = forward.clone().multiplyScalar(
      (window.moveForward ? flySpeed : 0) + (window.moveBackward ? -flySpeed : 0)
    );
    const rightStep = right.clone().multiplyScalar(
      (window.moveRight ? flySpeed : 0) + (window.moveLeft ? -flySpeed : 0)
    );
    nextPos.add(forwardStep).add(rightStep);

    // Vertical
    if (window.keys["Space"]) nextPos.y += flySpeed;
    if (window.keys["ShiftLeft"]) nextPos.y -= flySpeed;

    // collision
    if (!checkCollision(nextPos)) {
      window.controls.getObject().position.copy(nextPos);
    }

  } else {
    // walking
    let moveX = 0, moveZ = 0;
    if (window.moveForward) moveZ += speed;
    if (window.moveBackward) moveZ -= speed;
    if (window.moveRight) moveX += speed;
    if (window.moveLeft) moveX -= speed;

    moveWithCollision(forward, right, moveZ, moveX);
  }
}


// ==========================
// Jump
// ==========================
function jump() {
  if (!isFlying && canJump) {
    velocityY = jumpForce;
    canJump = false;
  }
}


// ==========================
// Space Key Logic (jump & flying toggle)
// ==========================
document.addEventListener('keydown', e => {
  if (e.code === "Space") {
    const now = Date.now();

    // double-tap Space → toggle flying
    if (now - spacePressedLast < doubleTapTime) {
      isFlying = !isFlying;
      velocityY = 0;
      canJump = false;
    } else {
      // single press → jump if not flying
      if (!isFlying) jump();
    }

    spacePressedLast = now;
  }
});

