class Stage3 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
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
                        [this.game.createPhaseTeaching, this.errorPhysicsText(), () => true, null, null],
                        [this.game.createPhaseTeaching, this.errorMathText(), () => true, null, null],
                        [
                            this.teachingLineClick,
                            [
                                "Click on the dotted red line to set the desired altitude.",
                                this.errorCodeBridgeText()
                            ], 
                            () => true,
                            null, null
                        ],
                        [
                            this.game.input,
                            ["Error = ", "Enter error equation", "Submit"],
                            this.checkErrorSubmit.bind(this), 
                            this.game.hint, 
                            "Hint: Error is the gap between where you want to be and where you are. desired_height - current_height"
                        ]
                    ]);
    }

    phase2() {
        this.currentPhaseDiv = this.game.createPhaseDom2(
            this,
            this.stagediv,
            [
                [this.game.createPhaseTeaching, this.proportionalPhysicsText(), () => true, null, null],
                [this.game.createPhaseTeaching, this.proportionalMathText(), () => true, null, null],
                [this.game.createPhaseTeaching, this.proportionalCodeBridgeText(), () => true, null, null],
                [
                    this.game.input,
                    ["Thrust = ", "e.g. Kp * error + hover_thrust", "Submit"],
                    this.handleThrustSubmit.bind(this),
                    this.game.hint, 
                    "Hint: Scale the error by some constant, then add hover_thrust to stay airborne. Try: 2 * error + hover_thrust"
                ],
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
                [this.game.createPhaseTeaching, this.derivativePhysicsText(), () => true, null, null],
                [this.game.createPhaseTeaching, this.derivativeMathText(), () => true, null, null],
                [this.game.createPhaseTeaching, this.derivativeCodeBridgeText(), () => true, null, null],
                [
                    this.game.input,
                    [
                        "Thrust = ",
                        "e.g. Kp * error + Kd * derivative(error) + hover_thrust",
                        "Submit"
                    ], 
                    this.handleDerivativeSubmit.bind(this),
                    this.game.hint, 
                    "Hint: Add a term that uses derivative(error) to slow the drone down as it approaches the target. Try: 2 * error + 3 * derivative(error) + hover_thrust"
                ],
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

    // --- Phase 1: Error ---

    errorPhysicsText() {
        return `
            <p>We want the drone to fly to a specific height. To do that, the drone needs to know <strong>how far off it is</strong> from where it should be.</p>
            <p>That gap — the difference between the target and the current state — is called the <strong>error</strong>. It's the fundamental input to almost every control system.</p>
            <p>If the error is large, the drone is far from its target and needs to work hard. If the error is zero, the drone is exactly where it should be.</p>
        `;
    }

    errorMathText() {
        return `
            <p>Error is simply the difference between where you <em>want</em> to be and where you <em>are</em>:</p>
            <pre>error = desired_height - current_height</pre>
            <p>Notice the order matters. If the drone is <em>below</em> the target, the error is <strong>positive</strong> — we need to go up. If it's above, the error is <strong>negative</strong> — we need to come down. The sign tells the controller which direction to push.</p>
        `;
    }

    errorCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have two variables available:</p>
            <ul>
                <li><code>desired_height</code>: the altitude you set by clicking the line</li>
                <li><code>current_height</code>: the drone's actual altitude right now</li>
            </ul>
            <p>Write the right hand side of the error equation using those two variables.</p>
        `;
    }

    // --- Phase 2: Proportional Control ---

    proportionalPhysicsText() {
        return `
            <p>Now that we can measure error, we can use it to adjust thrust. The simplest approach: apply more thrust the further the drone is from its target.</p>
            <p>This is called a <strong>proportional controller</strong> — the correction is proportional to the error. Double the error, double the push.</p>
        `;
    }

    proportionalMathText() {
        return `
            <p>We scale the error by a constant <em>Kp</em> (the proportional gain) and add it on top of hover thrust:</p>
            <pre>thrust = Kp × error + hover_thrust</pre>
            <p>The <code>hover_thrust</code> term keeps the drone airborne. The <code>Kp × error</code> term pushes it toward the target.</p>
        `;
    }

    proportionalCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have these variables available:</p>
            <ul>
                <li><code>error</code>: the gap between desired and current height</li>
                <li><code>hover_thrust</code>: the baseline thrust to stay airborne</li>
            </ul>
            <p>Choose any number for <em>Kp</em> — it controls how aggressively the drone responds. Write the right hand side of the thrust equation.</p>
        `;
    }

    // --- Phase 3: Derivative Control ---

    derivativePhysicsText() {
        return `
            <p>The proportional controller overshoots because it only looks at <em>where</em> the drone is, not <em>how fast</em> it's moving. It has no brakes.</p>
            <p>The fix is to add a <strong>derivative term</strong> — a correction based on how quickly the error is changing. If the drone is approaching the target fast, we reduce thrust early to slow it down before it overshoots.</p>
            <p>Together, proportional + derivative is called a <strong>PD controller</strong>. It's one of the most widely used control strategies in engineering.</p>
        `;
    }

    derivativeMathText() {
        return `
            <p>The derivative of error is the rate at which the error is changing over time — in other words, how fast the gap is closing (or growing):</p>
            <pre>d(error)/dt = (error - previous_error) / Δt</pre>
            <p>We scale that by a constant <em>Kd</em> and add it to the thrust equation:</p>
            <pre>thrust = Kp × error + Kd × d(error)/dt + hover_thrust</pre>
        `;
    }

    derivativeCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>The simulation computes the derivative of error for you. You can reference it with:</p>
            <ul>
                <li><code>derivative(error)</code>: the rate of change of error</li>
            </ul>
            <p>You still have access to <code>error</code> and <code>hover_thrust</code>. Add the derivative term to your previous equation and choose a value for <em>Kd</em>.</p>
        `;
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
        const droneCenterX = this.drone.x * this.game.meter;

        // If the user clicks near the drone's center, set the desired height
        if (Math.abs(x - droneCenterX) < 10) {
            this.desired_height = (this.game.canvas.height - y) / this.game.meter;
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
        const testHoverThrust = this.drone.mass * this.drone.gravity;
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

        let x_height = this.drone.x * this.game.meter;

        this.drawDottedLine(ctx, x_height , 0, x_height, this.game.canvas.height);

        if (this.phase >= 1 && this.desired_height !== null) {
            ctx.fillStyle = 'red';
            ctx.fillText('X', x_height - 5, this.game.canvas.height - this.desired_height * this.game.meter);
            ctx.fillText('Desired Height', x_height + 20, this.game.canvas.height - this.desired_height * this.game.meter);
            this.drawErrorArrow(ctx);
        }

        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`Current Height: ${this.drone.y.toFixed(2)} meters`, this.drone.x * this.game.meter + 50, this.game.canvas.height - this.drone.y * this.game.meter);
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
        const fromX = this.drone.x * this.game.meter - 15;
        const fromY = this.game.canvas.height - this.desired_height * this.game.meter;
        const toY = this.game.canvas.height - this.drone.y * this.game.meter;
        const label = 'Error';

        this.drawArrow(ctx, fromX, fromY, fromX, toY, label);
    }

    drawForces(ctx, thrust, error) {
        const arrowLength = 50;
        const arrowX = this.drone.x;
        const arrowY = this.drone.y;

        const thrustArrowLength = arrowLength + (error / this.drone.gravity) * 10;
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
    
        time = dt;

        let error = this.desired_height - this.drone.y; // Calculate the error
        let hover_thrust = -1 * this.drone.mass * this.drone.gravity; // Calculate hover thrust

        let userThrust = [this.userThrustFunction(error, hover_thrust)];

        this.drone.update(dt, userThrust);
        //this.drawForces(userThrust, error);
        
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
                
                this.oscillationDiv.appendChild(document.createTextNode("The problem: when the drone reaches the target, it still has velocity. It overshoots, the error flips sign, the thrust reverses — and the drone oscillates back and forth indefinitely."));

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
        return this.OscillationComplete || this.drone.crashed;
    }

    OscillationObjectiveReached() {
        return !this.drone.crashed;
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
        let hover_thrust = -1 * this.drone.mass * this.drone.gravity; // Calculate hover thrust

        let derivative_error = (error - this.lastError) / dt;

        let userThrust = [this.userDerivativeFunction(error, derivative_error, hover_thrust)];


        this.drone.update(dt, userThrust);
        //this.drawForces(userThrust, error);

        this.lastError = error; // Store the last error for derivative calculation

        if(Math.abs(error) < 0.1) {
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
