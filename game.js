class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drone = new Drone(this.canvas.width / 2, this.canvas.height / 4);
        this.currentStage = null;

        this.background = new Image();
        this.background.src = 'pics/mars_background.jpg'; // Ensure this path is correct
        this.background.onload = () => {
            this.run();
            this.startStage(Stage1); // Start with Stage1
        };

        this.droneImage = new Image();
        this.droneImage.src = 'pics/drone.png'; // Ensure this path is correct

        document.getElementById('startButton').addEventListener('click', () => {
            if (this.currentStage) {
                this.currentStage.startMission();
            }
        });

    }

    startStage(stageClass) {
    if (this.currentStage && typeof this.currentStage.cleanup === 'function') {
        this.currentStage.cleanup();
    }
    this.currentStage = new stageClass(this); // Pass `this` as the `game` argument
    this.currentStage.start();
}


    gameLoop(time) {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    if (this.currentStage) {
        if (typeof this.currentStage.update === 'function') {
            this.currentStage.update(dt);
        }
        if (typeof this.currentStage.draw === 'function') {
            this.currentStage.draw(this.ctx);
        }
    }

    requestAnimationFrame(this.gameLoop.bind(this));
}


    run() {
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    drawBackground() {
        this.ctx.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
    }

    drawMountains() {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);

        for (let x = 0; x <= this.canvas.width; x++) {
            let y = 0.8 * (Math.cos(x * 0.01) + Math.cos(3 * x * 0.01) + 0.000004 * (x - 600) * (x - 600)) + 3;
            this.ctx.lineTo(x, this.canvas.height - (y * 50 + 100)); // scale and position the mountains
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fillStyle = '#4d2600';
        this.ctx.fill();
    }

    drawDrone() {
        this.ctx.save();
        this.ctx.translate(this.drone.x, this.drone.y);
        this.ctx.rotate(this.drone.angle);
        this.ctx.drawImage(this.droneImage, -20, -20, 80, 80); // Adjust size and position as needed
        this.ctx.restore();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // Make the game instance accessible globally if needed
});
