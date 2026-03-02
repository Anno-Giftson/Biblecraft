// --------------------
// main.js — Modern Minecraft Clone with Physics
// --------------------
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Noise } from './engine/noise.js';

const noise = new Noise();

// --------------------
// Scene & Camera
// --------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --------------------
// Lighting
// --------------------
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100, 200, 100);
sun.castShadow = true;
scene.add(sun);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// --------------------
// Materials
// --------------------
const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x3cb043 });
const dirtMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

// --------------------
// Block System
// --------------------
const blocks = new Map(); // key = "x,y,z" value = mesh
function blockKey(x, y, z) {
    return `${x},${y},${z}`;
}

// --------------------
// Chunk System
// --------------------
const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 3;
const loadedChunks = new Map();

function chunkKey(cx, cz) {
    return `${cx},${cz}`;
}

function generateChunk(cx, cz) {
    const geometry = new THREE.BoxGeometry(1,1,1);
    const chunkBlocks = new Map();

    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
            const worldX = cx * CHUNK_SIZE + x;
            const worldZ = cz * CHUNK_SIZE + z;

            const height = Math.floor(noise.perlin(worldX * 0.1, worldZ * 0.1) * 10);

            for (let y = 0; y <= height; y++) {
                const material = y === height ? grassMaterial : dirtMaterial;
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(worldX, y, worldZ);
                cube.castShadow = true;
                cube.receiveShadow = true;
                scene.add(cube);
                const key = blockKey(worldX, y, worldZ);
                blocks.set(key, cube);
                chunkBlocks.set(key, cube);
            }
        }
    }

    loadedChunks.set(chunkKey(cx, cz), chunkBlocks);
}

// --------------------
// Player Physics
// --------------------
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = false, isSprinting = false;

let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

let pitch = 0, yaw = 0;

const WALK_SPEED = 14;
const SPRINT_SPEED = 22;
const gravity = 20;
const playerHeight = 1.8;

// --------------------
// Pointer Lock & Mouse Look
// --------------------
document.body.addEventListener("click", () => {
    document.body.requestPointerLock();
    const instructions = document.getElementById("instructions");
    if (instructions) instructions.style.display = "none";
});

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === document.body) {
        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;
        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    }
});

// --------------------
// Keyboard
// --------------------
document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyW": moveForward = true; break;
        case "KeyS": moveBackward = true; break;
        case "KeyA": moveLeft = true; break;
        case "KeyD": moveRight = true; break;
        case "Space": if (canJump) { velocity.y += 8; canJump = false; } break;
        case "ShiftLeft": isSprinting = true; break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyW": moveForward = false; break;
        case "KeyS": moveBackward = false; break;
        case "KeyA": moveLeft = false; break;
        case "KeyD": moveRight = false; break;
        case "ShiftLeft": isSprinting = false; break;
    }
});

// --------------------
// Block Interaction
// --------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);

document.addEventListener("mousedown", (event) => {
    if (document.pointerLockElement !== document.body) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...blocks.values()]);
    if (intersects.length > 0) {
        const hit = intersects[0];
        const block = hit.object;
        const pos = block.position;
        const key = blockKey(pos.x, pos.y, pos.z);

        // Left click - break
        if (event.button === 0) {
            scene.remove(block);
            blocks.delete(key);
        }

        // Right click - place
        if (event.button === 2) {
            const normal = hit.face.normal;
            const newX = pos.x + normal.x;
            const newY = pos.y + normal.y;
            const newZ = pos.z + normal.z;
            const newKey = blockKey(newX, newY, newZ);

            if (!blocks.has(newKey)) {
                const geometry = new THREE.BoxGeometry(1,1,1);
                const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
                const newBlock = new THREE.Mesh(geometry, material);
                newBlock.position.set(newX, newY, newZ);
                newBlock.castShadow = true;
                newBlock.receiveShadow = true;
                scene.add(newBlock);
                blocks.set(newKey, newBlock);
            }
        }
    }
});

// Disable right-click menu
window.addEventListener("contextmenu", e => e.preventDefault());

// --------------------
// Helper: Get highest Y at position
// --------------------
function getHighestY(x, z) {
    let maxY = -Infinity;
    for (let key of blocks.keys()) {
        const [bx, by, bz] = key.split(',').map(Number);
        if (bx === x && bz === z && by > maxY) maxY = by;
    }
    return maxY === -Infinity ? 0 : maxY;
}

// --------------------
// Animation Loop
// --------------------
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Movement damping
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= gravity * delta;

    // Direction
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    const currentSpeed = isSprinting ? SPRINT_SPEED : WALK_SPEED;
    if (moveForward || moveBackward) velocity.z -= direction.z * currentSpeed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * currentSpeed * delta;

    // Movement vectors
    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new THREE.Vector3(Math.sin(yaw - Math.PI/2), 0, Math.cos(yaw - Math.PI/2));

    camera.position.addScaledVector(forward, velocity.z * delta);
    camera.position.addScaledVector(right, velocity.x * delta);

    // --------------------
    // Vertical collision
    // --------------------
    const nextY = camera.position.y + velocity.y * delta;
    const x = Math.floor(camera.position.x);
    const z = Math.floor(camera.position.z);
    const keyBelow = blockKey(x, Math.floor(nextY - 0.1), z);

    if (blocks.has(keyBelow)) {
        // Landed on block
        velocity.y = 0;
        camera.position.y = Math.floor(nextY - 0.1) + 1 + 0.01;
        canJump = true;
    } else {
        // Free fall
        camera.position.y = nextY;
        canJump = false;
    }

    // Camera rotation
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // Load chunks dynamically
    const playerChunkX = Math.floor(camera.position.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(camera.position.z / CHUNK_SIZE);

    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
        for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
            const cx = playerChunkX + dx;
            const cz = playerChunkZ + dz;
            if (!loadedChunks.has(chunkKey(cx, cz))) {
                generateChunk(cx, cz);
            }
        }
    }

    renderer.render(scene, camera);
}

// --------------------
// Spawn on top of terrain
// --------------------
const spawnX = 0;
const spawnZ = 0;
// Generate initial chunks around spawn first
for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
    for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        generateChunk(dx, dz);
    }
}
const spawnY = getHighestY(spawnX, spawnZ) + 2;
camera.position.set(spawnX, spawnY, spawnZ);

animate();

// --------------------
// Window Resize
// --------------------
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
