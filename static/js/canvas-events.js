// Import necessary functions and state
import { drawImageWithBoxes } from './canvas-operations.js';
import { isInsideHandle, changeCursor } from './resize-handlers.js';
import { state } from './shared-state.js';

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
    let isSpacePressed = false;
    let isMovingImage = false;
    let moveStartX = 0;
    let moveStartY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let newText = null;
    let isPositioningText = false;

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
    const submitTextButton = document.getElementById('submit-text'); // Assuming a button element with id 'submit-text'
    const textInput = document.getElementById('text-content'); // Assuming an input element with id 'text-content'
    const textPositionMessage = document.createElement('div');
    textPositionMessage.textContent = "Τοποθετήστε το κείμενο στην εικόνα";
    textPositionMessage.style.position = 'absolute';
    textPositionMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    textPositionMessage.style.color = 'white';
    textPositionMessage.style.padding = '5px';
    textPositionMessage.style.borderRadius = '3px';
    textPositionMessage.style.display = 'none';
    document.body.appendChild(textPositionMessage);

    drawButton.addEventListener('click', () => {
        canDraw = !canDraw; // Toggle the drawing mode
        if (canDraw) {
            drawButton.style.backgroundColor = 'lightblue'; // Optional: Change button style to indicate active state
        } else {
            drawButton.style.backgroundColor = ''; // Reset button style
        }
    });

    addTextButton.addEventListener('click', () => {
        const textInputContainer = document.getElementById('add-text-input-container');
        textInputContainer.style.display = 'block';
    });

    submitTextButton.addEventListener('click', () => {
        const textContent = textInput.value.trim();
        if (textContent) {
            newText = {
                content: textContent,
                fontSize: 16,
                x: 0,
                y: 0
            };
            canAddText = true;
            textPositionMessage.style.display = 'block';
        }
        const textInputContainer = document.getElementById('add-text-input-container');
        textInputContainer.style.display = 'none';
    });

    function handleMouseDown(event) {
        if (event.button === 2) return; // Ignore right-clicks for dragging/resizing
        if (event.button !== 0) return; // Only respond to left-clicks

        if (isSpacePressed) {
            isMovingImage = true;
            moveStartX = event.clientX - state.originX;
            moveStartY = event.clientY - state.originY;
            imageCanvas.style.cursor = 'grabbing';
        } else if (canAddText) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            newText.x = (event.offsetX - state.originX) / (imgWidth * state.scale);
            newText.y = (event.offsetY - state.originY) / (imgHeight * state.scale);
            state.texts.push(newText);
            newText = null;
            canAddText = false;
            textPositionMessage.style.display = 'none';
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
            logTextSummary();
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
                const bottomRightHandle = { x: scaledX + scaledWidth, y: scaledHeight };

                if (isInsideHandle(event.offsetX, event.offsetY, topLeftHandle.x, topLeftHandle.y, handleSize)) {
                    selectedBox = box;
                    resizeHandle = 'topLeft';
                    isResizing = true;
                    console.debug('Resizing from top-left handle');
                } else if (isInsideHandle(event.offsetX, event.offsetY, topRightHandle.x, topRightHandle.y, handleSize)) {
                    selectedBox = box;
                    resizeHandle = 'topRight';
                    isResizing = true;
                    console.debug('Resizing from top-right handle');
                } else if (isInsideHandle(event.offsetX, event.offsetY, bottomLeftHandle.x, bottomLeftHandle.y, handleSize)) {
                    selectedBox = box;
                    resizeHandle = 'bottomLeft';
                    isResizing = true;
                    console.debug('Resizing from bottom-left handle');
                } else if (isInsideHandle(event.offsetX, event.offsetY, bottomRightHandle.x, bottomRightHandle.y, handleSize)) {
                    selectedBox = box;
                    resizeHandle = 'bottomRight';
                    isResizing = true;
                    console.debug('Resizing from bottom-right handle');
                } else if (event.offsetX >= scaledX && event.offsetX <= scaledX + scaledWidth && event.offsetY >= scaledY && event.offsetY <= scaledY + scaledHeight) {
                    selectedBox = box;
                    isDragging = true;
                    dragOffsetX = (event.offsetX - scaledX) / state.scale;
                    dragOffsetY = (event.offsetY - scaledY) / state.scale;
                    console.debug('Dragging box:', selectedBox);
                }
            });

            state.texts.forEach(text => {
                const imgWidth = state.img.width;
                const imgHeight = state.img.height;

                const x = text.x * imgWidth * state.scale + state.originX;
                const y = text.y * imgHeight * state.scale + state.originY;
                const textWidth = ctx.measureText(text.content).width;
                const textHeight = text.fontSize;

                const topLeftHandle = { x: x, y: y - textHeight };
                const bottomRightHandle = { x: x + textWidth, y: y };

                if (event.offsetX >= topLeftHandle.x && event.offsetX <= bottomRightHandle.x && event.offsetY >= topLeftHandle.y && event.offsetY <= bottomRightHandle.y) {
                    selectedText = text;
                    isDragging = true;
                    dragOffsetX = (event.offsetX - x) / state.scale;
                    dragOffsetY = (event.offsetY - y) / state.scale;
                    console.debug('Dragging text:', selectedText);
                }
            });

            if (isDragging) return;

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
                    console.debug('Started drawing new box:', drawingBox);
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

            // Log and send box data to Flask
            logBoxSummary();
        } else if (isDragging && selectedText) {
            const mouseX = (event.offsetX - state.originX) / state.scale;
            const mouseY = (event.offsetY - state.originY) / state.scale;
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;

            selectedText.x = mouseX / imgWidth - dragOffsetX / imgWidth;
            selectedText.y = mouseY / imgHeight - dragOffsetY / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

            // Log and send text data to Flask
            logTextSummary();
        } else if (isResizing && selectedBox) {
            const mouseX = (event.offsetX - state.originX) / state.scale;
            const mouseY = (event.offsetY - state.originY) / state.scale;

            const imgWidth = state.img.width;
            const imgHeight = state.img.height;

            switch (resizeHandle) {
                case 'topLeft':
                    selectedBox.width += selectedBox.x - mouseX / imgWidth;
                    selectedBox.height += selectedBox.y - mouseY / imgHeight;
                    selectedBox.x = mouseX / imgWidth;
                    selectedBox.y = mouseY / imgHeight;
                    break;
                case 'topRight':
                    selectedBox.width = mouseX / imgWidth - selectedBox.x;
                    selectedBox.height += selectedBox.y - mouseY / imgHeight;
                    selectedBox.y = mouseY / imgHeight;
                    break;
                case 'bottomLeft':
                    selectedBox.width += selectedBox.x - mouseX / imgWidth;
                    selectedBox.x = mouseX / imgWidth;
                    selectedBox.height = mouseY / imgHeight - selectedBox.y;
                    break;
                case 'bottomRight':
                    selectedBox.width = mouseX / imgWidth - selectedBox.x;
                    selectedBox.height = mouseY / imgHeight - selectedBox.y;
                    break;
            }

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

            // Log and send box data to Flask
            logBoxSummary();
        } else if (isResizing && selectedText) {
            const mouseX = (event.offsetX - state.originX) / state.scale;
            const mouseY = (event.offsetY - state.originY) / state.scale;
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;

            switch (resizeHandle) {
                case 'topLeft':
                    selectedText.fontSize += selectedText.y - mouseY / imgHeight;
                    selectedText.y = mouseY / imgHeight;
                    break;
                case 'bottomRight':
                    selectedText.fontSize = mouseY / imgHeight - selectedText.y;
                    break;
            }

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

            // Log and send text data to Flask
            logTextSummary();
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
                console.debug('Box too small, not adding to state');
            } else {
                const boxExists = state.boxes.some(box =>
                    box.x === drawingBox.x &&
                    box.y === drawingBox.y &&
                    box.width === drawingBox.width &&
                    box.height === drawingBox.height
                );

                if (!boxExists) {  // Ensure the box is not added twice
                    state.boxes.push(drawingBox);
                    console.debug('Box added to state:', drawingBox);
                }
            }
            isDrawing = false;
            drawingBox = null;
        }

        isResizing = false;
        resizeHandle = null;
        selectedBox = null;
        selectedText = null;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

        // Log and send box data to Flask
        logBoxSummary();
        logTextSummary();

        // Log and send box data to Flask
        const boxData = state.boxes.map(box => ({
            position_x: box.x.toFixed(2),
            position_y: box.y.toFixed(2),
            size_x: box.width.toFixed(2),
            size_y: box.height.toFixed(2)
        }));
        console.log("Box summary:", boxData);
        sendBoxDataToFlask(boxData);
    }

    const modeSwitchButton = document.getElementById('mode-switch');
    let isNumberingMode = false;

    modeSwitchButton.addEventListener('click', () => {
        isNumberingMode = !isNumberingMode;
        if (isNumberingMode) {
            modeSwitchButton.style.backgroundColor = 'lightblue';
            modeSwitchButton.innerText = 'Mode Numbering';
            state.mode = 'Numbering';
        } else {
            modeSwitchButton.style.backgroundColor = '';
            modeSwitchButton.innerText = 'Mode Page';
            state.mode = 'Page';
        }
    });

    function sendBoxDataToFlask(boxData) {
        fetch('/update-boxes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('input[name="csrf_token"]').value // Include CSRF token if needed
            },
            body: JSON.stringify({ boxes: boxData })
        })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error:', error));
    }

    function sendTextDataToFlask(textData) {
        fetch('/update-texts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('input[name="csrf_token"]').value // Include CSRF token if needed
            },
            body: JSON.stringify({ texts: textData })
        })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error:', error));
    }

    function logBoxSummary() {
        const boxData = state.boxes.map(box => ({
            position_x: box.x.toFixed(2),
            position_y: box.y.toFixed(2),
            size_x: box.width.toFixed(2),
            size_y: box.height.toFixed(2)
        }));
        sendBoxDataToFlask(boxData);
    }

    function logTextSummary() {
        const textData = state.texts.map(text => ({
            position_x: text.x.toFixed(2),
            position_y: text.y.toFixed(2),
            content: text.content,
            font_size: text.fontSize
        }));
        sendTextDataToFlask(textData);
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
        console.debug('Context menu event:', event);
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
        console.debug('Delete box option clicked');
        if (highlightedBox) {
            state.boxes = state.boxes.filter(box => box !== highlightedBox);
            highlightedBox = null;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
            // Log and send box data to Flask
            logBoxSummary();
            contextMenu.style.display = 'none';
        } else if (highlightedText) {
            state.texts = state.texts.filter(text => text !== highlightedText);
            highlightedText = null;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
            // Log and send text data to Flask
            logTextSummary();
            contextMenu.style.display = 'none';
        }
    });

    cancelMenuOption.addEventListener('click', () => {
        console.debug('Cancel menu option clicked');
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
            console.debug('Escape key pressed');
            canDraw = false;
            drawButton.style.backgroundColor = ''; // Reset button style
            canAddText = false;
            addTextButton.style.backgroundColor = ''; // Reset button style
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
