import * as THREE from 'three';

const ELECTRON_COLOR = 0x00ffff;
const ELECTRON_SIZE = 0.03;

export default class ElectronManager {
    constructor(scene, electronPoolSize = 50) {
        this.scene = scene;
        this.electronPoolSize = electronPoolSize;
        this.electrons = [];
        this.electronMaterial = new THREE.MeshStandardMaterial({
            color: ELECTRON_COLOR,
            emissive: ELECTRON_COLOR,
            emissiveIntensity: 2,
            metalness: 0.1,
            roughness: 0.4,
            // transparent: true, // Optional: if transparency is desired
            // opacity: 0.8       // Optional: if transparency is desired
        });
        this.electronGeometry = new THREE.SphereGeometry(ELECTRON_SIZE, 8, 8);

        this.pathSegments = []; // Array of THREE.CatmullRomCurve3 objects
        this.isPathActive = false; // True if the circuit is closed
        this.totalPathLength = 0;
        this.segmentLengths = [];
        this.cumulativeSegmentLengths = [];

        this.progressMarkers = new Array(this.electronPoolSize).fill(0).map(() => Math.random()); // Normalized progress along total active path

        this._initElectronPool();
    }

    _initElectronPool() {
        for (let i = 0; i < this.electronPoolSize; i++) {
            const electronMesh = new THREE.Mesh(this.electronGeometry, this.electronMaterial);
            electronMesh.visible = false;
            this.scene.add(electronMesh);
            this.electrons.push({
                mesh: electronMesh,
                currentSegmentIndex: 0,
                progressOnSegment: 0, // Normalized progress on current segment
                overallProgress: this.progressMarkers[i] // Initial random normalized progress on the *total* path
            });
        }
    }

    setPathSegments(segments) { // segments is an array of THREE.CatmullRomCurve3
        this.pathSegments = segments;
        this._calculatePathLengths();
        // Re-distribute electrons according to new total path length if needed
        this.electrons.forEach((electron, i) => {
            electron.overallProgress = this.progressMarkers[i]; // Keep their relative spacing
        });
    }

    _calculatePathLengths() {
        this.totalPathLength = 0;
        this.segmentLengths = [];
        this.cumulativeSegmentLengths = [0]; // Start with 0 for easier calculation

        if (!this.pathSegments || this.pathSegments.length === 0) return;

        this.pathSegments.forEach(segment => {
            const length = segment.getLength();
            this.segmentLengths.push(length);
            this.totalPathLength += length;
        });

        for (let i = 0; i < this.segmentLengths.length; i++) {
            this.cumulativeSegmentLengths.push(this.cumulativeSegmentLengths[i] + this.segmentLengths[i]);
        }
    }
    
    // Called by CircuitManager when switch state changes
    updateFlowState(isCircuitClosed) {
        this.isPathActive = isCircuitClosed;
        this.electrons.forEach(e => e.mesh.visible = this.isPathActive);
        if (!this.isPathActive) {
            // Optional: could reset electron positions or handle them stopping more gracefully
        } else {
            // Re-initialize progress if starting flow anew after a stop
             this.electrons.forEach((electron, i) => {
                electron.overallProgress = this.progressMarkers[i];
            });
        }
    }

    update(deltaTime) {
        if (!this.isPathActive || this.pathSegments.length === 0 || this.totalPathLength === 0) {
            this.electrons.forEach(e => e.mesh.visible = false);
            return;
        }
        
        this.electrons.forEach(e => e.mesh.visible = true);

        const speed = 0.5; // Units per second, adjust as needed

        this.electrons.forEach(electron => {
            electron.overallProgress += (speed * deltaTime) / this.totalPathLength;
            electron.overallProgress %= 1.0; // Wrap around

            let currentCumulativeLength = electron.overallProgress * this.totalPathLength;
            
            let segmentIndex = 0;
            for (let i = 0; i < this.cumulativeSegmentLengths.length -1; i++) {
                if (currentCumulativeLength >= this.cumulativeSegmentLengths[i] && currentCumulativeLength < this.cumulativeSegmentLengths[i+1]) {
                    segmentIndex = i;
                    break;
                }
                // Handle case where progress might be exactly at the end of the last segment due to modulo
                if (i === this.cumulativeSegmentLengths.length - 2 && currentCumulativeLength >= this.cumulativeSegmentLengths[i+1]) {
                    segmentIndex = i; 
                }
            }
            
            const lengthIntoSegment = currentCumulativeLength - this.cumulativeSegmentLengths[segmentIndex];
            const progressOnSegment = this.segmentLengths[segmentIndex] > 0 ? lengthIntoSegment / this.segmentLengths[segmentIndex] : 0;

            if (this.pathSegments[segmentIndex]) {
                const point = this.pathSegments[segmentIndex].getPointAt(Math.min(progressOnSegment, 1.0)); // Clamp progress to 1.0
                electron.mesh.position.copy(point);

                // Optional: Orient electron to path direction (can be performance intensive)
                // if (progressOnSegment < 1.0) {
                //     const tangent = this.pathSegments[segmentIndex].getTangentAt(progressOnSegment);
                //     electron.mesh.lookAt(point.clone().add(tangent));
                // }
            }
        });
    }
} 