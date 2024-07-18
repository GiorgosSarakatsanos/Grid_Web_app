import { state } from './shared-state.js';

export function drawImage(ctx, img, originX, originY, scale) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas before new drawing
    ctx.save();
    ctx.translate(originX, originY); // Set the origin for scaling and drawing
    ctx.scale(scale, scale); // Apply the scaling factor
    ctx.drawImage(img, 0, 0, img.width, img.height); // Draw the image at the new origin at scaled size
    ctx.restore();
}

export function drawBox(ctx, box, originX, originY, imgWidth, imgHeight, scale) {
    const scaledX = box.x * imgWidth * scale + originX;
    const scaledY = box.y * imgHeight * scale + originY;
    const scaledWidth = box.width * imgWidth * scale;
    const scaledHeight = box.height * imgHeight * scale;

    ctx.fillStyle = 'white';
    ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

    ctx.strokeStyle = 'black';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
    ctx.setLineDash([]);

    // Draw control handles
    const handleSize = 10;

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    // Top-left corner
    ctx.fillRect(scaledX - handleSize / 2, scaledY - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(scaledX - handleSize / 2, scaledY - handleSize / 2, handleSize, handleSize);

    // Top-right corner
    ctx.fillRect(scaledX + scaledWidth - handleSize / 2, scaledY - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(scaledX + scaledWidth - handleSize / 2, scaledY - handleSize / 2, handleSize, handleSize);

    // Bottom-left corner
    ctx.fillRect(scaledX - handleSize / 2, scaledY + scaledHeight - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(scaledX - handleSize / 2, scaledY + scaledHeight - handleSize / 2, handleSize, handleSize);

    // Bottom-right corner
    ctx.fillRect(scaledX + scaledWidth - handleSize / 2, scaledY + scaledHeight - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(scaledX + scaledWidth - handleSize / 2, scaledY + scaledHeight - handleSize / 2, handleSize, handleSize);
}

export function drawImageWithBoxes(ctx, img, originX, originY, scale, boxes) {
    drawImage(ctx, img, originX, originY, scale);
    boxes.forEach(box => {
        drawBox(ctx, box, originX, originY, img.width, img.height, scale);
    });
}
