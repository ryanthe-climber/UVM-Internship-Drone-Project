class Stage7old {
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
            /*case 3: this.phase3();  // Horizontal → Desired Angle
                    break;*/
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
                /*Teaching Step*/
                [
                    this.game.createPhaseTeaching,
                    this.positionErrorTeachText(),
                    () => true, null, null
                ],
 
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
 
    positionErrorTeachText() {
        return `<p>To follow the cursor, the drone first needs to know <b>how far away</b> the cursor is in both the horizontal (x) and vertical (y) directions. This difference is called the <b>error</b>.</p>
 
        <p>We define the cursor position as <b>(mouse_x, mouse_y)</b> and the drone position as <b>(drone_x, drone_y)</b>.</p>
 
        <p>Just like in Stage 3, the error is the <i>desired</i> value minus the <i>current</i> value:</p>
 
        <pre>x_error = mouse_x - drone_x
y_error = mouse_y - drone_y</pre>
 
        <p>A positive x_error means the cursor is to the right. A positive y_error means the cursor is above. Enter each error equation below.</p>`;
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
                /*Teaching Step*/
                [
                    this.game.createPhaseTeaching,
                    this.verticalControlTeachText(),
                    () => true, null, null
                ],
 
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
 
    verticalControlTeachText() {
        return `<p>You already built a vertical PD controller in Stage 3! The same idea applies here: we use <b>y_error</b> and its derivative to compute the thrust needed to move the drone toward the cursor's height.</p>
 
        <p>Recall the PD controller formula:</p>
        <pre>thrust = Kp * error + Kd * derivative(error) + hover_thrust</pre>
 
        <p>Here, <b>derivative(y_error)</b> is how fast the y error is changing, which helps prevent overshooting. A reasonable starting point for the gains is <b>Kp = 1</b> and <b>Kd = 2</b>.</p>
 
        <p>This gives us the total upward force needed to track the cursor vertically. Enter the equation below using the variables <b>y_error</b>, <b>derivative(y_error)</b>, and <b>hover_thrust</b>.</p>`;
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
                /*Teaching: horizontal PD*/
                [
                    this.game.createPhaseTeaching,
                    this.horizontalAccelTeachText(),
                    () => true, null, null
                ],
 
                /*Teaching: atan conversion*/
                [
                    this.game.createPhaseTeaching,
                    this.atanTeachText(),
                    () => true, null, null
                ],
 
                /*Desired Angle Input*/
                [
                    this.game.input,
                    [
                        "desired_angle = ",
                        "e.g., -atan(ax_desired / gravity)",
                        "Submit"
                    ],
                    this.validateDesiredAngle.bind(this),
                    this.game.hint,
                    "Hint: Use Math.atan() and the variables ax_desired and gravity. The negative sign is needed because tilting right (positive x) requires the drone to tip its left side up, which is a negative angle."
                ]
            ]);
    }
 
    horizontalAccelTeachText() {
        return `<p>For horizontal movement, we <i>can't</i> push the drone sideways directly — instead, we <b>tilt</b> it so that the motor thrust has a horizontal component. The more we tilt, the stronger the sideways push.</p>
 
        <p>First, we use a PD controller on <b>x_error</b> to compute the <i>desired horizontal acceleration</i>:</p>
        <pre>ax_desired = Kp * x_error + Kd * derivative(x_error)</pre>
 
        <p>This tells us how strongly we want to accelerate horizontally. Notice there is no hover_thrust here — this is an acceleration, not a direct force. A good starting point is again <b>Kp = 1</b>, <b>Kd = 2</b>.</p>`;
    }
 
    atanTeachText() {
        return `<p>Now we need to convert <b>ax_desired</b> (the acceleration we want) into a <b>tilt angle</b> the drone should adopt.</p>
 
        <p>Newton's second law tells us that for a drone of mass <i>m</i>, horizontal thrust is <b>F_x = m · ax</b>. When the drone is tilted by angle θ, the horizontal component of motor thrust is <b>F · sin(θ)</b>. Setting these equal and dividing by vertical thrust (≈ gravity), we get:</p>
        <pre>desired_angle = -atan(ax_desired / gravity)</pre>
 
        <p>The <b>negative sign</b> is a convention: tilting right means the left motor is higher, giving a negative angle in our coordinate system.</p>
 
        <p>Enter the equation for <b>desired_angle</b> using the variables <b>ax_desired</b> and <b>gravity</b>. Use <b>Math.atan()</b> for the inverse tangent.</p>`;
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
                /*
                //Teaching: angle error + torque
                [
                    this.game.createPhaseTeaching,
                    this.angleErrorTorqueTeachText(),
                    () => true, null, null
                ],
 
                //Angle Error Input
                [
                    this.game.input,
                    ["angle_error = ", "Enter angle error equation", "Submit"],
                    this.validateAngleError.bind(this),
                    this.game.hint,
                    "Hint: This is the same pattern as before — desired minus current. Use desired_angle and current_angle."
                ],
                /*Teaching: splitting into T1 and T2*/

        
                [
                    this.game.createPhaseTeaching,
                    this.motorSplitTeachText(),
                    () => true, null, null
                ],
 
                /*Motor Thrust Input*/
                [
                    this.game.input,
                    [
                        "Enter T1 and T2 (separated by a comma): ",
                        "e.g., vertical_thrust/2 + torque/2, vertical_thrust/2 - torque/2",
                        "Submit"
                    ],
                    () => true,   // Validation covered in teaching; sim will reveal mistakes
                    this.game.hint,
                    "Hint: T1 = vertical_thrust / (2 * cos(angle)) + torque / 2   and   T2 = vertical_thrust / (2 * cos(angle)) - torque / 2. The cos(angle) correction accounts for the drone being tilted."
                ]
            ]);
    }
 
    angleErrorTorqueTeachText() {
        return `<p>We now have a <b>desired_angle</b> for the drone to tilt to. To get there, we use the same PD approach one more time — this time on the <b>angle error</b>.</p>
 
        <p><b>angle_error</b> is how far the drone's current tilt is from the desired tilt:</p>
        <pre>angle_error = desired_angle - current_angle</pre>
 
        <p>We turn this angle error into a <b>torque</b> — a rotational force — using a PD controller:</p>
        <pre>torque = Kp * angle_error + Kd * derivative(angle_error)</pre>
 
        <p>Torque tells us how hard the motors need to push against each other to spin the drone. A positive torque rotates the drone counter-clockwise; a negative torque rotates it clockwise.</p>
 
        <p>Enter the equation for <b>angle_error</b> below using the variables <b>desired_angle</b> and <b>current_angle</b>.</p>`;
    }
 
    validateAngleError() {
        const code = this.positionUpdateCode;
        const hasDesired = /\bdesired_angle\b/.test(code);
        const hasCurrent = /\bcurrent_angle\b/.test(code);
 
        if (!hasDesired || !hasCurrent) {
            alert("Your equation must use 'desired_angle' and 'current_angle'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('desired_angle', 'current_angle', 'return (' + code + ');');
            const result = fn(1.0, 0.3);
            if (Math.abs(result - 0.7) > 0.01) {
                alert("Incorrect. Remember: angle_error = desired_angle - current_angle. Please try again.");
                return false;
            }
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    motorSplitTeachText() {
        return `<p>We now have two things to accomplish with two motors:</p>
        <ol>
            <li><b>Stay in the air</b> — both motors together must provide <i>vertical_thrust</i>.</li>
            <li><b>Rotate</b> — one motor must push harder than the other to apply <i>torque</i>.</li>
        </ol>
 
        <p>We split the work like this:</p>
        <pre>T1 = vertical_thrust / (2 · cos(angle)) + torque / 2
T2 = vertical_thrust / (2 · cos(angle)) − torque / 2</pre>
 
        <p>The <b>cos(angle)</b> correction is important: when the drone is tilted, the motors are no longer pointing straight up, so they need to work a little harder to produce the same vertical lift. <b>T1</b> is the left motor and <b>T2</b> is the right motor.</p>
 
        <p>Enter both thrust expressions below, separated by a comma.</p>`;
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

    angleErrorTeachText() {
        return `<p>Once we know the desired angle, we can then find the angle error by simply subtracting the current angle from the desired angle.</p>
                <p>desired_angle - current_angle</p>`
    }

    anglularVelocityTeachText() {
        return `<p>
                Angular velocity <i>ω</i> measures how fast an object is rotating, it’s the rate of change of its angle over time.
                </p>
                <p><b>ω = (θ(t) - θ(t - Δt)) / Δt</b></p>
                <p>
                Here, <i>θ</i> is the angle error, and <i>Δt</i> is the time interval.
                </p>
                <p>
                Use the variables theta, previous_theta, and delta_time in your equation.
                </p>`;
    }

    anglularAccellerationTeachText() {
        return `<p>
                Angular acceleration <i>α</i> is the change in angular velocity over time:
                </p>
                <p><b>α = (ω(t) - ω(t - Δt)) / Δt</b></p>
                <p>
                Use the variables omega, previous_omega, and delta_time in your equation.
                </p>`
    }

    neededThrustTeachText() {
        return `Let’s walk through how to determine the motor thrusts needed to create that torque and reach a desired angle.</p>
                <p>
                Substitute into the torque equation:
                </p>
                <p><b>L(F<sub>1</sub> - F<sub>2</sub>) = J(ω(t) - ω(t - Δt)) / Δt</b></p>
                <p>or more compactly:</p>
                <p><b>F<sub>1</sub> - F<sub>2</sub> = (JΔω) / (LΔt)</b></p>`
    }

    torqueTeachText() {
        return `<p>When a drone tilts, it’s because a <b>torque</b> acts on it. </p>
                <p>
                Torque is related to the drone’s moment of inertia and its angular acceleration:
                </p>
                <p><b>τ = J · α</b></p>

                <hr>

                <p><b>Express torque in terms of motor forces:</b></p>
                <p>
                If two motors produce forces <i>F<sub>1</sub></i> and <i>F<sub>2</sub></i> at a distance <i>L</i> from the drone’s center:
                </p>
                <p><b>τ = L(F<sub>1</sub> - F<sub>2</sub>)</b></p>
                <p>
                Use the variables L, F1, F2, J, and angular_acceleration in your equation.
                </p>`;
    }

    hoverThrustTeachText() {
        return `<p><b>Hover Thrust:</b></p>
                <p>
                When hovering, both motors produce equal <i>hover thrust (HT)</i>. To tilt, we slightly increase one motor’s force and decrease the other by an amount <i>c</i>:
                </p>
                <p><b>F<sub>1</sub> = HT + c</b> <br> <b>F<sub>2</sub> = HT - c</b></p>

                <p>Substitute these into <b>F<sub>1</sub> - F<sub>2</sub> = (JΔω) / (LΔt)</b>:</p>
                <p><b>(HT + c) - (HT - c) = (JΔω) / (LΔt)</b></p>

                <p>This simplifies to:</p>
                <p><b>c = (JΔω) / (2LΔt)</b></p>

                <hr>

                <p><b>6. Account for tilt angle:</b></p>
                <p>
                Because the thrust vectors aren’t perfectly vertical when the drone is tilted, each force can be broken into components:
                </p>
                <p><b>F<sub>V</sub> = F · cosθ</b> &nbsp;&nbsp; (vertical component)<br>
                <b>F<sub>H</sub> = F · sinθ</b> &nbsp;&nbsp; (horizontal component)</p>

                <p>Here, <b>θ</b> is the <i>angle error</i> — the difference between the drone’s current and desired tilt angle.</p>`;
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






        /*
        this.desired_height = (this.game.canvas.height / this.game.meter) - (this.mouseY / this.game.meter);

        let dx = (this.mouseX / this.game.meter) - this.drone.x;
        let dx_dot = (dx - this.last_dx) / dt;

        // Desired horizontal acceleration
        let ax_desired = 1 * dx + 2 * dx_dot;

        // Convert acceleration to tilt angle
        this.desiredAngle = -1 * Math.atan(ax_desired / this.drone.gravity);

        let error = this.desired_height - this.drone.y;

        let hover_thrust = -1 * this.drone.mass * this.drone.gravity;

        let vertical_thrust = 1 * error + 2 * ((error - this.last_error) / dt) + hover_thrust;               

        let angle_error = this.desiredAngle - this.drone.angle;

        let torque = 1 * angle_error + (2 * (angle_error - this.last_angle_error)) / dt;
        
        let T1 = vertical_thrust/(2 * Math.cos(this.drone.angle)) + torque/2;
        let T2 = vertical_thrust/(2 * Math.cos(this.drone.angle)) - torque/2;
        let thrustArray = [T1, T2];

        this.drone.update(dt, thrustArray);

        this.last_angle_error = angle_error;
        this.last_error = error;
        this.last_dx = dx;
        */

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