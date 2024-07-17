import { setupEventHandlers } from './event-handlers.js';
import './form-submission.js';  // Ensure form submission script is imported
import './ui-controls.js';  // Ensure UI controls script is imported

document.addEventListener('DOMContentLoaded', () => {
    setupEventHandlers();  // Initialize event handlers once the DOM is fully loaded
});
