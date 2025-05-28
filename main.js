import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from 'tween.js';
import { createScene, createRenderer, createCamera, createLights } from './sceneConfig.js';
import { createBattery, createResistor, createBulb, createSwitch, createWire } from './componentFactory.js';
import CircuitManager from './circuitManager.js';
import ElectronManager from './electronManager.js';

let scene, camera, renderer, controls;
let circuitManager;
let electronManager;
let switchComponent, bulbComponent, resistor;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clock = new THREE.Clock();

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

    // Initialize ElectronManager
    electronManager = new ElectronManager(scene, 75);

    // --- Define Path Segments for Electron Flow (Negative to Positive) ---
    const pathSegments = [];
    let points;

    // Segment 1: Battery Negative to Switch Pivot (Contact 2)
    // Battery Negative is at approximately (-0.75, 0.5, 3) [end of its negative terminal geometry]
    // Switch Pivot (Contact 2) is at (-3, 0.5, 0.5)
    points = [
        new THREE.Vector3(-0.75, 0.5, 3.0), // Battery Negative Output
        new THREE.Vector3(-1.5, 0.5, 2.0),  // Intermediate point for curve
        new THREE.Vector3(-2.5, 0.5, 1.0),  // Intermediate point for curve
        new THREE.Vector3(-3.0, 0.5, 0.5)   // Switch Pivot Contact
    ];
    pathSegments.push(new THREE.CatmullRomCurve3(points));

    // Segment 2: Through Switch Lever (Pivot to Closing Contact)
    // Switch Pivot is at (-3, 0.5, 0.5)
    // Switch Closing Contact is at (-3, 0.5, -0.5)
    // This path will be affected by the lever's rotation. For now, a straight line.
    // A more advanced implementation would make this segment dynamic based on lever position.
    points = [
        new THREE.Vector3(-3.0, 0.5, 0.5),  // Pivot Point
        new THREE.Vector3(-3.0, 0.5, 0.0),  // Mid-point of lever arm
        new THREE.Vector3(-3.0, 0.5, -0.5)  // Closing Contact Point
    ];
    pathSegments.push(new THREE.CatmullRomCurve3(points));
    
    // Segment 3: Switch Closing Contact to Bulb (Left Side)
    // Switch Closing Contact (-3, 0.5, -0.5)
    // Bulb Left Side is (-0.2, 0.5, -3)
    points = [
        new THREE.Vector3(-3.0, 0.5, -0.5), // Switch Closing Contact
        new THREE.Vector3(-2.0, 0.5, -1.5), // Intermediate
        new THREE.Vector3(-1.0, 0.5, -2.5), // Intermediate
        new THREE.Vector3(-0.2, 0.5, -3.0)  // Bulb Left Side
    ];
    pathSegments.push(new THREE.CatmullRomCurve3(points));

    // Segment 4: Bulb Filament Path (Placeholder - very simplified straight line for now)
    // Bulb Left Side: (-0.2, 0.5, -3.0)
    // Bulb Right Side: (0.2, 0.5, -3.0) (assuming connection point is symmetrical)
    // This needs to be replaced with actual filament path points from createBulb geometry later
    const bulbFilamentPoints = [
        new THREE.Vector3(-0.2, 0.5, -3.0), // Entry point (approx)
        new THREE.Vector3(0.0, 0.6, -3.0),  // Middle (approx, slightly higher)
        new THREE.Vector3(0.2, 0.5, -3.0)   // Exit point (approx)
    ];
    pathSegments.push(new THREE.CatmullRomCurve3(bulbFilamentPoints));

    // Segment 5: Bulb (Right Side) to Resistor (Bottom Lead)
    // Bulb Right Side: (0.2, 0.5, -3.0)
    // Resistor Bottom Lead: (3.0, 0.5, -0.7)
    points = [
        new THREE.Vector3(0.2, 0.5, -3.0),  // Bulb Right Side
        new THREE.Vector3(1.0, 0.5, -2.0),  // Intermediate
        new THREE.Vector3(2.0, 0.5, -1.0),  // Intermediate
        new THREE.Vector3(3.0, 0.5, -0.7)   // Resistor Bottom Lead
    ];
    pathSegments.push(new THREE.CatmullRomCurve3(points));

    // Segment 6: Through Resistor Body
    // Resistor Bottom Lead: (3.0, 0.5, -0.7)
    // Resistor Top Lead: (3.0, 0.5, 0.7)
    points = [
        new THREE.Vector3(3.0, 0.5, -0.7), // Resistor Bottom Lead
        new THREE.Vector3(3.0, 0.5, 0.0),  // Mid-point of resistor
        new THREE.Vector3(3.0, 0.5, 0.7)   // Resistor Top Lead
    ];
    pathSegments.push(new THREE.CatmullRomCurve3(points));

    // Segment 7: Resistor (Top Lead) to Battery Positive
    // Resistor Top Lead: (3.0, 0.5, 0.7)
    // Battery Positive: (0.8, 0.5, 3.0) [end of its positive terminal geometry]
    points = [
        new THREE.Vector3(3.0, 0.5, 0.7),   // Resistor Top Lead
        new THREE.Vector3(2.0, 0.5, 1.5),   // Intermediate
        new THREE.Vector3(1.0, 0.5, 2.5),   // Intermediate
        new THREE.Vector3(0.8, 0.5, 3.0)    // Battery Positive Input
    ];
    pathSegments.push(new THREE.CatmullRomCurve3(points));

    electronManager.setPathSegments(pathSegments);

    circuitManager = new CircuitManager(bulbComponent, switchComponent, electronManager);

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
    const deltaTime = clock.getDelta();
    TWEEN.update();
    controls.update();
    if (electronManager) {
        electronManager.update(deltaTime);
    }
    renderer.render(scene, camera);
}

init();