import * as THREE from 'three';

// --- Material Definitions ---
const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, metalness: 1.0, roughness: 0.25 });
const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x959595, metalness: 1.0, roughness: 0.45 });
const plasticMaterial = new THREE.MeshStandardMaterial({ color: 0x4A3B31, metalness: 0.05, roughness: 0.55 });
const redPlasticMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.05, roughness: 0.4 });
const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.05, transparent: true, opacity: 0.25 });
const ceramicMaterial = new THREE.MeshStandardMaterial({ color: 0xF0EAD6, metalness: 0.0, roughness: 0.6 }); // beige for resistor body
const copperMaterial = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 1.0, roughness: 0.3 });

// Battery specific materials
const batteryBodyRedMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.3, roughness: 0.5 });
const batteryLabelYellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffdd00, metalness: 0.2, roughness: 0.7 });
const batteryTerminalMaterial = new THREE.MeshStandardMaterial({ color: 0x959595, metalness: 1.0, roughness: 0.4 }); // Re-using and renaming for clarity
const batteryNegativeTerminalMaterial = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 1.0, roughness: 0.5 });

// Resistor specific materials
const resistorCeramicMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C, metalness: 0.0, roughness: 0.7 }); // Tan/beige, adjusted from F0EAD6
const resistorLeadMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 1.0, roughness: 0.3 }); // Tinned copper - silverish
const resistorEndCapMaterial = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, metalness: 1.0, roughness: 0.4 });

// Adjusted plastic material for switch base (used in createSwitch below)
const bakeliteSwitchMaterial = new THREE.MeshStandardMaterial({ color: 0x4A3B31, metalness: 0.05, roughness: 0.45 });

// Duracell-style Battery Materials
const batteryBlackMaterial = new THREE.MeshStandardMaterial({ color: 0x121212, metalness: 0.2, roughness: 0.5 });
const batteryCopperMaterial = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.7, roughness: 0.35 });

// Edison Bulb Materials
const vintageGlassMaterial = new THREE.MeshStandardMaterial({ color: 0xE8D5A2, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
const bulbBaseBrassMaterial = new THREE.MeshStandardMaterial({ color: 0xb58969, metalness: 0.8, roughness: 0.4 });
const bulbInsulatorMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.0, roughness: 0.7 });
const bulbBottomContactMaterial = new THREE.MeshStandardMaterial({ color: 0x707070, metalness: 0.9, roughness: 0.3 });
const internalGlassSupportMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.05, transparent: true, opacity: 0.15 });
const filamentWireMaterial = new THREE.MeshStandardMaterial({ color: 0x606060, metalness: 0.8, roughness: 0.5 });

function createShadowCastingMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

