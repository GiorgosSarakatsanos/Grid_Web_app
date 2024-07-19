import { drawImageWithBoxes } from './canvas-operations.js';
import { isInsideHandle, changeCursor } from './resize-handlers.js';
import { state } from './shared-state.js';

export function setupCanvasEvents() {
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let selectedBox = null;
    let isResizing = false;
    let resizeHandle = null;
    const handleSize = 10;
    let isDrawing = false;
    let drawingBox = null;
    let isZooming = false;
    let isMovingImage = false;
    let ctrlPressed = false;
    let messageTimeout;
    let canDraw = false; // Flag to indicate if drawing is enabled

    const contextMenu = document.getElementById('context-menu');
    const deleteBoxOption = document.getElementById('delete-box');
    const cancelMenuOption = document.getElementById('cancel-menu');
    let hoveredBox = null;
    let highlightedBox = null;

    // Show message in the top-right corner of the image
    function showMessage(text) {
        ctx.save();
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background
        const textWidth = ctx.measureText(text).width;
        const padding = 5;

        // Calculate position in the top-right corner of the image
        const mouseX = state.originX + state.img.width * state.scale - textWidth - padding * 2;
        const mouseY = state.originY + padding;

        // Draw the background rectangle
        ctx.fillRect(mouseX, mouseY - 12, textWidth + padding * 2, 24);

        // Draw the message text with better contrast color
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, mouseX + padding, mouseY + 6);
        ctx.restore();
    }

    // Hide the message
    function hideMessage() {
        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
    }

    // Listen for keydown events
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Control' && !ctrlPressed) {
            ctrlPressed = true;
            imageCanvas.style.cursor = 'grab'; // Change cursor to hand

            // Show message in the top-right corner of the image
            showMessage('Μετακίνηση θέσης φωτογραφίας');

            // Hide message after 1.25 seconds
            if (messageTimeout) {
                clearTimeout(messageTimeout);
            }
            messageTimeout = setTimeout(() => {
                hideMessage();
            }, 1250);
        }
    });

    // Listen for keyup events
    document.addEventListener('keyup', (event) => {
        if (event.key === 'Control') {
            ctrlPressed = false;
            imageCanvas.style.cursor = 'default'; // Reset cursor
        }
    });

    // Button to enable drawing mode
    const drawButton = document.getElementById('add-box');
    drawButton.addEventListener('click', () => {
        canDraw = true;
    });

    imageCanvas.addEventListener('mousedown', (event) => {
        if (ctrlPressed) {
            isMovingImage = true;
            startX = event.offsetX - state.originX;
            startY = event.offsetY - state.originY;
            return;
        }

        if (!canDraw) return; // Exit if drawing is not enabled

        startX = (event.offsetX - state.originX) / state.scale;
        startY = (event.offsetY - state.originY) / state.scale;

        const imgWidth = state.img.width;
        const imgHeight = state.img.height;

        state.boxes.forEach(box => {
            const scaledX = box.x * imgWidth * state.scale + state.originX;
            const scaledY = box.y * imgHeight * state.scale + state.originY;
            const scaledWidth = box.width * imgWidth * state.scale;
            const scaledHeight = box.height * imgHeight * state.scale;

            const topLeftHandle = { x: scaledX, y: scaledY };
            const topRightHandle = { x: scaledX + scaledWidth, y: scaledY };
            const bottomLeftHandle = { x: scaledX, y: scaledY + scaledHeight };
            const bottomRightHandle = { x: scaledX + scaledWidth, y: scaledY + scaledHeight };

            if (isInsideHandle(event.offsetX, event.offsetY, topLeftHandle.x, topLeftHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'topLeft';
                isResizing = true;
            } else if (isInsideHandle(event.offsetX, event.offsetY, topRightHandle.x, topRightHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'topRight';
                isResizing = true;
            } else if (isInsideHandle(event.offsetX, event.offsetY, bottomLeftHandle.x, bottomLeftHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'bottomLeft';
                isResizing = true;
            } else if (isInsideHandle(event.offsetX, event.offsetY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'bottomRight';
                isResizing = true;
            } else if (event.offsetX >= scaledX && event.offsetX <= scaledX + scaledWidth && event.offsetY >= scaledY && event.offsetY <= scaledY + scaledHeight) {
                selectedBox = box;
                isDragging = true;
            }
        });

        if (!isDrawing && !selectedBox && !isResizing) {
            isDrawing = true;
            drawingBox = {
                x: startX / imgWidth,
                y: startY / imgHeight,
                width: 0,
                height: 0
            };
        }

        if (!isDragging && !isResizing && !isDrawing) {
            isZooming = true;
        }
    });

    imageCanvas.addEventListener('mousemove', (event) => {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        const imgWidth = state.img.width;
        const imgHeight = state.img.height;

        if (isMovingImage) {
            state.originX = event.offsetX - startX;
            state.originY = event.offsetY - startY;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
        } else if (isDragging && selectedBox && !isResizing) {
            const offsetX = (mouseX - startX) / imgWidth;
            const offsetY = (mouseY - startY) / imgHeight;
            selectedBox.x += offsetX;
            selectedBox.y += offsetY;
            startX = mouseX;
            startY = mouseY;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
        } else if (isResizing && selectedBox) {
            const offsetX = (mouseX - state.originX) / state.scale;
            const offsetY = (mouseY - state.originY) / state.scale;
            switch (resizeHandle) {
                case 'topLeft':
                    selectedBox.width += selectedBox.x - offsetX / imgWidth;
                    selectedBox.height += selectedBox.y - offsetY / imgHeight;
                    selectedBox.x = offsetX / imgWidth;
                    selectedBox.y = offsetY / imgHeight;
                    break;
                case 'topRight':
                    selectedBox.width = offsetX / imgWidth - selectedBox.x;
                    selectedBox.height += selectedBox.y - offsetY / imgHeight;
                    selectedBox.y = offsetY / imgHeight;
                    break;
                case 'bottomLeft':
                    selectedBox.width += selectedBox.x - offsetX / imgWidth;
                    selectedBox.x = offsetX / imgWidth;
                    selectedBox.height = offsetY / imgHeight - selectedBox.y;
                    break;
                case 'bottomRight':
                    selectedBox.width = offsetX / imgWidth - selectedBox.x;
                    selectedBox.height = offsetY / imgHeight - selectedBox.y;
                    break;
            }
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
        } else if (isDrawing) {
            const rect = imageCanvas.getBoundingClientRect();
            const endX = (event.clientX - rect.left - state.originX) / state.scale;
            const endY = (event.clientY - rect.top - state.originY) / state.scale;

            drawingBox.width = (endX - startX) / imgWidth;
            drawingBox.height = (endY - startY) / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);

            ctx.strokeStyle = 'black';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.strokeRect(
                startX * state.scale + state.originX,
                startY * state.scale + state.originY,
                drawingBox.width * imgWidth * state.scale,
                drawingBox.height * imgHeight * state.scale
            );
            ctx.setLineDash([]);
        } else if (isZooming) {
            const offsetX = (mouseX - startX) / state.scale;
            const offsetY = (mouseY - startY) / state.scale;
            const scaleRatio = offsetX > 0 ? 1.01 : 0.99;
            state.scale *= scaleRatio;

            state.originX -= (mouseX - state.originX) * (scaleRatio - 1);
            state.originY -= (mouseY - state.originY) * (scaleRatio - 1);

            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
        } else {
            let cursorSet = false;
            hoveredBox = null;
            state.boxes.forEach(box => {
                const scaledX = box.x * imgWidth * state.scale + state.originX;
                const scaledY = box.y * imgHeight * state.scale + state.originY;
                const scaledWidth = box.width * imgWidth * state.scale;
                const scaledHeight = box.height * imgHeight * state.scale;

                const topLeftHandle = { x: scaledX, y: scaledY };
                const topRightHandle = { x: scaledX + scaledWidth, y: scaledY };
                const bottomLeftHandle = { x: scaledX, y: scaledY + scaledHeight };
                const bottomRightHandle = { x: scaledX + scaledWidth, y: scaledY + scaledHeight };

                if (isInsideHandle(event.offsetX, event.offsetY, topLeftHandle.x, topLeftHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'nw-resize');
                    cursorSet = true;
                } else if (isInsideHandle(event.offsetX, event.offsetY, topRightHandle.x, topRightHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'ne-resize');
                    cursorSet = true;
                } else if (isInsideHandle(event.offsetX, event.offsetY, bottomLeftHandle.x, bottomLeftHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'sw-resize');
                    cursorSet = true;
                } else if (isInsideHandle(event.offsetX, event.offsetY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'se-resize');
                    cursorSet = true;
                } else if (event.offsetX >= scaledX && event.offsetX <= scaledX + scaledWidth && event.offsetY >= scaledY && event.offsetY <= scaledY + scaledHeight) {
                    hoveredBox = box;
                    changeCursor(imageCanvas, 'pointer');
                    cursorSet = true;
                }
            });
            if (!cursorSet) {
                changeCursor(imageCanvas, 'default');
            }
        }
    });

    imageCanvas.addEventListener('mouseup', (event) => {
        isDragging = false;
        isResizing = false;
        isZooming = false;
        isMovingImage = false;
        selectedBox = null;
        resizeHandle = null;

        if (isDrawing) {
            state.boxes.push(drawingBox);
            isDrawing = false;
            drawingBox = null;
        }

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
    });

    imageCanvas.addEventListener('mouseout', () => {
        isDragging = false;
        isResizing = false;
        isZooming = false;
        isMovingImage = false;
        selectedBox = null;
        resizeHandle = null;
        isDrawing = false;
        drawingBox = null;
        changeCursor(imageCanvas, 'default');
    });

    imageCanvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        if (hoveredBox) {
            highlightedBox = hoveredBox; // Set the highlighted box
            contextMenu.style.left = `${event.clientX}px`; // Position context menu at the cursor position
            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.display = 'block';
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, highlightedBox);
        }
    });

    deleteBoxOption.addEventListener('click', () => {
        if (highlightedBox) {
            state.boxes = state.boxes.filter(box => box !== highlightedBox);
            highlightedBox = null;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
            contextMenu.style.display = 'none';
        }
    });

    cancelMenuOption.addEventListener('click', () => {
        contextMenu.style.display = 'none';
        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes); // Redraw to remove red highlight
    });

    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes); // Redraw to remove red highlight
        }
    });
}
