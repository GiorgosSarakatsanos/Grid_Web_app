// canvas-operations.js

export function drawImageWithBoxes(ctx, img, originX, originY, scale, boxes, highlightedBox = null) {
    console.debug('Drawing image with boxes:', { originX, originY, scale, boxes });
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, originX, originY, img.width * scale, img.height * scale);

    boxes.forEach((box, index) => {
        console.debug('Drawing box:', box, 'Index:', index);
        ctx.beginPath();
        ctx.rect(
            box.x * img.width * scale + originX,
            box.y * img.height * scale + originY,
            box.width * img.width * scale,
            box.height * img.height * scale
        );
        ctx.fillStyle = highlightedBox === box ? 'rgba(255, 0, 0, 0.5)' : 'white';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        ctx.closePath();

        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`Box ${index + 1}`, box.x * img.width * scale + originX, box.y * img.height * scale + originY - 5);
    });
}

export function setNumberingPosition(ctx, img, originX, originY, scale, numberingPosition) {
    console.debug('Setting numbering position:', { originX, originY, scale, numberingPosition });
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    const x = numberingPosition.x * img.width * scale + originX;
    const y = numberingPosition.y * img.height * scale + originY;
    ctx.fillText('1', x, y);
}
