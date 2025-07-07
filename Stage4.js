class Stage4 {
    constructor(game) {
        this.game = game;
        this.drone = game.drone;
        this.battery = 100;
        this.powerConstant = 5; // Example power constant

        // Ensure the DOM is fully loaded before accessing elements
        document.addEventListener('DOMContentLoaded', () => {
            // Add event listeners here, after the DOM is ready
            const startButton = document.getElementById('startStage4Button');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    this.start();
                });
            }

            const submitPowerButton = document.getElementById('submitPowerButton');
            if (submitPowerButton) {
                submitPowerButton.addEventListener('click', () => {
                    this.calculatePower();
                });
            }
        });
    }

    start() {
        document.getElementById('startStage4Button').style.visibility = 'visable';
        document.getElementById('inputThrust').style.visibility = 'hidden';
        document.getElementById('submitPowerButton').style.visibility = 'hidden';
        document.getElementById('batteryDisplay').style.visibility = 'visable';
        alert("Starting Stage 4 - Battery Consumption...");
    }

    calculatePower() {
        const thrustInput = document.getElementById('inputThrust');
        if (thrustInput) {
            const thrust = parseFloat(thrustInput.value);
            if (!isNaN(thrust)) {
                const power = this.powerConstant * thrust;
                const energy = power * 1; // Assuming t = 1 for simplicity
                this.battery -= energy;
                alert(`Battery remaining: ${this.battery}%`);
            } else {
                alert('Invalid input. Please enter a valid thrust value.');
            }
        }
    }

    updateBatteryDisplay() {
        const batteryElement = document.getElementById('batteryDisplay');
        if (batteryElement) {
            batteryElement.style.width = `${this.battery}%`;
            batteryElement.style.backgroundColor = `rgb(${(100 - this.battery) * 2.55}, ${this.battery * 2.55}, 0)`;
        }
    }

    update(dt) {
        this.updateBatteryDisplay();
    }

    endStage4() {
        // Hide elements specific to Stage 4
        /*
        document.getElementById('completionMessage').style.visibility = 'hidden';
        document.getElementById('hoverThrustContainer').style.visibility = 'hidden';
        document.getElementById('hintButtonStage2').style.visibility = 'hidden';
        document.getElementById('info').style.visibility = 'hidden';
        */

        // Transition to Stage 5
        this.game.startStage(Stage5);
    }
}

window.Stage4 = Stage4;
