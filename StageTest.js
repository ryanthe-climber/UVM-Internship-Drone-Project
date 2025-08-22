class StageTest {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage1div");
        this.stagediv.setAttribute("class", "stageDiv");
    
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);
        this.managePhases();
    }
    
    managePhases() {
        switch(this.phase) {
            case 0: this.phase1(); 
                    break;

            default:this.game.endStage("Try Again", "Test Stage", StageTest, this);
                    this.stageEnded = true;
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [

                        /*Input Step*/
                                    [   
                                        this.game.input,
                                        ["Enter Test Code: ", "Test Code", "Submit"],
                                        this.checkInput.bind(this), 
                                        null,
                                        null
                                    ],
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


    drawGrid(ctx) {
        //draw horizontal lines on meter mark
        ctx.strokeStyle = "red";
        let drawHeight = this.game.canvas.height - this.game.meter;

        while(drawHeight > 0) {
            ctx.moveTo(0, drawHeight);
            ctx.lineTo(this.game.canvas.width, drawHeight);
            ctx.stroke();

            drawHeight -= this.game.meter;
        }


        //draw vertical lines on meter mark
        
        let drawWidth = this.game.meter;
        while(drawWidth < this.game.canvas.width) {
            ctx.moveTo(drawWidth, 0);
            ctx.lineTo(drawWidth, this.game.canvas.height);
            ctx.stroke();

            drawWidth += this.game.meter;
        }
    }

    checkInput() {
        let code = this.positionUpdateCode;

        try {
            this.thrustFunction = new Function("thiss", "dt", code);
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    }









    nextPhase() {
        this.phase++;
        this.managePhases(); 
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        //this.game.drawBackground();
        //this.drawGrid(ctx);
        this.game.drawDrone();
    }

    displayVelocityAndPosition() {
        //Display all stats of drone including position, crashed, velocity, battery, thrust levels
        this.displayDiv.innerHTML = `
            <p>Vertical Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Horizontal Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Position: (${this.drone.x.toFixed(2)}, ${this.drone.y.toFixed(2)})</p>
            <p>Left Motor: ${this.drone.MotorL.toFixed(2)}</p>
            <p>Right Motor: ${this.drone.MotorR.toFixed(2)}</p>
        `;
    }

    initSim() {
        //initialize drone and other things
        let stageDiv = this.stagediv;

        stageDiv.removeChild(this.currentPhaseDiv);

        this.displayDiv = document.createElement("div");
        this.displayDiv.setAttribute("id", "displayDiv");
        this.displayDiv.setAttribute("class", "displayDiv textDiv");

        stageDiv.appendChild(this.displayDiv); 

        this.drone.reset(); 
        
        this.lastTime = null; 
        this.lastError = 2;
        this.desired_height = 5;
        this.desired_angle = 360;
        this.lastAngleError = 0;
    }

    stepSim(time) {
        //do one step of the simulation
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
    
        time = dt; 
        
        if(dt == 0) {
            dt = 0.016;
        }
        //let hover_thrust = this.drone.mass * this.drone.gravity;
        
        let thrustArray = this.thrustFunction(this, dt);

        this.drone.update(dt, thrustArray);

        this.displayVelocityAndPosition();
        //console.log(`Height: ${this.drone.y.toFixed(5)}\tVelocity: ${this.drone.vy.toFixed(5)}\tDt: ${dt.toFixed(5)}`);

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

function getMountainHeightAt(x) {
    return 0;
}

// Assign Stage1 to the global window object
window.StageTest = StageTest;
