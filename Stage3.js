class Stage3 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.gravity = 9.81; // m/s^2
        this.desiredHeight = null;
        this.currentHeight = this.game.canvas.height - this.drone.y;
        this.phase = 0;
        this.oscillationTime = 0;
        this.constant = 0; // Coefficient for error
        this.derivativeConstant = 0; // Coefficient for derivative

        // Event listeners
        document.getElementById('hintButtonStage3').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('submitErrorButton').addEventListener('click', () => this.handleErrorSubmit());
        document.getElementById('submitThrustButton').addEventListener('click', () => this.handleThrustSubmit());
        document.getElementById('submitDerivativeButton').addEventListener('click', () => this.handleDerivativeSubmit());

        this.game.canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
    }

    start() {
        this.drone.y = this.game.canvas.height / 4;
        this.currentHeight = this.game.canvas.height - this.drone.y;

        document.getElementById('info').style.visibility = 'visible';
        document.getElementById('completionMessage').style.visibility = 'hidden';
        document.getElementById('heightInputContainer').style.visibility = 'hidden';
        document.getElementById('hintButtonStage3').style.visibility = 'hidden';
        document.getElementById('thrustInputContainer').style.visibility = 'hidden';

        this.updateInfoText('In this stage, you will control the drone’s altitude. Click on the dotted red line to set the desired altitude, and the drone will adjust its thrust accordingly.');
    }

    handleCanvasClick(event) {
    const rect = this.game.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const droneCenterX = this.drone.x;

    // If the user clicks near the drone's center, set the desired height
    if (Math.abs(x - droneCenterX) < 10) {
        this.desiredHeight = y;
        this.phase = 1;

        document.getElementById('heightInputContainer').style.visibility = 'hidden';
        this.showErrorCalculationPrompt();
    }
}


    updateInfoText(text) {
        document.getElementById('info').style.visibility = 'visible';
        document.getElementById('info').innerHTML = `<p>${text}</p>`;
    }

    showHint() {
        alert('Hint: The drone needs to exert more thrust to go up, and less thrust to go down. Ensure the thrust is balanced to maintain altitude.');
    }

    showError(message) {
        alert(message);
    }

    update(dt) {
    if (this.phase === 3) { // Oscillation phase
        this.oscillationTime += dt;
        this.drone.update(dt);

        if (this.oscillationTime >= 3) {
            this.showOscillationPopup();
        }
    } else if (this.phase === 4) { // Derivative thrust calculation
        this.drone.update(dt);
    }
}

    // Handle thrust submission after error calculation
handleThrustSubmit() {
        const thrustEquationInput = document.getElementById('inputThrust').value.trim();

        // Check if the equation includes 'error' and 'hover_thrust'
        if (!thrustEquationInput.includes('error') || !thrustEquationInput.includes('hover_thrust')) {
            this.showError("The equation must include both 'error' and 'hover_thrust'. Please try again.");
            return;
        }

        // Attempt to validate the equation
        try {
            // Simulate current error and hover_thrust values for validation
            const testError = 10; // Simulated test error value
            const testHoverThrust = this.drone.mass * this.gravity; // Calculate hover thrust for validation
            const testThrust = eval(thrustEquationInput.replace(/error/g, testError).replace(/hover_thrust/g, testHoverThrust));

            // Ensure the equation produces a numeric result
            if (isNaN(testThrust)) {
                throw new Error("Invalid equation result.");
            }

            // If the equation is correct, save it and move to the oscillation phase
            this.proportionalEquation = thrustEquationInput;
            this.phase = 3;  // Move to oscillation phase

            // Provide feedback and hide the thrust input container
            this.updateInfoText("The drone is oscillating. We need a derivative term to stabilize it.");
            document.getElementById('thrustInputContainer').style.visibility = 'hidden';

            // Start the oscillation phase
            this.oscillationTime = 0;
            this.startOscillation();

        } catch (error) {
            this.showError("Invalid thrust equation. Please ensure it is a valid equation and try again.");
        }
    }

    startOscillation() {
    const oscillationDuration = 3; // Oscillate for 3 seconds
    const oscillationInterval = setInterval(() => {
        this.oscillationTime += 0.1; // Increment the oscillation time
        this.updateOscillation(0.016); // Keep the drone oscillating

        // Continue oscillation even after the prompt appears
        if (this.phase === 4) { 
            clearInterval(oscillationInterval);
        }
    }, 100); // Update every 100 milliseconds
}


