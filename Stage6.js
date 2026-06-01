class Stage6 {
    constructor(game) {
        this.game = game;
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
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 6! Here you will learn how the drone moves by tilting and controlling the forces of the two motors.', "Start");
                    break;
            case 1: this.phase1();
                    break;
            case 2: this.phase2();
                    break;
            case 3: this.phase3();
                    break;
            case 4: this.phase4();
                    break;
            case 5: this.phase5();;
                    break;
            case 6: this.phase6();;
                    break;

            default:this.game.endStage("Stage 6 Completed", "Stage 7 - FILL IN HERE", Stage7, this);
                    this.stageEnded = true;
                    break;
        }
    }


     phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Angle Error Physics*/  [this.game.createPhaseTeaching, this.angleErrorPhysicsText(), () => true, null, null],
                        /*Angle Error Math*/      [this.game.createPhaseTeaching, this.angleErrorMathText(), () => true, null, null],
                        /*Angle Error Code*/      [this.game.createPhaseTeaching, this.angleErrorCodeBridgeText(), () => true, null, null],
                        /*Angle Error Input*/
                                    [   
                                        this.game.input,
                                        ["angle_error =", "Enter error equation", "Submit"],
                                        () => true, 
                                        this.game.hint, 
                                        "Hint: Error is the gap between where you want to be and where you are. desired_angle - current_angle"
                                    ],
                    ]);
    }
 
    phase2() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Angular Velocity Physics*/      [this.game.createPhaseTeaching, this.angularVelocityPhysicsText(), () => true, null, null],
                        /*Angular Velocity Math*/         [this.game.createPhaseTeaching, this.angularVelocityMathText(), () => true, null, null],
                        /*Angular Velocity Code*/         [this.game.createPhaseTeaching, this.angularVelocityCodeBridgeText(), () => true, null, null],
                        /*Angular Velocity Input*/
                                    [   
                                        this.game.input,
                                        ["Angular Velocity (ω) =", "Enter angular velocity equation", "Submit"],
                                        () => true,  //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: Rate of change of angle. (theta - previous_theta) / delta_time"
                                    ]
                    ]);
    }

    phase3() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Angular Acceleration Physics*/  [this.game.createPhaseTeaching, this.angularAccelerationPhysicsText(), () => true, null, null],
                        /*Angular Acceleration Math*/     [this.game.createPhaseTeaching, this.angularAccelerationMathText(), () => true, null, null],
                        /*Angular Acceleration Code*/     [this.game.createPhaseTeaching, this.angularAccelerationCodeBridgeText(), () => true, null, null],
                        /*Angular Acceleration Input*/
                                    [   
                                        this.game.input,
                                        ["Angular Acceleration (α) =", "Enter angular acceleration equation", "Submit"],
                                        () => true, //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: Rate of change of angular velocity. (omega - previous_omega) / delta_time"
                                    ]
                    ]);
    }

    
 
    phase4() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Torque Physics*/  [this.game.createPhaseTeaching, this.torquePhysicsText(), () => true, null, null],
                        /*Torque Math*/     [this.game.createPhaseTeaching, this.torqueMathText(), () => true, null, null],
                        /*Torque Code*/     [this.game.createPhaseTeaching, this.torqueCodeBridgeText(), () => true, null, null],
                        /*Torque Input*/
                                    [   
                                        this.game.input,
                                        ["Set both sides equal: ", "L * (F1 - F2) = ...", "Submit"],
                                        () => true,  //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: One side is L * (F1 - F2). The other is J * angular_acceleration."
                                    ]
                    ]);
    }
 
    phase5() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Needed Thrust Physics*/   [this.game.createPhaseTeaching, this.neededThrustPhysicsText(), () => true, null, null],
                        /*Needed Thrust Math*/      [this.game.createPhaseTeaching, this.neededThrustMathText(), () => true, null, null],
                        /*Hover Thrust Physics*/    [this.game.createPhaseTeaching, this.hoverThrustPhysicsText(), () => true, null, null],
                        /*Hover Thrust Math*/       [this.game.createPhaseTeaching, this.hoverThrustMathText(), () => true, null, null],
                        /*Hover Thrust Code*/       [this.game.createPhaseTeaching, this.hoverThrustCodeBridgeText(), () => true, null, null],
                        /*Thrust Input*/
                                    [   
                                        this.game.input,
                                        ["Thrust: ", "T1, T2", "Submit"],
                                        () => true, //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: T1 = hover_thrust + c, T2 = hover_thrust - c"
                                    ]
                    ]);
    }
 
    phase6() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Desired angle input step*/
                                    [   
                                        this.game.input,
                                        ["Desired Angle: ", "[-90, 90]", "Submit"],
                                        this.getAngle.bind(this),
                                        this.game.hint, 
                                        "Hint: "
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
 
 
    rotationThrustSubmit() {
 
    }
 
    // --- Phase 1: Angle Error ---
 
    angleErrorPhysicsText() {
        return `
            <p>In the previous stages, you controlled the drone's <strong>height</strong> by measuring how far it was from a target altitude. The same idea applies to rotation.</p>
            <p>To tilt the drone to a desired angle, it first needs to know <strong>how far off it is</strong> from that angle. That gap is the <strong>angle error</strong>.</p>
            <p>If the angle error is large, the drone is far from its target tilt and needs to work hard. If the error is zero, the drone is pointing exactly where it should be.</p>
        `;
    }
 
    angleErrorMathText() {
        return `
            <p>Angle error works exactly the same way as height error:</p>
            <pre>angle_error = desired_angle - current_angle</pre>
            <p>The sign still matters. If the drone is tilted <em>less</em> than the target, the error is <strong>positive</strong>. If it's already past the target, the error is <strong>negative</strong>.</p>
        `;
    }
 
    angleErrorCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have two variables available:</p>
            <ul>
                <li><code>desired_angle</code>: the tilt angle you want the drone to reach</li>
                <li><code>current_angle</code>: the drone's actual tilt angle right now</li>
            </ul>
            <p>Write the right hand side of the angle error equation using those two variables.</p>
        `;
    }
 
    // --- Phase 2: Angular Velocity and Acceleration ---
 
    angularVelocityPhysicsText() {
        return `            
            <p>That rate of rotation is called <strong>angular velocity</strong>. A drone spinning quickly past its target will overshoot, just like a drone moving fast past its target height. We need to measure it so we can slow down in time.</p>
        `;
    }
 
    angularVelocityMathText() {
        return `
            <p>Angular velocity is the rate of change of angle over time — the same pattern as linear velocity:</p>
            <pre>ω = (θ(t) − θ(t − Δt)) / Δt</pre>
            <p>In plain terms: subtract the previous angle error from the current one, then divide by the time step. A large result means the drone is rotating quickly.</p>
        `;
    }
 
    angularVelocityCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have these variables available:</p>
            <ul>
                <li><code>theta</code>: the current angle error</li>
                <li><code>previous_theta</code>: the angle error from the last frame</li>
                <li><code>delta_time</code>: the time elapsed since the last frame (Δt)</li>
            </ul>
            <p>Write the right hand side of the angular velocity equation using those variables.</p>
        `;
    }
 
    angularAccelerationPhysicsText() {
        return `
            <p><strong>Angular acceleration</strong> is the rate of change of angular velocity. It's what connects the motor forces to the rotation we actually see.</p>
        `;
    }
 
    angularAccelerationMathText() {
        return `
            <p>Angular acceleration follows the same pattern as angular velocity:</p>
            <pre>α = (ω(t) − ω(t − Δt)) / Δt</pre>
            <p>Subtract the previous angular velocity from the current one, then divide by the time step. This tells us how aggressively the rotation is changing each frame.</p>
        `;
    }
 
    angularAccelerationCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have these variables available:</p>
            <ul>
                <li><code>omega</code>: the current angular velocity</li>
                <li><code>previous_omega</code>: the angular velocity from the last frame</li>
                <li><code>delta_time</code>: the time elapsed since the last frame (Δt)</li>
            </ul>
            <p>Write the right hand side of the angular acceleration equation using those variables.</p>
        `;
    }
 
    // --- Phase 3: Torque ---
 
    torquePhysicsText() {
        return `
            <p>Rotation is caused by <strong>torque</strong> — a twisting force. On a drone, torque comes from the two motors being unequal. If the left motor pushes harder than the right, the drone tilts right. The bigger the difference, the stronger the torque.</p>
            <p>To control the tilt, we need to control the torque, which means controlling the difference between the two motor forces.</p>
        `;
    }
 
    torqueMathText() {
        return `
            <p>Torque is related to angular acceleration through the drone's <strong>moment of inertia</strong> J — its resistance to rotation, just like mass is its resistance to linear motion:</p>
            <pre>τ = J · α</pre>
            <p>The two motors produce forces F<sub>1</sub> and F<sub>2</sub> at a distance L from the drone's center. Their difference creates the torque:</p>
            <pre>τ = L · (F<sub>1</sub> − F<sub>2</sub>)</pre>
            <p>Setting these equal links the motor force difference directly to the angular acceleration we want:</p>
            <pre>L · (F<sub>1</sub> − F<sub>2</sub>) = J · α</pre>
        `;
    }
 
    torqueCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have these variables available:</p>
            <ul>
                <li><code>L</code>: the distance from the drone's center to each motor</li>
                <li><code>F1</code>: the force produced by the left motor</li>
                <li><code>F2</code>: the force produced by the right motor</li>
                <li><code>J</code>: the drone's moment of inertia</li>
                <li><code>angular_acceleration</code>: the value calculated in the last step</li>
            </ul>
            <p>Set the two expressions for torque equal to each other.</p>
        `;
    }
 
    // --- Phase 4: Thrust ---
 
    neededThrustPhysicsText() {
        return `
            <p>We now have an equation that links motor forces to the angular acceleration we need. The last step is to solve for the <strong>actual thrust values</strong> to send to each motor.</p>
            <p>The drone needs to do two things at once: <strong>hover</strong> (fight gravity) and <strong>tilt</strong> (rotate to the desired angle). The total thrust from both motors handles hovering, and the <em>difference</em> between them handles tilting.</p>
        `;
    }
 
    neededThrustMathText() {
        return `
            <p>Starting from the torque equation, we can solve for the force difference needed:</p>
            <pre>F<sub>1</sub> − F<sub>2</sub> = (J · Δω) / (L · Δt)</pre>
            <p>Each motor contributes equally to hover thrust (HT), plus or minus a correction term <em>c</em> that creates the tilt:</p>
            <pre>F<sub>1</sub> = HT + c &nbsp;&nbsp;&nbsp; F<sub>2</sub> = HT − c</pre>
            <p>Substituting in and simplifying, we get c on its own:</p>
            <pre>c = (J · Δω) / (2 · L · Δt)</pre>
        `;
    }
 
    hoverThrustPhysicsText() {
        return `
            <p>There's one more complication: when the drone is tilted, its motors no longer point straight up. Some of their thrust is wasted pushing the drone sideways instead of lifting it.</p>
            <p>To maintain altitude while tilted, the motors need to work a little <strong>harder</strong> — just enough to compensate for the tilt angle. The steeper the tilt, the more extra thrust is needed.</p>
        `;
    }
 
    hoverThrustMathText() {
        return `
            <p>When the drone is tilted by angle θ, only the vertical component of thrust fights gravity:</p>
            <pre>F<sub>vertical</sub> = F · cos(θ)</pre>
            <p>So hover thrust must be adjusted upward to account for the tilt:</p>
            <pre>HT = (mass × |gravity|) / cos(θ)</pre>
            <p>With HT and c in hand, the final motor thrusts are:</p>
            <pre>T<sub>1</sub> = HT + c &nbsp;&nbsp;&nbsp; T<sub>2</sub> = HT − c</pre>
        `;
    }
 
    hoverThrustCodeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have these variables available:</p>
            <ul>
                <li><code>hover_thrust</code>: the tilt-adjusted baseline thrust needed to stay airborne</li>
                <li><code>c</code>: the correction term calculated from the torque equation</li>
            </ul>
            <p>Write the two thrust values as a comma-separated pair: <code>T1, T2</code>.</p>
        `;
    }

    getAngle() {
        this.desiredAngle = this.positionUpdateCode * (Math.PI/180);
        return true;
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
    }


    initSim() {
        //initialize drone and other things

        this.stagediv.removeChild(this.currentPhaseDiv);

        this.drone.reset(); 
        
        this.lastTime = null; 
        this.last_error = 0;
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

        let hover_thrust = -1 * this.drone.mass * this.drone.gravity;

        let angle_error = this.desiredAngle - this.drone.angle;

        let torque = 1 * angle_error + (2 * (angle_error - this.last_error)) / dt;
        
        let T1 = hover_thrust/(2 * Math.cos(this.drone.angle)) + torque/2;
        let T2 = hover_thrust/(2 * Math.cos(this.drone.angle)) - torque/2;
        let thrustArray = [T1, T2];

        this.drone.update(dt, thrustArray);

        this.last_error = angle_error;

        //console.log("Left Thrust: " + T1.toFixed(4) + "\nRight Thrust: " + T1.toFixed(4) + "\nAngle Error: " + (angle_error * (180/Math.PI)).toFixed(4) + "\nAngular Acceleration: " + angular_acceleration.toFixed(4) + "\nTorque: " + torque.toFixed(4) + "\nCurrent Angle: " + (this.drone.angle * (180/Math.PI)).toFixed(4))
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