class Drone {
    constructor(x, y) {
        this.orig_x = x;
        this.orig_y = y;
        this.reset()
    }

    update(dt) {
        if (this.crashed) return;

        // Gravity
        const g = 100;  // m/s^2 CHANGE BACK TO 9.81 //FIXME
        this.vy += g * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Check collision with mountains
        if (this.y >= getMountainHeightAt(this.x)) { //REWRITE TO CHECK IF DRONE IS OFF SCREEN
            this.y = getMountainHeightAt(this.x);
            this.vx = 0;
            this.vy = 0;
            this.crashed = true;
        }

        // Update battery, position, and other parameters
        this.battery -= dt * 0.1; // simple battery consumption model
    }

    thrustNeeded() {
        return this.mass * 9.81; // hover thrust
    }

    reset() {
        this.x = this.orig_x;
        this.y = this.orig_y;
        this.battery = 100;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.angularVelocity = 0;
        this.mass = 1;  // kg
        this.motorStrength = 10;  // max power
        this.automatic = false;
        this.crashed = false; // New property to indicate if the drone has crashed
    }
}

// Assign Drone to the global window object
window.Drone = Drone;
