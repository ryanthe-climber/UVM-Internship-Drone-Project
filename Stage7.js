class Stage7 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage7div");
        this.stagediv.setAttribute("class", "stageDiv");
    
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);

        window.addEventListener('mousemove', e => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.managePhases();
    }

    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 7! Here you will learn to combine vertical and horizontal movement to follow the cursor.', "Start");
                    break;
            case 1: this.phase1();  // Position Error
                    break;
            case 2: this.phase2();  // Vertical Control
                    break;
            case 3: this.phase3();  // Horizontal → Desired Angle
                    break;
            case 3: this.phase4();  // Torque → Motor Thrusts
                    break;
            case 4: this.phase5();  // Simulation
                    break;
 
            default: this.game.endStage("Stage 7 Completed", "Stage 8 - Obstacle Avoidance", Stage9, this);
                    this.stageEnded = true;
                    break;
        }
    }
 
    // ─── PHASE 1: Position Error ──────────────────────────────────────────────
 
    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Physics Teaching Step*/
                [this.game.createPhaseTeaching, this.positionErrorPhysicsText(), () => true, null, null],

                /*Math Teaching Step*/
                [this.game.createPhaseTeaching, this.positionErrorMathText(), () => true, null, null],

                /*Code Bridge Teaching Step*/
                [this.game.createPhaseTeaching, this.positionErrorCodeBridgeText(), () => true, null, null],

                /*X Error Input*/
                [
                    this.game.input,
                    ["x_error = ", "Enter x error equation", "Submit"],
                    this.validateXError.bind(this),
                    this.game.hint,
                    "Hint: The x error is the difference between where you want to be and where you are. Use the variables mouse_x and drone_x."
                ],

                /*Y Error Input*/
                [
                    this.game.input,
                    ["y_error = ", "Enter y error equation", "Submit"],
                    this.validateYError.bind(this),
                    this.game.hint,
                    "Hint: Same idea as x_error, but for the vertical axis. Use mouse_y and drone_y."
                ]
            ]);
    }

    positionErrorPhysicsText() {
        return `
            <p>To follow the cursor, the drone first needs to know <strong>how far away</strong> the cursor is in both the horizontal (x) and vertical (y) directions.</p>
            <p>This gap between where the drone <em>is</em> and where it <em>wants to be</em> is called the <strong>error</strong>. Just like in Stage 3, a larger error means the drone needs to work harder to correct itself.</p>
        `;
    }

    positionErrorMathText() {
        return `
            <p>We define the cursor position as <strong>(mouse_x, mouse_y)</strong> and the drone position as <strong>(drone_x, drone_y)</strong>.</p>
            <p>The error in each direction is simply the desired value minus the current value:</p>
            <pre>x_error = mouse_x - drone_x
y_error = mouse_y - drone_y</pre>
            <p>A positive x_error means the cursor is to the right. A positive y_error means the cursor is above.</p>
        `;
    }

    positionErrorCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have four variables available:</p>
            <ul>
                <li><code>mouse_x</code>: the cursor's horizontal position in meters</li>
                <li><code>mouse_y</code>: the cursor's vertical position in meters</li>
                <li><code>drone_x</code>: the drone's current horizontal position</li>
                <li><code>drone_y</code>: the drone's current vertical position</li>
            </ul>
            <p>Write the right hand side of each error equation using those variables.</p>
        `;
    }
 
    validateXError() {
        const code = this.positionUpdateCode;
        const hasMouse = /\bmouse_x\b/.test(code);
        const hasDrone = /\bdrone_x\b/.test(code);
 
        if (!hasMouse || !hasDrone) {
            alert("Your equation must use the variables 'mouse_x' and 'drone_x'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('mouse_x', 'drone_x', 'return (' + code + ');');
            const result = fn(10, 3);
            if (Math.abs(result - 7) > 0.01) {
                alert("Incorrect. Remember: x_error = mouse_x - drone_x. Please try again.");
                return false;
            }
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    validateYError() {
        const code = this.positionUpdateCode;
        const hasMouse = /\bmouse_y\b/.test(code);
        const hasDrone = /\bdrone_y\b/.test(code);
 
        if (!hasMouse || !hasDrone) {
            alert("Your equation must use the variables 'mouse_y' and 'drone_y'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('mouse_y', 'drone_y', 'return (' + code + ');');
            const result = fn(8, 5);
            if (Math.abs(result - 3) > 0.01) {
                alert("Incorrect. Remember: y_error = mouse_y - drone_y. Please try again.");
                return false;
            }
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    // ─── PHASE 2: Vertical Control ────────────────────────────────────────────
 
    phase2() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Physics Teaching Step*/
                [this.game.createPhaseTeaching, this.verticalControlPhysicsText(), () => true, null, null],

                /*Math Teaching Step*/
                [this.game.createPhaseTeaching, this.verticalControlMathText(), () => true, null, null],

                /*Code Bridge Teaching Step*/
                [this.game.createPhaseTeaching, this.verticalControlCodeBridgeText(), () => true, null, null],

                /*Vertical Thrust Input*/
                [
                    this.game.input,
                    [
                        "vertical_thrust = ",
                        "e.g., Kp * y_error + Kd * derivative(y_error) + hover_thrust",
                        "Submit"
                    ],
                    this.validateVerticalThrust.bind(this),
                    this.game.hint,
                    "Hint: This is the same PD controller from Stage 3, but using y_error instead of height error. Make sure to include y_error, derivative(y_error), and hover_thrust."
                ]
            ]);
    }

    verticalControlPhysicsText() {
        return `
            <p>You already built a vertical controller in Stage 3 to hold the drone at a fixed height. The same idea applies here, but now the target height is wherever the <strong>cursor</strong> is.</p>
            <p>The drone needs to continuously adjust its thrust to chase the cursor's vertical position. If the cursor is above the drone, the drone should thrust upward. If it's below, the drone should ease off.</p>
        `;
    }

    verticalControlMathText() {
        return `
            <p>We use the same <strong>PD controller</strong> formula from Stage 3, but now using <strong>y_error</strong> instead of a fixed height error:</p>
            <pre>vertical_thrust = Kp * y_error + Kd * derivative(y_error) + hover_thrust</pre>
            <p>The <strong>derivative term</strong> measures how fast the error is changing, which prevents the drone from overshooting. A reasonable starting point is <strong>Kp = 1</strong> and <strong>Kd = 2</strong>.</p>
        `;
    }

    verticalControlCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have three variables available:</p>
            <ul>
                <li><code>y_error</code>: the vertical gap between the cursor and the drone</li>
                <li><code>derivative(y_error)</code>: how fast the vertical error is changing</li>
                <li><code>hover_thrust</code>: the baseline thrust needed to stay airborne</li>
            </ul>
            <p>Write the right hand side of the vertical thrust equation using those variables.</p>
        `;
    }
 
    validateVerticalThrust() {
        const raw = this.positionUpdateCode;
 
        let normalized = raw
            .replace(/\bhover[ _]?thrust\b/ig, 'hover_thrust')
            .replace(/\by[ _]?error\b/ig, 'y_error')
            .replace(/derivative\s*\(\s*y_error\s*\)/ig, 'dy_error');
 
        if (!/\by_error\b/.test(normalized)) {
            alert("Your equation must include 'y_error'. Please try again.");
            return false;
        }
        if (!/\bdy_error\b/.test(normalized)) {
            alert("Your equation must include 'derivative(y_error)'. Please try again.");
            return false;
        }
        if (!/\bhover_thrust\b/.test(normalized)) {
            alert("Your equation must include 'hover_thrust'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('y_error', 'dy_error', 'hover_thrust', 'return (' + normalized + ');');
            const result = fn(0, 0, 3.728);
            if (isNaN(result)) throw new Error("NaN");
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    // ─── PHASE 3: Horizontal Error → Desired Angle ────────────────────────────
 
    phase3() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Physics Teaching Step*/
                [this.game.createPhaseTeaching, this.horizontalPhysicsText(), () => true, null, null],

                /*Math Teaching Step*/
                [this.game.createPhaseTeaching, this.horizontalMathText(), () => true, null, null],

                /*Code Bridge Teaching Step*/
                [this.game.createPhaseTeaching, this.horizontalCodeBridgeText(), () => true, null, null],

                /*Desired Angle Input*/
                [
                    this.game.input,
                    [
                        "desired_angle = ",
                        "e.g., -Math.atan(ax_desired / gravity)",
                        "Submit"
                    ],
                    this.validateDesiredAngle.bind(this),
                    this.game.hint,
                    "Hint: Use Math.atan() and the variables ax_desired and gravity. The negative sign is needed because tilting right (positive x) requires the drone to tip its left side up, which is a negative angle."
                ]
            ]);
    }

    horizontalPhysicsText() {
        return `
            <p>Unlike vertical movement, the drone <strong>can't push itself sideways directly</strong>. Instead, it tilts so that the motor thrust has a horizontal component.</p>
        `;
    }

    horizontalMathText() {
        return `
            <p><strong>Step 1: How hard do we want to accelerate horizontally?</strong></p>
            <p>We use a PD controller on x_error to compute a desired horizontal acceleration:</p>
            <pre>ax_desired = Kp * x_error + Kd * derivative(x_error)</pre>
            <p>This is the same PD pattern as before — just applied to horizontal position instead of height. A good starting point is <strong>Kp = 1, Kd = 2</strong>. Notice there is no hover_thrust here because this is an acceleration, not a direct force.</p>

            <p><strong>Step 2: What tilt angle produces that acceleration?</strong></p>
            <p>When the drone tilts by angle theta, the motors no longer point straight up. The total thrust force <strong>F</strong> splits into two components:</p>
            <pre>Vertical:   F * cos(theta)
    Horizontal: F * sin(theta)</pre>

            <p>We want the horizontal component to produce our desired acceleration, so by Newton's second law:</p>
            <pre>F * sin(theta) = mass * ax_desired</pre>

            <p>When hovering, the vertical component must support the drone's weight:</p>
            <pre>F * cos(theta) = mass * gravity</pre>

            <p>Dividing the first equation by the second cancels out F and mass:</p>
            <pre>sin(theta) / cos(theta) = ax_desired / gravity</pre>

            <p>Since sin/cos = tan, we can take the inverse tangent of both sides:</p>
            <pre>theta = atan(ax_desired / gravity)</pre>

            <p>Finally, we add a <strong>negative sign</strong> because of our coordinate convention: to accelerate right, the drone must tilt with its left side up, which is a negative angle in our system:</p>
            <pre>desired_angle = -atan(ax_desired / gravity)</pre>
        `;
    }

    horizontalCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have two variables available for the angle equation:</p>
            <ul>
                <li><code>ax_desired</code>: the horizontal acceleration computed from x_error</li>
                <li><code>gravity</code>: the gravitational acceleration (already available)</li>
            </ul>
            <p>Use <code>Math.atan()</code> for the inverse tangent. Write the right hand side of the desired_angle equation.</p>
        `;
    }
 
    validateDesiredAngle() {
        const raw = this.positionUpdateCode;
 
        const normalized = raw
            .replace(/\batan\b/ig, 'Math.atan')
            .replace(/\batan2\b/ig, 'Math.atan2');
 
        const hasAtan = /Math\.atan/.test(normalized);
        const hasAx   = /\bax_desired\b/.test(normalized);
        const hasGrav = /\bgravity\b/.test(normalized);
 
        if (!hasAtan) {
            alert("Your equation must use atan() (inverse tangent). Please try again.");
            return false;
        }
        if (!hasAx || !hasGrav) {
            alert("Your equation must use the variables 'ax_desired' and 'gravity'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('ax_desired', 'gravity', 'return (' + normalized + ');');
            const result = fn(0, 9.81);
            if (isNaN(result)) throw new Error("NaN");
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    // ─── PHASE 4: Angle Error, Torque, and Motor Thrusts ─────────────────────
 
    phase4() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Physics Teaching Step*/
                [this.game.createPhaseTeaching, this.motorSplitPhysicsText(), () => true, null, null],

                /*Math Teaching Step*/
                [this.game.createPhaseTeaching, this.motorSplitMathText(), () => true, null, null],

                /*Code Bridge Teaching Step*/
                [this.game.createPhaseTeaching, this.motorSplitCodeBridgeText(), () => true, null, null],

                /*Motor Thrust Input*/
                [
                    this.game.input,
                    [
                        "Enter T1 and T2 (separated by a comma): ",
                        "e.g., vertical_thrust/2 + torque/2, vertical_thrust/2 - torque/2",
                        "Submit"
                    ],
                    () => true,
                    this.game.hint,
                    "Hint: T1 = vertical_thrust / (2 * cos(angle)) + torque / 2   and   T2 = vertical_thrust / (2 * cos(angle)) - torque / 2. The cos(angle) correction accounts for the drone being tilted."
                ]
            ]);
    }

    motorSplitPhysicsText() {
        return `
            <p>We now have a <strong>desired_angle</strong> for the drone to tilt to. To reach it, we apply a <strong>torque</strong> — a rotational force that spins the drone toward the target angle.</p>
            <p>The two motors create torque by pushing different amounts. If the left motor pushes harder, the drone tilts right. If the right motor pushes harder, the drone tilts left.</p>
        `;
    }

    motorSplitMathText() {
        return `
            <p>We use a PD controller on the angle error to compute torque:</p>
            <pre>angle_error = desired_angle - current_angle
