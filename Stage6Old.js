class Stage7 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.drone.y = 2.5;
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
            case 0: game.stageExplainationDOM(this, this.stagediv, 'Welcome to Stage 7! Here you will learn how the drone moves by tilting and controlling the forces of the two motors.', "Start");
                    break;
            case 1: this.phase1();
                    break;
            case 2: this.phase2();
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
                        /*Desired Angle Teaching Step*/[this.game.createPhaseTeaching, this.desiredAngleTeachText(), () => true, null, null],
                        /*Desired Angle Input Step*/
                                    [   
                                        this.game.input,
                                        ["desired angle (θ) = ", "Enter θ Equation", "Submit"],
                                        this.angleErrorSubmit.bind(this),
                                        this.game.hint, 
                                        "Hint: tan^-1((cursor_x - drone_x) / (cursor_y - drone_y))"
                                    ],
                        /*Angle Error Teaching Step*/[this.game.createPhaseTeaching, this.angleErrorTeachText(), () => true, null, null],
                        /*Desired Angle Input Step*/
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
                        /*Needed thrust teaching*/[this.game.createPhaseTeaching, this.neededThrustTeachText(), () => true, null, null],
                        /*thrust input step*/
                                    [   
                                        this.game.input,
                                        ["Enter thrusts: ", "T1, T2", "Submit"],
                                        () => true, 
                                        this.game.hint, 
                                        "Hint: "
                                    ]
                    ]);
    }


    angleErrorSubmit() {
        const usercode = this.positionUpdateCode;

        // Normalize variable names for user flexibility
        let normalizedInput = usercode
            .replace(/\bcursor[ _]?x\b/ig, 'cursor_x')
            .replace(/\bcursor[ _]?y\b/ig, 'cursor_y')
            .replace(/\bdrone[ _]?x\b/ig, 'drone_x')
            .replace(/\bdrone[ _]?y\b/ig, 'drone_y')
            // Replace tan^-1 with Math.atan
            .replace(/tan\s*\^\s*-?1\s*\(/ig, 'Math.atan(');

        // --- Check that the required elements are present ---
        const hasAtan = /\batan\b/.test(normalizedInput);
        const hasCursorX = /\bcursor_x\b/.test(normalizedInput);
        const hasCursorY = /\bcursor_y\b/.test(normalizedInput);
        const hasDroneX = /\bdrone_x\b/.test(normalizedInput);
        const hasDroneY = /\bdrone_y\b/.test(normalizedInput);

        if (!hasAtan || !hasCursorX || !hasDroneX || !hasCursorY || !hasDroneY) {
            alert("Incorrect. Please include 'tan^-1' and the variables 'cursor_x', 'drone_x', 'cursor_y', and 'drone_y' in your equation.");
            return false;
        }

        // --- Try to compile the equation into a function ---
        try {
            this.userAngleFunction = new Function('cursor_x', 'cursor_y', 'drone_x', 'drone_y', 'return (' + normalizedInput + ');');
        } catch (e) {
            alert("Please input a valid equation for θ (angle).");
            this.userAngleFunction = null;
            return false;
        }

        // --- Test the function with sample values ---
        const testVals = { cursor_x: 5, cursor_y: 5, drone_x: 2, drone_y: 2 };
        let testResult;
        try {
            testResult = this.userAngleFunction(testVals.cursor_x, testVals.cursor_y, testVals.drone_x, testVals.drone_y);
            if (isNaN(testResult)) throw new Error("Result is not a number");
        } catch (e) {
            alert("Invalid equation. Please ensure it correctly uses tan^-1 and the coordinate differences.");
            this.userAngleFunction = null;
            return false;
        }

        // --- Passed all checks ---
        return true;

    }

    rotationThrustSubmit() {
        const usercode = this.positionUpdateCode;

        // Normalize variable names
        let normalizedInput = usercode
            .replace(/\bhover[ _]?thrust\b/ig, 'hover_thrust')
            .replace(/\berror\b/ig, 'error')
            .replace(/\bx\b/ig, 'x'); // ensure x is recognized

        // Check required variables
        if (!/\bhover_thrust\b/.test(normalizedInput) || !/\bx\b/.test(normalizedInput)) {
            alert("Please include 'hover_thrust' and 'x' in your equation.");
            return false;
        }

        // Compile the function
        try {
            this.userThrustFunction = new Function('hover_thrust', 'x', `
                const T1 = hover_thrust/2 + x/2;
                const T2 = hover_thrust/2 - x/2;
                return [T1, T2];
            `);
        } catch(e) {
            alert("Failed to compile thrust function.");
            this.userThrustFunction = null;
            return false;
        }

        // Test with sample values
        const testHover = this.drone.mass * this.drone.gravity;
        const testX = 2;
        let testResult;
        try {
            testResult = this.userThrustFunction(testHover, testX);
            if (!Array.isArray(testResult) || testResult.length !== 2) throw new Error("Result must be [T1, T2]");
            if (testResult.some(val => isNaN(val))) throw new Error("T1 or T2 is not a number");
        } catch(e) {
            alert("Invalid thrust calculation. Make sure it returns [T1, T2] using hover_thrust and x.");
            this.userThrustFunction = null;
            return false;
        }

        return true;
    }


    desiredAngleTeachText() {
        return `<p>For now, the desired angle will be the angle between a vertical line on the drone and your cursor.</p>
                <p>Let's say that the cursor's coordinates are (x<sub>c</sub>, y<sub>c</sub>) and the drone's coordinates are (x<sub>d</sub>, y<sub>d</sub>). We can calculate the angle between them, θ, with:</p>
                <p>θ = tan<sup>-1</sup>[(x<sub>c</sub> - x<sub>d</sub>) - (y<sub>c</sub> - y<sub>d</sub>)]</p>
                <p>tan^-1((cursor_x - drone_x) / (cursor_y - drone_y))</p>`
    }

    angleErrorTeachText() {
        return `<p>Once we know the desired angle, we can then find the angle error by simply subtracting the current angle from the desired angle.</p>
                <p>desired_angle - current_angle</p>`
    }

    anglularVelocityTeachText() {
        return `<p>Angular velocity is how quickly the drone should rotate to fix its angle error in the desired time. It’s just total angle change divided by the time allowed for that change</p>
                <p>Angular Velocity = Angle Error / Correction Time</p>`
    }

    neededThrustTeachText() {
        return `<p>Once we know the angular velocity, we calculate the thrust difference needed to create this rotation. This depends on the drone’s rotational mass, and we compute it with the formula x = rotational_mass * angular_velocity / dt, where dt is the simulation’s time step. The value x represents the extra thrust required to generate torque for tilting.</p>
                <p>Finally, we split the thrust between the two motors. The total hover thrust is divided evenly to keep the drone in the air, and then we add half of x to the first motor and subtract half of x from the second motor. This creates a difference in thrust that causes the drone to tilt toward the desired angle while still maintaining lift.</p>`
    }

    showInstructions() {
        const infoDiv = document.getElementById('info');
        infoDiv.innerHTML = this.startMessage + "<br><br>" + 
            "The drone has two motors. By changing the thrust on each motor individually, we can tilt the drone and move it in different directions.<br><br>" +
            "The forces generated by the motors can be broken down into two components:<br>" +
            "<strong>1. Vertical Component</strong> (F_y): Helps the drone hover.<br>" +
            "<strong>2. Horizontal Component</strong> (F_x): Controls the drone's movement left and right.<br><br>" +
            "Next, we'll visualize how these forces break down using a triangle!";
        
        document.getElementById('startButton').style.visibility = 'hidden';
        document.getElementById('nextStepButton').style.visibility = 'visible';
        document.getElementById('nextStepButton').innerText = 'Show Triangle';
        document.getElementById('nextStepButton').onclick = () => this.showForceBreakdown();
    }

    showForceBreakdown() {
        // Clear the nextStepButton since we don't need it anymore
        document.getElementById('nextStepButton').style.visibility = 'hidden';

        // Draw the triangle on the canvas
        this.drawTriangle();

        // After showing the triangle, display the motor control sliders
        this.displaySliders();
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












    






    checkInput() {
        let code = this.positionUpdateCode;

        try {
            this.thrustFunction = new Function("thiss", "dt", code);
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
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
        if(this.phase == 1) {
            this.drawTriangle(this.game.ctx);
        }
    }

    displayVelocityAndPosition() {
        //Display all stats of drone including position, crashed, velocity, battery, thrust levels
        this.displayDiv.innerHTML = `
            <p>Vertical Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Horizontal Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Position: (${this.drone.x.toFixed(2)}, ${this.drone.y.toFixed(2)})</p>
            <p>Left Motor: ${this.drone.MotorL.toFixed(2)}</p>
            <p>Right Motor: ${this.drone.MotorR.toFixed(2)}</p>
        `;
    }

    initSim() {
        //initialize drone and other things
        let stageDiv = this.stagediv;

        stageDiv.removeChild(this.currentPhaseDiv);

        this.displayDiv = document.createElement("div");
        this.displayDiv.setAttribute("id", "displayDiv");
        this.displayDiv.setAttribute("class", "displayDiv textDiv");

        stageDiv.appendChild(this.displayDiv); 

        this.drone.reset(); 
        
        this.lastTime = null; 
        this.lastError = 2;
        this.desired_height = 5;
        this.desired_angle = 360;
        this.lastAngleError = 0;
    }

    stepSim(time) {
        //do one step of the simulation
        if(this.lastTime == null) {
            this.lastTime = time;
        }
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
    
        time = dt; 
        
        if(dt == 0) {
            dt = 0.016;
        }
        //let hover_thrust = this.drone.mass * this.drone.gravity;
        
        let thrustArray = this.thrustFunction(this, dt);

        this.drone.update(dt, thrustArray);

        this.displayVelocityAndPosition();
        //console.log(`Height: ${this.drone.y.toFixed(5)}\tVelocity: ${this.drone.vy.toFixed(5)}\tDt: ${dt.toFixed(5)}`);

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
