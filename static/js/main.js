// main.js
import { setupCanvasEvents } from './canvas-events.js';
import { setupEventHandlers } from './event-handlers.js';
import { setupZoomEvents } from './zoom-events.js';
import { state } from './shared-state.js';
import { toggleFields } from './ui-controls.js';
import { drawImageWithBoxes } from './canvas-operations.js';
import { populateBoxFields } from './box-handlers.js';
import './form-submission.js';
import { setupModeSwitchButton, setupDrawBoxButton, setupAddTextButton, setupSetNumberingPositionButton, setupEscapeKeyHandler } from './mode-events.js';

document.addEventListener('DOMContentLoaded', () => {
    setupCanvasEvents();
    setupEventHandlers();
    setupZoomEvents();

    // Example box data to populate the form
    const exampleBoxData = [
        { position_x: 0.12, position_y: 0.19, size_x: 0.56, size_y: 0.08 }
    ];
    populateBoxFields(exampleBoxData);

    // Setup mode and button event handlers
    setupModeSwitchButton();
    setupDrawBoxButton();
    setupAddTextButton();
    setupSetNumberingPositionButton();
    setupEscapeKeyHandler();

    // Initial call to set correct visibility
    toggleFields();
});
