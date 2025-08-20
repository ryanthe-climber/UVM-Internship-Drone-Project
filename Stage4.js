class Stage4 {

        constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        //this.battery = 100;
        this.powerConstant = 5; // Example power constant
        this.phase = 0;
        this.step = 0;
        this.desired_height = this.game.canvas.height / 2 / this.game.meter;


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
            case 0: game.stageExplainationDOM(this, this.stagediv, "Battery", "Start");
                    break;
            case 1: this.phase1();
                    break;

            default:this.game.endStage("message", "nextText", Stage5, this);
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(
            this,
            this.stagediv,

            [
                /*Derivative Input Step*/
                [
                    this.game.input,
                    [
                        "Enter a thrust equation with a derivative term just like stage 3(e.g., Kp * error + Kd * derivative(error) + hover_thrust).", 
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
            console.error(e);
            alert("Invalid derivative equation. Please ensure it is a valid equation and try again.");
            this.userDerivativeFunction = null;
            return false;
        }
        return true;
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
        this.drone.reset();
        this.lastError = 0;
        this.lastTime = null; 
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

        let error = this.desired_height - this.drone.y; // Error
        let hover_thrust = -1 * this.drone.mass * this.drone.gravity; // Hover thrust
        let derivative_error = (error - this.lastError) / dt;

        let userThrust = 0;

        if(this.drone.battery > 0) {
            userThrust = this.userDerivativeFunction(error, derivative_error, hover_thrust);
            if(userThrust < 0) {
                userThrust = 0;
            }
            
            // --- BATTERY DEPLETION ---
            let power = Math.pow(userThrust, 1.5);  
            let batteryDrain = power * dt;           // Charge lost per tick
            this.drone.battery -= batteryDrain;
            this.updateBatteryDisplay();

            if(this.drone.battery < 0) {
                this.drone.battery = 0;
            }
        }
        // Update vertical velocity
        this.drone.vy += (userThrust / this.drone.mass) * dt;

        // Update position
        this.drone.update(dt);

        // Update last error
        this.lastError = error;
    }

    simComplete() {
        //check if the simulation is complete and return a boolean
        return this.drone.crashed;
    }

    objectiveReached() {
        //check if the objective was reached after the simulation and return a boolean
        return true;
    }

    objectiveNotReached() {
        alert("objective not reached");
        this.managePhases();
    }

    updateBatteryDisplay() {
        if (this.batteryElement) {
            this.batteryElement.style.width = `${this.drone.battery}%`;
            this.batteryElement.style.backgroundColor = `rgb(${(100 - this.drone.battery) * 2.55}, ${this.drone.battery * 2.55}, 0)`;
        }
    }
}

window.Stage4 = Stage4;
