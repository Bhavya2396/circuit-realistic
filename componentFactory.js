import * as THREE from 'three';

// --- Material Definitions ---
const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, metalness: 1.0, roughness: 0.25 });
const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x959595, metalness: 1.0, roughness: 0.45 });
const plasticMaterial = new THREE.MeshStandardMaterial({ color: 0x4A3B31, metalness: 0.05, roughness: 0.55 });
const redPlasticMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.05, roughness: 0.4 });
const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.05, transparent: true, opacity: 0.25 });
const ceramicMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C, metalness: 0.0, roughness: 0.7 }); // beige for resistor body
const copperMaterial = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 1.0, roughness: 0.3 });

// Battery specific materials
const batteryBodyRedMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.3, roughness: 0.6 });
const batteryLabelYellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffdd00, metalness: 0.2, roughness: 0.7 });
const batteryTerminalMaterial = new THREE.MeshStandardMaterial({ color: 0x959595, metalness: 1.0, roughness: 0.4 }); // Re-using and renaming for clarity
const batteryNegativeTerminalMaterial = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 1.0, roughness: 0.5 });

const resistorLeadMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 1.0, roughness: 0.3 }); // Tinned copper - silverish
// const resistorEndCapMaterial = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, metalness: 1.0, roughness: 0.4 }); // Will likely be removed

function createShadowCastingMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

export function createBattery() {
    const group = new THREE.Group();
    const bodyRadius = 0.4;
    const bodyHeight = 1.5;
    const terminalHeight = 0.1;
    const terminalRadius = 0.15;

    // Main body
    const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 48); // Increased segments for smoothness
    const body = createShadowCastingMesh(bodyGeo, batteryBodyRedMaterial);
    group.add(body);

    // Positive terminal base
    const positiveTerminalBaseGeo = new THREE.CylinderGeometry(terminalRadius, terminalRadius, terminalHeight, 32);
    const positiveTerminalBase = createShadowCastingMesh(positiveTerminalBaseGeo, batteryTerminalMaterial);
    positiveTerminalBase.position.y = bodyHeight / 2 + terminalHeight / 2;
    group.add(positiveTerminalBase);

    // Positive terminal raised cap
    const positiveTerminalCapGeo = new THREE.CylinderGeometry(terminalRadius * 0.7, terminalRadius * 0.7, terminalHeight * 0.5, 32);
    const positiveTerminalCap = createShadowCastingMesh(positiveTerminalCapGeo, batteryTerminalMaterial);
    positiveTerminalCap.position.y = bodyHeight / 2 + terminalHeight + (terminalHeight * 0.5) / 2;
    group.add(positiveTerminalCap);
    
    // Negative terminal (flat disc at the bottom)
    const negativeTerminalGeo = new THREE.CylinderGeometry(bodyRadius * 0.85, bodyRadius * 0.85, 0.03, 32); // Thin disc
    const negativeTerminal = createShadowCastingMesh(negativeTerminalGeo, batteryNegativeTerminalMaterial);
    negativeTerminal.position.y = -bodyHeight / 2 - 0.015;
    group.add(negativeTerminal);

    // Label
    const labelGeo = new THREE.CylinderGeometry(bodyRadius + 0.005, bodyRadius + 0.005, 0.6, 48); // Increased segments
    const label = createShadowCastingMesh(labelGeo, batteryLabelYellowMaterial);
    label.position.y = 0.2; // Keep label position relative to center
    group.add(label);

    group.rotation.z = Math.PI / 2; // Lay it flat
    return group;
}

export function createResistor() {
    const group = new THREE.Group();
    const bodyOverallLength = 0.6; // Effective length for the main ceramic part
    const maxBodyRadius = 0.15;
    const minBodyRadius = 0.1; // Radius at the very ends where leads attach
    const leadRadius = 0.025;
    const leadLength = 0.4;

    // Define points for the LatheGeometry (half-profile of the resistor body)
    const points = [];
    points.push(new THREE.Vector2(minBodyRadius, -bodyOverallLength / 2));          // Start at one end
    points.push(new THREE.Vector2(maxBodyRadius * 0.8, -bodyOverallLength / 2 * 0.7)); // Curve out
    points.push(new THREE.Vector2(maxBodyRadius, -bodyOverallLength / 2 * 0.3));     // Max radius part 1
    points.push(new THREE.Vector2(maxBodyRadius, bodyOverallLength / 2 * 0.3));      // Max radius part 2
    points.push(new THREE.Vector2(maxBodyRadius * 0.8, bodyOverallLength / 2 * 0.7));  // Curve in
    points.push(new THREE.Vector2(minBodyRadius, bodyOverallLength / 2));           // End at other end

    const bodyGeo = new THREE.LatheGeometry(points, 32);
    const body = createShadowCastingMesh(bodyGeo, ceramicMaterial);
    // LatheGeometry creates geometry around Y axis by default. We want it along Y for now, then rotate group.
    group.add(body);

    // Color bands - updated colors and adjusted positioning for lathe shape
    const bandHeight = 0.06;
    // New colors: Blue, Light Gray/Silver, Brown, Gold
    const bandColors = [0x0073CF, 0xAAAAAA, 0x8B4513, 0xFFD700]; 

    // Approximate band positions along the body length (from -bodyOverallLength/2 to +bodyOverallLength/2)
    // These Y positions are relative to the center of the lathe body
    const bandPositionsY = [-0.15, -0.07, 0.01, 0.12]; // Adjust these to look right on the curve
    const bandRadii = [maxBodyRadius*0.95, maxBodyRadius, maxBodyRadius, maxBodyRadius*0.9]; // Radii might vary slightly on the curve

    for (let i = 0; i < bandColors.length; i++) {
        // For LatheGeometry, bands need to be placed carefully. This is a simplified approach.
        // A better way might be to UV map a texture, but for procedural, we make thin cylinders.
        const bandGeo = new THREE.CylinderGeometry(bandRadii[i] + 0.005, bandRadii[i] + 0.005, bandHeight, 32);
        const bandMat = new THREE.MeshStandardMaterial({ color: bandColors[i], metalness: 0.0, roughness: 0.5 });
        const band = createShadowCastingMesh(bandGeo, bandMat);
        band.position.y = bandPositionsY[i];
        // band.rotation.x = Math.PI / 2; // Not needed if body is along Y, then whole group rotates
        group.add(band);
    }
    
    // Leads
    const leadGeo = new THREE.CylinderGeometry(leadRadius, leadRadius, leadLength, 12);
    
    const lead1 = createShadowCastingMesh(leadGeo, resistorLeadMaterial);
    // Attach lead to the end of the lathe body
    lead1.position.y = bodyOverallLength / 2 + leadLength / 2 - 0.01; // Slight overlap
    group.add(lead1);

    const lead2 = createShadowCastingMesh(leadGeo, resistorLeadMaterial);
    lead2.position.y = -(bodyOverallLength / 2 + leadLength / 2 - 0.01); // Slight overlap
    group.add(lead2);
    
    group.rotation.x = Math.PI / 2; // Orient horizontally, as before
    return group;
}

