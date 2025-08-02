class Stage1 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;
        this.hintShown = false;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage1div");
        this.stagediv.setAttribute("class", "stageDiv");
    
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);
        this.managePhases();
    }
     
    start() {
        return;
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

    teachingDoneCB() {
        return true;
    }

    blankCB() {
        return;
    }


    simulationCode() {
        //when correct, start simulation.
                initSimCB();
                let simloop = function(time){
                    stepSimCB(time);
                    if(!simCompleteCB()) {
                        requestAnimationFrame(simloop);
                    } else {
                        //next phase
                        if(objectiveReachedCB()) {
                            nextPhaseCB();
                        } else {
                            objectiveNotReachedCB();
                        }
                    }
                };
                requestAnimationFrame(simloop);
    }


    input(dataArray, currentStage, phaseDiv, stepArray, stagediv, nextStep) {
             //[prompt, placeHolder, Button]
             //   0         1          2   

        let inputDiv = document.createElement("div");
        inputDiv.setAttribute("id", "inputDiv");
        inputDiv.setAttribute("class", "inputDiv textDiv");

        inputDiv.appendChild(document.createTextNode(dataArray[0]));

        let inputBox = document.createElement("input");
        inputBox.setAttribute("id", "inputBox");
        inputBox.setAttribute("type", "text"); 
        inputBox.setAttribute("placeholder", dataArray[1]);

        //button to submit input
        let submitButton = document.createElement("button");
        submitButton.setAttribute("class", "submitButton");
        submitButton.appendChild(document.createTextNode(dataArray[2]));

        submitButton.addEventListener('click', () => {
            //check answer
            currentStage.positionUpdateCode = inputBox.value.trim();
            nextStep(currentStage, phaseDiv, stepArray, stagediv);
        });

        inputDiv.appendChild(inputBox);
        inputDiv.appendChild(submitButton);

        phaseDiv.appendChild(inputDiv);

        stagediv.appendChild(phaseDiv);
    }

    hint(currentStage, phaseDiv, hintText) {
        let hintButtonDiv = document.createElement("div");
        hintButtonDiv.setAttribute("id", "hintButtonDiv");
        hintButtonDiv.setAttribute("class", "hintButtonDiv");

        if(!currentStage.hintShown) {
                    let hintButton = document.createElement("button");
                    hintButton.appendChild(document.createTextNode("Hint"));
                    hintButtonDiv.appendChild(hintButton);

                    hintButton.addEventListener('click', () => {
                         alert(hintText); //FIXME - maybe make the hint show up in a div?
                    });

                    currentStage.hintShown = true;
        }

        phaseDiv.appendChild(hintButtonDiv);
    }

    inputDone(cbArray, currentStage) {
        //[CheckAnswer, wrongAnswer]
        let correct = cbArray[0](currentStage.positionUpdateCode);
        if(!correct) {
            cbArray[1]();
        }
        return correct;
    }


    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Teaching Step*/[this.game.createPhaseTeaching, this.getInitialInfoText(), this.teachingDoneCB, null, null],

                        /*Input Step*/
                                    [   
                                        this.input,
                                        ["current_height = ", "Enter position equation", "Submit"],
                                        this.inputDone.bind(this), 
                                        this.hint, 
                                        "hint", 
                                        [this.validateUserCode, this.wrongAnswer]
                                    ]
                    ]);

        /*this.currentPhaseDiv = game.createPhaseDOM(this,
                            this.stagediv,
                            this.getInitialInfoText(), 
                            "current_height = ", 
                            this.validateUserCode.bind(this), 
                            this.wrongAnswer, 
                            "Hint: Think about the relationship between position and velocity. Use the variables previous_height, velocity, and time.",
                            this.nextPhase.bind(this),
                            "Enter position equation",
                            this.initSim.bind(this),
                            this.stepSim.bind(this),
                            this.simComplete.bind(this),
                            this.objectiveReached.bind(this),
                            this.objectiveNotReached.bind(this));  */ 

        //other code dependant on phase
    }

    validateUserCode(code) {
        // Basic validation to check if the code follows the expected pattern
        const expectedPattern = /previous_height\s*\+\s*velocity\s*\*\s*time/i;
        let correct = expectedPattern.test(code);
        /*if(correct) {
            this.positionUpdateCode = code;

            this.stagediv.removeChild(this.currentPhaseDiv);

            this.displayDiv = document.createElement("div");
            this.displayDiv.setAttribute("id", "displayDiv");
            this.displayDiv.setAttribute("class", "displayDiv textDiv");
            this.stagediv.appendChild(this.displayDiv);
        }*/ //FIXME - Should this code be here or in nextPhase?
        return correct;
    }

    wrongAnswer() {
        //determine what is wrong with answer and give feedback
        alert('Equation does not match reality. Please try again.');
    }

    nextPhase() {
        this.phase++;
        if(this.currentPhaseDiv) {
            this.stagediv.removeChild(this.currentPhaseDiv); //FIXME - doesn't work because if call this after the stage explanation and tries to remove nothing
        }
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

    displayVelocityAndPosition() {
        const info = this.displayDiv;
        info.innerHTML = `
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


        this.displayVelocityAndPosition();
    }

    simComplete() {
        //check if the simulation is complete and return a boolean
        return this.drone.crashed;
    }

    objectiveReached() {
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
