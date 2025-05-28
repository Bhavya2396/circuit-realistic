import * as THREE from 'three';
import * as TWEEN from 'tween.js';

export default class CircuitManager {
    constructor(bulbComponent, switchComponent) {
        this.bulbFilamentMaterial = bulbComponent.filamentMaterial;
        this.bulbLight = bulbComponent.bulbLight;
        this.switchLever = switchComponent.lever;
        this.isCircuitOn = false;
        this.switchOpenAngle = Math.PI / 3; // Approx 60 degrees
        this.switchClosedAngle = 0.05; // Slightly off horizontal to seat in contact
        this.switchLever.rotation.x = this.switchOpenAngle; // Initial state: open
        this.updateBulb();
    }

    toggleSwitch() {
        this.isCircuitOn = !this.isCircuitOn;
        const targetAngle = this.isCircuitOn ? this.switchClosedAngle : this.switchOpenAngle;

        new TWEEN.Tween(this.switchLever.rotation)
            .to({ x: targetAngle }, 300)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        this.updateBulb();
    }

    updateBulb() {
        if (this.isCircuitOn) {
            this.bulbFilamentMaterial.emissive.setHex(0xffdd66); // Brighter emissive color
            this.bulbFilamentMaterial.emissiveIntensity = 2.0; // Increase emissive intensity
            this.bulbFilamentMaterial.color.setHex(0xffffff); // Very bright base color when emissive
            this.bulbLight.intensity = 1.5; // Turn on point light
        } else {
            this.bulbFilamentMaterial.emissive.setHex(0x000000); // No emission
            this.bulbFilamentMaterial.emissiveIntensity = 1.0; // Reset emissive intensity
            this.bulbFilamentMaterial.color.setHex(0xffcc33); // Original filament color
            this.bulbLight.intensity = 0; // Turn off point light
        }
        this.bulbFilamentMaterial.needsUpdate = true;
    }
}