class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drone = new Drone(this.canvas.width / 2, this.canvas.height / 4);
        this.currentStage = null;

        this.background = new Image();
        this.background.src = 'pics/Mars_Landscape_AI.png'; // Ensure this path is correct
        this.background.onload = () => {
            this.run();
            this.startStage(Stage1); // Start with Stage1
        };

        this.droneImage = new Image();
        this.droneImage.src = 'pics/drone.png'; // Ensure this path is correct

        document.getElementById('startButton').addEventListener('click', () => {
            if (this.currentStage) {
                this.currentStage.startMission();
            }
        });

    }

    startStage(stageClass) {
        if (this.currentStage && typeof this.currentStage.cleanup === 'function') {
            this.currentStage.cleanup();
        }
        this.currentStage = new stageClass(this); // Pass `this` as the `game` argument
        this.currentStage.start();
    }

    endStage(message, nextText, nextStage, currentStage) {
        currentStage.gameContent.removeChild(currentStage.stagediv);
        let completionDiv = document.createElement("div");
        completionDiv.setAttribute("id", "completionDiv");
        completionDiv.setAttribute("class", "completionDiv textDiv");
        completionDiv.appendChild(document.createTextNode(message));

        let nextButton = document.createElement("button");
        nextButton.setAttribute("class", "nextButton");
        nextButton.appendChild(document.createTextNode(nextText));
        completionDiv.appendChild(nextButton);

        nextButton.addEventListener('click', () => {
            currentStage.gameContent.removeChild(completionDiv);
            currentStage.game.startStage(nextStage);
        });

        currentStage.gameContent.appendChild(completionDiv);
    }

    gameLoop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.currentStage) {
            if (typeof this.currentStage.update === 'function') {
                this.currentStage.update(dt);
            }
            if (typeof this.currentStage.draw === 'function') {
                this.currentStage.draw(this.ctx);
            }
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }


    run() {
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    drawBackground() {
        this.ctx.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
    }

    drawMountains() {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);

        for (let x = 0; x <= this.canvas.width; x++) {
            let y = 0.8 * (Math.cos(x * 0.01) + Math.cos(3 * x * 0.01) + 0.000004 * (x - 600) * (x - 600)) + 3;
            this.ctx.lineTo(x, this.canvas.height - (y * 50 + 100)); // scale and position the mountains
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fillStyle = '#4d2600';
        this.ctx.fill();
    }

    drawDrone() {
        this.ctx.save();
        this.ctx.translate(this.drone.x, this.drone.y);
        this.ctx.rotate(this.drone.angle);
        this.ctx.drawImage(this.droneImage, -20, -20, 80, 80); // Adjust size and position as needed
        this.ctx.restore();
    }

    createPhaseDOM( currentStage,
                    stagediv/*current stage div*/,
                    teachingText/*string*/, 
                    submitInstruction/*string*/, 
                    checkAnswerCB/*bool function(String input)*/, 
                    wrongAnswerCB/*string function(String input)*/, 
                    hintText/*String*/,
                    nextPhaseCB/*void function*/,
                    placeholder/*String*/,
                    initSimCB,
                    stepSimCB,
                    simCompleteCB)
    {
        let hintShown = false;

        //create phase div
        let phaseDiv = document.createElement("div");
        phaseDiv.setAttribute("id", "phaseDiv");
        phaseDiv.setAttribute("class", "phaseDiv");

        let teachDiv = document.createElement("div");
        teachDiv.setAttribute("id", "teachDiv");
        teachDiv.setAttribute("class", "teachDiv textDiv");

        let inputDiv = document.createElement("div");
        inputDiv.setAttribute("id", "inputDiv");
        inputDiv.setAttribute("class", "inputDiv textDiv");

        let hintButtonDiv = document.createElement("div");
        hintButtonDiv.setAttribute("id", "hintButtonDiv");
        hintButtonDiv.setAttribute("class", "hintButtonDiv");

        //display teaching text
        let teachText = document.createElement("p");
        teachText.innerHTML = teachingText;

        teachDiv.appendChild(teachText);
        //input
        let inputBox = document.createElement("input");
        inputBox.setAttribute("id", "inputBox");
        inputBox.setAttribute("type", "text"); 
        inputBox.setAttribute("placeholder", placeholder);

        //button to submit input
        let submitButton = document.createElement("button");
        submitButton.setAttribute("class", "submitButton");
        submitButton.appendChild(document.createTextNode("Submit"));
        submitButton.addEventListener('click', () => {
            //check answer
            currentStage.positionUpdateCode = inputBox.value.trim();
            let correct = checkAnswerCB(currentStage.positionUpdateCode);
            //if wrong, wrong answer function
            if(!correct) {
                wrongAnswerCB();
                //button for hint
                if(!hintShown) {
                    let hintButton = document.createElement("button");
                    hintButton.appendChild(document.createTextNode("Hint"));
                    hintButtonDiv.appendChild(hintButton);

                    hintButton.addEventListener('click', () => {
                        alert(hintText);
                    });

                    hintShown = true;
                }
            } else {

                //when correct, start simulation.
                initSimCB();
                let simloop = function(time){
                    stepSimCB(time);
                    if(!simCompleteCB()) {
                        requestAnimationFrame(simloop);
                    } else {
                        //next phase
                        nextPhaseCB();
                    }
                };
                requestAnimationFrame(simloop);
            }
        });
        inputDiv.appendChild(document.createTextNode(submitInstruction));
        inputDiv.appendChild(inputBox);
        inputDiv.appendChild(submitButton);

        
        phaseDiv.appendChild(teachDiv);
        phaseDiv.appendChild(inputDiv);
        phaseDiv.appendChild(hintButtonDiv);

        stagediv.appendChild(phaseDiv);

        return phaseDiv;
    }

    stageExplainationDOM(currentStage, stageDiv, explaination, buttonText) {
        let button = document.createElement("button");
        button.setAttribute("class", "nextButton");
        button.appendChild(document.createTextNode(buttonText));

        let explainationDiv = document.createElement("div");
        explainationDiv.setAttribute("id", "explainationDiv");
        explainationDiv.setAttribute("class", "explainationDiv textDiv");

        explainationDiv.appendChild(document.createTextNode(explaination));
        explainationDiv.appendChild(button);
        stageDiv.appendChild(explainationDiv);

        button.addEventListener('click', () => {
            stageDiv.removeChild(explainationDiv);
            currentStage.nextPhase();
        }); 
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // Make the game instance accessible globally if needed
});
