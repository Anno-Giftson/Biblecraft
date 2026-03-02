import * as THREE from 'three';

// --- GAME STATE ---
export const state = {
    active: false,
    player: { hp: 100, manna: 100, velocity: new THREE.Vector3(), onGround: false, selectedSlot: 1 },
    keys: { forward: false, backward: false, left: false, right: false, jump: false, sprint: false },
    inventory: { 1: { type: 'wood', count: 10, icon: '🪵' }, 2: { type: 'stone', count: 0, icon: '🪨' } }
};

// --- VOXEL CORE ---
export const scene = new THREE.Scene();
export const worldGrid = new Map();
export const blocks = [];

scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.03);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(50, 100, 50);
scene.add(dirLight);

// Simple Materials
export const MATS = {
    grass: new THREE.MeshStandardMaterial({ color: 0x4a6b30 }),
    dirt: new THREE.MeshStandardMaterial({ color: 0x5d4037 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x757575 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x5c4033 })
};

const boxGeo = new THREE.BoxGeometry(1, 1, 1);

export function getGridKey(x, y, z) {
    return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
}

export function createBlock(x, y, z, type) {
    if (worldGrid.has(getGridKey(x, y, z))) return; // Prevent double placement
    
    const mesh = new THREE.Mesh(boxGeo, MATS[type] || MATS.dirt);
    mesh.position.set(Math.floor(x), Math.floor(y), Math.floor(z));
    mesh.userData = { type: type, hp: 3 };
    
    scene.add(mesh);
    blocks.push(mesh);
    worldGrid.set(getGridKey(x, y, z), mesh);
}

export function removeBlock(mesh) {
    scene.remove(mesh);
    blocks.splice(blocks.indexOf(mesh), 1);
    worldGrid.delete(getGridKey(mesh.position.x, mesh.position.y, mesh.position.z));
}

// --- WORLD GEN ---
export function generateWorld() {
    for (let x = -10; x < 10; x++) {
        for (let z = -10; z < 10; z++) {
            createBlock(x, -1, z, 'grass');
            createBlock(x, -2, z, 'dirt');
        }
    }
}

// --- PHYSICS (Glitch-Free) ---
export function checkCollision(x, y, z) {
    const minX = Math.floor(x - 0.3), maxX = Math.floor(x + 0.3);
    const minY = Math.floor(y - 1.6), maxY = Math.floor(y + 0.2);
    const minZ = Math.floor(z - 0.3), maxZ = Math.floor(z + 0.3);

    for (let ix = minX; ix <= maxX; ix++) {
        for (let iy = minY; iy <= maxY; iy++) {
            for (let iz = minZ; iz <= maxZ; iz++) {
                if (worldGrid.has(`${ix},${iy},${iz}`)) return true;
            }
        }
    }
    return false;
}

export function updatePhysics(camera, delta) {
    if (!state.active) return;
    
    const p = state.player;
    const k = state.keys;
    p.velocity.y -= 30.0 * delta; // Gravity

    // Input
    const speed = k.sprint ? 15.0 : 10.0;
    const dir = new THREE.Vector3(Number(k.right) - Number(k.left), 0, Number(k.forward) - Number(k.backward)).normalize();
    
    if (k.forward || k.backward) p.velocity.z -= dir.z * speed * 15.0 * delta;
    if (k.left || k.right) p.velocity.x -= dir.x * speed * 15.0 * delta;

    p.velocity.x -= p.velocity.x * 10.0 * delta; // Friction
    p.velocity.z -= p.velocity.z * 10.0 * delta;

    if (k.jump && p.onGround) { p.velocity.y = 12.0; p.onGround = false; }

    // Apply movement with Separate Axis Collision
    camera.translateX(-p.velocity.x * delta);
    if (checkCollision(camera.position.x, camera.position.y, camera.position.z)) {
        camera.translateX(p.velocity.x * delta); p.velocity.x = 0;
    }

    camera.translateZ(-p.velocity.z * delta);
    if (checkCollision(camera.position.x, camera.position.y, camera.position.z)) {
        camera.translateZ(p.velocity.z * delta); p.velocity.z = 0;
    }

    camera.position.y += p.velocity.y * delta;
    p.onGround = false;
    if (checkCollision(camera.position.x, camera.position.y, camera.position.z)) {
        camera.position.y -= p.velocity.y * delta;
        if (p.velocity.y < 0) p.onGround = true;
        p.velocity.y = 0;
    }
}
