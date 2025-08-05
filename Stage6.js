class Stage6 {
    constructor(game) {
        this.game = game;
        this.setHeight = 150;  // Default set height if not chosen
        this.currentHeight = 0;
        this.landingSpeed = 0; // Speed of descent based on user input (height = set_height - time)
        this.isLanding = false; // Track whether the drone is landing
        this.time = 0; // Track time for descent
        this.dashedLineY = this.game.canvas.height - 50; // Default dashed line near the bottom
        this.isHeightSet = false;
        this.droneImage = new Image();  // Image for the drone
        this.droneImage.src = 'pics/drone.png';  // Path to the drone image
        document.getElementById('startButton').style.visibility = 'hidden';
        document.getElementById('info').style.visibility = 'hidden';
        this.initUI();
    }

    initUI() {
        const container = document.getElementById('landingStageContainer');
        container.style.visibility = 'visible';
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '10px';
        container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        container.style.padding = '15px';
        container.style.borderRadius = '8px';
        container.style.width = '300px';

        const titleText = document.createElement('div');
        titleText.innerText = "6 - Landing";
        titleText.style.color = 'black';
        titleText.style.fontSize = '20px';
        titleText.style.fontWeight = 'bold';
        titleText.style.marginBottom = '10px';
        container.appendChild(titleText);

        const instructionsText = document.createElement('div');
        instructionsText.innerText = "Move your mouse to set the initial height (click in the bottom quarter of the screen). The drone will use height control to reach the set height. Then, program the descent with the equation height = set_height - time.";
        instructionsText.style.color = 'grey';
        instructionsText.style.fontSize = '16px';
        instructionsText.style.marginBottom = '20px';
        container.appendChild(instructionsText);

        // Input for y = -t (user programs the descent)
        const programLabel = document.createElement('div');
        programLabel.innerText = "Program descent (height = set_height - time):";
        programLabel.style.marginTop = '20px';
        container.appendChild(programLabel);

        this.descentInput = document.createElement('input');
        this.descentInput.type = 'text';
        this.descentInput.placeholder = "Enter descent equation";
        container.appendChild(this.descentInput);
        container.appendChild(document.createElement('br'));

        const submitDescentButton = document.createElement('button');
        submitDescentButton.innerText = "Submit Descent Program";
        submitDescentButton.onclick = () => this.startLanding();
        container.appendChild(submitDescentButton);

        // Message container for feedback
        this.messageContainer = document.createElement('div');
        this.messageContainer.style.marginTop = '20px';
        this.messageContainer.style.color = 'red';
        container.appendChild(this.messageContainer);

        // Set up the mouse move listener for height selection
        this.game.canvas.addEventListener('mousemove', (e) => this.updateDashedLine(e));
        this.game.canvas.addEventListener('click', (e) => this.setDroneHeight(e));
    }

    updateDashedLine(e) {
        // Update the Y position of the dashed line based on mouse movement
        const rect = this.game.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;

        // Limit the dashed line to the bottom quarter of the screen
        if (mouseY > this.game.canvas.height * 0.75) {
            this.dashedLineY = mouseY;
        }
    }

    setDroneHeight(e) {
        // Set the initial height based on the clicked Y position
        const rect = this.game.canvas.getBoundingClientRect();
        const clickY = e.clientY - rect.top;

        // Limit the height setting to the bottom quarter of the screen
        if (clickY > this.game.canvas.height * 0.75) {
            this.setHeight = this.game.canvas.height - clickY;
            this.currentHeight = this.setHeight;
            this.isHeightSet = true;
            this.messageContainer.innerText = `Drone set to height: ${this.setHeight}px. Now program the descent.`;
        } else {
            this.messageContainer.innerText = "Please click in the bottom quarter of the screen.";
        }
    }

    startLanding() {
        const userInput = this.descentInput.value;

        // Check if the input matches the expected descent equation height = set_height - time
        if (userInput !== "height = set_height - time") {
            this.messageContainer.innerText = "Incorrect equation. Please program height = set_height - time.";
            return;
        }

        this.messageContainer.innerText = "Landing initiated. Drone will descend using height = set_height - time.";
        this.isLanding = true;
        this.time = 0;  // Start descent
    }

    update(dt) {
        if (this.isLanding && this.currentHeight > 0) {
            // height = set_height - time, so height decreases consistently over time (t)
            this.time += dt / 1000;  // Convert time to seconds
            this.currentHeight = this.setHeight - this.time;

            // Simulate the landing when height reaches 0
            if (this.currentHeight <= 0) {
                this.currentHeight = 0;
                this.isLanding = false;
                this.messageContainer.innerText = "Drone has landed successfully!";
            }
        }
    }

    draw(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();

        // Draw the dashed red line following the mouse
        if (!this.isHeightSet) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(0, this.dashedLineY);
            ctx.lineTo(this.game.canvas.width, this.dashedLineY);
            ctx.stroke();
            ctx.setLineDash([]);  // Reset line dash to solid
        }

        // Draw the drone at the current height (after the height is set)
        if (this.isHeightSet) {
            ctx.drawImage(this.droneImage, this.game.canvas.width / 2 - 30, this.game.canvas.height - this.currentHeight - 30, 60, 60);
        }
    }

    cleanup() {
        const container = document.getElementById('landingStageContainer');
        container.innerHTML = ''; 
        container.style.visibility = 'hidden'; 
    }
}

// Make Stage6 accessible globally
window.Stage6 = Stage6;