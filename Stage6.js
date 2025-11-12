class Stage6 {
    constructor(game) {
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage6div");
        this.stagediv.setAttribute("class", "stageDiv");
    
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);
        this.managePhases();
    }
    
    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Stage 6 - Landing', "Start Mission");
                    break;
            case 1: this.phase1();
                    break;

            default:this.game.endStage("Stage 6 Completed", "Stage 7 - Tilt/Movement Control", Stage7, this);
                    this.stageEnded = true;
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Teaching Step*/[this.game.createPhaseTeaching, this.getInitialInfoText(), () => true, null, null],

                        /*Desired Height Input Step*/
                                    [   
                                        this.game.input,
                                        ["desired_height = ", "Set desired height", "Submit"],
                                        this.DesiredHeightSubmit.bind(this), 
                                        this.game.hint, 
                                        "Hint: set the desired height to current height / 2" //Add hint
                                    ],

                        //Derivative Input Step            
                                    [
                                        this.game.input,
                                        [
                                            "Enter a thrust equation with a derivative term (e.g., Kp * error + Kd * derivative(error) + hover_thrust).",
                                            "Enter Thrust Equation", 
                                            "Submit Thrust Equation"
                                        ], 
                                        this.handleDerivativeSubmit.bind(this),
                                        this.game.hint, 
                                        "Hint: idk man figure it out" //FIXME - add a real hint
                                    ],
                        /*Simulation Step*/
                                    [
                                        this.game.simulateDrone, 
                                        [
                                            this.initSim.bind(this), 
                                            this.stepSim.bind(this), 
                                            this.simComplete.bind(this), 
                                        ],
                                        this.objectiveReached.bind(this),
                                        null,
                                        null
                                    ]
                    ]);
    }

    DesiredHeightSubmit() {
        const heightEquationInput = this.positionUpdateCode;

        // Normalize variable names for user flexibility
        let normalizedInput = heightEquationInput
            .replace(/\bcurrent[ _]?height\b/ig, 'current_height')
            .replace(/\s+/g, ' ')
            .trim();

        // Check that the required variable is included
        if (!/\bcurrent_height\b/.test(normalizedInput)) {
            alert("Your equation must include current height.");
            return false;
        }

        // Check that the input contains a division
        if (!/\/\s*2\b/.test(normalizedInput)) {
            alert("Your equation must involve dividing the current height by 2.");
            return false;
        }

        // Try to compile and test the function
        try {
            this.userHeightFunction = new Function('current_height', 'return (' + normalizedInput + ');');
        } catch (e) {
            alert("Your input doesn't form a valid equation. Please correct any syntax errors.");
            this.userHeightFunction = null;
            return false;
        }

        // Test the function with sample values
        const testHeight = 20;
        let testResult;
        try {
            testResult = this.userHeightFunction(testHeight);
            if (isNaN(testResult)) throw new Error("Result is not a number");
        } catch (e) {
            alert("The result of your equation is invalid. Please check your calculations.");
            this.userHeightFunction = null;
            return false;
        }

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

    wrongAnswer() {
        //determine what is wrong with answer and give feedback
        alert('Equation does not match reality. Please try again.');
    }

    nextPhase() {
        this.phase++;
        this.managePhases(); 
    }

    getInitialInfoText() {
        return `<p>In order to land the drone, we cannot simply set the desired height to the ground. Instead, we must slowly lower the desired height so that the drone sets down on the ground in a controlled manner. Set the desired height to half of the current height.</p>`;
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
    }

    displayVelocityAndPosition() {
        this.displayDiv.innerHTML = `
            <p>Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Position: (${this.drone.x.toFixed(2)}, ${this.drone.y.toFixed(2)})</p>
        `;
    }

    initSim() {
        //initialize drone and other things
        let stageDiv = this.stagediv;

        stageDiv.removeChild(this.currentPhaseDiv);

        this.drone.reset(); 
        
        this.lastTime = null; 
        this.lastError = 0;
    }

    stepSim(time) {
        // Initialize lastTime
        if(this.lastTime == null) {
            this.lastTime = time;
            return;
        }

        // Calculate timestep
        let dt = (time - this.lastTime) / 1000;

        if(dt > 0.05){ // clamp huge dt
            dt = 0.016;
        }
        this.lastTime = time;

        this.desired_height = this.userHeightFunction(this.drone.y);

        let error = this.desired_height - this.drone.y; // Error
        let hover_thrust = -1 * this.drone.mass * this.drone.gravity; // Hover thrust
        let derivative_error = (error - this.lastError) / dt;

        let userThrust = [this.userDerivativeFunction(error, derivative_error, hover_thrust)];
        this.drone.update(dt, userThrust);

        // Update last error
        this.lastError = error;
    }

    simComplete() {
        //check if the simulation is complete and return a boolean
        return this.drone.crashed;
    }

    objectiveReached(cbArray, currentStage) {
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
    return 0;
}

// Assign Stage1 to the global window object
window.Stage1 = Stage1;
