import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from 'tween.js';
import { createScene, createRenderer, createCamera, createLights } from './sceneConfig.js';
import { createBattery, createResistor, createBulb, createSwitch, createWire } from './componentFactory.js';
import CircuitManager from './circuitManager.js';

let scene, camera, renderer, controls;
let circuitManager;
let switchComponent, bulbComponent, resistor;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function init() {
    const container = document.getElementById('container');

    renderer = createRenderer();
    container.appendChild(renderer.domElement);

    scene = createScene();
    camera = createCamera();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.target.set(0, 0.5, 0);

    createLights(scene);

    // Workbench
    const workbenchGeo = new THREE.BoxGeometry(20, 0.2, 10);
    const workbenchMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.95 });
    const workbench = new THREE.Mesh(workbenchGeo, workbenchMat);
    workbench.position.y = -0.1;
    workbench.receiveShadow = true;
    scene.add(workbench);

    // Create components
    const battery = createBattery();
    battery.position.set(0, 0.5, 3);
    battery.rotation.z = Math.PI / 2;
    scene.add(battery);

    resistor = createResistor();
    resistor.position.set(3, 0.5, 0);
    scene.add(resistor);
    
    bulbComponent = createBulb();
    bulbComponent.group.position.set(0, 0.5, -3);
    scene.add(bulbComponent.group);

    switchComponent = createSwitch();
    switchComponent.group.position.set(-3, 0.5, 0);
    switchComponent.group.rotation.y = 0;
    scene.add(switchComponent.group);

    // Wires for the square layout
    // Battery (+) to Resistor (top lead)
    scene.add(createWire(new THREE.Vector3(0.8, 0.5, 3), new THREE.Vector3(3, 0.5, 0.7)));
    // Resistor (bottom lead) to Bulb (right side of base)
    scene.add(createWire(new THREE.Vector3(3, 0.5, -0.7), new THREE.Vector3(0.2, 0.5, -3)));
    // Bulb (left side of base) to Switch (contact 1 - non-pivot)
    scene.add(createWire(new THREE.Vector3(-0.2, 0.5, -3), new THREE.Vector3(-3, 0.5, -0.5)));
    // Switch (contact 2 - pivot) to Battery (-)
    scene.add(createWire(new THREE.Vector3(-3, 0.5, 0.5), new THREE.Vector3(-0.75, 0.5, 3)));


    circuitManager = new CircuitManager(bulbComponent, switchComponent);

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onClick);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(switchComponent.handle, true);
    if (intersects.length > 0) {
        circuitManager.toggleSwitch();
    }
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
}

init();