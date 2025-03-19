class Drone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.battery = 100;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.angularVelocity = 0;
        this.mass = 1;  // kg
        this.motorStrength = 10;  // max power
        this.automatic = false;
        this.missionPhase = 0;
        this.crashed = false; // New property to indicate if the drone has crashed
    }

    update(dt) {
        if (this.crashed) return;

        // Gravity
        const g = 9.81;  // m/s^2
        this.vy += g * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Check collision with mountains
        if (this.y >= getMountainHeightAt(this.x)) {
            this.y = getMountainHeightAt(this.x);
            this.vx = 0;
            this.vy = 0;
            this.crashed = true;
        }

        // Update battery, position, and other parameters
        this.battery -= dt * 0.1; // simple battery consumption model
    }

    startMission() {
        this.missionPhase = 1; // starting free fall
    }

    thrustNeeded() {
        return this.mass * 9.81; // hover thrust
    }
}

// Assign Drone to the global window object
window.Drone = Drone;
