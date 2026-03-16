class Stage9 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.obstacleX = game.canvas.width / 4;
        this.obstacleY = game.canvas.height / 2;
        this.obstacleradius = 0.5;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage9div");
        this.stagediv.setAttribute("class", "stageDiv");
    
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);

        this.managePhases();
    }

    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 9! Here you will learn how to make the drone avoid obstacles', "Start");
                    break;
            case 1: this.phase1();
                    break;

            default:this.game.endStage("Stage 9 Completed", "Stage 10 - FILL IN HERE", Stage10, this);
                    this.stageEnded = true;
                    break;
        }
    }
    

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Simulation Step*/
                                    [
                                        this.game.simulateDrone,
                                        [
                                            this.initSim.bind(this), 
                                            this.stepSim.bind(this), 
                                            this.simComplete.bind(this), 
                                        ],
                                        this.objectiveReached.bind(this),
                                        null,
                                        null
                                    ]
                    ]);
    }

    nextPhase() {
        this.phase++;
        this.step = 0;
        if (this.currentPhaseDiv) {
            this.stagediv.removeChild(this.currentPhaseDiv);
        }
        this.drone.reset();
        this.managePhases();
    }

    drawobstacle(ctx) {
        ctx.beginPath();
        ctx.arc(
            this.obstacleX,
            this.obstacleY,
            this.obstacleradius * this.game.meter,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 0, 0, 1)";
        ctx.fill();
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
        this.drawobstacle(ctx);
    }


    initSim() {
        //initialize drone and other things

        //this.stagediv.removeChild(this.currentPhaseDiv);

        this.drone.reset(); 
        
        this.lastTime = null; 
        this.last_angle_error = 0;
        this.last_error = 0;
        this.last_dx = 0;
        this.last_temp = 0;
        this.desired_angle = 0;
        this.last_y_error = 0;
        this.last_x_error = 0;
        this.last_angle_error = 0;
    }

    stepSim(time) {
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;  
        
        if(dt == 0) {
            dt = 0.016;
        }


        // VERTICAL
        let y_desired = (this.game.canvas.height / this.game.meter) - (this.mouseY / this.game.meter);
        let y_cursor_error = y_desired - this.drone.y;

        // HORIZONTAL
        let x_desired = this.mouseX / this.game.meter;
        let x_cursor_error = x_desired - this.drone.x;


        //OBSTACLE REPULSION

        // Obstacle position in world coordinates
        let obs_x = this.obstacleX / this.game.meter;
        let obs_y = (this.game.canvas.height - this.obstacleY) / this.game.meter;

        // Vector from obstacle to drone
        let dx_obs = this.drone.x - obs_x;
        let dy_obs = this.drone.y - obs_y;

        let dist = Math.hypot(dx_obs, dy_obs) - this.obstacleradius;

        // Repulsion parameters
        let repulsionRadius = 1;   // meters



        let strength = (1 / dist) - (1 / (this.obstacleradius + repulsionRadius));
        
        if (strength < 0) {strength = 0};

        let x_repulsion = dx_obs * strength;
        let y_repulsion = dy_obs* strength;


        // COMBINED ERRORS
        let x_error = x_cursor_error + x_repulsion;
        let y_error = y_cursor_error + y_repulsion;

        // Controllers
        let vertical_thrust = 1 * y_error + 2 * ((y_error - this.last_y_error) / dt) + this.drone.hover_thrust;

        // Desired horizontal acceleration
        let ax_desired = 1 * x_error + 2 * (x_error - this.last_x_error) / dt;

        // Convert acceleration to tilt angle
        this.desired_angle = -1 * Math.atan(ax_desired / this.drone.gravity);

        let angle_error = this.desired_angle - this.drone.angle;

        let torque = 1 * angle_error + (2 * (angle_error - this.last_angle_error)) / dt;
        
        let T1 = vertical_thrust/(2 * Math.cos(this.drone.angle)) + torque/2;
        let T2 = vertical_thrust/(2 * Math.cos(this.drone.angle)) - torque/2;
        let thrustArray = [T1, T2];

        this.drone.update(dt, thrustArray);


        //Save Variables
        this.last_y_error = y_error;
        this.last_x_error = x_error;
        this.last_angle_error = angle_error;


        console.log(
            "-- Vertical (Y) --\n" +
            "y_desired: " + y_desired.toFixed(3) + " m\n" +
            "y_current: " + this.drone.y.toFixed(3) + " m\n" +
            "y_error:   " + y_error.toFixed(3) + " m\n" +
            "v_thrust:  " + vertical_thrust.toFixed(3) + " N\n\n" +

            "-- Horizontal (X) --\n" +
            "x_desired: " + x_desired.toFixed(3) + " m\n" +
            "x_current: " + this.drone.x.toFixed(3) + " m\n" +
            "x_error:   " + x_error.toFixed(3) + " m\n" +
            "des_angle: " + (this.desired_angle * 180 / Math.PI).toFixed(2) + " deg\n" +
            "current_angle: " + (this.drone.angle * 180 / Math.PI).toFixed(2) + " deg\n" +
            "angle_error: " + (angle_error * 180 / Math.PI).toFixed(2) + " deg\n\n" +

            "-- Repulsion --\n" +
            "dist: " + dist.toFixed(3) + "\n" +
            "x_repulsion: " + x_repulsion.toFixed(3) + "\n" +
            "y_repulsion: " + y_repulsion.toFixed(3) 
        );
    }

    simComplete() {
        //check if the simulation is complete and return a boolean
        return this.drone.crashed;
    }

    objectiveReached(cbArray, currentStage) {
        //check if the objective was reached after the simulation and return a boolean
        return this.drone.crashed;
    }

    objectiveNotReached() {
        alert("objective not reached");
        this.stagediv.removeChild(this.displayDiv);
        this.drone.reset();
        this.managePhases();
    }
}