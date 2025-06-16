class Stage5 {
    constructor(game) {
        this.game = game;
        this.a = 1;
        this.b = 1;
        this.c = 100;
        this.functionType = 'sin'; // Default function type
        this.isSubmitted = false;
        this.selectedX = null;
        this.selectedY = null;
        this.calculatedMountainHeight = false; // To track whether mountain height was calculated

        this.initUI();
    }

    initUI() {
        const container = document.getElementById('mountainStageContainer');
        container.style.visibility = 'visible';
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '10px';
        container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        container.style.padding = '15px';
        container.style.borderRadius = '8px';
        container.style.width = '300px';

        // Create and append title and instructions
        const titleText = document.createElement('div');
        titleText.innerText = "Modeling Mountains - Stage 5";
        titleText.style.color = 'black';
        titleText.style.fontSize = '20px';
        titleText.style.fontWeight = 'bold';
        titleText.style.marginBottom = '10px';
        container.appendChild(titleText);

        const instructionsText = document.createElement('div');
        instructionsText.innerText = "Select a function type and adjust the constants. Submit your function when you're ready.";
        instructionsText.style.color = 'grey';
        instructionsText.style.fontSize = '16px';
        instructionsText.style.marginBottom = '20px';
        container.appendChild(instructionsText);

        // Create dynamic equation display
        this.equationDisplay = document.createElement('div');
        this.equationDisplay.style.color = 'black';
        this.equationDisplay.style.fontSize = '16px';
        this.equationDisplay.style.marginBottom = '20px';
        container.appendChild(this.equationDisplay);
        this.updateEquationDisplay();

        // Create a dropdown for function selection
        const dropdown = document.createElement('select');
        dropdown.innerHTML = `
            <option value="sin">Sine</option>
            <option value="cos">Cosine</option>
            <option value="poly">Polynomial</option>
            <option value="exp">Exponential</option>
        `;
        dropdown.onchange = (e) => {
            this.functionType = e.target.value;
            this.updateEquationDisplay();
            this.updateGraph();
        };
        container.appendChild(dropdown);
        container.appendChild(document.createElement('br'));

        // Create labeled sliders for constants a, b, c
        this.createSlider(container, 'a', 1, 100, 1, this.a, (value) => { this.a = parseFloat(value); this.updateEquationDisplay(); });
        this.createSlider(container, 'b', 0.005, 0.05, 0.005, this.b, (value) => { this.b = parseFloat(value); this.updateEquationDisplay(); });
        this.createSlider(container, 'c', 70, 250, 1, this.c, (value) => { this.c = parseFloat(value); this.updateEquationDisplay(); });

        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.innerText = "Submit Function";
        submitButton.onclick = () => {
            this.isSubmitted = true;
            alert("Function submitted! Click on the screen to select a point.");
        };
        container.appendChild(submitButton);

        // Input box for user to program the distance
        this.inputContainer = document.createElement('div');
        this.inputContainer.style.visibility = 'hidden';
        const inputLabel = document.createElement('div');
        inputLabel.innerText = "First, enter the equation for the mountain height at setX:";
        this.inputContainer.appendChild(inputLabel);

        this.mountainHeightInput = document.createElement('input');
        this.mountainHeightInput.type = 'text';
        this.mountainHeightInput.placeholder = "mountain_height = ...";
        this.inputContainer.appendChild(this.mountainHeightInput);

        const submitMountainHeightButton = document.createElement('button');
        submitMountainHeightButton.innerText = "Submit Mountain Height";
        submitMountainHeightButton.onclick = () => {
            this.checkMountainHeight();
        };
        this.inputContainer.appendChild(submitMountainHeightButton);

        // Distance input field, initially hidden
        this.distanceInputContainer = document.createElement('div');
        this.distanceInputContainer.style.visibility = 'hidden';
        const distanceInputLabel = document.createElement('div');
        distanceInputLabel.innerText = "Now, enter the equation for the distance:";
        this.distanceInputContainer.appendChild(distanceInputLabel);

        this.distanceInput = document.createElement('input');
        this.distanceInput.type = 'text';
        this.distanceInput.placeholder = "distance = setY - mountain_height";
        this.distanceInputContainer.appendChild(this.distanceInput);

        const submitDistanceButton = document.createElement('button');
        submitDistanceButton.innerText = "Submit Distance";
        submitDistanceButton.onclick = () => {
            this.checkDistance();
        };
        this.distanceInputContainer.appendChild(submitDistanceButton);

        container.appendChild(this.inputContainer);
        container.appendChild(this.distanceInputContainer);

        this.updateGraph();
    }

    updateEquationDisplay() {
        let equation = "";
        switch (this.functionType) {
            case 'cos':
                equation = `y = ${this.a} * cos(${this.b}x) + ${this.c}`;
                break;
            case 'sin':
                equation = `y = ${this.a} * sin(${this.b}x) + ${this.c}`;
                break;
            case 'poly':
                equation = `y = ${this.a} * (x/100)² + ${this.b} * (x/100) + ${this.c}`;
                break;
            case 'exp':
                equation = `y = ${this.a} * exp(${this.b} * (x/100)) + ${this.c}`;
                break;
        }
        this.equationDisplay.innerText = equation;
    }

    createSlider(container, label, min, max, step, value, onInput) {
        const labelElement = document.createElement('div');
        labelElement.innerText = label;
        labelElement.style.marginBottom = '5px';
        container.appendChild(labelElement);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;
        slider.oninput = (e) => { onInput(e.target.value); this.updateGraph(); };
        container.appendChild(slider);
        container.appendChild(document.createElement('br'));
    }

    updateGraph() {
        this.game.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.drawBackground();

        this.game.ctx.beginPath();
        this.game.ctx.moveTo(0, this.game.canvas.height);

        for (let x = 0; x <= this.game.canvas.width; x++) {
            let y;
            switch (this.functionType) {
                case 'cos':
                    y = this.a * Math.cos(this.b * x) + this.c;
                    break;
                case 'sin':
                    y = this.a * Math.sin(this.b * x) + this.c;
                    break;
                case 'poly':
                    y = this.a * Math.pow(x / 100, 2) + this.b * (x / 100) + this.c;
                    break;
                case 'exp':
                    y = this.a * Math.exp(this.b * (x / 100)) + this.c;
                    break;
            }
            this.game.ctx.lineTo(x, this.game.canvas.height - y);
        }

        this.game.ctx.lineTo(this.game.canvas.width, this.game.canvas.height);
        this.game.ctx.closePath();
        this.game.ctx.fillStyle = '#4d2600';
        this.game.ctx.fill();

        if (this.selectedX !== null && this.selectedY !== null) {
            this.game.ctx.fillStyle = 'red';
            this.game.ctx.fillText('X', this.selectedX - 5, this.selectedY + 5);
            this.game.ctx.fillText(`(${this.selectedX.toFixed(2)}, ${this.selectedY.toFixed(2)})`, this.selectedX + 10, this.selectedY);
        }
    }

    start() {
        this.updateGraph();
        document.getElementById('startButton').style.visibility = 'hidden';
        document.getElementById('info').style.visibility = 'hidden';

        this.game.canvas.addEventListener('click', (e) => {
            if (this.isSubmitted) {
                const rect = this.game.canvas.getBoundingClientRect();
                this.selectedX = e.clientX - rect.left;
                this.selectedY = e.clientY - rect.top;
                this.inputContainer.style.visibility = 'visible';
                this.updateGraph();
                alert("Point selected! Now enter the equation for the mountain height at setX.");
            }
        });
    }

    checkMountainHeight() {
        if (this.selectedX === null) return;

        let peakY;
        switch (this.functionType) {
            case 'cos':
                peakY = this.a * Math.cos(this.b * this.selectedX) + this.c;
                break;
            case 'sin':
                peakY = this.a * Math.sin(this.b * this.selectedX) + this.c;
                break;
            case 'poly':
                peakY = this.a * Math.pow(this.selectedX / 100, 2) + this.b * (this.selectedX / 100) + this.c;
                break;
            case 'exp':
                peakY = this.a * Math.exp(this.b * (this.selectedX / 100)) + this.c;
                break;
        }

        try {
            // Get the user input and extract only the formula (ignore the "mountain_height = " part)
            let userInput = this.mountainHeightInput.value;
            
            // Remove anything before the "=" if it exists
            userInput = userInput.split('=')[1] ? userInput.split('=')[1].trim() : userInput.trim();
            
            // Replace 'setX' with the actual selectedX value
            userInput = userInput.replace('setX', this.selectedX);

            // Automatically replace sin, cos, exp, pow with Math equivalents
            userInput = userInput.replace(/\bsin\b/g, 'Math.sin')
                                .replace(/\bcos\b/g, 'Math.cos')
                                .replace(/\bexp\b/g, 'Math.exp')
                                .replace(/\bpow\b/g, 'Math.pow'); // Handle 'pow' for exponents

            // Evaluate the user's formula and calculate the result
            const userCalculatedHeight = eval(userInput);

            // Debugging: Show the correct peakY and the user's calculated value for comparison
            console.log(`Correct mountain height (peakY): ${peakY}`);
            console.log(`Users calculated mountain height: ${userCalculatedHeight}`);

            //Compare the calculated height with the actual peakY value
            if (Math.abs(userCalculatedHeight - peakY) < 0.1) {
                alert("Correct! Now enter the equation for the distance.");
                this.calculatedMountainHeight = true;
                this.distanceInputContainer.style.visibility = 'visible';
            } else {
                alert(`Incorrect. Your value: ${userCalculatedHeight}, Expected: ${peakY}`);
            }
        } catch (error) {
            alert(`There was an error with your input: ${error.message}. Please check the format and try again.`);
        }
    }


    checkDistance() {
        if (!this.calculatedMountainHeight || this.selectedX === null) return;

        let peakY;
        switch (this.functionType) {
            case 'cos':
                peakY = this.a * Math.cos(this.b * this.selectedX) + this.c;
                break;
            case 'sin':
                peakY = this.a * Math.sin(this.b * this.selectedX) + this.c;
                break;
            case 'poly':
                peakY = this.a * Math.pow(this.selectedX / 100, 2) + this.b * (this.selectedX / 100) + this.c;
                break;
            case 'exp':
                peakY = this.a * Math.exp(this.b * (this.selectedX / 100)) + this.c;
                break;
        }

        try {
            // Get the user's input for the distance equation
            let userInput = this.distanceInput.value;

            // Remove anything before the "=" to evaluate only the formula (ignore "distance =")
            userInput = userInput.split('=')[1] ? userInput.split('=')[1].trim() : userInput.trim();

            // Replace 'setY' with the actual y-coordinate from the selected point
            userInput = userInput.replace('setY', this.selectedY);
            // Replace 'mountain_height' with the calculated peakY value
            userInput = userInput.replace('mountain_height', peakY);

            // Evaluate the user's formula and calculate the result
            const userCalculatedDistance = eval(userInput);

            // Correct the actual distance by subtracting peakY from the canvas height (inverting the coordinate system)
            const actualDistance = Math.abs(this.selectedY - peakY);

            // Compare the user's calculated distance with the actual distance
            if (Math.abs(userCalculatedDistance - actualDistance) < 0.1) {
                alert("Stage Complete! You calculated the correct distance.");

                // Link to Stage 6
                const linkToStage6 = document.createElement('a');
                linkToStage6.href = "Stage6.js"; // Assuming the link to Stage 6 is Stage6.html
                linkToStage6.innerText = "Go to Stage 6";
                this.distanceInputContainer.appendChild(linkToStage6);
            } else {
                alert(`Incorrect distance. Try again! Your result: ${userCalculatedDistance}, Expected: ${actualDistance}`);
            }
        } catch (error) {
            alert(`There was an error with your input: ${error.message}. Please check the format and try again.`);
        }
    }




    cleanup() {
        const container = document.getElementById('mountainStageContainer');
        container.innerHTML = '';
        container.style.visibility = 'hidden';
    }

    update(dt) {}
    draw(ctx) {}
}

// Make Stage5 accessible globally
window.Stage5 = Stage5;
