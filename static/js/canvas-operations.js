// canvas-operations.js
export function drawImage(ctx, img, originX, originY, scale) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas before new drawing
    ctx.save();
    ctx.translate(originX, originY); // Set the origin for scaling and drawing
    ctx.scale(scale, scale); // Apply the scaling factor
    ctx.drawImage(img, 0, 0, img.width, img.height); // Draw the image at the new origin at scaled size
    ctx.restore();
}

import { state } from './shared-state.js'; // Ensure the shared state is imported

export function setNumberingPosition(event, ctx, img, originX, originY, scale) {
    const rect = ctx.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - originX) / scale;
    const y = (event.clientY - rect.top - originY) / scale;

    // Calculate relative position
    const relX = x / img.width;
    const relY = y / img.height;

    document.getElementById('numbering_position_x').value = relX.toFixed(4); // More precise
    document.getElementById('numbering_position_y').value = relY.toFixed(4); // More precise

    // Redraw image and boxes first
    drawImageWithBoxes(ctx, img, originX, originY, scale, state.boxes);

    // Draw green mark on the canvas
    const fontSize = parseFloat(document.querySelector('input[name="font_size"]').value) || 8;
    const verticalMarkLength = fontSize * 1.5; // Vertical mark length
    const horizontalMarkLength = verticalMarkLength * 2; // Horizontal mark length

    const scaledX = relX * img.width * scale + originX;
    const scaledY = relY * img.height * scale + originY;

    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY - verticalMarkLength / 2);
    ctx.lineTo(scaledX, scaledY + verticalMarkLength / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY);
    ctx.lineTo(scaledX + horizontalMarkLength, scaledY);
    ctx.stroke();

    // Position numbering text at the top of the horizontal line with 1px padding
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'green';
    ctx.fillText('ΑΡΙΘΜΗΣΗ', scaledX + 2, scaledY - 2);
}


export function drawBox(ctx, box, originX, originY, scale) {
    const scaledX = box.x * scale + originX;
    const scaledY = box.y * scale + originY;
    const scaledWidth = box.width * scale;
    const scaledHeight = box.height * scale;

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
        drawBox(ctx, box, originX, originY, scale);
    });
}
