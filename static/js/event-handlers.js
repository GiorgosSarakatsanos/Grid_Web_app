import { setupImageEvents } from './image-events.js';
import { setupCanvasEvents } from './canvas-events.js';
import { setupZoomEvents } from './zoom-events.js';
import { toggleFields } from './ui-controls.js'; // Import toggleFields

export function setupEventHandlers() {
    setupImageEvents();
    setupCanvasEvents();
    setupZoomEvents();

    // Ensure toggleFields is called on mode change and initial setup
    document.querySelectorAll('input[name="mode"]').forEach(field =>
        field.addEventListener('change', toggleFields)
    );
    document.getElementById('paper_size').addEventListener('change', toggleFields);
    document.getElementById('img_size').addEventListener('change', toggleFields);

    toggleFields(); // Initial call to set correct visibility
}
