class Stage4 {
        constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.battery = 100;
        this.powerConstant = 5; // Example power constant

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "Stage4Div");
        this.stagediv.setAttribute("class", "stageDiv");

        this.batteryElement = document.createElement("div");
        this.batteryElement.setAttribute("class", "batteryElement");
        this.stagediv.appendChild(this.batteryElement);

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
                            this.stagediv,
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

    validateUserCode(thrustInput) {
        //check input
        const thrust = parseFloat(thrustInput.value);
            if (!isNaN(thrust)) {
                const power = this.powerConstant * thrust;
                const energy = power * 1; // Assuming t = 1 for simplicity
                this.battery -= energy;
                alert(`Battery remaining: ${this.battery}%`);

                return true;
            } else {
                return false;
            }

    }

    wrongAnswer() {
        //determine what is wrong with answer and give feedback
        alert('Invalid input. Please enter a valid thrust value.');
    }

    nextPhase() {
        this.phase++;
        this.managePhases();
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
        //this.updateBatteryDisplay()
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
        this.updateBatteryDisplay();
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



    updateBatteryDisplay() {
        const batteryElement = document.getElementById('batteryDisplay');
        if (batteryElement) {
            batteryElement.style.width = `${this.battery}%`;
            batteryElement.style.backgroundColor = `rgb(${(100 - this.battery) * 2.55}, ${this.battery * 2.55}, 0)`;
        }
    }

    endStage4() {
        // Hide elements specific to Stage 4
        /*
        document.getElementById('completionMessage').style.visibility = 'hidden';
        document.getElementById('hoverThrustContainer').style.visibility = 'hidden';
        document.getElementById('hintButtonStage2').style.visibility = 'hidden';
        document.getElementById('info').style.visibility = 'hidden';
        */

        // Transition to Stage 5
        this.game.startStage(Stage5);
    }
}

window.Stage4 = Stage4;
