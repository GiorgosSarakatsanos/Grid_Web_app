// zoom-events.js
import { drawImageWithBoxes } from './canvas-operations.js';
import { state } from './shared-state.js';

export function setupZoomEvents() {
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');
    let zoomTimeout;
    let showingZoomLevel = false;

    function showZoomLevel(mouseX, mouseY, zoomLevel) {
        ctx.save();
        ctx.font = '10px Arial'; // font size
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background
        const text = `Zoom: ${zoomLevel.toFixed(2)}x`;
        const textWidth = ctx.measureText(text).width;
        const padding = 2;

        // Draw the background rectangle
        ctx.fillRect(mouseX, mouseY - 20, textWidth + padding * 2, 24);

        // Draw the zoom level text with better contrast color
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, mouseX + padding, mouseY - 5);
        ctx.restore();
    }

    function hideZoomLevel() {
        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
        showingZoomLevel = false;
    }

    function handleZoom(mouseX, mouseY, wheel) {
        const newScale = state.scale * wheel;
        const scaleRatio = newScale / state.scale;

        state.originX = mouseX - (mouseX - state.originX) * scaleRatio;
        state.originY = mouseY - (mouseY - state.originY) * scaleRatio;

        state.scale = newScale;

        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
        showZoomLevel(mouseX, mouseY, state.scale);

        if (zoomTimeout) {
            clearTimeout(zoomTimeout);
        }

        showingZoomLevel = true;
        zoomTimeout = setTimeout(hideZoomLevel, 1250);
    }

    // Zoom in event
    document.getElementById('zoom-in').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        handleZoom(mouseX, mouseY, 1.1);
    });

    // Zoom out event
    document.getElementById('zoom-out').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        handleZoom(mouseX, mouseY, 0.9);
    });

    // Capture the wheel event at the document level to manage default action
    document.addEventListener('wheel', (event) => {
        if (event.target === imageCanvas) {
            event.preventDefault();
        }
    }, { passive: false });

    // Zoom with mouse wheel
    imageCanvas.addEventListener('wheel', (event) => {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        const wheel = event.deltaY < 0 ? 1.1 : 0.9;
        handleZoom(mouseX, mouseY, wheel);
    });

    // Track mouse movement to update zoom level text position
    imageCanvas.addEventListener('mousemove', (event) => {
        if (showingZoomLevel) {
            const mouseX = event.offsetX;
            const mouseY = event.offsetY;
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
            showZoomLevel(mouseX, mouseY, state.scale);
        }
    });
}
