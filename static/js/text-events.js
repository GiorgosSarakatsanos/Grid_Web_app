// text-events.js
import { drawImageWithBoxes } from './canvas-operations.js';
import { isInsideHandle, changeCursor } from './utils.js';
import { state } from './shared-state.js';
import { logTextSummary, debugLog } from './debug-logger.js';
import { debounce } from './debounce.js';

let selectedText = null;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let initialMouseX = 0;
let initialMouseY = 0;
let newText = null;
let textAdded = false;
let hoveredText = null; // Added variable
const handleSize = 10;

const sendDataToServer = () => {
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
        console.log('JSON response of Text data:', data);
    })
    .catch((error) => {
        console.error('JSON response of Text data:', error);
    });
};

const debouncedSendDataToServer = debounce(sendDataToServer, 500);

export function setupTextEvents(ctx, imageCanvas) {
    const addTextButton = document.getElementById('add-text');
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

    let canAddText = false;

    addTextButton.addEventListener('click', () => {
        canAddText = !canAddText;
        if (canAddText) {
            addTextButton.classList.add('active');
            const textInputContainer = document.getElementById('add-text-input-container');
            textInputContainer.style.display = 'block';
        } else {
            addTextButton.classList.remove('active');
            const textInputContainer = document.getElementById('add-text-input-container');
            textInputContainer.style.display = 'none';
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
            sendDataToServer(); // Send data to the server after updating texts
        }
    }

    function handleMouseMove(event) {
        if (isDragging && selectedText) {
            const mouseX = (event.offsetX - state.originX) / state.scale;
            const mouseY = (event.offsetY - state.originY) / state.scale;
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;

            selectedText.x = mouseX / imgWidth - dragOffsetX / imgWidth;
            selectedText.y = mouseY / imgHeight - dragOffsetY / imgHeight;

            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

            logTextSummary(state.texts);
            debouncedSendDataToServer(); // Use debounced version
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
            sendDataToServer(); // Send data to the server after updating texts
        } else {
            let cursorSet = false;
            hoveredText = null;

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
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
        selectedText = null;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);

        logTextSummary(state.texts);
        sendDataToServer(); // Send data to the server after updating texts
    }

    function handleMouseOut() {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
        selectedText = null;
        changeCursor(imageCanvas, 'default');
    }

    imageCanvas.addEventListener('mousedown', handleMouseDown);
    imageCanvas.addEventListener('mousemove', handleMouseMove);
    imageCanvas.addEventListener('mouseup', handleMouseUp);
    imageCanvas.addEventListener('mouseout', handleMouseOut);
}
