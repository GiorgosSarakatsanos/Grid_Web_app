// main.js
import { setupCanvasEvents } from './canvas-events.js';
import { setupBoxEvents } from './box-events.js';
import { setupTextEvents } from './text-events.js';
import { setupNumberingEvents } from './numbering-events.js';
import { setupMouseKeyEvents } from './mouse-key-events.js';
import { setupZoomEvents } from './zoom-events.js';
import { setupImageEvents } from './image-events.js'; // Import setupImageEvents
import { state } from './shared-state.js';
import { toggleFields } from './ui-controls.js';
import { drawImageWithBoxes } from './canvas-operations.js';
import { populateBoxFields } from './box-handlers.js';
import './form-submission.js';
let canvasEventsSetup = false;

document.addEventListener('DOMContentLoaded', () => {
    if (!canvasEventsSetup) {
        setupCanvasEvents();
        canvasEventsSetup = true;
    }

    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');

    setupCanvasEvents();
    setupBoxEvents(ctx, imageCanvas);
    setupTextEvents(ctx, imageCanvas);
    setupNumberingEvents(ctx, imageCanvas);
    setupMouseKeyEvents(ctx, imageCanvas);
    setupZoomEvents();
    setupImageEvents(); // Call setupImageEvents

    // Example box data to populate the form
    const exampleBoxData = [
        { position_x: 0.12, position_y: 0.19, size_x: 0.56, size_y: 0.08 }
    ];
    populateBoxFields(exampleBoxData);

    // Initial call to set correct visibility
    toggleFields();
});
