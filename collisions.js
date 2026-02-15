// ==========================
// Collision & Physics (Minecraft-style)
// ==========================

const playerHeight = 1.8;
const playerRadius = 0.3;
let velocityY = 0;
const gravity = -0.01;
let canJump = false;

let isFlying = false;
let flySpeed = 0.15;

let spacePressedLast = 0;
const doubleTapTime = 300;


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

    // IMPORTANT: do NOT count standing on top as a collision
    const collideY = dy > 0.1 && dy < playerHeight - 0.1;

    if (collideX && collideZ && collideY) {
      return true;
    }
  }
  return false;
}

// ==========================
// Gravity & vertical collisions
// ==========================
function applyGravity() {
  // Apply gravity if not flying
  if (!isFlying) {
    velocityY += gravity;

    const nextPos = window.controls.getObject().position.clone();
    nextPos.y += velocityY;

    let collided = false;

    for (const blockPos of window.blocks) {
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

    window.controls.getObject().position.y = nextPos.y;
    if (!collided) canJump = false;
  } else {
    // Flying mode: no gravity, but collisions still active vertically
    const nextPos = window.controls.getObject().position.clone();
    nextPos.y += (window.keys["Space"] ? flySpeed : 0) - (window.keys["ShiftLeft"] ? flySpeed : 0);

    // Check vertical collisions
    for (const blockPos of window.blocks) {
      const dx = nextPos.x - blockPos.x;
      const dz = nextPos.z - blockPos.z;
      const dy = nextPos.y - blockPos.y;

      if (Math.abs(dx) < 0.5 + playerRadius &&
          Math.abs(dz) < 0.5 + playerRadius) {

        // Flying up into a block
        if (dy <= playerHeight && dy > 0 && (window.keys["Space"])) {
          nextPos.y = blockPos.y - 0.01;
        }

        // Flying down onto a block
        if (dy <= playerHeight && dy > 0 && (window.keys["ShiftLeft"])) {
          nextPos.y = blockPos.y + playerHeight;
        }
      }
    }

    window.controls.getObject().position.y = nextPos.y;
  }
}


// ==========================
// Horizontal collisions
// ==========================
function moveWithCollision(forwardVec, rightVec, speedZ, speedX) {
  const nextPos = window.controls.getObject().position.clone();

  const forwardStep = forwardVec.clone().multiplyScalar(speedZ);
  const rightStep = rightVec.clone().multiplyScalar(speedX);

  // Forward/back
  const posForward = nextPos.clone().add(forwardStep);
  if (!checkCollision(posForward)) nextPos.copy(posForward);

  // Left/right
  const posRight = nextPos.clone().add(rightStep);
  if (!checkCollision(posRight)) nextPos.copy(posRight);

  window.controls.getObject().position.copy(nextPos);
}

function updatePlayerPhysics() {
  applyGravity();

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  
  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  let moveX = 0, moveY = 0, moveZ = 0;

  
  // Flying movement
  
  if(isFlying){
    // Horizontal movement with collision
    const nextPos = window.controls.getObject().position.clone();

    // Forward/back
    const forwardStep = forward.clone().multiplyScalar(
      (window.moveForward ? flySpeed : 0) + (window.moveBackward ? -flySpeed : 0)
    );

    // Left/right
    const rightStep = right.clone().multiplyScalar(
      (window.moveRight ? flySpeed : 0) + (window.moveLeft ? -flySpeed : 0)
    );

    const desiredPos = nextPos.clone().add(forwardStep).add(rightStep);

    // Check horizontal collisions
    if (!checkCollision(desiredPos)) nextPos.copy(desiredPos);

    // Vertical movement
    nextPos.y += (window.keys["Space"] ? flySpeed : 0) - (window.keys["ShiftLeft"] ? flySpeed : 0);

    // Collision vertically
    for (const blockPos of window.blocks) {
      const dx = nextPos.x - blockPos.x;
      const dz = nextPos.z - blockPos.z;
      const dy = nextPos.y - blockPos.y;

      if (Math.abs(dx) < 0.5 + playerRadius &&
          Math.abs(dz) < 0.5 + playerRadius) {

        if (dy <= playerHeight && dy > 0) {
          // Flying up
          if (window.keys["Space"] && dy <= playerHeight) nextPos.y = blockPos.y - 0.01;
          // Flying down
          if (window.keys["ShiftLeft"] && dy > 0) nextPos.y = blockPos.y + playerHeight;
        }
      }
    }

    window.controls.getObject().position.copy(nextPos);
}

  else {
  // Normal walking with collisions
  if(window.moveForward) moveZ += speed;
  if(window.moveBackward) moveZ -= speed;
  if(window.moveRight) moveX += speed;
  if(window.moveLeft) moveX -= speed;

  moveWithCollision(forward, right, moveZ, moveX);
}

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
  if (e.code === "Space") {

  const now = Date.now();

  if (now - spacePressedLast < doubleTapTime) {
    isFlying = !isFlying;
    velocityY = 0;
    canJump = false;
  } else {
    if (!isFlying) jump();
  }

  spacePressedLast = now;
}

});

