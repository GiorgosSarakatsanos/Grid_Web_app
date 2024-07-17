import { drawImageWithBoxes } from './canvas-operations.js';
import { setNumberingPosition } from './canvas-operations.js';
import { toggleFields } from './ui-controls.js'; // Import toggleFields
import { state } from './shared-state.js';

export function setupBoxHandlers() {
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');

    document.getElementById('add-box').addEventListener('click', () => {
        const box = { x: 50, y: 50, width: 100, height: 100 };
        state.boxes.push(box);
        drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
    });

    window.setNumberingPosition = function(event) {
        if (document.querySelector('input[name="mode"]:checked').value !== 'Numbering') {
            return; // Exit if the mode is not "Numbering"
        }

        setNumberingPosition(event, ctx, state.img, state.originX, state.originY, state.scale);
    };

    document.querySelectorAll('input[name="mode"]').forEach(field =>
        field.addEventListener('change', toggleFields)
    );

    document.querySelectorAll('input[name="mode"]').forEach(field =>
        field.addEventListener('change', toggleFields)
    );

    document.getElementById('paper_size').addEventListener('change', toggleFields);
    document.getElementById('img_size').addEventListener('change', toggleFields);

    toggleFields(); // Initial call to set correct visibility
}
