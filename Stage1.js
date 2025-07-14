class Stage1 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;

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
        this.currentPhaseDiv = game.createPhaseDOM(this,
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
                            this.objectiveNotReached.bind(this));  

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