export function createBattery() {
    const group = new THREE.Group();
    const overallHeight = 1.5;
    const bodyRadius = 0.4;

    const copperPartHeight = overallHeight * 0.35;
    const blackPartHeight = overallHeight - copperPartHeight;

    const terminalHeight = 0.05; // Thinner positive terminal structures
    const positiveTerminalButtonRadius = 0.12;
    const positiveTerminalContactRingRadius = bodyRadius * 0.75;
    const topSilverRingHeight = 0.04;

    // Black lower part
    const blackGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, blackPartHeight, 64);
    const blackPart = createShadowCastingMesh(blackGeo, batteryBlackMaterial);
    blackPart.position.y = blackPartHeight / 2 - (overallHeight / 2); // Positioned at the bottom
    group.add(blackPart);

    // Copper upper part
    const copperGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, copperPartHeight, 64);
    const copperPart = createShadowCastingMesh(copperGeo, batteryCopperMaterial);
    copperPart.position.y = blackPart.position.y + blackPartHeight / 2 + copperPartHeight / 2;
    group.add(copperPart);

    // Top silver ring on copper part
    const topRingGeo = new THREE.CylinderGeometry(bodyRadius + 0.001, bodyRadius + 0.001, topSilverRingHeight, 64);
    const topRing = createShadowCastingMesh(topRingGeo, batteryTerminalMaterial);
    // Position it at the very top of the copper part
    topRing.position.y = copperPart.position.y + copperPartHeight / 2 - topSilverRingHeight / 2;
    group.add(topRing);

    // Positive Terminal (Contact Ring - wider and flatter)
    const positiveTerminalContactGeo = new THREE.CylinderGeometry(positiveTerminalContactRingRadius, positiveTerminalContactRingRadius, terminalHeight, 48);
    const positiveTerminalContact = createShadowCastingMesh(positiveTerminalContactGeo, batteryTerminalMaterial);
    positiveTerminalContact.position.y = copperPart.position.y + copperPartHeight / 2 + terminalHeight / 2 - topSilverRingHeight; // Sit just below the top ring, on copper
    group.add(positiveTerminalContact);

    // Positive Terminal (Central Button)
    const positiveTerminalButtonGeo = new THREE.CylinderGeometry(positiveTerminalButtonRadius, positiveTerminalButtonRadius * 0.8, terminalHeight * 1.5, 32);
    const positiveTerminalButton = createShadowCastingMesh(positiveTerminalButtonGeo, batteryTerminalMaterial);
    positiveTerminalButton.position.y = positiveTerminalContact.position.y + terminalHeight / 2 + (terminalHeight * 1.5) / 2;
    group.add(positiveTerminalButton);
    
    // Negative terminal (flat disc at the bottom)
    const negativeTerminalGeo = new THREE.CylinderGeometry(bodyRadius * 0.85, bodyRadius * 0.85, 0.04, 48);
    const negativeTerminal = createShadowCastingMesh(negativeTerminalGeo, batteryNegativeTerminalMaterial);
    negativeTerminal.position.y = blackPart.position.y - blackPartHeight / 2 + 0.02; // Ensure it's at the very bottom
    group.add(negativeTerminal);

    // Group's origin is now effectively at the center of the overall battery height
    // Adjust group so its base (bottom of negative terminal) is at y=0 locally for easier placement in scene
    group.position.y = (overallHeight / 2) - (blackPart.position.y - blackPartHeight / 2 + 0.02); 

    group.rotation.z = Math.PI / 2; // Lay it flat as per original setup
    return group;
}

export function createResistor() {
    const group = new THREE.Group();
    const bodyMaxRadius = 0.16; // Slightly increased max radius
    const bodyMinRadius = 0.1;  // Radius at the ends where leads connect
    const bodyLength = 0.6;
    const leadRadius = 0.025;
    const leadLength = 0.4;

    // Resistor Body with LatheGeometry for bulbous shape
    const points = [];
    points.push(new THREE.Vector2(bodyMinRadius, -bodyLength / 2)); // Start at bottom for lead
    points.push(new THREE.Vector2(bodyMaxRadius * 0.8, -bodyLength / 2 * 0.7)); // Start of curve
    points.push(new THREE.Vector2(bodyMaxRadius, -bodyLength / 2 * 0.3)); // Max radius part 1
    points.push(new THREE.Vector2(bodyMaxRadius, bodyLength / 2 * 0.3));  // Max radius part 2
    points.push(new THREE.Vector2(bodyMaxRadius * 0.8, bodyLength / 2 * 0.7)); // End of curve
    points.push(new THREE.Vector2(bodyMinRadius, bodyLength / 2));   // End at top for lead
    
    const bodyGeo = new THREE.LatheGeometry(points, 32);
    const body = createShadowCastingMesh(bodyGeo, resistorCeramicMaterial);
    // No need to add body to group yet, it will be rotated with the group later.
    // The lathe is built along Y, will be rotated to X with the group.
    group.add(body);

    // Color bands - Updated colors and adjusted positioning for LatheGeometry
    const bandHeight = 0.07;
    const bandColors = [0x007bff, 0x808080, 0x8B4513, 0xFFD700]; // Blue, Gray, Brown, Gold

    // Bands should be placed on the flatter, wider central part of the resistor
    // Approximate y-positions for bands on the lathe geometry (relative to its local Y-axis)
    const bandPositionsY = [-0.09, -0.01, 0.07, 0.15]; // Spaced out

    for (let i = 0; i < bandColors.length; i++) {
        // For LatheGeometry, band radius needs to correspond to the lathe's radius at bandPositionsY[i]
        // This is a simplification: using bodyMaxRadius. A more accurate way would be to find the exact radius on the curve.
        const bandGeo = new THREE.CylinderGeometry(bodyMaxRadius + 0.005, bodyMaxRadius + 0.005, bandHeight, 24);
        const bandMat = new THREE.MeshStandardMaterial({ color: bandColors[i], metalness: 0.0, roughness: 0.5 });
        const band = createShadowCastingMesh(bandGeo, bandMat);
        band.position.y = bandPositionsY[i]; 
        // No need to add to group yet, will be part of the main resistor group that gets rotated.
        body.add(band); // Add bands as children of the resistor body so they rotate together
    }
    
    // Leads
    const leadGeo = new THREE.CylinderGeometry(leadRadius, leadRadius, leadLength, 12);
    
    const lead1 = createShadowCastingMesh(leadGeo, resistorLeadMaterial);
    lead1.position.y = bodyLength / 2 + leadLength / 2 - 0.01; // Adjusted for new body shape origin
    body.add(lead1); // Add as child of the body

    const lead2 = createShadowCastingMesh(leadGeo, resistorLeadMaterial);
    lead2.position.y = -(bodyLength / 2 + leadLength / 2 - 0.01); // Adjusted
    body.add(lead2); // Add as child of the body
    
    group.rotation.x = Math.PI / 2; // Orient horizontally
    return group;
}

