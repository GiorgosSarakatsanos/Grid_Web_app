import { setupEventHandlers } from './event-handlers.js';
import { setupZoomEvents } from './zoom-events.js';
import './form-submission.js';
import './ui-controls.js';

document.addEventListener('DOMContentLoaded', () => {
    setupEventHandlers(); // Initialize other event handlers
    setupZoomEvents();    // Initialize zoom events
});
