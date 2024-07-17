// event-handlers.js
import { drawImage, setNumberingPosition, drawImageWithBoxes } from './canvas-operations.js';
import { getScaleRatio, adjustOrigin } from './utils.js';

function isInsideHandle(x, y, handleX, handleY, handleSize) {
    return x >= handleX - handleSize / 2 && x <= handleX + handleSize / 2 &&
           y >= handleY - handleSize / 2 && y <= handleY + handleSize / 2;
}

export function setupEventHandlers() {
    const imageInput = document.getElementById('image');
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');
    let img = new Image();
    let scale = 1;
    let originX = 0;
    let originY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let boxes = [];
    let selectedBox = null;
    let isResizing = false;
    let resizeHandle = null;
    const handleSize = 10;

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.onload = () => {
                    const containerWidth = 400;
                    const containerHeight = 600;

                    const widthScale = containerWidth / img.width;
                    const heightScale = containerHeight / img.height;
                    scale = Math.min(widthScale, heightScale);

                    originX = (containerWidth - img.width * scale) / 2;
                    originY = (containerHeight - img.height * scale) / 2;

                    imageCanvas.width = img.width;
                    imageCanvas.height = img.height;

                    drawImageWithBoxes(ctx, img, originX, originY, scale, boxes);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    imageCanvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        const wheel = event.deltaY < 0 ? 1.1 : 0.9;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImageWithBoxes(ctx, img, originX, originY, scale, boxes);
    });

    imageCanvas.addEventListener('mousedown', (event) => {
        startX = event.offsetX - originX;
        startY = event.offsetY - originY;
        isDragging = true;

        // Check if a box is clicked
        boxes.forEach(box => {
            const scaledX = box.x * scale + originX;
            const scaledY = box.y * scale + originY;
            const scaledWidth = box.width * scale;
            const scaledHeight = box.height * scale;

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
            const offsetX = (event.offsetX - originX) / scale;
            const offsetY = (event.offsetY - originY) / scale;

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
                selectedBox.x = offsetX - startX / scale;
                selectedBox.y = offsetY - startY / scale;
            } else {
                originX = event.offsetX - startX;
                originY = event.offsetY - startY;
            }
            drawImageWithBoxes(ctx, img, originX, originY, scale, boxes);
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

    document.getElementById('add-box').addEventListener('click', () => {
        const box = { x: 50, y: 50, width: 100, height: 100 };
        boxes.push(box);
        drawImageWithBoxes(ctx, img, originX, originY, scale, boxes);
    });

    window.setNumberingPosition = function(event) {
        if (document.querySelector('input[name="mode"]:checked').value !== 'Numbering') {
            return; // Exit if the mode is not "Numbering"
        }

        setNumberingPosition(event, ctx, img, originX, originY, scale);
    };

    // Zoom in and zoom out button event listeners
    document.getElementById('zoom-in').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 1.1;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImageWithBoxes(ctx, img, originX, originY, scale, boxes);
    });

    document.getElementById('zoom-out').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 0.9;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImageWithBoxes(ctx, img, originX, originY, scale, boxes);
    });

    document.querySelectorAll('input[name="mode"]').forEach(field =>
        field.addEventListener('change', toggleFields)
    );
    document.getElementById('paper_size').addEventListener('change', toggleFields);
    document.getElementById('img_size').addEventListener('change', toggleFields);

    toggleFields(); // Initial call to set correct visibility
}
