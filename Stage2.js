class Stage2 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.drone.reset();
        this.hoverThrust = null;
        this.phase = 0; // To track the interactive phases
        this.step = 0;
        this.positionUpdateCode = '';

        this.stagediv = document.createElement("div");
        this.stagediv.setAttribute("id", "Stage2div");
        this.stagediv.setAttribute("class", "stageDiv");
        this.gameContent = document.getElementById("gameContent");
        gameContent.appendChild(this.stagediv);
        this.managePhases();
    }

    start() {
        return;
    }

    managePhases() {
        switch(this.phase) {
             case 0: game.stageExplainationDOM(
                    this, 
                    this.stagediv, 
                    "In this stage, we will program hover thrust — the force needed to keep the drone perfectly still in the air.", 
                    "Start");
                    break;

            case 1: this.phase1();
                    break;

            default:this.game.endStage("Stage 2 Completed", "Stage 3 - Altitude Control", Stage3, this);
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

                        /*Input Step*/
                        [   
                            this.game.input,
                            ["hover_thrust = ", "Enter hover thrust equation", "Submit"],
                            this.validateUserCode.bind(this), 
                            this.game.hint, 
                            "Hint: The upward force must exactly cancel gravity. hover_thrust - mass * gravity = 0, so hover_thrust = ?"
                        ]
                    ]);
    }

    physicsText() {
        return `
            <p>In Stage 1, the drone's motors were off, so gravity pulled it straight down. Now we want to keep the drone perfectly still in the air.</p>
            <p>For the drone to hover, the upward push from the motors must exactly cancel the downward pull of gravity.</p>
            <p>The two arrows on screen represent those two forces. Notice they point in opposite directions. We need them to be <strong>equal in size</strong>.</p>
        `;
    }

    mathText() {
        return `
            <p>Newton's second law says: <strong>F = m × a</strong>. When the drone hovers, acceleration is zero, so net force must also be zero.</p>
            <p>The two forces acting on the drone are thrust (upward) and gravity (downward):</p>
            <pre>hover_thrust - mass × gravity = 0</pre>
            <p>Rearranging to solve for hover_thrust:</p>
            <pre>hover_thrust = mass × gravity</pre>
            <p>Note: in this simulation, gravity is already stored as a negative number (since it pulls downward), so the math takes care of the sign for you.</p>
        `;
    }

    codeBridgeText() {
        return `
            <h3>Turning Math into Code</h3>
            <p>You have two variables available:</p>
            <ul>
                <li><code>mass</code>: the drone's mass in kilograms</li>
                <li><code>gravity</code>: the gravitational acceleration on Mars (negative, since it points downward)</li>
            </ul>
            <p>Write the right hand side of the hover thrust equation using those variables.</p>
        `;
    }

    validateUserCode() {
        let code = this.positionUpdateCode;
        const pattern1 = /\s*mass\s*\*\s*gravity/i;
        const pattern2 = /\s*gravity\s*\*\s*mass/i;
        let correct = pattern1.test(code) || pattern2.test(code);

        if(correct) {
            return true;
        } else {
            this.wrongAnswer();
            return false;
        }
    }

    wrongAnswer() {
        alert('This is incorrect, please try again.');
    }

    nextPhase() {
        this.phase++;
        this.managePhases();
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();

        if (this.phase >= 1) {
            this.drawForces(ctx);  // Ensure arrows are drawn during the correct phase
        }
    }

    drawForces(ctx) {
        const arrowLength = 1;
        const arrowX = this.drone.x;
        const arrowY = this.drone.y + 0.325;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;


        // Draw the hover thrust arrow (upward)
        this.drawArrow(ctx, arrowX * this.game.meter, this.game.canvas.height - arrowY * this.game.meter, arrowX * this.game.meter, this.game.canvas.height - (arrowY + arrowLength) * this.game.meter , 'hover_thrust');

        this.drawArrow(ctx, arrowX * this.game.meter, this.game.canvas.height - arrowY * this.game.meter, arrowX * this.game.meter, this.game.canvas.height - (arrowY - arrowLength) * this.game.meter , 'Mass * Gravity');
        // Draw the gravity force arrow (downward)
    }

    drawArrow(ctx, fromX, fromY, toX, toY, label) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw the arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();

        // Draw the label
        if (label) {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(label, fromX + 10, fromY + (toY - fromY) / 2);
        }
    }
}

// Assign Stage2 to the global window object
window.Stage2 = Stage2;
