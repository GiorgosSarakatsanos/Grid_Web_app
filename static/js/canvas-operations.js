import { state } from './shared-state.js';

// canvas-operations.js

export function drawImageWithBoxes(ctx, img, originX, originY, scale, boxes, highlightedBox = null) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, originX, originY, img.width * scale, img.height * scale);

    boxes.forEach(box => {
        const x = box.x * img.width * scale + originX;
        const y = box.y * img.height * scale + originY;
        const width = box.width * img.width * scale;
        const height = box.height * img.height * scale;

        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = box === highlightedBox ? 'red' : 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    });

    if (state.numberingPosition) {
        const numX = state.numberingPosition.x * img.width * scale + originX;
        const numY = state.numberingPosition.y * img.height * scale + originY;

        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;

        // Draw right part of cross
        ctx.beginPath();
        ctx.moveTo(numX, numY);
        ctx.lineTo(numX, numY - 20);
        ctx.moveTo(numX, numY);
        ctx.lineTo(numX + 60, numY);
        ctx.stroke();

        // Write the message "ΘΕΣΗ ΑΡΙΘΜΗΣΗΣ"
        ctx.font = '10px Arial';
        ctx.fillStyle = 'green';
        ctx.fillText("ΘΕΣΗ ΑΡΙΘΜΗΣΗΣ", numX + 3, numY - 5);
    }
}

export function setNumberingPosition(ctx, img, originX, originY, scale, numberingPosition) {
    console.debug('Setting numbering position:', { originX, originY, scale, numberingPosition });
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    const x = numberingPosition.x * img.width * scale + originX;
    const y = numberingPosition.y * img.height * scale + originY;
    ctx.fillText('1', x, y);
}