export function createBulb() {
    const group = new THREE.Group();
    const bulbOverallScale = 0.8; // Scale down the entire bulb if it feels too large

    // --- Glass Envelope ---
    const points = [];
    points.push(new THREE.Vector2(0.001, 0));      // Bottom start of neck
    points.push(new THREE.Vector2(0.15, 0.05));    // Neck flare
    points.push(new THREE.Vector2(0.25, 0.2));     // Wider neck
    points.push(new THREE.Vector2(0.38, 0.5));     // Start of main bulb curve
    points.push(new THREE.Vector2(0.4, 0.8));      // Max width
    points.push(new THREE.Vector2(0.35, 1.1));     // Upper curve
    points.push(new THREE.Vector2(0.2, 1.25));     // Towards top
    points.push(new THREE.Vector2(0.001, 1.3));    // Top center (almost closed)
    const glassEnvelopeGeo = new THREE.LatheGeometry(points, 32);
    const glassEnvelope = createShadowCastingMesh(glassEnvelopeGeo, vintageGlassMaterial);
    group.add(glassEnvelope);

    // Glass pip at the top
    const pipGeo = new THREE.SphereGeometry(0.03, 16, 16);
    const pip = createShadowCastingMesh(pipGeo, vintageGlassMaterial);
    pip.position.y = 1.31; // Slightly above the lathe top
    group.add(pip);

    // --- Metallic Base ---
    const baseHeight = 0.35;
    const baseRadius = 0.24; // Slightly less than widest part of glass neck
    const basePositionY = -0.05; // Position base slightly overlapping with bottom of glass neck

    const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.95, baseHeight, 32);
    const baseMesh = createShadowCastingMesh(baseGeo, bulbBaseBrassMaterial);
    baseMesh.position.y = basePositionY;
    group.add(baseMesh);

    // Simulated Threads
    const threadCount = 4;
    const threadHeight = 0.02;
    for (let i = 0; i < threadCount; i++) {
        const threadRadius = baseRadius * 0.96 - (i * 0.003); // Taper slightly
        const threadGeo = new THREE.TorusGeometry(threadRadius, threadHeight, 8, 32);
        const thread = createShadowCastingMesh(threadGeo, bulbBaseBrassMaterial);
        thread.position.y = basePositionY + baseHeight/2 - 0.06 - i * 0.065;
        thread.rotation.x = Math.PI / 2;
        group.add(thread);
    }

    // Insulator Ring
    const insulatorHeight = 0.07;
    const insulatorRadius = baseRadius * 0.85;
    const insulatorGeo = new THREE.CylinderGeometry(insulatorRadius, insulatorRadius, insulatorHeight, 32);
    const insulatorMesh = createShadowCastingMesh(insulatorGeo, bulbInsulatorMaterial);
    insulatorMesh.position.y = basePositionY - baseHeight/2 - insulatorHeight/2 + 0.01; // Below brass base
    group.add(insulatorMesh);

    // Bottom Contact
    const bottomContactRadius = 0.1;
    const bottomContactHeight = 0.04;
    const bottomContactGeo = new THREE.CylinderGeometry(bottomContactRadius, bottomContactRadius * 0.8, bottomContactHeight, 16);
    const bottomContactMesh = createShadowCastingMesh(bottomContactGeo, bulbBottomContactMaterial);
    bottomContactMesh.position.y = insulatorMesh.position.y - insulatorHeight/2 - bottomContactHeight/2 + 0.005;
    group.add(bottomContactMesh);

    // --- Internal Structure ---
    const internalStemHeight = 0.5;
    const internalStemRadius = 0.04;

    // Main glass stem
    const stemGeo = new THREE.CylinderGeometry(internalStemRadius, internalStemRadius * 0.7, internalStemHeight, 12);
    const stemMesh = createShadowCastingMesh(stemGeo, internalGlassSupportMaterial);
    stemMesh.position.y = basePositionY + baseHeight/2 + internalStemHeight/2 - 0.05; // Sits inside, starting from top of base
    group.add(stemMesh);

    // Flare at the top of the stem (where filament supports attach)
    const stemFlareGeo = new THREE.CylinderGeometry(internalStemRadius * 0.8, internalStemRadius * 1.5, 0.1, 12);
    const stemFlareMesh = createShadowCastingMesh(stemFlareGeo, internalGlassSupportMaterial);
    stemFlareMesh.position.y = stemMesh.position.y + internalStemHeight/2 + 0.05;
    group.add(stemFlareMesh);

    // Lead-in wires (simplified)
    const leadWireHeight = internalStemHeight + 0.1;
    const leadWireGeo = new THREE.CylinderGeometry(0.008, 0.008, leadWireHeight, 6);
    
    const leadWire1 = createShadowCastingMesh(leadWireGeo, filamentWireMaterial);
    leadWire1.position.set(internalStemRadius * 0.3, stemMesh.position.y, 0);
    group.add(leadWire1);

    const leadWire2 = createShadowCastingMesh(leadWireGeo, filamentWireMaterial);
    leadWire2.position.set(-internalStemRadius * 0.3, stemMesh.position.y, 0);
    group.add(leadWire2);

    // Complex Filament
    const filamentPathPoints = [];
    const f_loops = 4;
    const f_height = 0.35;
    const f_radius = 0.1;
    const f_start_y = stemFlareMesh.position.y + 0.05;

    for (let i = 0; i < f_loops * 20; i++) {
        const t = (i / (f_loops * 20)) * Math.PI * 2 * f_loops;
        const x = Math.cos(t * 1.5) * f_radius * (1 + Math.sin(t * 0.8) * 0.3);
        const z = Math.sin(t * 1.5) * f_radius * (1 + Math.cos(t * 1.1) * 0.3);
        const y = f_start_y + (i / (f_loops * 20)) * f_height;
        filamentPathPoints.push(new THREE.Vector3(x, y, z));
    }
    const filamentCurve = new THREE.CatmullRomCurve3(filamentPathPoints);
    const filamentTubeGeo = new THREE.TubeGeometry(filamentCurve, 64, 0.007, 8, false);
    
    // Define the material for the filament that CircuitManager will control
    const filamentMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffcc33, 
        emissive: 0x000000, 
        metalness: 0.2, 
        roughness: 0.5 
    });
    const complexFilament = createShadowCastingMesh(filamentTubeGeo, filamentMaterial);
    group.add(complexFilament);

    // Define the light for the bulb that CircuitManager will control
    const bulbLight = new THREE.PointLight(0xffdd66, 0, 5); 
    bulbLight.castShadow = true; 
    bulbLight.shadow.mapSize.width = 512; // Ensure shadow map size is set
    bulbLight.shadow.mapSize.height = 512;
    complexFilament.add(bulbLight); 

    // Final scaling and positioning adjustments
    group.scale.set(bulbOverallScale, bulbOverallScale, bulbOverallScale);
    // The LatheGeometry is built upwards from y=0. The base is then added below y=0.
    // To make the very bottom of the bulb (bottom contact) sit at y=0 of the group:
    const lowestPointY = bottomContactMesh.position.y - bottomContactHeight / 2;
    group.position.y = -lowestPointY * bulbOverallScale;

    return { group, filamentMaterial, glass: glassEnvelope, bulbLight }; // glassEnvelope for potential future interactions
}

