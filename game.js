class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.world_height = 10;
        
        this.meter = (this.canvas.height - 60) / this.world_height; //assume the screen height is 10 meters

        this.droneImage = new Image();
        this.droneImage.src = 'pics/drone.png'; // Ensure this path is correct
        this.drone = new Drone((this.canvas.width / 2) / this.meter , 7.5, this);


        this.currentStage = null;

        this.background = new Image();
        this.background.src = 'pics/Mars_Landscape_AI.png'; // Ensure this path is correct
        this.background.onload = () => {
            this.run();
            this.startStage(Stage1); // Start with Stage1
        };


        document.getElementById('startButton').addEventListener('click', () => {
            if (this.currentStage) {
                this.currentStage.startMission();
            }
        });

    }

    startStage(stageClass) {
        this.currentStage = new stageClass(this); // Pass `this` as the `game` argument
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

        if (this.currentStage) {
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
        this.ctx.translate(this.drone.x * this.meter, this.canvas.height - (this.drone.y * this.meter));
        this.ctx.rotate(this.drone.angle);
        this.ctx.drawImage(this.droneImage, -10, -75, 80, 80); // Adjust size and position as needed
        this.ctx.restore();
    }

    clearDiv(div) {
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }

    createPhaseTeaching(infoText, currentStage, phaseDiv, stepArray, stagediv, nextStep) {
        let teachDiv = document.createElement("div");
        teachDiv.setAttribute("id", "teachDiv");
        teachDiv.setAttribute("class", "teachDiv textDiv");

        let teachText = document.createElement("p");
        teachText.innerHTML = infoText;

        teachDiv.appendChild(teachText);
        phaseDiv.appendChild(teachDiv);

        stagediv.appendChild(phaseDiv);

        nextStep(currentStage, phaseDiv, stepArray, stagediv);

    }

    simulateDrone(cbArray, currentStage, phaseDiv, stepArray, stageDiv, nextStep) { //FIXME - Maybe make this a Game.js function
        //cbArray = [initSimCB, stepSimCB, simCompleteCB];
        //              0         1            2                           
        //this is the code that will be run in the simulation

        cbArray[0](); //initSimCB
        
        let simloop = function(time){
            cbArray[1](time); //stepSimCB
            

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

    doNextPhaseStep(currentStage, phaseDiv, stepArray, stageDiv) {
        if(stepArray[currentStage.step][2]()) {
            currentStage.step++;
            if(currentStage.step < stepArray.length) {
                stepArray[currentStage.step][0](stepArray[currentStage.step][1], currentStage, phaseDiv, stepArray, stageDiv, currentStage.game.doNextPhaseStep);
            } else {
                //if the step is done, then we can move to the next phase
                currentStage.nextPhase();
            }
        } else {
            stepArray[currentStage.step][3](currentStage, phaseDiv, stepArray[currentStage.step][4]);
        }
    }

    createPhaseDom2(currentStage,
                    stagediv,
                    stepArray) {
                    //the step array will include more arrays that contain the following:
                    //doSomethingCallback, "dataBlob", stepFinishedCallback, hintCallback, "HintData"
                    //      0                   1                  2                3           4 
        let phaseDiv = document.createElement("div");
        phaseDiv.setAttribute("id", "phaseDiv");
        phaseDiv.setAttribute("class", "phaseDiv");


        //here, the parameters will always be dataBlob, currentStage, phaseDiv, stepArray, stageDiv, nextStep
        
        stepArray[currentStage.step][0](stepArray[currentStage.step][1], currentStage, phaseDiv, stepArray, stagediv, this.doNextPhaseStep);


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
