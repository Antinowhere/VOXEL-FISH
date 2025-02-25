import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Initialize Three.js scene
let scene, camera, renderer, composer;
let goldfish, sharks = [], smallFish = [];
const COLORS = {
    water: 0x4499ff,
    goldfish: 0xff6600,
    shark: 0x666666,
    smallFish: 0x55ff55,
    sunray: 0xffffdd
};

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.water);

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 5;

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    // Setup post-processing for sun rays
    setupPostProcessing();

    // Create underwater elements
    createGoldfish();
    createSharks(3);
    createSchoolOfFish(20);
    createVoxelTerrain();

    // Setup mouse movement
    document.addEventListener('mousemove', onMouseMove);

    // Start animation loop
    animate();
}

function setupPostProcessing() {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);
}

function createVoxelCube(color, size = 1) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}

function createGoldfish() {
    goldfish = createVoxelCube(COLORS.goldfish);
    goldfish.scale.set(0.5, 0.5, 1);
    scene.add(goldfish);
}

function createSharks(count) {
    for (let i = 0; i < count; i++) {
        const shark = createVoxelCube(COLORS.shark, 2);
        shark.position.set(
            Math.random() * 40 - 20,
            Math.random() * 20 - 10,
            Math.random() * 10 - 5
        );
        sharks.push(shark);
        scene.add(shark);
    }
}

function createSchoolOfFish(count) {
    for (let i = 0; i < count; i++) {
        const fish = createVoxelCube(COLORS.smallFish, 0.3);
        fish.position.set(
            Math.random() * 40 - 20,
            Math.random() * 20 - 10,
            Math.random() * 10 - 5
        );
        smallFish.push(fish);
        scene.add(fish);
    }
}

function createVoxelTerrain() {
    // Create some basic terrain blocks
    for (let x = -20; x < 20; x += 2) {
        const height = Math.floor(Math.sin(x / 5) * 3) + 4;
        for (let y = -15; y < -15 + height; y += 2) {
            const block = createVoxelCube(0x225577, 2);
            block.position.set(x, y, 0);
            scene.add(block);
        }
    }
}

function onMouseMove(event) {
    // Convert mouse position to 3D coordinates
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update goldfish position
    goldfish.position.x = mouseX * 15;
    goldfish.position.y = mouseY * 10;
}

function animate() {
    requestAnimationFrame(animate);

    // Animate sharks
    sharks.forEach(shark => {
        shark.position.x += Math.sin(Date.now() * 0.001) * 0.1;
        shark.position.y += Math.cos(Date.now() * 0.001) * 0.05;

        // Check collision with goldfish
        if (shark.position.distanceTo(goldfish.position) < 2) {
            // Implement collision behavior here
            console.log('Shark attack!');
        }
    });

    // Animate small fish
    smallFish.forEach(fish => {
        fish.position.x += Math.sin(Date.now() * 0.002) * 0.05;
        fish.position.y += Math.cos(Date.now() * 0.002) * 0.03;
    });

    // Render the scene with post-processing
    composer.render();
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the scene when the page loads
init(); 