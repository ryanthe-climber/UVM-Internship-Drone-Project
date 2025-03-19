class Stage2 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.gravity = 9.81; // m/s^2
        this.hoverThrust = null;
        this.phase = 0; // To track the interactive phases

        // Event listener for the hover thrust submit button
        document.getElementById('submitHoverThrustButton').addEventListener('click', () => {
            this.handleHoverThrustSubmit();
        });

        // Event listener for the "Start Hover Thrust" button
        document.getElementById('startHoverThrustButton').addEventListener('click', () => {
            this.showForces();  // Show forces before user input
            this.promptHoverThrust();
        });

        // Event listener for the hint button
        document.getElementById('hintButtonStage2').addEventListener('click', () => {
            this.showHint();
        });
    }

    start() {
        // Set the drone to start in the sky
        this.drone.y = this.game.canvas.height / 4;

        // Initially hide all interactive elements
        document.getElementById('stage2Button').style.visibility = 'hidden';
        document.getElementById('info').style.visibility = 'hidden';
        document.getElementById('completionMessage').style.visibility = 'hidden';
        document.getElementById('hoverThrustContainer').style.visibility = 'hidden';
        document.getElementById('hintButtonStage2').style.visibility = 'hidden';
        document.getElementById('startHoverThrustButton').style.visibility = 'visible';

        // Start the stage
        this.updateInfoText('In this stage, we will be programming hover thrust. Hover thrust is how much force (in Newtons) must be applied to keep the drone hovering in the air without falling or moving upwards.  Click “Start Hover Thrust” to continue.');
    }

    updateInfoText(text) {
        document.getElementById('info').style.visibility = 'visible';
        document.getElementById('info').innerHTML = `<p>${text}</p>`;
    }

    showForces() {
        this.updateInfoText('The top arrow represents the hover thrust, and the bottom arrow represents the force of gravity (mass * gravity). These quantities must be equal for the net force to be zero, which means the net acceleration is zero, and the drone hovers.');
        this.phase = 1; // Set phase to draw the arrows
    }

    promptHoverThrust() {
        // Show the hover thrust input area
        this.updateInfoText('Given the variables mass and gravity, write the equation that represents the hover_thrust:	');
        document.getElementById('hoverThrustContainer').style.visibility = 'visible';
        document.getElementById('startHoverThrustButton').style.visibility = 'hidden'; // Hide the button once clicked
    }

    handleHoverThrustSubmit() {
        const userInput = document.getElementById('hoverThrustCode').value.trim();

        if (this.validateUserCode(userInput)) {
            this.hoverThrust = this.drone.mass * this.gravity;
            document.getElementById('hoverThrustContainer').style.visibility = 'hidden';
            this.showCompletionPopup();
        } else {
            this.showError('This is incorrect, please try again.');
            document.getElementById('hintButtonStage2').style.visibility = 'visible'; // Show hint button after an incorrect attempt
        }
    }

    validateUserCode(code) {
    const pattern1 = /\s*mass\s*\*\s*gravity/;
    const pattern2 = /\s*gravity\s*\*\s*mass/;
    return pattern1.test(code) || pattern2.test(code);
}

    

    showHint() {
        alert('Hint: The force that the drone exerts must be equal in magnitude to the force pulling downwards to have a net force of 0. Therefore, hover_thrust - mass * gravity = 0.');
    }

    showError(message) {
        alert(message); // Show an alert with the error message
    }

    showCompletionPopup() {
        const completionMessage = document.getElementById('completionMessage');
        completionMessage.style.visibility = 'visible';
        completionMessage.innerHTML = `
            <p>Stage 2 Complete</p>
            <button id="stage3Button">Stage 3 - Altitude Control</button>
        `;

        // Add event listener for the "Stage 3" button
        document.getElementById('stage3Button').addEventListener('click', () => {
            this.endStage2();
        });
    }
    
    endStage2() {
        // Hide elements specific to Stage 2
        document.getElementById('completionMessage').style.visibility = 'hidden';
        document.getElementById('hoverThrustContainer').style.visibility = 'hidden';
        document.getElementById('hintButtonStage2').style.visibility = 'hidden';
        document.getElementById('info').style.visibility = 'hidden';

        // Transition to Stage 3
        this.game.startStage(Stage3);
    }

    update(dt) {
        // No dynamic update needed for this stage
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
        const arrowLength = 50;
        const arrowX = this.drone.x;
        const arrowY = this.drone.y;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        // Draw the hover thrust arrow (upward)
        this.drawArrow(ctx, arrowX, arrowY, arrowX, arrowY - arrowLength, 'hover_thrust');

        // Draw the gravity force arrow (downward)
        this.drawArrow(ctx, arrowX, arrowY, arrowX, arrowY + arrowLength, 'Mass * Gravity');
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

    cleanup() {
        // Optional: Cleanup logic for Stage 2 if needed
    }
}

// Assign Stage2 to the global window object
window.Stage2 = Stage2;
