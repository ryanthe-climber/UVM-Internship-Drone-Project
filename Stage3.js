class Stage3 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.gravity = 9.81; // m/s^2
        this.desired_height = null;
        this.current_height = this.drone.y;
        this.phase = 0;
        this.step = 0;
        this.oscillationTime = 0;
        this.constant = 0; // Coefficient for error
        this.derivativeConstant = 0; // Coefficient for derivative
        this.positionUpdateCode = null;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "Stage3Div");
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
                                                "In this stage, you will control the drone’s altitude.", 
                                                "Start Altitude Control");
                    break;
            case 1: this.phase1();
                    break;
            
            case 2: this.phase2();
                    break;

            case 3: this.phase3();
                    break;

            default:this.game.endStage("Stage 4 - Battery Life", "Start Stage 4", Stage4, this);
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,

                    [
                        /*Teaching Step*/[
                                            this.teachingLineClick,
                                            ["Click on the dotted red line to set the desired altitude, and the drone will adjust its thrust accordingly.",
                                             "The difference between the current height and desired height is the error. Write an equation for error with the variables current_height and desired_height.     desired_height - current_height"
                                            ], 
                                            () => true,
                                            null, null
                                        ],
                        /*Error Input Step*/ [
                                                this.game.input,
                                                ["Error = ", "Enter calculated error", "Submit"],
                                                this.checkErrorSubmit.bind(this), 
                                                this.game.hint, 
                                                "Hint: The error is the difference between the desired height and current height."
                                            ]
                    ]);
    }
    
    phase2() {
        this.currentPhaseDiv = this.game.createPhaseDom2(
            this,
            this.stagediv,

            [
                /*Teaching Step*/
                [
                    this.game.createPhaseTeaching,
                    "Set the thrust using: (any number) * error + hover_thrust. Enter your thrust equation below.", 
                    () => true,
                    null, null
                ],
                /*Thrust Input Step*/
                [
                    this.game.input,
                    ["Enter Thrust Equation (e.g., Kp * error + hover_thrust): ", "Enter Thrust Equation", "Submit Thrust Equation"], 
                    this.handleThrustSubmit.bind(this),
                    this.game.hint, 
                    "Hint: Enter Thrust Equation (e.g., Kp * error + hover_thrust)" //FIXME - add a real hint
                ],
                /*Simulation Step (oscillation)*/ 
                [
                    this.game.simulateDrone,
                    [
                        this.initOscillationSim.bind(this), 
                        this.stepOscillationSim.bind(this), 
                        this.OscillationSimComplete.bind(this), 
                    ],
                    this.OscillationObjectiveReached.bind(this),
                    null,
                    null
                ]
            ]);
    }

    phase3() {
        this.currentPhaseDiv = this.game.createPhaseDom2(
            this,
            this.stagediv,

            [
                /*Derivative Input Step*/
                [
                    this.game.input,
                    [
                        "To stabilize the drone, we need to add a derivative term. Enter a new thrust equation with a derivative term (e.g., Kp * error + Kd * derivative(error) + hover_thrust).",
                        "Enter Thrust Equation", 
                        "Submit Thrust Equation"
                    ], 
                    this.handleDerivativeSubmit.bind(this),
                    this.game.hint, 
                    "Hint: idk man figure it out" //FIXME - add a real hint
                ],

                /*Simulation Step (stable)*/ 
                [
                    this.game.simulateDrone,
                    [
                        this.initDerivativeSim.bind(this), 
                        this.stepDerivativeSim.bind(this), 
                        this.DerivativeSimComplete.bind(this), 
                    ],
                    this.DerivativeObjectiveReached.bind(this),
                    null,
                    null
                ]
            ]);
    }

    teachingLineClick(infoTextArray, currentStage, phaseDiv, stepArray, stagediv, nextStep) {
        //Click on the dotted red line to set the desired altitude, then click "Submit Height" to continue.

        let teachDiv = document.createElement("div");
        teachDiv.setAttribute("id", "teachDiv");
        teachDiv.setAttribute("class", "teachDiv textDiv");

        let teachText = document.createElement("p");
        teachText.innerHTML = infoTextArray[0];
        teachDiv.appendChild(teachText);

        let lockButton = document.createElement("button");
        lockButton.appendChild(document.createTextNode('Submit Height'));
        lockButton.disabled = true; // Disabled until a line click
        lockButton.setAttribute('id', 'submitHeightButton');
        lockButton.setAttribute('class', 'submitButton');
        teachDiv.appendChild(lockButton);

        let handleCanvasClickGlue = function (event) {
            currentStage.handleCanvasClick(event, lockButton);
        }

        phaseDiv.appendChild(teachDiv);

        stagediv.appendChild(phaseDiv);

         currentStage.game.canvas.addEventListener('click', handleCanvasClickGlue);


        lockButton.addEventListener('click', () => {
            teachText.innerHTML = infoTextArray[1];
            teachDiv.removeChild(lockButton);

            nextStep(currentStage, phaseDiv, stepArray, stagediv);
            currentStage.game.canvas.removeEventListener('click', handleCanvasClickGlue);
        });
    }

    nextPhase() {
        this.phase++;
        this.step = 0;
        if (this.currentPhaseDiv) {
            this.stagediv.removeChild(this.currentPhaseDiv);
        }
        this.drone.reset();
        this.managePhases();
    }


    handleCanvasClick(event, lockButton) {
        const rect = this.game.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const droneCenterX = this.drone.x;

        // If the user clicks near the drone's center, set the desired height
        if (Math.abs(x - droneCenterX) < 10) {
            this.desired_height = y;
            lockButton.disabled = false; // Enable the button after setting the height
        }
    }

    // Handle thrust submission after error calculation
    handleThrustSubmit() {
        const thrustEquationInput = this.positionUpdateCode;
        // Normalize variable names for user flexibility
        let normalizedInput = thrustEquationInput
            .replace(/\bhover[ _]?thrust\b/ig, 'hover_thrust')
            .replace(/\berror\b/ig, 'error');

        // Check for required variables
        if (!/\berror\b/.test(normalizedInput) || !/\bhover_thrust\b/.test(normalizedInput)) {
            alert("Incorrect. Please make sure to use the variables 'error' and 'hover_thrust' in your equation.");
            return false;
        }

        // Try to compile and test the function
        try {
            this.userThrustFunction = new Function('error', 'hover_thrust', 'return (' + normalizedInput + ');');
        } catch (e) {
            alert("Please input a valid equation for thrust.");
            this.userThrustFunction = null;
            return false;
        }

        // Test the function with sample values
        const testError = 10;
        const testHoverThrust = this.drone.mass * this.drone.gravity;
        let testResult;
        try {
            testResult = this.userThrustFunction(testError, testHoverThrust);
            if (isNaN(testResult)) {
                throw new Error("Result is not a number");
            }
        } catch (e) {
            //console.error("Error evaluating thrust function:", e); FIXME - remove console log
            alert("Invalid thrust equation. Please ensure it is a valid equation and try again.");
            this.userThrustFunction = null;
            return false;
        }

        // If the function works, save the equation and proceed

        
        return true;
    }
    
    handleDerivativeSubmit() {
        const derivativeEquationInput = this.positionUpdateCode;

        // Normalize variable names for user flexibility
        let normalizedInput = derivativeEquationInput
        .replace(/\bhover[ _]?thrust\b/ig, 'hover_thrust')
        .replace(/\berror\b/ig, 'error')
        .replace(/derivative\s*\(\s*error\s*\)/ig, 'derivative_error');

        // Check for required variables
        if (!/\berror\b/.test(normalizedInput) || !/\bderivative_error\b/.test(normalizedInput)) {
            alert("The equation must include both 'error' and 'derivative(error)'. Please try again.");
            return false;
        }

        // Try to compile and test the function
        try {
            this.userDerivativeFunction = new Function('error', 'derivative_error', 'hover_thrust', 'return (' + normalizedInput + ');');
        } catch (e) {
            alert("Please input a valid equation for the derivative thrust.");
            this.userDerivativeFunction = null;
            return false;
        }

        // Test the function with sample values
        const testError = 10;
        const testDerivative = 2; // Simulated test derivative value
        const testHoverThrust = this.drone.mass * this.gravity;
        let testResult;

        try {
            testResult = this.userDerivativeFunction(testError, testDerivative, testHoverThrust);
            if (isNaN(testResult)) {
                throw new Error("Result is not a number");
            }
        } catch (e) {
            alert("Invalid derivative equation. Please ensure it is a valid equation and try again.");
            this.userDerivativeFunction = null;
            return false;
        }
        return true;
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();

        this.drawDottedLine(ctx, this.drone.x, 0, this.drone.x, this.game.canvas.height);

        if (this.phase >= 1 && this.desired_height !== null) {
            ctx.fillStyle = 'red';
            ctx.fillText('X', this.drone.x, this.desired_height);
            ctx.fillText('Desired Height', this.drone.x + 10, this.desired_height - 10);
            this.drawErrorArrow(ctx);
        }

        if (this.phase === 3 || this.phase === 4) {
            this.drawForces(ctx);
        }

        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`Current Height: ${(this.game.canvas.height - this.drone.y).toFixed(2)}px`, this.drone.x + 50, this.drone.y);
    }

    drawDottedLine(ctx, x1, y1, x2, y2) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawErrorArrow(ctx) {
        const fromX = this.drone.x - 15;
        const fromY = this.desired_height;
        const toY = this.drone.y;
        const label = 'Error';

        this.drawArrow(ctx, fromX, fromY, fromX, toY, label);
    }

    drawForces(ctx, thrust, error) {
        const arrowLength = 50;
        const arrowX = this.drone.x;
        const arrowY = this.drone.y;

        const thrustArrowLength = arrowLength + (error / this.gravity) * 10;
        const upwardArrowLength = thrustArrowLength > arrowLength ? thrustArrowLength : arrowLength - 20;
        const downwardArrowLength = arrowLength;

        this.drawArrow(this.game.ctx, arrowX, arrowY, arrowX, arrowY - upwardArrowLength, 'Thrust');
        this.drawArrow(this.game.ctx, arrowX, arrowY, arrowX, arrowY + downwardArrowLength, 'Mass * Gravity');
    }

    drawArrow(ctx, fromX, fromY, toX, toY, label) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();

        if (label) {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(label, fromX + 10, fromY + (toY - fromY) / 2);
        }
    }

    checkErrorSubmit() {
        const userErrorInput = this.positionUpdateCode; // Assuming this is the input from the user
        const expectedError = this.desired_height - this.drone.y;

        userErrorInput.replace(/\bdesired_?height\b/ig, "desired_height");
        userErrorInput.replace(/\bcurrent_?height\b/ig, "current_height");
        if (/\bdesired_height\b/.test(userErrorInput) &&
            /\bcurrent_height\b/.test(userErrorInput)) {

            let userErrorInputFunction = new Function("desired_height", "current_height", "return(" + userErrorInput + ");");

            try {
                let calculatedError = userErrorInputFunction(this.desired_height, this.current_height);

                if (Math.abs(calculatedError - expectedError) < 0.01) {
                    alert('Correct! You calculated the error accurately.');
                    return true; // Indicate that the error calculation is correct
                } else {
                    console.log("Difference of calculatedError and expectedError:" + Math.abs(calculatedError - expectedError));
                    alert('Incorrect. Please try again.');
                    return false; // Indicate that the error calculation is incorrect
                }
            } catch (e) {
                alert("Please input a valid equation for error.");
                return false; /* tell the user that their code didn't work right (it didn't compile/execute cleanly */
            }
        } else {
            alert('Incorrect. Please make sure to use the variables "current_height" and "desired_height" in your equation.');
            return false; // Indicate that the user did not use the correct variables
        }
    }


    initOscillationSim() {
        this.drone.reset();
        this.numOscillations = 0;
    }

    stepOscillationSim(time) {
        //do one step of the simulation
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        
        if(dt > 0.2){ //make sure we don't have a huge dt
            dt = 0;
        }
        this.lastTime = time;
    
        let previous_height = this.drone.y;
        let velocity = this.drone.vy;
        time = dt;

        let error = this.desired_height - this.drone.y; // Calculate the error
        let hover_thrust = this.drone.mass * this.gravity; // Calculate hover thrust

        let userThrust = this.userThrustFunction(error, hover_thrust);

        this.drone.vy += (userThrust / this.drone.mass) * dt; // Update vertical velocity

        this.drone.update(dt);
        this.drawForces(userThrust, error);
        
        if(error * this.lastError < 0) {
                this.numOscillations++;
        }

        this.lastError = error; // Store the last error for derivative calculation

        //drone has been oscillating for too long
        if(this.numOscillations >= 3) {
            if(!this.oscillationDiv){  

                this.game.clearDiv(this.currentPhaseDiv);
                
                this.oscillationDiv = document.createElement("div");
                this.oscillationDiv.setAttribute("id", "oscillationDiv");
                this.oscillationDiv.setAttribute("class", "textDiv");
                
                this.oscillationDiv.appendChild(document.createTextNode("The drone is oscillating because it still has velocity. Let’s stabilize it by adding a derivative term."));

                let button = document.createElement("button");
                button.setAttribute("id", "stabilizeButton");
                button.setAttribute("class", "nextButton");
                button.appendChild(document.createTextNode("Stabilize Drone"));
                this.oscillationDiv.appendChild(button);
                
                this.currentPhaseDiv.appendChild(this.oscillationDiv);

                button.addEventListener('click', () => {
                    this.OscillationComplete = true;
                });
            }   
        }
    }

    OscillationSimComplete() {
        return this.OscillationComplete;
    }

    OscillationObjectiveReached() {
        return true;
    }   


    initDerivativeSim() {
        this.drone.reset();
        this.requiredTime = 5;
        this.totalTime = 0;
    }

    stepDerivativeSim(time) {
         //do one step of the simulation
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        
        if(dt > 0.2){ //make sure we don't have a huge dt
            dt = 0.016;
        }
        this.lastTime = time;
    
        time = dt;

        let error = this.desired_height - this.drone.y; // Calculate the error
        let hover_thrust = this.drone.mass * this.gravity; // Calculate hover thrust

        let derivative_error = (error - this.lastError) / dt;

        let userThrust = this.userDerivativeFunction(error, derivative_error, hover_thrust);

        this.drone.vy += (userThrust / this.drone.mass) * dt; // Update vertical velocity

        this.drone.update(dt);
        this.drawForces(userThrust, error);

        this.lastError = error; // Store the last error for derivative calculation

        if(Math.abs(error) < 25) {
            this.totalTime += dt;
        }
    }

    DerivativeSimComplete() {
        // Simulation ends when drone has been stable long enough
        if(this.totalTime >= this.requiredTime) {
            return true;
        } else {
            return false;
        }
    }

    DerivativeObjectiveReached() {
        // Success = drone stabilized
        return true;
    }


}

// Assign Stage3 to the global window object
window.Stage3 = Stage3;
