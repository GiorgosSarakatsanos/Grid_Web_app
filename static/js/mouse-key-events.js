// mouse-key-events.js
import { drawImageWithBoxes } from './canvas-operations.js';
import { state } from './shared-state.js';
import { changeCursor } from './utils.js';

export function setupMouseKeyEvents(ctx, imageCanvas) {
    let isSpacePressed = false;
    let isMovingImage = false;
    let moveStartX = 0;
    let moveStartY = 0;

    function handleMouseDown(event) {
        if (isSpacePressed) {
            isMovingImage = true;
            moveStartX = event.clientX - state.originX;
            moveStartY = event.clientY - state.originY;
            imageCanvas.style.cursor = 'grabbing';
        }
    }

    function handleMouseMove(event) {
        if (isMovingImage) {
            state.originX = event.clientX - moveStartX;
            state.originY = event.clientY - moveStartY;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
        }
    }

    function handleMouseUp() {
        if (isMovingImage) {
            isMovingImage = false;
            imageCanvas.style.cursor = 'grab';
        }
    }

    function handleMouseOut() {
        if (isMovingImage) {
            isMovingImage = false;
            changeCursor(imageCanvas, 'default');
        }
    }

    function handleKeyDown(event) {
        if (event.code === 'Space' && !isSpacePressed) {
            isSpacePressed = true;
            imageCanvas.style.cursor = 'grab';
        } else if (event.code === 'Escape') {
            const drawButton = document.getElementById('add-box');
            const addTextButton = document.getElementById('add-text');
            const numberingPositionButton = document.getElementById('set-numbering-position');
            const textPositionMessage = document.querySelector('div[text-position-message]');

            drawButton.classList.remove('active');
            addTextButton.classList.remove('active');
            numberingPositionButton.classList.remove('active');
            textPositionMessage.style.display = 'none';

            canDraw = false;
            canAddText = false;
            canSetNumbering = false;
        }
    }

    function handleKeyUp(event) {
        if (event.code === 'Space' && isSpacePressed) {
            isSpacePressed = false;
            imageCanvas.style.cursor = 'default';
            isMovingImage = false;
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    imageCanvas.addEventListener('mousedown', handleMouseDown);
    imageCanvas.addEventListener('mousemove', handleMouseMove);
    imageCanvas.addEventListener('mouseup', handleMouseUp);
    imageCanvas.addEventListener('mouseout', handleMouseOut);
}
