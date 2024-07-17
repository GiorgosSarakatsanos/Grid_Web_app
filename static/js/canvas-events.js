import { drawImageWithBoxes } from './canvas-operations.js';
import { isInsideHandle } from './resize-handlers.js';
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

    imageCanvas.addEventListener('mousedown', (event) => {
        startX = event.offsetX - state.originX;
        startY = event.offsetY - state.originY;
        isDragging = true;

        // Check if a box is clicked
        state.boxes.forEach(box => {
            const scaledX = box.x * state.scale + state.originX;
            const scaledY = box.y * state.scale + state.originY;
            const scaledWidth = box.width * state.scale;
            const scaledHeight = box.height * state.scale;

            const topLeftHandle = { x: scaledX, y: scaledY };
            const topRightHandle = { x: scaledX + scaledWidth, y: scaledY };
            const bottomLeftHandle = { x: scaledX, y: scaledY + scaledHeight };
            const bottomRightHandle = { x: scaledX + scaledWidth, y: scaledY + scaledHeight };

            if (isInsideHandle(startX, startY, topLeftHandle.x, topLeftHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'topLeft';
                isResizing = true;
            } else if (isInsideHandle(startX, startY, topRightHandle.x, topRightHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'topRight';
                isResizing = true;
            } else if (isInsideHandle(startX, startY, bottomLeftHandle.x, bottomLeftHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'bottomLeft';
                isResizing = true;
            } else if (isInsideHandle(startX, startY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                selectedBox = box;
                resizeHandle = 'bottomRight';
                isResizing = true;
            } else if (startX >= scaledX && startX <= scaledX + scaledWidth && startY >= scaledY && startY <= scaledY + scaledHeight) {
                selectedBox = box;
                isResizing = false;
            }
        });
    });

    imageCanvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const offsetX = (event.offsetX - state.originX) / state.scale;
            const offsetY = (event.offsetY - state.originY) / state.scale;

            if (selectedBox && isResizing) {
                switch (resizeHandle) {
                    case 'topLeft':
                        selectedBox.width += selectedBox.x - offsetX;
                        selectedBox.height += selectedBox.y - offsetY;
                        selectedBox.x = offsetX;
                        selectedBox.y = offsetY;
                        break;
                    case 'topRight':
                        selectedBox.width = offsetX - selectedBox.x;
                        selectedBox.height += selectedBox.y - offsetY;
                        selectedBox.y = offsetY;
                        break;
                    case 'bottomLeft':
                        selectedBox.width += selectedBox.x - offsetX;
                        selectedBox.x = offsetX;
                        selectedBox.height = offsetY - selectedBox.y;
                        break;
                    case 'bottomRight':
                        selectedBox.width = offsetX - selectedBox.x;
                        selectedBox.height = offsetY - selectedBox.y;
                        break;
                }
            } else if (selectedBox) {
                selectedBox.x = offsetX - startX / state.scale;
                selectedBox.y = offsetY - startY / state.scale;
            } else {
                state.originX = event.offsetX - startX;
                state.originY = event.offsetY - startY;
            }
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
        }
    });

    imageCanvas.addEventListener('mouseup', () => {
        isDragging = false;
        selectedBox = null;
        isResizing = false;
        resizeHandle = null;
    });

    imageCanvas.addEventListener('mouseout', () => {
        isDragging = false;
        selectedBox = null;
        isResizing = false;
        resizeHandle = null;
    });
}