export function createSwitch() {
    const group = new THREE.Group();
    const baseWidth = 0.8;
    const baseHeight = 0.2;
    const baseDepth = 1.5;
    const bevelSize = 0.03;

    // Base
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const switchBase = createShadowCastingMesh(baseGeo, bakeliteSwitchMaterial); // Use updated material
    switchBase.position.y = baseHeight / 2; 
    group.add(switchBase);

    // Bevels for the base (simplified)
    const bevelMaterial = bakeliteSwitchMaterial; // Same material as base
    const bevelLengthZ = baseDepth;
    const bevelLengthX = baseWidth;
    const bevelGeoZ = new THREE.BoxGeometry(bevelSize, bevelSize, bevelLengthZ);
    const bevelGeoX = new THREE.BoxGeometry(bevelLengthX, bevelSize, bevelSize);

    // Front bevel
    let bevel = createShadowCastingMesh(bevelGeoX, bevelMaterial);
    bevel.position.set(0, baseHeight + bevelSize/2, baseDepth/2 + bevelSize/2);
    // group.add(bevel); // These simple box bevels might not look great, will re-evaluate based on complexity goals
    // Back, Left, Right bevels would be similar if desired.
    // For now, keeping the base simple to focus on contacts and lever.

    // Contacts
    const contactHeight = 0.25;
    const contactWidth = 0.15; // Thinner contacts
    const contactDepth = 0.2;

    // Contact 1 (U-shaped clip)
    const clipGroup = new THREE.Group();
    const clipSideGeo = new THREE.BoxGeometry(contactWidth * 0.4, contactHeight, contactDepth * 0.8);
    const clipBackGeo = new THREE.BoxGeometry(contactWidth * 1.2, contactHeight * 0.4, contactDepth * 0.8);

    const clipSide1 = createShadowCastingMesh(clipSideGeo, copperMaterial);
    clipSide1.position.x = -contactWidth * 0.4;
    clipGroup.add(clipSide1);

    const clipSide2 = createShadowCastingMesh(clipSideGeo, copperMaterial);
    clipSide2.position.x = contactWidth * 0.4;
    clipGroup.add(clipSide2);

    const clipBack = createShadowCastingMesh(clipBackGeo, copperMaterial);
    clipBack.position.z = -contactDepth * 0.4; // Position it to form the back of U
    clipBack.position.y = -contactHeight/2 + (contactHeight*0.4)/2; // Lowered
    clipGroup.add(clipBack);
    
    clipGroup.position.set(0, baseHeight + contactHeight/2, -baseDepth * 0.35);
    group.add(clipGroup);

    // Contact 2 (Pivot Block)
    const pivotBlockGeo = new THREE.BoxGeometry(contactWidth * 1.5, contactHeight * 1.2, contactDepth * 1.2);
    const contact2 = createShadowCastingMesh(pivotBlockGeo, copperMaterial);
    contact2.position.set(0, baseHeight + (contactHeight * 1.2)/2, baseDepth * 0.35);
    group.add(contact2);

    // Lever arm
    const lever = new THREE.Group();
    const armLength = 1.0;
    const armGeo = new THREE.BoxGeometry(0.12, 0.05, armLength); // Slightly thinner width
    const arm = createShadowCastingMesh(armGeo, metalMaterial);
    arm.position.z = 0; 
    lever.add(arm);

    // Ferrule for handle
    const ferruleRadius = 0.11;
    const ferruleHeight = 0.08;
    const ferruleGeo = new THREE.CylinderGeometry(ferruleRadius, ferruleRadius, ferruleHeight, 16);
    const ferrule = createShadowCastingMesh(ferruleGeo, metalMaterial);
    ferrule.rotation.x = Math.PI / 2;
    ferrule.position.z = -armLength/2 + ferruleHeight/2 - 0.02; // Positioned at the base of the handle
    lever.add(ferrule);

    // Handle
    const handleRadius = 0.1;
    const handleLength = 0.4;
    const handleGeo = new THREE.CylinderGeometry(handleRadius, handleRadius, handleLength, 24); // Smoother handle
    const handle = createShadowCastingMesh(handleGeo, redPlasticMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.position.z = -armLength/2 - handleLength/2 + 0.01; // Adjusted to sit on ferrule
    lever.add(handle);
    
    lever.position.set(0, baseHeight + contactHeight * 1.2 , baseDepth * 0.35); // Pivot point over contact2
    lever.rotation.x = Math.PI / 3; // Initial open state

    group.add(lever);

    return { group, lever, handle };
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