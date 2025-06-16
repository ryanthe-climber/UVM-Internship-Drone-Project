class Stage1 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.positionUpdateCode = '';
        this.hintShown = false;
        this.codeSubmitted = false; // Flag to indicate if code has been submitted

        // Add event listener for the submit button
        document.getElementById('submitCodeButton').addEventListener('click', () => {
            this.handleSubmit();
        });

        // Add event listener for the hint button
        document.getElementById('hintButton').addEventListener('click', () => {
            alert('Hint: Think about the relationship between position and velocity. Use the variables previous_height, velocity, and time.');
        });
        
        document.getElementById('stage2Button').addEventListener('click', () => {
            this.game.startStage(Stage2);
        });
    }

    start() {
        // Initially hide info and input area
        document.getElementById('info').style.visibility = 'hidden';
        document.getElementById('inputContainer').style.visibility = 'hidden';
        document.getElementById('completionMessage').style.visibility = 'hidden'; // Hide completion message initially
    }

    startMission() {
        // Show info and input area when mission starts
        this.drone.startMission();
        const info = document.getElementById('info');
        info.style.visibility = 'visible';
        info.innerHTML = this.getInitialInfoText();
        document.getElementById('inputContainer').style.visibility = 'visible';
    }

    getInitialInfoText() {
        return `
            <p>First, let’s first get started with understanding how the drone moves. Right now the drone is in free fall. That means the only force acting on the drone is gravity.</p>
            <p>Acceleration is the change in velocity over time, also known as the derivative (Dv/Dt). So the equation for velocity is:</p>
            <pre>velocity = previous_velocity + acceleration * time</pre>
            <p>Similarly, velocity is the change in position. Using the variables current_height and previous_height, in addition to the ones above, enter the equation for current_height.</p>
        `;
    }

    handleSubmit() {
        const userInput = document.getElementById('inputCode').value.trim();
        if (validateUserCode(userInput)) {
            this.positionUpdateCode = userInput;
            this.codeSubmitted = true;
            document.getElementById('inputContainer').style.visibility = 'hidden';
            document.getElementById('hintButton').style.visibility = 'hidden';
            document.getElementById('errorMessage').style.visibility = 'hidden';
        } else {
            this.showError('Equation does not match reality. Please try again.');
            if (!this.hintShown) {
                document.getElementById('hintButton').style.visibility = 'visible'; // Show hint button
                this.hintShown = true;
            }
        }
    }

    update(dt) {
        // Update logic for Stage 1
        if (this.codeSubmitted) {
            this.updatePosition(dt);
            this.drone.update(dt);
            this.displayVelocityAndPosition();
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();
        this.game.drawDrone();
    }

    updatePosition(dt) {
        try {
            const previous_height = this.drone.y;
            const velocity = this.drone.vy;
            const time = dt;

            // Validate and execute user code
            if (validateUserCode(this.positionUpdateCode)) {
                const position = eval(this.positionUpdateCode.replace('previous_height', previous_height).replace('velocity', velocity).replace('time', time));
                this.drone.y = position; // Use 'position' instead of 'height'

                // Validate the updated position
                if (this.drone.y >= getMountainHeightAt(this.drone.x, this.game)) { // Pass this.game as an argument
                            this.drone.y = getMountainHeightAt(this.drone.x, this.game);
                    this.drone.vx = 0;
                    this.drone.vy = 0;
                    this.drone.crashed = true;
                    document.getElementById('completionMessage').style.visibility = 'visible'; // Show completion message
                    document.getElementById('stage2Button').style.visibility = 'visible'; // Show Stage 2 button
                } else if (this.drone.y < 0) {
                    throw new Error("Position is below ground level, check your equation.");
                }
            } else {
                throw new Error("Equation does not match reality. Please try again.");
            }
        } catch (error) {
            console.error('Error in user code:', error);
            this.showError(error.message);
        }
    }


    displayVelocityAndPosition() {
        const info = document.getElementById('info');
        info.innerHTML = `
            <p>Velocity: ${this.drone.vy.toFixed(2)} m/s</p>
            <p>Position: (${this.drone.x.toFixed(2)}, ${this.drone.y.toFixed(2)})</p>
        `;
    }

    showError(message) {
        const errorMessageElement = document.getElementById('errorMessage');
        errorMessageElement.innerHTML = `<p>${message}</p>`;
        errorMessageElement.style.visibility = 'visible';

        setTimeout(() => {
            errorMessageElement.style.visibility = 'hidden';
            document.getElementById('inputContainer').style.visibility = 'visible';
            document.getElementById('hintButton').style.visibility = 'visible';
        }, 2000); // Hide error message after 2 seconds
    }

    cleanup() {
        // Optional: Cleanup logic for Stage 1 if needed
    }
}

function validateUserCode(code) {
    // Basic validation to check if the code follows the expected pattern
    const expectedPattern = /previous_height\s*\+\s*velocity\s*\*\s*time/;
    return expectedPattern.test(code);
}

function getMountainHeightAt(x) {
    return this.game.canvas.height - 50; // Use window.game to reference the global game object
}

// Assign Stage1 to the global window object
window.Stage1 = Stage1;
