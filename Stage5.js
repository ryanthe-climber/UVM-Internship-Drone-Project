class Stage5 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.descentRate = 0.5; // meters per second

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage5div");
        this.stagediv.setAttribute("class", "stageDiv");
    
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);
        this.managePhases();
    }
    
    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Stage 5 - Landing', "Start Mission");
                    break;
            case 1: this.phase1();
                    break;

            default: this.game.endStage("Stage 5 Completed", "Stage 6 - Tilt/Movement Control", Stage7, this);
                     this.stageEnded = true;
                     break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Physics Teaching Step*/
                        [this.game.createPhaseTeaching, this.physicsText(), () => true, null, null],

                        /*Math Teaching Step*/
                        [this.game.createPhaseTeaching, this.mathText(), () => true, null, null],

                        /*Code Bridge Teaching Step*/
                        [this.game.createPhaseTeaching, this.codeBridgeText(), () => true, null, null],

                        /*Descent Rate Input Step*/
                        [
                            this.game.input,
                            ["descent_rate = ", "Enter a descent speed in m/s, e.g. 0.5", "Submit"],
                            this.descentRateSubmit.bind(this),
                            this.game.hint,
                            "Hint: Try a value between 0.2 and 1.0. Too fast and the PD controller won't keep up; too slow and it takes forever to land."
                        ],

                        /*Thrust Equation Input Step*/
                        [
                            this.game.input,
                            [
                                "Thrust = ",
                                "e.g. Kp * error + Kd * derivative(error) + hover_thrust",
                                "Submit Thrust Equation"
                            ],
                            this.handleDerivativeSubmit.bind(this),
                            this.game.hint,
                            "Hint: Same PD equation as Stage 3. Try: 2 * error + 3 * derivative(error) + hover_thrust"
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

    // --- Teaching Texts ---

    physicsText() {
        return `
            <p>The drone knows how to hold a fixed altitude, but landing is different: the drone needs to <strong>move downward in a controlled way</strong> and touch down gently.</p>
            <p>If we set the desired height to zero, the drone would accelerate hard toward the ground and crash.</p>
            <p>A better approach is to give the drone a <strong>moving target</strong>. Instead of jumping straight to zero, the target height descends at a steady, safe speed.</p>
        `;
    }

    mathText() {
        return `
            <p>We define a <strong>descent rate</strong> — how many meters per second the target drops. Each frame, we subtract a small amount from the desired height:</p>
            <pre>desired_height = desired_height - descent_rate × Δt</pre>
            <p>This turns landing into a simple tracking problem. The drone is always chasing a target that's just slightly below where it was last frame.</p>
        `;
    }

    codeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You'll provide two things:</p>
            <ul>
                <li><strong>A descent rate</strong> — a number in meters per second. This controls how fast the target drops. The simulation will update <code>desired_height</code> automatically each frame using your value.</li>
                <li><strong>A PD thrust equation</strong> — the same one you wrote in Stage 3. The variables are <code>error</code>, <code>derivative(error)</code>, and <code>hover_thrust</code>.</li>
            </ul>
        `;
    }

    // --- Validation ---

    descentRateSubmit() {
        const input = this.positionUpdateCode.trim();
        const value = parseFloat(input);

        if (isNaN(value)) {
            alert("Please enter a number for the descent rate (e.g. 0.5).");
            return false;
        }

        if (value <= 0) {
            alert("Descent rate must be positive. Try a value like 0.5.");
            return false;
        }

        if (value > 3) {
            alert("That descent rate is too fast — the drone will crash before the controller can react. Try something under 3 m/s.");
            return false;
        }

        this.descentRate = value;
        return true;
    }

    handleDerivativeSubmit() {
        const derivativeEquationInput = this.positionUpdateCode;

        let normalizedInput = derivativeEquationInput
            .replace(/\bhover[ _]?thrust\b/ig, 'hover_thrust')
            .replace(/\berror\b/ig, 'error')
            .replace(/derivative\s*\(\s*error\s*\)/ig, 'derivative_error');

        if (!/\berror\b/.test(normalizedInput) || !/\bderivative_error\b/.test(normalizedInput)) {
            alert("The equation must include both 'error' and 'derivative(error)'. Please try again.");
            return false;
        }

        try {
            this.userDerivativeFunction = new Function('error', 'derivative_error', 'hover_thrust', 'return (' + normalizedInput + ');');
        } catch (e) {
            alert("Please input a valid equation for the derivative thrust.");
            this.userDerivativeFunction = null;
            return false;
        }

        const testError = 10;
        const testDerivative = 2;
        const testHoverThrust = this.drone.mass * this.drone.gravity;
        let testResult;

        try {
            testResult = this.userDerivativeFunction(testError, testDerivative, testHoverThrust);
            if (isNaN(testResult)) throw new Error("Result is not a number");
        } catch (e) {
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
    }

    initSim() {
        let stageDiv = this.stagediv;
        stageDiv.removeChild(this.currentPhaseDiv);

        this.drone.reset();
        this.desired_height = this.drone.y; // start target at drone's current position
        this.lastTime = null; 
        this.lastError = 0;
    }

    stepSim(time) {
        if(this.lastTime == null) {
            this.lastTime = time;
            return;
        }

        let dt = (time - this.lastTime) / 1000;
        if(dt > 0.05) dt = 0.016;
        this.lastTime = time;

        // Move the target downward at the chosen descent rate
        this.desired_height -= this.descentRate * dt;
        if(this.desired_height < 0) this.desired_height = 0;

        let error = this.desired_height - this.drone.y;
        let hover_thrust = -1 * this.drone.mass * this.drone.gravity;
        let derivative_error = (error - this.lastError) / dt;

        let userThrust = [this.userDerivativeFunction(error, derivative_error, hover_thrust)];
        this.drone.update(dt, userThrust);

        this.lastError = error;
    }

    simComplete() {
        // Land when target has reached the ground and drone is close to it
        return this.drone.crashed || (this.desired_height <= 0 && this.drone.y < 0.1);
    }

    objectiveReached() {
        return !this.drone.crashed;
    }

    objectiveNotReached() {
        alert("The drone crashed. Try a slower descent rate or adjust your thrust equation.");
        this.drone.reset();
        this.managePhases();
    }
}
// Assign Stage6 to the global window object
window.Stage6 = Stage6;