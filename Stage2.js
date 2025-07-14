class Stage2 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.gravity = 9.81; // m/s^2
        this.hoverThrust = null;
        this.phase = 0; // To track the interactive phases

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "Stage2div");
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
            case 0: game.stageExplainationDOM(  this, 
                                                this.stagediv, 
                                                "In this stage, we will be programming hover thrust. Hover thrust is how much force (in Newtons) must be applied to keep the drone hovering in the air without falling or moving upwards.  Click “Start Hover Thrust” to continue.", 
                                                "Start Hover Thrust");
                    break;

            case 1: this.phase1();
                    break;

            default:this.game.endStage("Stage 2 Completed", "Stage 3 - Altitude Control", Stage3, this);
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = game.createPhaseDOM(this,
            this.stagediv, 
            "The top arrow represents the hover thrust, and the bottom arrow represents the force of gravity (mass * gravity). These quantities must be equal for the net force to be zero, which means the net acceleration is zero, and the drone hovers.\n\nGiven the variables mass and gravity, write the equation that represents the hover_thrust:	", 
            "hover_thrust = ", 
            this.validateUserCode, 
            this.wrongAnswer, 
            "Hint: The force that the drone exerts must be equal in magnitude to the force pulling downwards to have a net force of 0. Therefore, hover_thrust - mass * gravity = 0.", 
            this.nextPhase.bind(this),
            "Enter hover thrust equation", 
            this.initSim.bind(this),
            this.stepSim.bind(this),
            this.simComplete.bind(this),
            this.objectiveReached.bind(this),
            this.objectiveNotReached.bind(this));  
    }

    validateUserCode(code) {
        const pattern1 = /\s*mass\s*\*\s*gravity/i;
        const pattern2 = /\s*gravity\s*\*\s*mass/i;
        return pattern1.test(code) || pattern2.test(code);
    }

    wrongAnswer() {
        alert('This is incorrect, please try again.');
    }

    nextPhase() {
        this.phase++;
        this.managePhases();
    }

    showForces() {
        this.updateInfoText('The top arrow represents the hover thrust, and the bottom arrow represents the force of gravity (mass * gravity). These quantities must be equal for the net force to be zero, which means the net acceleration is zero, and the drone hovers.');
        this.phase = 1; // Set phase to draw the arrows
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();

        if (this.phase >= 1) {
            this.drawForces(ctx);  // Ensure arrows are drawn during the correct phase
        }
    }

    drawForces(ctx) {
        const arrowLength = 50;
        const arrowX = this.drone.x;
        const arrowY = this.drone.y;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        // Draw the hover thrust arrow (upward)
        this.drawArrow(ctx, arrowX, arrowY, arrowX, arrowY - arrowLength, 'hover_thrust');

        // Draw the gravity force arrow (downward)
        this.drawArrow(ctx, arrowX, arrowY, arrowX, arrowY + arrowLength, 'Mass * Gravity');
    }

    drawArrow(ctx, fromX, fromY, toX, toY, label) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw the arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();

        // Draw the label
        if (label) {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(label, fromX + 10, fromY + (toY - fromY) / 2);
        }
    }

    initSim() {
        //initialize drone and other things
        this.drone.x = this.game.canvas.width / 2;
        this.drone.y = this.game.canvas.height / 4;

        this.lastTime = null; 
    }

    stepSim(time) {
        //do one step of the simulation
        //no simulation is necessary
    }

    simComplete() {
        //check if the simulation is complete and return a boolean
        return true;
    }

    objectiveReached() {
        //check if the objective was reached after the simulation and return a boolean
        return true;
    }

    objectiveNotReached() {
        alert("objective not reached");
        this.managePhases();
    }
}

// Assign Stage2 to the global window object
window.Stage2 = Stage2;
