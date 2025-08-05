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

    simulationCode(cbArray, currentStage, phaseDiv, stepArray, stageDiv, nextStep) {
        //cbArray = [initSimCB, stepSimCB, simCompleteCB, objectiveReachedCB, objectiveNotReachedCB, displayCB];
        //              0         1            2                3                  4                    5
        //this is the code that will be run in the simulation

        stageDiv.removeChild(phaseDiv);

        let displayDiv = document.createElement("div");
        displayDiv.setAttribute("id", "displayDiv");
        displayDiv.setAttribute("class", "displayDiv textDiv");

        stageDiv.appendChild(displayDiv);

        cbArray[0](); //initSimCB
        
        let simloop = function(time){
            cbArray[1](time); //stepSimCB
            cbArray[5](displayDiv); //displayCB

            if(!cbArray[2]()) { //simCompleteCB
                //if simulation is not complete, continue simulating
                requestAnimationFrame(simloop); 
            } else {
                //simulation is complete
                nextStep(currentStage, phaseDiv, stepArray, stageDiv);
            }
        };
        requestAnimationFrame(simloop);
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Teaching Step*/[this.game.createPhaseTeaching, this.getInitialInfoText(), () => true, null, null],

                        /*Input Step*/
                                    [   
                                        this.game.input,
                                        ["current_height = ", "Enter position equation", "Submit"],
                                        this.game.inputDone, 
                                        this.game.hint, 
                                        "Hint: Think about the relationship between position and velocity. Use the variables previous_height, velocity, and time.", 
                                        [this.validateUserCode, this.wrongAnswer]
                                    ],
                        /*Simulation Step*/
                                    [
                                        this.simulationCode.bind(this), 
                                        [
                                            this.initSim.bind(this), 
                                            this.stepSim.bind(this), 
                                            this.simComplete.bind(this), 
                                            this.objectiveReached.bind(this), 
                                            this.objectiveNotReached.bind(this), 
                                            this.displayVelocityAndPosition.bind(this)
                                        ],
                                        this.objectiveReached.bind(this),
                                        null,
                                        null,
                                        null
                                    ]
                    ]);
    }

    validateUserCode(code) {
        // Basic validation to check if the code follows the expected pattern
        const expectedPattern = /previous_height\s*\+\s*velocity\s*\*\s*time/i;
        let correct = expectedPattern.test(code);
        return correct;
    }

    wrongAnswer() {
        //determine what is wrong with answer and give feedback
        alert('Equation does not match reality. Please try again.');
    }

    nextPhase() {
        this.phase++;
        this.managePhases(); 
    }

    getInitialInfoText() {
        return `<p>First, let’s first get started with understanding how the drone moves. Right now the drone is in free fall. That means the only force acting on the drone is gravity.</p>
        <p>Acceleration is the change in velocity over time, also known as the derivative (Dv/Dt). So the equation for velocity is:</p>
        <pre>velocity = previous_velocity + acceleration * time</pre>
        <p>Similarly, velocity is the change in position. Using the variables current_height and previous_height, in addition to the ones above, enter the equation for current_height.</p>
        <p><b>ANSWER:</b> previous_height + velocity * time</p>`;
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
    }

    displayVelocityAndPosition(displayDiv) {
        displayDiv.innerHTML = `
            <p>Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Position: (${this.drone.x.toFixed(2)}, ${this.drone.y.toFixed(2)})</p>
        `;
    }

    initSim() {
        //initialize drone and other things
        this.drone.x = this.game.canvas.width / 2;
        this.drone.y = this.game.canvas.height / 4;

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

        this.drone.update(dt);
        let position = eval(this.positionUpdateCode.replace('previous_height', previous_height).replace('velocity', velocity).replace('time', time));
        this.drone.y = position;

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
    return this.game.canvas.height - 50; // Use window.game to reference the global game object
}

// Assign Stage1 to the global window object
window.Stage1 = Stage1;
