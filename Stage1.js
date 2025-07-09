class Stage1 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.positionUpdateCode = '';
        this.phase = 0;
        this.stageEnded = false;

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

    phase1() {
        this.currentPhaseDiv = game.createPhaseDOM(this.stagediv,
                            this.getInitialInfoText(), 
                            "current_height = ", 
                            this.validateUserCode.bind(this), 
                            this.wrongAnswer, 
                            "Hint: Think about the relationship between position and velocity. Use the variables previous_height, velocity, and time.",
                            this.nextPhase.bind(this),
                            "Enter position equation");  

        //other code dependant on phase
    }

    validateUserCode(code) {
        // Basic validation to check if the code follows the expected pattern
        const expectedPattern = /previous_height\s*\+\s*velocity\s*\*\s*time/i;
        let correct = expectedPattern.test(code);
        if(correct) {
            this.positionUpdateCode = code;

            this.stagediv.removeChild(this.currentPhaseDiv);

            this.displayDiv = document.createElement("div");
            this.displayDiv.setAttribute("id", "displayDiv");
            this.displayDiv.setAttribute("class", "displayDiv textDiv");
            this.stagediv.appendChild(this.displayDiv);
        }
        return correct;
    }

    wrongAnswer() {
        //determine what is wrong with answer and give feedback
        alert('Equation does not match reality. Please try again.');
    }

    nextPhase() {
        this.phase++;
        if(this.phase < 2) {
            this.managePhases();
        }
        //specific to stage 1:
        if(this.phase == 2) {
            this.codeSubmitted = true;
        }
        
    }

    update(dt) {
        // Update logic for Stage 1
        if (this.codeSubmitted) {
            this.updatePosition(dt);
            this.drone.update(dt);
            this.displayVelocityAndPosition();
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
    }

    cleanup() {
        // Optional: Cleanup logic for Stage 2 if needed
    }

    



    startMission() {
        /*
        // Show info and input area when mission starts
        this.drone.startMission();
        const info = document.getElementById('info');
        info.style.visibility = 'visible';
        info.innerHTML = this.getInitialInfoText();
        document.getElementById('inputContainer').style.visibility = 'visible';
        */
    }

    getInitialInfoText() {
        return `<p>First, let’s first get started with understanding how the drone moves. Right now the drone is in free fall. That means the only force acting on the drone is gravity.</p>
        <p>Acceleration is the change in velocity over time, also known as the derivative (Dv/Dt). So the equation for velocity is:</p>
        <pre>velocity = previous_velocity + acceleration * time</pre>
        <p>Similarly, velocity is the change in position. Using the variables current_height and previous_height, in addition to the ones above, enter the equation for current_height.</p>
        <p><b>ANSWER:</b> previous_height + velocity * time</p>`;
    }

    updatePosition(dt) {
        try {
            const previous_height = this.drone.y;
            const velocity = this.drone.vy;
            const time = dt;

            // Validate and execute user code
           if (this.validateUserCode(this.positionUpdateCode)) {
                const position = eval(this.positionUpdateCode.replace('previous_height', previous_height).replace('velocity', velocity).replace('time', time));
                this.drone.y = position; // Use 'position' instead of 'height'

                // Validate the updated position
                if (this.drone.y >= getMountainHeightAt(this.drone.x, this.game)) { // Pass this.game as an argument
                    this.drone.y = getMountainHeightAt(this.drone.x, this.game);
                    this.drone.vx = 0;
                    this.drone.vy = 0;
                    this.drone.crashed = true;
                    if(!this.stageEnded) {
                        this.managePhases();
                    }
                } else if (this.drone.y < 0) {
                    throw new Error("Position is below ground level, check your equation.");
                }
            } else {
                throw new Error("Equation does not match reality. Please try again.");
            }
        } catch (error) {
            console.error('Error in user code:', error);
            alert(error.message);
        }
    }


    displayVelocityAndPosition() { //change this - ask dad
        const info = this.displayDiv;
        info.innerHTML = `
            <p>Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Position: (${this.drone.x.toFixed(2)}, ${this.drone.y.toFixed(2)})</p>
        `;
    }
}


function getMountainHeightAt(x) {
    return this.game.canvas.height - 50; // Use window.game to reference the global game object
}

// Assign Stage1 to the global window object
window.Stage1 = Stage1;
