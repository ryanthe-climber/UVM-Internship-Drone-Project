    desiredAngleTeachText() {
        return `<p>For now, the desired angle will be the angle between a vertical line on the drone and your cursor.</p>
                <p>Let's say that the cursor's coordinates are (x<sub>c</sub>, y<sub>c</sub>) and the drone's coordinates are (x<sub>d</sub>, y<sub>d</sub>). We can calculate the angle between them, θ, with:</p>
                <p>θ = tan<sup>-1</sup>[(x<sub>c</sub> - x<sub>d</sub>) - (y<sub>c</sub> - y<sub>d</sub>)]</p>
                <p>tan^-1((cursor_x - drone_x) / (cursor_y - drone_y))</p>`
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