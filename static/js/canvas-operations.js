// canvas-operations.js
import { state } from './shared-state.js';

export function drawImageWithBoxes(ctx, img, originX, originY, scale, boxes, texts = [], highlightedBox = null, highlightedText = null) {
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

    texts.forEach(text => {
        const x = text.x * img.width * scale + originX;
        const y = text.y * img.height * scale + originY;

        ctx.font = `${text.fontSize}px Arial`;
        ctx.fillStyle = 'black';
        ctx.fillText(text.content, x, y);

        if (text === highlightedText) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y - text.fontSize, ctx.measureText(text.content).width, text.fontSize);
        }
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
        ctx.lineTo(numX + 50, numY);
        ctx.stroke();

        // Set the font for the text
        ctx.font = '16px Arial';
        ctx.fillStyle = 'green';

        // Measure the text width
        const text = "ΘΕΣΗ ΑΡΙΘΜΗΣΗΣ";
        const textWidth = ctx.measureText(text).width;

        // Calculate the position for the text
        const textX = numX + 2;
        const textY = numY - 2;

        // Draw the text
        ctx.fillText(text, textX, textY);
    }
}
