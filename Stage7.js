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

        this.managePhases();
    }

    managePhases() {
        switch(this.phase) {
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 7! Here you will learn how the drone moves by tilting and controlling the forces of the two motors.', "Start");
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

            default:this.game.endStage("Stage 7 Completed", "Stage 8 - FILL IN HERE", Stage8, this);
                    this.stageEnded = true;
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Angle Error Teaching Step*/[this.game.createPhaseTeaching, this.angleErrorTeachText(), () => true, null, null],
                        /*Angle Error Input Step*/
                                    [   
                                        this.game.input,
                                        ["angle error =", "Enter Error Equation", "Submit"],
                                        () => true, 
                                        this.game.hint, 
                                        "Hint: desired_angle - current_angle"
                                    ],
                    ]);
    }

    phase2() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Angular Velocity Teaching*/[this.game.createPhaseTeaching, this.anglularVelocityTeachText(), () => true, null, null],
                        /*angular velocity input step*/
                                    [   
                                        this.game.input,
                                        ["Angular Velocity =", "Angular Velocity", "Submit"],
                                        () => true,  //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: "
                                    ],
                        /*Angular Acceleration Teaching*/[this.game.createPhaseTeaching, this.anglularAccellerationTeachText(), () => true, null, null],
                        /*angular acceleration input step*/
                                    [   
                                        this.game.input,
                                        ["Angular Acceleration =", "Angular Acceleration", "Submit"],
                                        () => true, //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: "
                                    ]
                    ]);
    }

    phase3() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Torque Teaching*/[this.game.createPhaseTeaching, this.torqueTeachText(), () => true, null, null],
                        /*Torque input step*/
                                    [   
                                        this.game.input,
                                        ["Set both sides equal: ", "Torque", "Submit"],
                                        () => true,  //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: "
                                    ]
                    ]);
    }

    phase4() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
                        /*Needed thrust teaching*/[this.game.createPhaseTeaching, this.neededThrustTeachText(), () => true, null, null],
                        /*Hover thrust teaching*/[this.game.createPhaseTeaching, this.hoverThrustTeachText(), () => true, null, null],
                        /*Hover thrust input step*/
                                    [   
                                        this.game.input,
                                        ["Thrust: ", "T1, T2", "Submit"],
                                        () => true, //FIXME - make this so that it actually checks the input
                                        this.game.hint, 
                                        "Hint: "
                                    ]
                    ]);
    }

    phase5() {
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