updateOscillation(dt) {
    if (this.desiredHeight !== null) {
        const error = this.desiredHeight - this.drone.y; // Calculate the error
        const hoverThrust = this.drone.mass * this.gravity; // Calculate hover thrust

        // Evaluate the user-entered thrust equation
        let thrust;
        try {
            thrust = eval(this.proportionalEquation.replace(/error/g, error).replace(/hover_thrust/g, hoverThrust));
        } catch (e) {
            this.showError('There was an error in your thrust equation.');
            return;
        }

        // Damped oscillation calculation
        const dampingFactor = 0.1; // Adjust this value for desired damping
        const dampingThrust = thrust * (1 - dampingFactor); // Apply damping to the thrust

        // Simulate oscillation with damping
        this.drone.vy += (dampingThrust / this.drone.mass - this.gravity) * dt; // Update vertical velocity
        this.drone.y += this.drone.vy * dt; // Update position

        // Draw the current forces acting on the drone
        this.drawForces(thrust, error);
    }
}
    // Validate and handle submission of the derivative equation
    handleDerivativeSubmit() {
    const derivativeEquationInput = document.getElementById('inputDerivative').value.trim();

    // Ensure the equation includes both 'error' and 'derivative(error)'
    if (!derivativeEquationInput.includes('error') || !derivativeEquationInput.includes('derivative(error)')) {
        this.showError("The equation must include both 'error' and 'derivative(error)'. Please try again.");
        return;
    }

    // Attempt to validate the proportional-derivative equation
    try {
        // Simulate current error and velocity (derivative of height)
        const testError = 10;
        const testDerivative = 2; // Simulated test derivative value
        const testHoverThrust = this.drone.mass * this.gravity;

        // Replace placeholders with test values and evaluate the equation
        const testThrust = eval(derivativeEquationInput.replace(/error/g, testError)
            .replace(/derivative\(error\)/g, testDerivative)
            .replace(/hover_thrust/g, testHoverThrust));

        // Ensure the equation produces a numeric result
        if (isNaN(testThrust)) {
            throw new Error("Invalid equation result.");
        }

        // If valid, save the equation and proceed to stabilization
        this.derivativeEquation = derivativeEquationInput;
        this.phase = 4;

        alert("Derivative equation accepted! Now watch how the drone stabilizes.");
        document.getElementById('derivativeInputContainer').style.visibility = 'hidden';

    } catch (error) {
        this.showError("Invalid derivative equation. Please ensure it is a valid equation and try again.");
    }
}


    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();

        this.drawDottedLine(ctx, this.drone.x, 0, this.drone.x, this.game.canvas.height);

        if (this.phase >= 1) {
            ctx.fillStyle = 'red';
            ctx.fillText('X', this.drone.x, this.desiredHeight);
            ctx.fillText('Desired Height', this.drone.x + 10, this.desiredHeight - 10);
            this.drawErrorArrow(ctx);
        }

        if (this.phase === 3 || this.phase === 4) {
            this.drawForces(ctx);
        }

        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`Current Height: ${(this.game.canvas.height - this.drone.y).toFixed(2)}px`, this.drone.x + 50, this.drone.y);
    }

    drawDottedLine(ctx, x1, y1, x2, y2) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawErrorArrow(ctx) {
        const fromX = this.drone.x - 15;
        const fromY = this.desiredHeight;
        const toY = this.drone.y;
        const label = 'Error';

        this.drawArrow(ctx, fromX, fromY, fromX, toY, label);
    }

    drawForces(ctx, thrust, error) {
        const arrowLength = 50;
        const arrowX = this.drone.x;
        const arrowY = this.drone.y;

        const thrustArrowLength = arrowLength + (error / this.gravity) * 10;
        const upwardArrowLength = thrustArrowLength > arrowLength ? thrustArrowLength : arrowLength - 20;
        const downwardArrowLength = arrowLength;

        this.drawArrow(this.game.ctx, arrowX, arrowY, arrowX, arrowY - upwardArrowLength, 'Thrust');
        this.drawArrow(this.game.ctx, arrowX, arrowY, arrowX, arrowY + downwardArrowLength, 'Mass * Gravity');
    }

    drawArrow(ctx, fromX, fromY, toX, toY, label) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();

        if (label) {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(label, fromX + 10, fromY + (toY - fromY) / 2);
        }
    }

    showErrorCalculationPrompt() {
        document.getElementById('heightInputContainer').style.visibility = 'hidden';
        document.getElementById('errorInputContainer').style.visibility = 'visible';
        this.updateInfoText('The difference between the current height and desired height is the error. Write an equation for error.');
    }

    handleErrorSubmit() {
        const userErrorInput = document.getElementById('inputError').value.trim();
        const expression = userErrorInput.replace(/desired_height/g, this.desiredHeight.toFixed(2))
                                         .replace(/current_height/g, this.drone.y.toFixed(2));

        let calculatedError;
        try {
            calculatedError = eval(expression);
        } catch (e) {
            this.showError('There was an error in your calculation. Please try again.');
            return;
        }

        const expectedError = this.desiredHeight - this.drone.y;

        if (Math.abs(calculatedError - expectedError) < 0.01) {
            alert('Correct! You calculated the error accurately.');
            document.getElementById('errorInputContainer').style.visibility = 'hidden';
            this.updateInfoText('Now, use the error to calculate the thrust.');
            this.showThrustInputPrompt();
            this.phase = 2;
        } else {
            this.showError('Incorrect. Please try again.');
        }
    }

    showThrustInputPrompt() {
        document.getElementById('thrustInputContainer').style.visibility = 'visible';
        this.updateInfoText('Set the thrust using: (any number) * error + hover_thrust. Enter your thrust equation below.');
    }

    resetDroneForDerivative() {
    this.drone.y = this.game.canvas.height / 4;
    this.drone.vy = 0;

    // Update the text to prompt for the derivative equation
    this.updateInfoText("To stabilize the drone, we need to add a derivative term. Enter a new thrust equation with a derivative term (e.g., Kp * error + Kd * derivative(error) + hover_thrust).");

    // Show the derivative input box
    document.getElementById('derivativeInputContainer').style.visibility = 'visible';
}

    handleDerivativeSubmit() {
    const derivativeEquationInput = document.getElementById('inputDerivative').value.trim();

    // Ensure the equation includes both 'error' and 'derivative(error)'
    if (!derivativeEquationInput.includes('error') || !derivativeEquationInput.includes('derivative(error)')) {
        this.showError("The equation must include both 'error' and 'derivative(error)'. Please try again.");
        return;
    }

    // Attempt to validate the proportional-derivative equation
    try {
        // Simulate current error and velocity (derivative of height)
        const testError = 10;
        const testDerivative = 2; // Simulated test derivative value
        const testHoverThrust = this.drone.mass * this.gravity;

        // Replace placeholders with test values and evaluate the equation
        const testThrust = eval(derivativeEquationInput.replace(/error/g, testError)
            .replace(/derivative\(error\)/g, testDerivative)
            .replace(/hover_thrust/g, testHoverThrust));

        // Ensure the equation produces a numeric result
        if (isNaN(testThrust)) {
            throw new Error("Invalid equation result.");
        }

        // If valid, save the equation and proceed to stabilization
        this.derivativeEquation = derivativeEquationInput;
        this.phase = 4;

        alert("Derivative equation accepted! Now watch the drone stabilize.");
        document.getElementById('derivativeInputContainer').style.visibility = 'hidden';

    } catch (error) {
        this.showError("Invalid derivative equation. Please ensure it is a valid equation and try again.");
    }
}

    showOscillationPopup() {
    this.phase = 4; // Stop oscillation and move to derivative phase
    alert('The drone is oscillating because it still has velocity. Let’s stabilize it by adding a derivative term.');
    this.resetDroneForDerivative();
}

    showCompletionPopup() {
        document.getElementById('completionMessage').style.visibility = 'visible';
        document.getElementById('completionMessage').innerHTML = `
            <p>Stage 3 Complete</p>
            <button id="stage4Button">Stage 4 - Next Challenge</button>
        `;

        document.getElementById('stage4Button').addEventListener('click', () => {
            alert('Stage 4 will be loaded here.');
        });
    }
}

// Assign Stage3 to the global window object
window.Stage3 = Stage3;
