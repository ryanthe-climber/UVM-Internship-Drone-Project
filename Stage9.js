class Stage9 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.obstacleList = [
            game.toMeters({
                x: game.canvas.width * 0.2, 
                y: game.canvas.height / 2
            }), 
            game.toMeters({
                x: game.canvas.width * 0.7, 
                y: game.canvas.height / 2
            }), 
            game.toMeters({
                x: game.canvas.width * 0.8, 
                y: game.canvas.height / 2
            })
        ]

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

    drawobstacles(ctx) {
        this.obstacleList.forEach(obstacle => {
            const obstaclePixels = this.game.toPixels(obstacle);

            ctx.beginPath();
            ctx.arc(
                obstaclePixels.x,
                obstaclePixels.y,
                this.obstacleradius * this.game.meter,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "rgba(255, 0, 0, 1)";
            ctx.fill();
        });
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
        this.drawobstacles(ctx);
    }


    initSim() {
        //initialize drone and other things

        //this.stagediv.removeChild(this.currentPhaseDiv);

        this.drone.reset(); 
        
        this.lastTime = null; 

        this.desired_angle = 0;

        this.lastError = {
            x: 0,
            y: 0,
            angle: 0
        };
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

        let lowDist = 100;
        let obstacle = null;

        let dx_obs = 0;
        let dy_obs = 0;

        this.obstacleList.forEach(current => {
            const obs_dx = this.drone.x - current.x;
            const obs_dy = this.drone.y - current.y;

            const dist = Math.hypot(obs_dx, obs_dy) - this.obstacleradius;
            if (dist < lowDist) {
                lowDist = dist;
                obstacle = current;

                dx_obs = obs_dx;
                dy_obs = obs_dy;
            }
        });

        const desired = {
            x: this.game.mouse.x, 
            y: this.game.mouse.y
        };

        const cursor_error = {
            x: desired.x - this.drone.x, 
            y: desired.y - this.drone.y
        };

        //OBSTACLE REPULSION


        // Repulsion parameters
        const repulsionRadius = 1;   // meters



        let strength = (1 / lowDist) - (1 / (this.obstacleradius + repulsionRadius));
        
        if (strength < 0) {strength = 0};

        const repulsion = {
            x: dx_obs * strength,
            y: dy_obs * strength
        };


        // COMBINED ERRORS
        const error = {
            x: cursor_error.x + repulsion.x,
            y: cursor_error.y + repulsion.y
        };

        // Controllers
        let vertical_thrust = 1 * error.y + 2 * ((error.y - this.lastError.y) / dt) + this.drone.hover_thrust;

        // Desired horizontal acceleration
        let ax_desired = 1 * error.x + 2 * (error.x - this.lastError.x) / dt;

        // Convert acceleration to tilt angle
        this.desired_angle = -1 * Math.atan(ax_desired / this.drone.gravity);

        let angle_error = this.desired_angle - this.drone.angle;

        let torque = 1 * angle_error + (2 * (angle_error - this.lastError.angle)) / dt;
        
        let T1 = vertical_thrust/(2 * Math.cos(this.drone.angle)) + torque/2;
        let T2 = vertical_thrust/(2 * Math.cos(this.drone.angle)) - torque/2;
        let thrustArray = [T1, T2];

        this.drone.update(dt, thrustArray);


        //Save Variables
        this.lastError = {
                    x: error.x,
                    y: error.y,
                    angle: angle_error
                }

        console.log(
            "-- Vertical (Y) --\n" +
            "y_desired: " + desired.y.toFixed(3) + " m\n" +
            "y_current: " + this.drone.y.toFixed(3) + " m\n" +
            "y_error:   " + error.y.toFixed(3) + " m\n" +
            "v_thrust:  " + vertical_thrust.toFixed(3) + " N\n\n" +

            "-- Horizontal (X) --\n" +
            "x_desired: " + desired.x.toFixed(3) + " m\n" +
            "x_current: " + this.drone.x.toFixed(3) + " m\n" +
            "x_error:   " + error.x.toFixed(3) + " m\n" +
            "des_angle: " + (this.desired_angle * 180 / Math.PI).toFixed(2) + " deg\n" +
            "current_angle: " + (this.drone.angle * 180 / Math.PI).toFixed(2) + " deg\n" +
            "angle_error: " + (angle_error * 180 / Math.PI).toFixed(2) + " deg\n\n" +

            "-- Repulsion --\n" +
            "dist: " + lowDist.toFixed(3) + "\n" +
            "x_repulsion: " + repulsion.x.toFixed(3) + "\n" +
            "y_repulsion: " + repulsion.y.toFixed(3) 
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