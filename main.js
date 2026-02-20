import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { SpiritualState } from './spiritual.js';

let scene, camera, renderer;
let spiritual = new SpiritualState();
let blocks = [];

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  createGround();

  window.addEventListener('click', placeBlock);
  window.addEventListener('contextmenu', removeBlock);

  animate();
}

function createGround() {
  for (let x = -10; x < 10; x++) {
    for (let z = -10; z < 10; z++) {
      createBlock(x, 0, z, 0x228B22);
    }
  }
}

function createBlock(x, y, z, color) {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  scene.add(cube);
  blocks.push(cube);
}

function placeBlock(event) {
  createBlock(
    Math.floor(Math.random() * 5),
    1,
    Math.floor(Math.random() * 5),
    0x8B4513
  );
}

function removeBlock(event) {
  event.preventDefault();
  if (blocks.length > 0) {
    let block = blocks.pop();
    scene.remove(block);
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.pray = function() {
  spiritual.pray();
  document.getElementById("faith").innerText = spiritual.faith;
}

window.study = function() {
  spiritual.study();
  document.getElementById("wisdom").innerText = spiritual.wisdom;
}
