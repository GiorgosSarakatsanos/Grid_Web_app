import { setupCanvasEvents } from './canvas-events.js';
import { setupEventHandlers } from './event-handlers.js';
import { setupZoomEvents } from './zoom-events.js';
import { state } from './shared-state.js';
import { toggleFields } from './ui-controls.js'; // Correctly import toggleFields
import './form-submission.js';

document.addEventListener('DOMContentLoaded', () => {
    setupCanvasEvents();  // Initialize canvas events
    setupEventHandlers(); // Initialize other event handlers
    setupZoomEvents();    // Initialize zoom events

    // New button for switching modes
    const modeSwitchButton = document.getElementById('mode-switch');
    let isNumberingMode = false;

    modeSwitchButton.addEventListener('click', () => {
        isNumberingMode = !isNumberingMode;
        if (isNumberingMode) {
            modeSwitchButton.style.backgroundColor = 'lightblue';
            modeSwitchButton.innerText = 'Με αρίθμηση';
            document.getElementById('mode_numbering').checked = true;
            state.mode = 'Numbering';
        } else {
            modeSwitchButton.style.backgroundColor = '';
            modeSwitchButton.innerText = 'Μία σελίδα';
            document.getElementById('mode_page').checked = true;
            state.mode = 'Page';
        }
        // Trigger change event to update the fields
        toggleFields();
        // Log the updated mode state
        console.log("Current mode:", state.mode);
    });

    // Initial call to set correct visibility
    toggleFields();
});
