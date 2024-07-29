// canvas-events.js
import { drawImageWithBoxes } from './canvas-operations.js';
import { isInsideHandle, changeCursor } from './utils.js';
import { state } from './shared-state.js';
import { logBoxSummary, logTextSummary, debugLog, errorLog } from './debug-logger.js';

export function setupCanvasEvents() {
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');
    let startX = 0;
    let startY = 0;
    let selectedBox = null;
    let selectedText = null;
    let isDrawing = false;
    let drawingBox = null;
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = null;
    let canDraw = false;
    let canAddText = false;
    let canSetNumbering = false;
    let isSpacePressed = false;
    let isMovingImage = false;
    let moveStartX = 0;
    let moveStartY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let newText = null;
    let initialMouseX = 0;
    let initialMouseY = 0;
    let textAdded = false;

    const handleSize = 10;
    const minBoxSize = 20;

    const contextMenu = document.getElementById('context-menu');
    const deleteBoxOption = document.getElementById('delete-box');
    const cancelMenuOption = document.getElementById('cancel-menu');
    let hoveredBox = null;
    let hoveredText = null;
    let highlightedBox = null;
    let highlightedText = null;

    const drawButton = document.getElementById('add-box');
    const addTextButton = document.getElementById('add-text');
    const numberingPositionButton = document.getElementById('set-numbering-position');
    const submitTextButton = document.getElementById('submit-text');
    const textInput = document.getElementById('text-content');
    const rotationInput = document.getElementById('text-rotation');
    const fontSizeInput = document.getElementById('text-font-size');
    const textPositionMessage = document.createElement('div');
    textPositionMessage.textContent = "Τοποθετήστε το κείμενο στην εικόνα";
    textPositionMessage.style.position = 'absolute';
    textPositionMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    textPositionMessage.style.color = 'white';
    textPositionMessage.style.padding = '5px';
    textPositionMessage.style.borderRadius = '3px';
    textPositionMessage.style.display = 'none';
    document.body.appendChild(textPositionMessage);

    fontSizeInput.value = "12";

    const toggleButtons = [drawButton, addTextButton, numberingPositionButton];

    function toggleButton(button) {
        toggleButtons.forEach(btn => {
            if (btn !== button) {
                btn.disabled = !btn.disabled;
            }
        });
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

    addTextButton.addEventListener('click', () => {
        canAddText = !canAddText;
        if (canAddText) {
            toggleButton(addTextButton);
            const textInputContainer = document.getElementById('add-text-input-container');
            textInputContainer.style.display = 'block';
        } else {
            addTextButton.classList.remove('active');
            const textInputContainer = document.getElementById('add-text-input-container');
            textInputContainer.style.display = 'none';
        }
    });

    numberingPositionButton.addEventListener('click', () => {
        canSetNumbering = !canSetNumbering;
        if (canSetNumbering) {
            toggleButton(numberingPositionButton);
        } else {
            numberingPositionButton.classList.remove('active');
        }
    });

    submitTextButton.addEventListener('click', (event) => {
        event.preventDefault();
        const textContent = textInput.value.trim();
        const rotation = parseInt(rotationInput.value, 10);
        const fontSize = parseInt(fontSizeInput.value, 10);
        if (textContent) {
            newText = {
                content: textContent,
                fontSize: fontSize,
                x: 0,
                y: 0,
                rotation: rotation
            };
            debugLog('New text object created:', newText);
            canAddText = true;
            textAdded = false;
            textPositionMessage.style.display = 'block';
        }
        const textInputContainer = document.getElementById('add-text-input-container');
        textInputContainer.style.display = 'none';
    });

    function handleMouseDown(event) {
        if (isSpacePressed) {
            isMovingImage = true;
            moveStartX = event.clientX - state.originX;
            moveStartY = event.clientY - state.originY;
            imageCanvas.style.cursor = 'grabbing';
        } else if (canSetNumbering) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            state.numberingPosition = {
                x: (event.offsetX - state.originX) / (imgWidth * state.scale),
                y: (event.offsetY - state.originY) / (imgHeight * state.scale)
            };
            canSetNumbering = false;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
        } else {
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

            state.texts.forEach(text => {
                const imgWidth = state.img.width;
                const imgHeight = state.img.height;

                const x = text.x * imgWidth * state.scale + state.originX;
                const y = text.y * imgHeight * state.scale + state.originY;
                ctx.font = `${text.fontSize}px Arial`;
                const textWidth = ctx.measureText(text.content).width;
                const textHeight = text.fontSize;

                const topLeftHandle = { x: x, y: y - textHeight };
                const bottomRightHandle = { x: x + textWidth, y: y };

                if (event.offsetX >= topLeftHandle.x && event.offsetX <= bottomRightHandle.x && event.offsetY >= topLeftHandle.y && event.offsetY <= bottomRightHandle.y) {
                    selectedText = text;
                    isDragging = true;
                    dragOffsetX = (event.offsetX - x) / state.scale;
                    dragOffsetY = (event.offsetY - y) / state.scale;
                    debugLog('Dragging text:', selectedText);
                } else if (isInsideHandle(event.offsetX, event.offsetY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                    selectedText = text;
                    resizeHandle = 'bottomRight';
                    isResizing = true;
                    debugLog('Resizing text from bottom-right handle');
                    initialMouseX = event.offsetX;
                    initialMouseY = event.offsetY;
                }
            });

            if (isDragging || isResizing) return;

            if (canDraw) {
                const imgWidth = state.img.width;
                const imgHeight = state.img.height;

                if (!isDrawing && !selectedBox && !isResizing && !selectedText) {
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
    }

    function handleMouseMove(event) {
        if (isMovingImage) {
            state.originX = event.clientX - moveStartX;
            state.originY = event.clientY - moveStartY;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
        } else if (isDrawing) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            const endX = (event.offsetX - state.originX) / state.scale;
            const endY = (event.offsetY - state.originY) / state.scale;

            drawingBox.width = (endX - startX) / imgWidth;
            drawingBox.height = (endY - startY) / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

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
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

            logBoxSummary(state.boxes);
        } else if (isDragging && selectedText) {
            const mouseX = (event.offsetX - state.originX) / state.scale;
            const mouseY = (event.offsetY - state.originY) / state.scale;
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;

            selectedText.x = mouseX / imgWidth - dragOffsetX / imgWidth;
            selectedText.y = mouseY / imgHeight - dragOffsetY / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

            logTextSummary(state.texts);
        } else if (isResizing && selectedText) {
            const mouseX = event.offsetX;
            const mouseY = event.offsetY;

            const deltaX = mouseX - initialMouseX;
            const deltaY = mouseY - initialMouseY;

            if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                if (deltaY > 0) {
                    selectedText.fontSize += 1;
                } else if (deltaY < 0) {
                    selectedText.fontSize -= 1;
                }

                initialMouseX = mouseX;
                initialMouseY = mouseY;
            }

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

            logTextSummary(state.texts);
        } else {
            let cursorSet = false;
            hoveredBox = null;
            hoveredText = null;

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
                    hoveredBox = box;
                    changeCursor(imageCanvas, 'pointer');
                    cursorSet = true;
                }
            });

            state.texts.forEach(text => {
                const x = text.x * state.img.width * state.scale + state.originX;
                const y = text.y * state.img.height * state.scale + state.originY;
                ctx.font = `${text.fontSize}px Arial`;
                const textWidth = ctx.measureText(text.content).width;
                const textHeight = text.fontSize;

                const topLeftHandle = { x: x, y: y - textHeight };
                const bottomRightHandle = { x: x + textWidth, y: y };

                if (isInsideHandle(event.offsetX, event.offsetY, topLeftHandle.x, topLeftHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'nw-resize');
                    cursorSet = true;
                } else if (isInsideHandle(event.offsetX, event.offsetY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                    changeCursor(imageCanvas, 'se-resize');
                    cursorSet = true;
                } else if (event.offsetX >= topLeftHandle.x && event.offsetX <= bottomRightHandle.x && event.offsetY >= topLeftHandle.y && event.offsetY <= bottomRightHandle.y) {
                    hoveredText = text;
                    changeCursor(imageCanvas, 'pointer');
                    cursorSet = true;
                }
            });

            if (!cursorSet) {
                changeCursor(imageCanvas, 'default');
            }

            if (canAddText) {
                textPositionMessage.style.left = `${event.pageX + 10}px`;
                textPositionMessage.style.top = `${event.pageY + 10}px`;
            }
        }
    }

    function handleMouseUp(event) {
        if (isMovingImage) {
            isMovingImage = false;
            imageCanvas.style.cursor = 'grab';
        } else if (isDragging) {
            isDragging = false;
            selectedBox = null;
            selectedText = null;
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

        if (canAddText && !textAdded && newText) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            newText.x = (event.offsetX - state.originX) / (imgWidth * state.scale);
            newText.y = (event.offsetY - state.originY) / (imgHeight * state.scale);
            state.texts.push(newText);
            debugLog('Text added to state:', newText);
            newText = null;
            canAddText = false;
            textAdded = true;
            textPositionMessage.style.display = 'none';
        }

        isResizing = false;
        resizeHandle = null;
        selectedBox = null;
        selectedText = null;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

        logBoxSummary(state.boxes);
        logTextSummary(state.texts);
    }

    function handleMouseOut() {
        isDrawing = false;
        drawingBox = null;
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
        selectedBox = null;
        selectedText = null;
        changeCursor(imageCanvas, 'default');
    }

    function handleContextMenu(event) {
        debugLog('Context menu event:', event);
        event.preventDefault();
        if (hoveredBox) {
            highlightedBox = hoveredBox;
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.display = 'block';
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts, highlightedBox);
        } else if (hoveredText) {
            highlightedText = hoveredText;
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.display = 'block';
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts, null, highlightedText);
        }
    }

    imageCanvas.addEventListener('mousedown', handleMouseDown);
    imageCanvas.addEventListener('mousemove', handleMouseMove);
    imageCanvas.addEventListener('mouseup', handleMouseUp);
    imageCanvas.addEventListener('mouseout', handleMouseOut);
    imageCanvas.addEventListener('contextmenu', handleContextMenu);

    deleteBoxOption.addEventListener('click', () => {
        debugLog('Delete box option clicked');
        if (highlightedBox) {
            state.boxes = state.boxes.filter(box => box !== highlightedBox);
            highlightedBox = null;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
            logBoxSummary(state.boxes);
            contextMenu.style.display = 'none';
        } else if (highlightedText) {
            state.texts = state.texts.filter(text => text !== highlightedText);
            highlightedText = null;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
            logTextSummary(state.texts);
            contextMenu.style.display = 'none';
        }
    });

    cancelMenuOption.addEventListener('click', () => {
        debugLog('Cancel menu option clicked');
        contextMenu.style.display = 'none';
        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
    });

    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !isSpacePressed) {
            isSpacePressed = true;
            imageCanvas.style.cursor = 'grab';
        } else if (event.code === 'Escape') {
            debugLog('Escape key pressed');
            canDraw = false;
            drawButton.classList.remove('active');
            canAddText = false;
            addTextButton.classList.remove('active');
            canSetNumbering = false;
            numberingPositionButton.classList.remove('active');
            textPositionMessage.style.display = 'none';
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.code === 'Space' && isSpacePressed) {
            isSpacePressed = false;
            imageCanvas.style.cursor = 'default';
            isMovingImage = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    setupCanvasEvents();
});
