// box-events.js
import { drawImageWithBoxes } from './canvas-operations.js';
import { isInsideHandle, changeCursor } from './resize-handlers.js'; // Import from resize-handlers.js
import { state } from './shared-state.js';
import { logBoxSummary, debugLog } from './debug-logger.js';

let startX = 0;
let startY = 0;
let selectedBox = null;
let isDrawing = false;
let drawingBox = null;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
const handleSize = 10;
const minBoxSize = 20;

function sendDataToServer() {
    const data = {
        boxes: state.boxes,
        texts: state.texts
    };

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content'); // Get CSRF token

    fetch('/submit-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken // Add CSRF token to the request
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

export function setupBoxEvents(ctx, imageCanvas) {
    const drawButton = document.getElementById('add-box');
    let canDraw = false;

    function toggleButton(button) {
        button.classList.toggle('active');
    }

    drawButton.addEventListener('click', () => {
        canDraw = !canDraw;
        if (canDraw) {
            toggleButton(drawButton);
        } else {
            drawButton.classList.remove('active');
        }
    });

    function handleMouseDown(event) {
        state.boxes.forEach(box => {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
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
                debugLog('Resizing from top-left handle');
            } else if (isInsideHandle(event.offsetX, event.offsetY, topRightHandle.x, topRightHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'topRight';
                isResizing = true;
                debugLog('Resizing from top-right handle');
            } else if (isInsideHandle(event.offsetX, event.offsetY, bottomLeftHandle.x, bottomLeftHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'bottomLeft';
                isResizing = true;
                debugLog('Resizing from bottom-left handle');
            } else if (isInsideHandle(event.offsetX, event.offsetY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'bottomRight';
                isResizing = true;
                debugLog('Resizing from bottom-right handle');
            } else if (event.offsetX >= scaledX && event.offsetX <= scaledX + scaledWidth && event.offsetY >= scaledY && event.offsetY <= scaledY + scaledHeight) {
                selectedBox = box;
                isDragging = true;
                dragOffsetX = (event.offsetX - scaledX) / state.scale;
                dragOffsetY = (event.offsetY - scaledY) / state.scale;
                debugLog('Dragging box:', selectedBox);
            }
        });

        if (isDragging || isResizing) return;

        if (canDraw) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            if (!isDrawing && !selectedBox && !isResizing) {
                isDrawing = true;
                startX = (event.offsetX - state.originX) / state.scale;
                startY = (event.offsetY - state.originY) / state.scale;
                drawingBox = {
                    x: startX / imgWidth,
                    y: startY / imgHeight,
                    width: 0,
                    height: 0
                };
                debugLog('Started drawing new box:', drawingBox);
            }
        }
    }

    function handleMouseMove(event) {
        if (isDrawing) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            const endX = (event.offsetX - state.originX) / state.scale;
            const endY = (event.offsetY - state.originY) / state.scale;

            drawingBox.width = (endX - startX) / imgWidth;
            drawingBox.height = (endY - startY) / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);

            ctx.fillStyle = 'white';
            ctx.fillRect(
                startX * state.scale + state.originX,
                startY * state.scale + state.originY,
                drawingBox.width * imgWidth * state.scale,
                drawingBox.height * imgHeight * state.scale
            );

            ctx.strokeStyle = 'blue';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.strokeRect(
                startX * state.scale + state.originX,
                startY * state.scale + state.originY,
                drawingBox.width * imgWidth * state.scale,
                drawingBox.height * imgHeight * state.scale
            );
            ctx.setLineDash([]);
        } else if (isDragging && selectedBox) {
            const mouseX = (event.offsetX - state.originX) / state.scale;
            const mouseY = (event.offsetY - state.originY) / state.scale;
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;

            selectedBox.x = mouseX / imgWidth - dragOffsetX / imgWidth;
            selectedBox.y = mouseY / imgHeight - dragOffsetY / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);

            logBoxSummary(state.boxes);
        } else if (isResizing && selectedBox) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            const mouseX = (event.offsetX - state.originX) / state.scale;
            const mouseY = (event.offsetY - state.originY) / state.scale;

            if (resizeHandle === 'topLeft') {
                selectedBox.width += selectedBox.x - mouseX / imgWidth;
                selectedBox.height += selectedBox.y - mouseY / imgHeight;
                selectedBox.x = mouseX / imgWidth;
                selectedBox.y = mouseY / imgHeight;
            } else if (resizeHandle === 'topRight') {
                selectedBox.width = mouseX / imgWidth - selectedBox.x;
                selectedBox.height += selectedBox.y - mouseY / imgHeight;
                selectedBox.y = mouseY / imgHeight;
            } else if (resizeHandle === 'bottomLeft') {
                selectedBox.width += selectedBox.x - mouseX / imgWidth;
                selectedBox.x = mouseX / imgWidth;
                selectedBox.height = mouseY / imgHeight - selectedBox.y;
            } else if (resizeHandle === 'bottomRight') {
                selectedBox.width = mouseX / imgWidth - selectedBox.x;
                selectedBox.height = mouseY / imgHeight - selectedBox.y;
            }

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);

            logBoxSummary(state.boxes);
        } else {
            let cursorSet = false;

            state.boxes.forEach(box => {
                const scaledX = box.x * state.img.width * state.scale + state.originX;
                const scaledY = box.y * state.img.height * state.scale + state.originY;
                const scaledWidth = box.width * state.img.width * state.scale;
                const scaledHeight = box.height * state.img.height * state.scale;

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
                    changeCursor(imageCanvas, 'pointer');
                    cursorSet = true;
                }
            });

            if (!cursorSet) {
                changeCursor(imageCanvas, 'default');
            }
        }
    }

    function handleMouseUp(event) {
        if (isDragging) {
            isDragging = false;
            selectedBox = null;
        }

        if (isDrawing) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;

            if (drawingBox.width * imgWidth < minBoxSize || drawingBox.height * imgHeight < minBoxSize) {
                debugLog('Box too small, not adding to state');
            } else {
                const boxExists = state.boxes.some(box =>
                    box.x === drawingBox.x &&
                    box.y === drawingBox.y &&
                    box.width === drawingBox.width &&
                    box.height === drawingBox.height
                );

                if (!boxExists) {
                    state.boxes.push(drawingBox);
                    debugLog('Box added to state:', drawingBox);
                }
            }
            isDrawing = false;
            drawingBox = null;
        }

        isResizing = false;
        resizeHandle = null;
        selectedBox = null;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);

        logBoxSummary(state.boxes);
        sendDataToServer(); // Send data to the server after updating boxes
    }

    function handleMouseOut() {
        isDrawing = false;
        drawingBox = null;
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
        selectedBox = null;
        changeCursor(imageCanvas, 'default');
    }

    imageCanvas.addEventListener('mousedown', handleMouseDown);
    imageCanvas.addEventListener('mousemove', handleMouseMove);
    imageCanvas.addEventListener('mouseup', handleMouseUp);
    imageCanvas.addEventListener('mouseout', handleMouseOut);
}
