import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// --------------------
// Scene Setup
// --------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky color

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --------------------
// Lighting (Modern Style)
// --------------------

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100, 200, 100);
sun.castShadow = true;
scene.add(sun);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// --------------------
// Pointer Lock Controls
// --------------------

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let pitch = 0;
let yaw = 0;

document.body.addEventListener("click", () => {
    document.body.requestPointerLock();
    document.getElementById("instructions").style.display = "none";
});

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === document.body) {
        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    }
});

document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyW": moveForward = true; break;
        case "KeyS": moveBackward = true; break;
        case "KeyA": moveLeft = true; break;
        case "KeyD": moveRight = true; break;
        case "Space":
            if (canJump) velocity.y += 8;
            canJump = false;
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyW": moveForward = false; break;
        case "KeyS": moveBackward = false; break;
        case "KeyA": moveLeft = false; break;
        case "KeyD": moveRight = false; break;
    }
});

// --------------------
// Simple Terrain Generation
// --------------------

const blockSize = 1;
const worldSize = 50;

const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x3cb043 });
const dirtMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

function generateTerrain() {
    const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

    for (let x = -worldSize; x < worldSize; x++) {
        for (let z = -worldSize; z < worldSize; z++) {

            const height = Math.floor(
                5 * Math.sin(x * 0.1) * Math.cos(z * 0.1)
            );

            for (let y = 0; y <= height; y++) {
                const material = y === height ? grassMaterial : dirtMaterial;
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x, y, z);
                cube.receiveShadow = true;
                cube.castShadow = true;
                scene.add(cube);
            }
        }
    }
}

generateTerrain();

// --------------------
// Player Setup
// --------------------

camera.position.set(0, 10, 0);

const playerHeight = 1.8;
const gravity = 20;
const speed = 10;

// --------------------
// Animation Loop
// --------------------

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= gravity * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward)
        velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight)
        velocity.x -= direction.x * speed * delta;

    const forward = new THREE.Vector3(
        Math.sin(yaw),
        0,
        Math.cos(yaw)
    );

    const right = new THREE.Vector3(
        Math.sin(yaw - Math.PI / 2),
        0,
        Math.cos(yaw - Math.PI / 2)
    );

    camera.position.addScaledVector(forward, velocity.z * delta);
    camera.position.addScaledVector(right, velocity.x * delta);
    camera.position.y += velocity.y * delta;

    if (camera.position.y < playerHeight) {
        velocity.y = 0;
        camera.position.y = playerHeight;
        canJump = true;
    }

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    renderer.render(scene, camera);
}

animate();

// --------------------
// Resize Handler
// --------------------

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
