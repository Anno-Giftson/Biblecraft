import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';
import { scene, state, generateWorld, updatePhysics, blocks, removeBlock, createBlock } from './engine.js';

// --- SETUP ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.insertBefore(renderer.domElement, document.getElementById('ui-layer'));

const controls = new PointerLockControls(camera, document.body);
const raycaster = new THREE.Raycaster();

// Initialize World
generateWorld();
camera.position.set(0, 5, 0);
updateUI();

// --- INPUTS ---
document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    controls.lock();
});

controls.addEventListener('lock', () => state.active = true);
controls.addEventListener('unlock', () => {
    state.active = false;
    document.getElementById('start-screen').classList.remove('hidden');
    document.querySelector('#start-screen h1').innerText = "PAUSED";
});

window.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'KeyW': state.keys.forward = true; break;
        case 'KeyS': state.keys.backward = true; break;
        case 'KeyA': state.keys.left = true; break;
        case 'KeyD': state.keys.right = true; break;
        case 'Space': state.keys.jump = true; break;
        case 'ShiftLeft': state.keys.sprint = true; break;
        case 'Digit1': state.player.selectedSlot = 1; updateUI(); break;
        case 'Digit2': state.player.selectedSlot = 2; updateUI(); break;
    }
});
window.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'KeyW': state.keys.forward = false; break;
        case 'KeyS': state.keys.backward = false; break;
        case 'KeyA': state.keys.left = false; break;
        case 'KeyD': state.keys.right = false; break;
        case 'Space': state.keys.jump = false; break;
        case 'ShiftLeft': state.keys.sprint = false; break;
    }
});

// --- MINING & BUILDING ---
window.addEventListener('mousedown', (e) => {
    if (!state.active) return;
    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const intersects = raycaster.intersectObjects(blocks);
    
    if (intersects.length > 0 && intersects[0].distance < 6) {
        const hit = intersects[0];
        
        if (e.button === 0) { // Left Click: Mine
            hit.object.userData.hp--;
            if (hit.object.userData.hp <= 0) removeBlock(hit.object);
        } 
        else if (e.button === 2) { // Right Click: Build
            const pos = hit.object.position.clone().add(hit.face.normal);
            const slot = state.inventory[state.player.selectedSlot];
            if (slot && slot.count > 0) {
                createBlock(pos.x, pos.y, pos.z, slot.type);
                slot.count--;
                updateUI();
            }
        }
    }
});

// --- UI UPDATE ---
function updateUI() {
    document.getElementById('coord-display').innerText = 
        `X:${Math.floor(camera.position.x)} Y:${Math.floor(camera.position.y)} Z:${Math.floor(camera.position.z)}`;
    
    const hotbar = document.getElementById('hotbar-container');
    hotbar.innerHTML = '';
    [1, 2].forEach(i => {
        const item = state.inventory[i];
        const div = document.createElement('div');
        div.className = `hotbar-slot ${state.player.selectedSlot === i ? 'active' : ''}`;
        if(item) div.innerHTML = `<span>${item.icon}</span><span style="position:absolute; bottom:2px; right:4px; font-size:16px;">${item.count}</span>`;
        hotbar.appendChild(div);
    });
}

// --- GAME LOOP ---
let lastTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    updatePhysics(camera, delta);
    if(state.active) updateUI();
    
    renderer.render(scene, camera);
}
animate();
