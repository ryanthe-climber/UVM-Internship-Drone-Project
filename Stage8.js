class Stage8 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.positionUpdateCode = '';
        this.phase = 0;
        this.step = 0;

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "stage8div");
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
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 8! Here you will learn to combine vertical and horizontal movement to follow the cursor.', "Start");
                    break;
            case 1: this.phase1();
                    break;

            default:this.game.endStage("Stage 8 Completed", "Stage 9 - FILL IN HERE", Stage8, this);
                    this.stageEnded = true;
                    break;
        }
    }

    phase1() {
        this.currentPhaseDiv = this.game.createPhaseDom2(this,
                    this.stagediv,
                    [
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



    desiredAngleTeachText() {
        return `<p>For now, the desired angle will be the angle between a vertical line on the drone and your cursor.</p>
                <p>Let's say that the cursor's coordinates are (x<sub>c</sub>, y<sub>c</sub>) and the drone's coordinates are (x<sub>d</sub>, y<sub>d</sub>). We can calculate the angle between them, θ, with:</p>
                <p>θ = tan<sup>-1</sup>[(x<sub>c</sub> - x<sub>d</sub>) - (y<sub>c</sub> - y<sub>d</sub>)]</p>
                <p>tan^-1((cursor_x - drone_x) / (cursor_y - drone_y))</p>`
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
        this.last_angle_error = 0;
        this.last_error = 0;
        this.last_dx = 0;
        this.last_temp = 0;
        this.desiredAngle = 0;
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

        
        this.desired_height = (this.game.canvas.height / this.game.meter) - (this.mouseY / this.game.meter);

        let dx = (this.mouseX / this.game.meter) - this.drone.x;

        let dx_dot = (dx - this.last_dx) / dt;
        
        this.desiredAngle = 1 * dx + 2 * dx_dot;

        

        const maxTilt = Math.PI / 5;
        this.desiredAngle = Math.min(Math.max(this.desiredAngle, -maxTilt), maxTilt);

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