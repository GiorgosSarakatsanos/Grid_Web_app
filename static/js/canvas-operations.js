// canvas-operations.js
export function drawImage(ctx, img, originX, originY, scale) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas before new drawing
    ctx.save();
    ctx.translate(originX, originY); // Set the origin for scaling and drawing
    ctx.scale(scale, scale); // Apply the scaling factor
    ctx.drawImage(img, 0, 0, img.width, img.height); // Draw the image at the new origin at scaled size
    ctx.restore();
}

export function setNumberingPosition(event, ctx, img, originX, originY, scale) {
    const rect = ctx.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - originX) / scale;
    const y = (event.clientY - rect.top - originY) / scale;

    // Calculate relative position
    const relX = x / img.width;
    const relY = y / img.height;

    document.getElementById('numbering_position_x').value = relX;
    document.getElementById('numbering_position_y').value = relY;

    // Draw green mark on the canvas
    const fontSize = parseFloat(document.querySelector('input[name="font_size"]').value) || 8;
    const verticalMarkLength = fontSize * 1.5; // Vertical mark length
    const horizontalMarkLength = verticalMarkLength * 2; // Horizontal mark length

    drawImage(ctx, img, originX, originY, scale); // Redraw the image before drawing the mark
    const scaledX = relX * img.width * scale + originX;
    const scaledY = relY * img.height * scale + originY;
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY - verticalMarkLength / 2);
    ctx.lineTo(scaledX, scaledY + verticalMarkLength / 2);
    ctx.stroke();
    // Draw horizontal line
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY);
    ctx.lineTo(scaledX + horizontalMarkLength, scaledY);
    ctx.stroke();

    // Position numbering text at the top of the horizontal line with 1px padding
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'green';
    ctx.fillText('ΑΡΙΘΜΗΣΗ', scaledX + 2, scaledY - 2);
}
