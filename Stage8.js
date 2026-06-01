class Stage8 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.obstacleList = [
            game.toMeters({ x: game.canvas.width * 0.2, y: game.canvas.height / 2 }),
            game.toMeters({ x: game.canvas.width * 0.7, y: game.canvas.height / 2 }),
            game.toMeters({ x: game.canvas.width * 0.8, y: game.canvas.height / 2 })
        ].map((obs, i) => ({
            ...obs,
            baseY: obs.y,
            phaseOffset: (i / 3) * Math.PI * 2   // spreads them evenly around the cycle
        }));

        this.obstacleradius = 0.5;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage8div");
        this.stagediv.setAttribute("class", "stageDiv");
    
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);

        this.managePhases();
    }
    
    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 8! Here you will learn how to make the drone avoid obstacles.', "Start");
                    break;
            case 1: this.phase1();  // What is obstacle avoidance? + distance
                    break;
            case 2: this.phase2();  // Repulsion strength
                    break;
            case 3: this.phase3();  // Combining repulsion with cursor error
                    break;
            case 4: this.phase4();  // Simulation
                    break;
 
            default: this.game.endStage("Stage 8 Completed", "GAME FINISHED", Stage10, this);
                    this.stageEnded = true;
                    break;
        }
    }
 
    // ─── PHASE 1: Obstacle Avoidance + Distance ───────────────────────────────
 
    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Teaching: what is obstacle avoidance*/
                [
                    this.game.createPhaseTeaching,
                    this.obstacleIntroTeachText(),
                    () => true, null, null
                ],
 
                /*Teaching: distance to an obstacle*/
                [
                    this.game.createPhaseTeaching,
                    this.distanceTeachText(),
                    () => true, null, null
                ],
 
                /*Distance Input*/
                [
                    this.game.input,
                    ["dist = ", "Enter equation for distance to an obstacle", "Submit"],
                    this.validateDistance.bind(this),
                    this.game.hint,
                    "Hint: Use Math.hypot(dx, dy) to find the straight-line distance between two points, then subtract the obstacle's radius so the distance is measured from the obstacle's surface, not its centre."
                ]
            ]);
    }
 
    obstacleIntroTeachText() {
        return `<p>In Stage 8, the drone could follow your cursor, but it had no idea that obstacles exist. If you moved the cursor behind a red ball, the drone would fly straight into it.</p>
 
        <p>In this stage, we'll give the drone a sense of <b>self-preservation</b>. The idea is called a <b>repulsion field</b>: each obstacle pushes the drone away from itself, similar to how two magnets with matching poles repel each other.</p>
 
        <p>The closer the drone gets to an obstacle, the <b>stronger</b> the push. Far enough away, the obstacle has <b>no effect at all</b>. We blend this repulsion force directly into the same error-based control system from Stage 8.</p>
 
        <p>There are three things to figure out for each obstacle:</p>
        <ol>
            <li>How far away is the obstacle? (<b>distance</b>)</li>
            <li>How hard should it push? (<b>repulsion strength</b>)</li>
            <li>In which direction? (<b>repulsion vector</b>)</li>
        </ol>`;
    }
 
    distanceTeachText() {
        return `<p>First, we need the <b>distance</b> from the drone to each obstacle. We already know the drone's position <b>(drone_x, drone_y)</b> and the obstacle's position <b>(obs_x, obs_y)</b>.</p>
 
        <p>The straight-line distance between two points uses the Pythagorean theorem:</p>
        <pre>dist = sqrt(dx² + dy²)</pre>
        <p>where <b>dx = drone_x − obs_x</b> and <b>dy = drone_y − obs_y</b>.</p>
 
        <p>In JavaScript, <b>Math.hypot(dx, dy)</b> does exactly this calculation for you.</p>
 
        <p>However, obstacles have a <b>radius</b>, so we measure distance from the <i>surface</i> of the obstacle, not its centre. That means we subtract the obstacle radius from the result:</p>
        <pre>dist = Math.hypot(dx, dy) - obstacle_radius</pre>
 
        <p>Enter the equation for <b>dist</b> using the variables <b>dx</b>, <b>dy</b>, and <b>obstacle_radius</b>.</p>`;
    }
 
    validateDistance() {
        const code = this.positionUpdateCode;
 
        const hasHypot = /Math\.hypot|sqrt|hypot/.test(code);
        const hasDx    = /\bdx\b/.test(code);
        const hasDy    = /\bdy\b/.test(code);
        const hasRadius = /\bobstacle_radius\b/.test(code);
 
        if (!hasDx || !hasDy) {
            alert("Your equation must use the variables 'dx' and 'dy'. Please try again.");
            return false;
        }
        if (!hasHypot) {
            alert("Your equation should use Math.hypot(dx, dy) to calculate the straight-line distance. Please try again.");
            return false;
        }
        if (!hasRadius) {
            alert("Don't forget to subtract 'obstacle_radius' so the distance is measured from the obstacle's surface. Please try again.");
            return false;
        }
 
        try {
            const normalized = code.replace(/\bhypot\b/g, 'Math.hypot');
            const fn = new Function('dx', 'dy', 'obstacle_radius', 'return (' + normalized + ');');
            // drone at (3,4) from obstacle centre, radius 0.5 → dist = 5 - 0.5 = 4.5
            const result = fn(3, 4, 0.5);
            if (Math.abs(result - 4.5) > 0.05) {
                alert("Incorrect. Check your equation: dist = Math.hypot(dx, dy) - obstacle_radius. Please try again.");
                return false;
            }
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    // ─── PHASE 2: Repulsion Strength ──────────────────────────────────────────
 
    phase2() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Teaching: repulsion strength formula*/
                [
                    this.game.createPhaseTeaching,
                    this.repulsionStrengthTeachText(),
                    () => true, null, null
                ],
 
                /*Repulsion Strength Input*/
                [
                    this.game.input,
                    ["strength = ", "Enter equation for repulsion strength", "Submit"],
                    this.validateRepulsionStrength.bind(this),
                    this.game.hint,
                    "Hint: strength = (1 / dist) - (1 / (obstacle_radius + repulsion_radius)). If the result is negative, clamp it to 0 — we only want to push, never pull."
                ]
            ]);
    }
 
    repulsionStrengthTeachText() {
        return `<p>Now that we know the distance, we need to compute the <b>repulsion strength</b> — how hard the obstacle pushes the drone away.</p>
 
        <p>We want a force that:</p>
        <ul>
            <li>Gets <b>very large</b> as the drone approaches the obstacle surface (dist → 0)</li>
            <li>Fades to <b>exactly zero</b> at a certain safe distance called the <b>repulsion radius</b></li>
            <li>Has <b>no effect</b> beyond that safe distance</li>
        </ul>
 
        <p>A formula that does all three of these things is:</p>
        <pre>strength = (1 / dist) - (1 / (obstacle_radius + repulsion_radius))</pre>
 
        <p>When <b>dist</b> is large, the first term is small and eventually the whole expression goes negative. We clamp it at zero so obstacles only ever <b>push</b>, never pull:</p>
        <pre>if (strength &lt; 0) { strength = 0; }</pre>
 
        <p>Enter the equation for <b>strength</b> using the variables <b>dist</b>, <b>obstacle_radius</b>, and <b>repulsion_radius</b>. The clamping is handled for you after you submit.</p>`;
    }
 
    validateRepulsionStrength() {
        const code = this.positionUpdateCode;
 
        const hasDist   = /\bdist\b/.test(code);
        const hasObsR   = /\bobstacle_radius\b/.test(code);
        const hasRepR   = /\brepulsion_radius\b/.test(code);
 
        if (!hasDist) {
            alert("Your equation must use the variable 'dist'. Please try again.");
            return false;
        }
        if (!hasObsR || !hasRepR) {
            alert("Your equation must use 'obstacle_radius' and 'repulsion_radius'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('dist', 'obstacle_radius', 'repulsion_radius', 'return (' + code + ');');
            // At dist = obstacle_radius + repulsion_radius the strength should be 0
            const result = fn(1.5, 0.5, 1.0);
            if (Math.abs(result) > 0.05) {
                alert("Incorrect. At exactly the repulsion boundary (dist = obstacle_radius + repulsion_radius), strength should equal 0. Check your formula.");
                return false;
            }
            // Strength should be positive when closer than the repulsion radius
            const closeResult = fn(0.6, 0.5, 1.0);
            if (closeResult <= 0) {
                alert("Incorrect. Strength should be positive when the drone is inside the repulsion radius. Check your formula.");
                return false;
            }
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    // ─── PHASE 3: Combining Repulsion with Cursor Error ───────────────────────
 
    phase3() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Teaching: repulsion direction + combining with cursor error*/
                [
                    this.game.createPhaseTeaching,
                    this.repulsionDirectionTeachText(),
                    () => true, null, null
                ],
 
                /*Combined X Error Input*/
                [
                    this.game.input,
                    ["combined_x_error = ", "Enter combined x error equation", "Submit"],
                    this.validateCombinedX.bind(this),
                    this.game.hint,
                    "Hint: Add the cursor x error and the x component of the repulsion together: cursor_x_error + repulsion_x"
                ],
 
                /*Combined Y Error Input*/
                [
                    this.game.input,
                    ["combined_y_error = ", "Enter combined y error equation", "Submit"],
                    this.validateCombinedY.bind(this),
                    this.game.hint,
                    "Hint: Same idea vertically: cursor_y_error + repulsion_y"
                ]
            ]);
    }
 
    repulsionDirectionTeachText() {
        return `<p>We know how <i>strongly</i> to push. Now we need to know in which <b>direction</b>.</p>
 
        <p>The repulsion should point <b>directly away from the obstacle</b>. The vector pointing from the obstacle to the drone is simply <b>(dx, dy)</b> — the same values we used to compute distance. Multiplying by the strength scales that direction vector:</p>
        <pre>repulsion_x = dx * strength
repulsion_y = dy * strength</pre>
 
        <p>We do this for every obstacle and <b>add all the repulsion vectors together</b>. If two obstacles are pushing in different directions, their contributions partially cancel — the drone threads between them naturally.</p>
 
        <p>The final step is to <b>blend repulsion into the cursor error</b> from Stage 8. Instead of feeding raw cursor error into the controllers, we add the repulsion on top:</p>
        <pre>combined_x_error = cursor_x_error + repulsion_x
combined_y_error = cursor_y_error + repulsion_y</pre>
 
        <p>The rest of the control system (vertical thrust, desired angle, torque, motor split) is <b>unchanged</b> from Stage 8 — it just receives this blended error instead of the raw cursor error.</p>
 
        <p>Enter each combined error equation below using the variables <b>cursor_x_error</b> and <b>repulsion_x</b> (or <b>cursor_y_error</b> and <b>repulsion_y</b>).</p>`;
    }
 
    validateCombinedX() {
        const code = this.positionUpdateCode;
 
        const hasCursor    = /\bcursor_x_error\b/.test(code);
        const hasRepulsion = /\brepulsion_x\b/.test(code);
 
        if (!hasCursor || !hasRepulsion) {
            alert("Your equation must use 'cursor_x_error' and 'repulsion_x'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('cursor_x_error', 'repulsion_x', 'return (' + code + ');');
            const result = fn(3, 1.5);
            if (Math.abs(result - 4.5) > 0.05) {
                alert("Incorrect. combined_x_error = cursor_x_error + repulsion_x. Please try again.");
                return false;
            }
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    validateCombinedY() {
        const code = this.positionUpdateCode;
 
        const hasCursor    = /\bcursor_y_error\b/.test(code);
        const hasRepulsion = /\brepulsion_y\b/.test(code);
 
        if (!hasCursor || !hasRepulsion) {
            alert("Your equation must use 'cursor_y_error' and 'repulsion_y'. Please try again.");
            return false;
        }
 
        try {
            const fn = new Function('cursor_y_error', 'repulsion_y', 'return (' + code + ');');
            const result = fn(2, -0.5);
            if (Math.abs(result - 1.5) > 0.05) {
                alert("Incorrect. combined_y_error = cursor_y_error + repulsion_y. Please try again.");
                return false;
            }
        } catch(e) {
            alert("Please enter a valid equation.");
            return false;
        }
        return true;
    }
 
    // ─── PHASE 4: Simulation ──────────────────────────────────────────────────
 
    phase4() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
            this.stagediv,
            [
                /*Teaching: sim intro*/
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
        return `<p>The full system is now in place:</p>
        <ol>
            <li>For each obstacle, compute <b>distance</b> from the drone to its surface.</li>
            <li>Use the potential field formula to get a <b>repulsion strength</b> (zero beyond the safe radius).</li>
            <li>Scale the direction vector <b>(dx, dy)</b> by the strength to get the repulsion contribution.</li>
            <li>Sum all obstacle repulsions and <b>add to the cursor error</b>.</li>
            <li>Feed the combined error into the same <b>three PD controllers</b> from Stage 8.</li>
        </ol>
        <p>Move your cursor around the screen. Try guiding the drone close to the red obstacles and watch it automatically steer away.</p>`;
    }
 















    /*
    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 8! Here you will learn how to make the drone avoid obstacles', "Start");
                    break;
            case 1: this.phase1();
                    break;

            default:this.game.endStage("Stage 8 Completed", "Stage 10 - FILL IN HERE", Stage10, this);
                    this.stageEnded = true;
                    break;
        }
    }
    

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        //Simulation Step
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
                    */

    nextPhase() {
        this.phase++;
        this.step = 0;
        if (this.currentPhaseDiv) {
            this.stagediv.removeChild(this.currentPhaseDiv);
        }
        this.drone.reset();
        this.managePhases();
    }

    drawobstacles(ctx) {
        this.obstacleList.forEach(obstacle => {
            this.game.drawShadow(obstacle);

            const obstaclePixels = this.game.toPixels(obstacle);

            ctx.beginPath();
            ctx.arc(
                obstaclePixels.x,
                obstaclePixels.y,
                this.obstacleradius * this.game.meter,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "rgba(255, 0, 0, 1)";
            ctx.fill();
        });
    }

    updateObstacles(time) {
        const hoverSpeed = 0.5;   // cycles per second
        const hoverHeight = 0.15; // meters

        this.obstacleList.forEach(obs => {
            obs.y = obs.baseY + Math.sin((time / 1000) * hoverSpeed * Math.PI * 2 + obs.phaseOffset) * hoverHeight;
        });
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
        this.drawobstacles(ctx);
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
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;  
        
        if(dt == 0) {
            dt = 0.016;
        }

        this.updateObstacles(time);

        //OBSTACLE REPULSION

        const repulsion = {
            x: 0,
            y: 0
        };

        this.obstacleList.forEach(current => {
            const dx_obs = this.drone.x - current.x;
            const dy_obs = this.drone.y - current.y;

            const dist = Math.hypot(dx_obs, dy_obs) - this.obstacleradius;

            const repulsionRadius = 1;   // meters

            let strength = (1 / dist) - (1 / (this.obstacleradius + repulsionRadius));
            
            if (strength < 0) {strength = 0};

            repulsion.x += dx_obs * strength;
            repulsion.y += dy_obs * strength;
        });

        const desired = {
            x: this.game.mouse.x, 
            y: this.game.mouse.y
        };

        const cursor_error = {
            x: desired.x - this.drone.x, 
            y: desired.y - this.drone.y
        };


        // COMBINED ERRORS
        const error = {
            x: cursor_error.x + repulsion.x,
            y: cursor_error.y + repulsion.y
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

        console.log(
            "-- Vertical (Y) --\n" +
            "y_desired: " + desired.y.toFixed(3) + " m\n" +
            "y_current: " + this.drone.y.toFixed(3) + " m\n" +
            "y_error:   " + error.y.toFixed(3) + " m\n" +
            "v_thrust:  " + vertical_thrust.toFixed(3) + " N\n\n" +

            "-- Horizontal (X) --\n" +
            "x_desired: " + desired.x.toFixed(3) + " m\n" +
            "x_current: " + this.drone.x.toFixed(3) + " m\n" +
            "x_error:   " + error.x.toFixed(3) + " m\n" +
            "des_angle: " + (this.desired_angle * 180 / Math.PI).toFixed(2) + " deg\n" +
            "current_angle: " + (this.drone.angle * 180 / Math.PI).toFixed(2) + " deg\n" +
            "angle_error: " + (angle_error * 180 / Math.PI).toFixed(2) + " deg\n\n" +

            "-- Repulsion --\n" +
            //"dist: " + dist.toFixed(3) + "\n" +
            "x_repulsion: " + repulsion.x.toFixed(3) + "\n" +
            "y_repulsion: " + repulsion.y.toFixed(3) 
        );
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