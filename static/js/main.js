// main.js
import { setupEventHandlers } from './event-handlers.js';
import './form-submission.js';  // Ensure form submission script is imported

document.addEventListener('DOMContentLoaded', () => {
    setupEventHandlers();  // Initialize event handlers once the DOM is fully loaded
});
