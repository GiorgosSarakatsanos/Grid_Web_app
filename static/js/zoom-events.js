import { drawImageWithBoxes } from './canvas-operations.js';
import { state } from './shared-state.js';

export function setupZoomEvents() {
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');

    // Zoom in event
    document.getElementById('zoom-in').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 1.1;

        const newScale = state.scale * wheel;
        const scaleRatio = newScale / state.scale;

        state.originX = mouseX - (mouseX - state.originX) * scaleRatio;
        state.originY = mouseY - (mouseY - state.originY) * scaleRatio;

        state.scale = newScale;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
    });

    // Zoom out event
    document.getElementById('zoom-out').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 0.9;

        const newScale = state.scale * wheel;
        const scaleRatio = newScale / state.scale;

        state.originX = mouseX - (mouseX - state.originX) * scaleRatio;
        state.originY = mouseY - (mouseY - state.originY) * scaleRatio;

        state.scale = newScale;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
    });

    // Zoom with mouse wheel
    imageCanvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        const wheel = event.deltaY < 0 ? 1.1 : 0.9;

        const newScale = state.scale * wheel;
        const scaleRatio = newScale / state.scale;

        state.originX = mouseX - (mouseX - state.originX) * scaleRatio;
        state.originY = mouseY - (mouseY - state.originY) * scaleRatio;

        state.scale = newScale;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
    });
}