torque = Kp * angle_error + Kd * derivative(angle_error)</pre>
            <p>Then we split the work between the two motors. Each motor must contribute to both <strong>lifting</strong> (vertical_thrust) and <strong>rotating</strong> (torque):</p>
            <pre>T1 = vertical_thrust / (2 · cos(angle)) + torque / 2
T2 = vertical_thrust / (2 · cos(angle)) − torque / 2</pre>
            <p>The <strong>cos(angle)</strong> correction accounts for the fact that when the drone is tilted, the motors are no longer pointing straight up — they need to work harder to produce the same vertical lift.</p>
        `;
    }

    motorSplitCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have these variables available:</p>
            <ul>
                <li><code>vertical_thrust</code>: the total upward force computed from your vertical PD controller</li>
                <li><code>torque</code>: the rotational force computed from the angle error</li>
                <li><code>angle</code>: the drone's current tilt angle in radians</li>
            </ul>
            <p>Enter both motor thrust expressions separated by a comma. Use <code>Math.cos(angle)</code> for the tilt correction.</p>
        `;
    }
 
 
    // ─── PHASE 5: Simulation ──────────────────────────────────────────────────
 
    phase5() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Teaching*/
                [
                    this.game.createPhaseTeaching,
                    this.simIntroTeachText(),
                    () => true, null, null
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
 
    simIntroTeachText() {
        return `<p>All three controllers are now working together:</p>
        <ol>
            <li>A <b>vertical PD controller</b> adjusts thrust to match the cursor's height.</li>
            <li>A <b>horizontal PD controller</b> computes the desired tilt angle from horizontal error.</li>
            <li>An <b>angle PD controller</b> generates the torque to reach that tilt angle.</li>
        </ol>
        <p>Move your cursor around the screen and watch the drone follow it. If the drone goes out of bounds, the simulation ends.</p>`;
    }


    drawTriangle(ctx) {
        const droneX = this.drone.x * this.game.meter;
        const droneY = this.game.canvas.height - (this.drone.y * this.game.meter);

        // --- Draw right triangle legs ---
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 2;

        // Vertical leg
        ctx.beginPath();
        ctx.moveTo(droneX, droneY);
        ctx.lineTo(droneX, this.mouseY);
        ctx.stroke();

        // Horizontal leg
        ctx.beginPath();
        ctx.moveTo(droneX, this.mouseY);
        ctx.lineTo(this.mouseX, this.mouseY);
        ctx.stroke();

        // Hypotenuse
        ctx.beginPath();
        ctx.moveTo(droneX, droneY);
        ctx.lineTo(this.mouseX, this.mouseY);
        ctx.stroke();

        // Calculate angle
        const dx = this.mouseX - droneX;
        const dy = this.mouseY - droneY;
        const angleRad = Math.atan2(dx, -dy);
        const angleDeg = (angleRad * 180 / Math.PI).toFixed(1);

        // Draw arc
        const arcRadius = 30;
        const startAngle = -Math.PI / 2;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,255,0,0.9)';
        ctx.lineWidth = 2;
        ctx.arc(droneX, droneY, arcRadius, startAngle, startAngle + angleRad, angleRad < 0);
        ctx.stroke();

        // --- Draw angle label ---
        const midAngle = startAngle + angleRad / 2;
        const labelX = droneX + Math.cos(midAngle) * (arcRadius + 15);
        const labelY = droneY + Math.sin(midAngle) * (arcRadius + 15);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`θ = ${angleDeg}°`, labelX, labelY);

        // --- Draw leg labels ---
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        // Vertical leg label (adjacent, along vertical)
        const vertLabelX = droneX - 40; // offset to the left
        const vertLabelY = (droneY + this.mouseY) / 2;
        ctx.fillText('adjacent = cursor_y - drone_y', vertLabelX, vertLabelY);

        // Horizontal leg label (opposite, along horizontal)
        const horizLabelX = (droneX + this.mouseX) / 2;
        const horizLabelY = this.mouseY + 20; // offset below
        ctx.fillText('opposite = cursor_x - drone_x', horizLabelX, horizLabelY);

        // Hypotenuse label
        const hypoLabelX = (droneX + this.mouseX) / 2 + 10;
        const hypoLabelY = (droneY + this.mouseY) / 2 - 10;
        ctx.fillText('hypotenuse', hypoLabelX, hypoLabelY);
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

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
        //this.drawTriangle(ctx);
    }


    initSim() {
        //initialize drone and other things

        //this.stagediv.removeChild(this.currentPhaseDiv);

        this.drone.reset();
        
        this.lastTime = null; 

        this.desired_angle = 0;

        this.lastError = {
            x: 0,
            y: 0,
            angle: 0
        };
    }

    stepSim(time) {
        //do one step of the simulation
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;  
        
        if(dt == 0) {
            dt = 0.016;
        }

        const desired = {
            x: this.game.mouse.x, 
            y: this.game.mouse.y
        };

        const error = {
            x: desired.x - this.drone.x, 
            y: desired.y - this.drone.y
        };


        // Controllers
        let vertical_thrust = 1 * error.y + 2 * ((error.y - this.lastError.y) / dt) + this.drone.hover_thrust;

        // Desired horizontal acceleration
        let ax_desired = 1 * error.x + 2 * (error.x - this.lastError.x) / dt;

        // Convert acceleration to tilt angle
        this.desired_angle = -1 * Math.atan(ax_desired / this.drone.gravity);

        let angle_error = this.desired_angle - this.drone.angle;

        let torque = 1 * angle_error + (2 * (angle_error - this.lastError.angle)) / dt;
        
        let T1 = vertical_thrust/(2 * Math.cos(this.drone.angle)) + torque/2;
        let T2 = vertical_thrust/(2 * Math.cos(this.drone.angle)) - torque/2;
        let thrustArray = [T1, T2];

        
        this.drone.update(dt, thrustArray);


        //Save Variables
        this.lastError = {
            x: error.x,
            y: error.y,
            angle: angle_error
        }

        console.log("Left Thrust: " + T1.toFixed(4) + "\nRight Thrust: " + T2.toFixed(4) + "\nAngle Error: " + (angle_error * (180/Math.PI)).toFixed(4) + "\nTorque: " + torque.toFixed(4) + "\nCurrent Angle: " + (this.drone.angle * (180/Math.PI)).toFixed(4) + "\nDesired Angle: " + (this.desiredAngle * (180/Math.PI)).toFixed(4))
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