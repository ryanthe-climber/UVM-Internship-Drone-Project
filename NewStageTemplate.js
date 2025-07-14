/*class NewStageTemplate {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.gravity = 9.81; // m/s^2
        this.hoverThrust = null;
        this.phase = 0; // To track the interactive phases

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "StageTemplateDiv");
        this.stagediv.setAttribute("class", stageDiv);
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);
        this.managePhases();
    }

    start() {
        return;
    }

    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, "explaination", "buttonText");
                    break;
            case 1: this.phase1();
                    break;

            default:this.game.endStage(message, nextText, nextStage, currentStage);
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = game.createPhaseDOM(this,
                `           this.stagediv,
                            "Teaching Text", 
                            "Submit Instruction", 
                            this.validateUserCode, 
                            this.wrongAnswer, 
                            "Hint",
                            this.nextPhase.bind(this),
                            "Input Place Holder",
                            initSimCB,
                            stepSimCB,
                            simCompleteCB,
                            objectiveReachedCB,
                            objectiveNotReachedCB);  

        //other code dependant on phase
    }

    validateUserCode(code) {
        //check input

        const pattern1 = /\s*mass\s*\*\s*gravity/i;
        const pattern2 = /\s*gravity\s*\*\s*mass/i;
        return pattern1.test(code) || pattern2.test(code);

    }

    wrongAnswer() {
        //determine what is wrong with answer and give feedback
        alert('This is incorrect, please try again.');
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

        let position = eval(this.positionUpdateCode.replace('previous_height', previous_height).replace('velocity', velocity).replace('time', time));
        this.drone.y = position;

        //previous_height + velocity * time

        this.drone.update(dt);
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
        this.managePhases();
    }
}

// Assign Stage to the global window object
*/
