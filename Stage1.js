class Stage1 {
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
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Stage 1 - Free Fall', "Start Mission");
                    break;
            case 1: this.phase1();
                    break;

            default:this.game.endStage("Stage 1 Completed", "Stage 2 - Hover Thrust", Stage2, this);
                    this.stageEnded = true;
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Physics Teaching Step*/
                        [this.game.createPhaseTeaching, this.physicsText(), () => true, null, null],

                        /*Math Teaching Step*/
                        [this.game.createPhaseTeaching, this.mathText(), () => true, null, null],

                        /*Code Bridge Teaching Step*/
                        [this.game.createPhaseTeaching, this.codeBridgeText(), () => true, null, null],

                        /*Input Step*/
                        [   
                            this.game.input,
                            ["current_height = ", "Enter position equation", "Submit"],
                            this.validateUserCode.bind(this), 
                            this.game.hint, 
                            "Hint: Remember the math: position = previous_position + velocity × Δt`</p>"
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

    physicsText() {
        return `
            <p>Right now, the drone's motors are off. The only force acting on it is <strong>gravity</strong>.</p>
            <p>Because gravity is a force, it causes <strong>acceleration</strong>. This means that the drone doesn't just move down at a constant rate, it speeds up as it falls.</p>
        `;
    }

    mathText() {
        return `
            <p>Acceleration is the rate of change of velocity. So if we know the acceleration and a small slice of time <em>Δt</em>, we can update velocity:</p>
            <pre>velocity = previous_velocity + acceleration × Δt</pre>
            <p>And velocity is the rate of change of position. So we can update position the same way:</p>
            <pre>position = previous_position + velocity × Δt</pre>
        `;
    }

    codeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>In the simulation, <em>Δt</em> is called <code>time</code>, and the variables you have access to are:</p>
            <ul>
                <li><code>previous_height</code>: the drone's position from the last frame</li>
                <li><code>velocity</code>: the drone's current vertical velocity</li>
                <li><code>time</code>: the time elapsed since the last frame (Δt)</li>
            </ul>
            <p>Write the right hand side of the position equation using those variables.</p>
        `;
    }

    validateUserCode() {
        let code = this.positionUpdateCode;
        // Basic validation to check if the code follows the expected pattern
        const expectedPattern = /previous_height\s*\+\s*velocity\s*\*\s*time/i;
        let correct = expectedPattern.test(code);
        if(correct) {
            return true;
        } else {
            this.wrongAnswer();
            return false;
        }
    }

    wrongAnswer() {
        //determine what is wrong with answer and give feedback
        alert('Equation does not match reality. Please try again.');
    }

    nextPhase() {
        this.phase++;
        this.managePhases(); 
    }


    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
    }

    displayVelocityAndPosition() {
        this.displayDiv.innerHTML = `
            <p>Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Position: (${this.drone.x.toFixed(2)}, ${this.drone.y.toFixed(2)})</p>
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
    }

    stepSim(time) {
        //do one step of the simulation
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
    
        let previous_height = this.drone.y;
        let velocity = this.drone.vy;
        time = dt;

        this.drone.update(dt, [0]); // no thrust because drone is in free fall

        this.displayVelocityAndPosition();

        //previous_height + velocity * time
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
window.Stage1 = Stage1;
