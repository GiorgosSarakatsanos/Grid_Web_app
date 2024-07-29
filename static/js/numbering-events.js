// numbering-events.js
import { drawImageWithBoxes } from './canvas-operations.js';
import { state } from './shared-state.js';

export function setupNumberingEvents(ctx, imageCanvas) {
    const numberingPositionButton = document.getElementById('set-numbering-position');
    let canSetNumbering = false;

    numberingPositionButton.addEventListener('click', () => {
        canSetNumbering = !canSetNumbering;
        numberingPositionButton.classList.toggle('active');
    });

    function handleMouseDown(event) {
        if (canSetNumbering) {
            const imgWidth = state.img.width;
            const imgHeight = state.img.height;
            state.numberingPosition = {
                x: (event.offsetX - state.originX) / (imgWidth * state.scale),
                y: (event.offsetY - state.originY) / (imgHeight * state.scale)
            };
            canSetNumbering = false;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
        }
    }

    imageCanvas.addEventListener('mousedown', handleMouseDown);
}
