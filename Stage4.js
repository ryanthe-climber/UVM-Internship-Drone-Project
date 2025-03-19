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
                    this.startStage4();
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

    startStage4() {
        // Logic for starting Stage 4
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
}

window.Stage4 = Stage4;
