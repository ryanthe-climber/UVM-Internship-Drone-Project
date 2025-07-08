/*class NewStageTemplate {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.gravity = 9.81; // m/s^2
        this.hoverThrust = null;
        this.phase = 0; // To track the interactive phases

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "StageTemplateDiv");
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

            default:this.endStage();
                    break;
        }
    }

    phase1() {
        game.createPhaseDOM(this.stagediv,
                            "Teaching Text", 
                            "Submit Instruction", 
                            this.validateUserCode, 
                            this.wrongAnswer, 
                            "Hint",
                            this.nextPhase.bind(this),
                            "Input Place Holder");  

        //other code dependant on phase
    }

    validateUserCode(code) {
        //check input

        /*
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

    endStage() {
        this.gameContent.removeChild(this.stagediv);
        let completionDiv = document.createElement("div");
        completionDiv.setAttribute("id", "completionDiv");
        completionDiv.setAttribute("class", "completionDiv textDiv");
        completionDiv.appendChild(document.createTextNode("Stage Template Completed"));

        let nextButton = document.createElement("button");
        nextButton.appendChild(document.createTextNode("nextStage"));
        completionDiv.appendChild(nextButton);

        nextButton.addEventListener('click', () => {
            this.gameContent.removeChild(completionDiv);
            this.game.startStage(/*NEXT STAGE OBJECT*);
        });

        this.gameContent.appendChild(completionDiv);
    }

    update(dt) {
        // No dynamic update needed for this stage
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
    }

    cleanup() {
        // Optional: Cleanup logic for Stage if needed
    }
}

// Assign Stage to the global window object
*/
