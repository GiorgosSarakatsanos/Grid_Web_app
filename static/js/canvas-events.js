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

    imageCanvas.addEventListener('mousedown', (event) => {
        startX = event.offsetX - state.originX;
        startY = event.offsetY - state.originY;

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
                isDragging = true;
            }
        });

        if (!isDrawing && !selectedBox && !isResizing) {
            isDrawing = true;
            drawingBox = {
                x: (startX / state.scale) / imgWidth,
                y: (startY / state.scale) / imgHeight,
                width: 0,
                height: 0
            };
        }
    });

    imageCanvas.addEventListener('mousemove', (event) => {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        const imgWidth = state.img.width;
        const imgHeight = state.img.height;

        if (isDragging && selectedBox && !isResizing) {
            const offsetX = (mouseX - startX) / state.scale;
            const offsetY = (mouseY - startY) / state.scale;
            selectedBox.x += offsetX / imgWidth;
            selectedBox.y += offsetY / imgHeight;
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
            const endX = event.clientX - rect.left;
            const endY = event.clientY - rect.top;

            drawingBox.width = (endX - startX) / state.scale / imgWidth;
            drawingBox.height = (endY - startY) / state.scale / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);

            ctx.strokeStyle = 'black';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.strokeRect(
                startX,
                startY,
                drawingBox.width * imgWidth * state.scale,
                drawingBox.height * imgHeight * state.scale
            );
            ctx.setLineDash([]);
        } else {
            let cursorSet = false;
            state.boxes.forEach(box => {
                const scaledX = box.x * imgWidth * state.scale + state.originX;
                const scaledY = box.y * imgHeight * state.scale + state.originY;
                const scaledWidth = box.width * imgWidth * state.scale;
                const scaledHeight = box.height * imgHeight * state.scale;

                const topLeftHandle = { x: scaledX, y: scaledY };
                const topRightHandle = { x: scaledX + scaledWidth, y: scaledY };
                const bottomLeftHandle = { x: scaledX, y: scaledY + scaledHeight };
                const bottomRightHandle = { x: scaledX + scaledWidth, y: scaledY + scaledHeight };

                if (isInsideHandle(mouseX, mouseY, topLeftHandle.x, topLeftHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'nw-resize');
                    cursorSet = true;
                } else if (isInsideHandle(mouseX, mouseY, topRightHandle.x, topRightHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'ne-resize');
                    cursorSet = true;
                } else if (isInsideHandle(mouseX, mouseY, bottomLeftHandle.x, bottomLeftHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'sw-resize');
                    cursorSet = true;
                } else if (isInsideHandle(mouseX, mouseY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'se-resize');
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
        selectedBox = null;
        resizeHandle = null;
        isDrawing = false;
        drawingBox = null;
        changeCursor(imageCanvas, 'default');
    });
}
