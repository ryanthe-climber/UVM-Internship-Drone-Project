class Drone {
    constructor(x, y, game) {
        this.game = game;
        this.max_x = (this.game.canvas.width - this.game.droneImage.width) / this.game.meter; // meters
        this.max_y = 10; //meters
        this.orig_x = x;
        this.orig_y = y;
        this.gravity = -3.728;
        this.reset()
    }

    update(dt, thrustArray) {

        if (this.crashed) return; //FIXME maybe change this

        if(Array.isArray(thrustArray)) { 
            if(thrustArray.length == 1) {
                //thrust value should be for both motors
                this.MotorL = thrustArray[0] / 2;
                this.MotorR = thrustArray[0] / 2;
            } else if(thrustArray.length == 2) {
                //thrust value should be individual
                this.MotorL = thrustArray[0];
                this.MotorR = thrustArray[1];
                
            } else {
                //invalid input with too many values
                throw new RangeError(`${thrustArray.length} thrust values entered. Enter only 1 or 2. `);
            }
        } else {
            throw new TypeError("thrustArray must be an array.");
        }
 
        this.angularAcceleration = (this.MotorL - this.MotorR) / this.rotationalMass;
        this.angularVelocity += this.angularAcceleration * dt;
        this.angle += this.angularVelocity * dt;

        const maxAngle = Math.PI / 3;
        this.angle = Math.max(
            -maxAngle,
            Math.min(maxAngle, this.angle)
        );

        const cosA = Math.cos(this.angle);
        const sinA = Math.sin(this.angle);

        this.ty = (this.MotorL + this.MotorR) * cosA; // vertical thrust
        this.tx = (this.MotorL + this.MotorR) * sinA; // horizontal thrust

        this.vy += (this.ty / this.mass) * dt; // Update vertical velocity
        this.vx += (this.tx / this.mass) * dt; // Update horizontal velocity

        this.vy += this.gravity * dt; //account for gravity
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Check collision with mountains

        if (this.y < getMountainHeightAt(this.x)) { //REWRITE TO CHECK IF DRONE IS OFF SCREEN
            this.y = getMountainHeightAt(this.x);
            this.crash();
        }
    
        if(this.x > this.max_x) {
            this.x = this.max_x;
            this.crash();
        }

        if(this.x < 0) {
            this.x = 0;
            this.crash();
        }
        
        if(this.y > this.max_y) {
            this.y = 0;
            this.crash();
        }

    }

    thrustNeeded() {
        return -1 * (this.mass * this.gravity); // hover thrust
    }

    crash() {
        this.vx = 0;
        this.vy = 0;
        this.crashed = true;
    }

    reset() {
        this.x = this.orig_x;
        this.y = this.orig_y;
        this.battery = 100;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.MotorL = 0;
        this.MotorR = 0;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.mass = 1;  // kg
        this.rotationalMass = 1;
        this.motorStrength = 10;  // max power
        this.hover_thrust = -1 * this.mass * this.gravity;
        this.automatic = false;
        this.crashed = false; // New property to indicate if the drone has crashed
    }
}

// Assign Drone to the global window object
window.Drone = Drone;