export function createBulb() {
    const group = new THREE.Group();

    // Base (metallic, threaded look)
    const baseHeight = 0.4;
    const baseRadius = 0.2;
    const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.9, baseHeight, 16);
    const base = createShadowCastingMesh(baseGeo, metalMaterial);
    base.position.y = baseHeight / 2;
    group.add(base);

    // Tip contact on base
    const tipGeo = new THREE.CylinderGeometry(baseRadius*0.3, baseRadius*0.3, 0.05, 8);
    const tip = createShadowCastingMesh(tipGeo, darkMetalMaterial);
    tip.position.y = 0.025;
    group.add(tip);

    // Glass envelope
    const glassRadius = 0.4;
    const glassGeo = new THREE.SphereGeometry(glassRadius, 32, 16);
    const glass = createShadowCastingMesh(glassGeo, glassMaterial);
    glass.position.y = baseHeight + glassRadius * 0.9; // Sit on top of base
    group.add(glass);

    // Filament
    const filamentGeo = new THREE.TorusGeometry(0.08, 0.01, 16, 32);
    const filamentMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffcc33, 
        emissive: 0x000000, // Initially off
        metalness: 0.2, 
        roughness: 0.5 
    });
    const filament = createShadowCastingMesh(filamentGeo, filamentMaterial);
    filament.position.y = baseHeight + glassRadius * 0.8;
    filament.rotation.x = Math.PI / 2;
    group.add(filament);

    // Point light for illumination
    const bulbLight = new THREE.PointLight(0xffdd66, 0, 5); // color, intensity (initially 0), distance
    bulbLight.castShadow = true; // Optional: if bulb light should cast shadows
    bulbLight.shadow.mapSize.width = 512;
    bulbLight.shadow.mapSize.height = 512;
    filament.add(bulbLight); // Add light as a child of the filament so it moves with it

    group.position.y = -baseHeight / 2; // Adjust so bottom of base is at y=0 of group

    return { group, filamentMaterial, glass, bulbLight }; // Return the bulbLight
}

export function createSwitch() {
    const group = new THREE.Group();

    // Base
    const baseGeo = new THREE.BoxGeometry(0.8, 0.2, 1.5); // width, height, depth
    const switchBase = createShadowCastingMesh(baseGeo, plasticMaterial);
    switchBase.position.y = 0.1; // Base bottom at y=0
    group.add(switchBase);

    // Contacts
    const contactGeo = new THREE.BoxGeometry(0.3, 0.25, 0.2);
    
    const contact1 = createShadowCastingMesh(contactGeo, copperMaterial);
    contact1.position.set(0, 0.2 + 0.25/2, -0.5); // On top of base, at one end
    group.add(contact1);

    const contact2 = createShadowCastingMesh(contactGeo, copperMaterial);
    contact2.position.set(0, 0.2 + 0.25/2, 0.5); // On top of base, at other end (pivot)
    group.add(contact2);

    // Lever arm
    const lever = new THREE.Group();
    const armGeo = new THREE.BoxGeometry(0.15, 0.05, 1.0);
    const arm = createShadowCastingMesh(armGeo, metalMaterial);
    arm.position.z = 0; // Pivot point at one end of arm
    lever.add(arm);

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 12);
    const handle = createShadowCastingMesh(handleGeo, redPlasticMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.position.z = -0.4; // At the end of the arm
    lever.add(handle);
    
    lever.position.set(0, 0.2 + 0.25, 0.5); // Pivot point over contact2
    lever.rotation.x = Math.PI / 3; // Initial open state

    group.add(lever);

    return { group, lever, handle }; // Return handle for raycasting
}


export function createWire(startPoint, endPoint, color = 0x555555, radius = 0.04) {
    const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
    const length = direction.length();
    const wireGeo = new THREE.CylinderGeometry(radius, radius, length, 8);
    
    const wireMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
    const wire = createShadowCastingMesh(wireGeo, wireMat);

    wire.position.copy(startPoint).add(direction.multiplyScalar(0.5));
    wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    
    return wire;
}