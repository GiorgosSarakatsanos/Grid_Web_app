import { setupCanvasEvents } from './canvas-events.js';
import { setupEventHandlers } from './event-handlers.js';
import { setupZoomEvents } from './zoom-events.js';
import { state } from './shared-state.js';
import { toggleFields } from './ui-controls.js';
import './form-submission.js';

document.addEventListener('DOMContentLoaded', () => {
    setupCanvasEvents();  // Initialize canvas events
    setupEventHandlers(); // Initialize other event handlers
    setupZoomEvents();    // Initialize zoom events

    const modeSwitchButton = document.getElementById('mode-switch');
    const setNumberingPositionButton = document.getElementById('set-numbering-position');
    const imageCanvas = document.getElementById('image-canvas');
    let isNumberingMode = false;
    let isSettingNumberingPosition = false;

    modeSwitchButton.addEventListener('click', () => {
        isNumberingMode = !isNumberingMode;
        if (isNumberingMode) {
            switchToNumberingMode();
        } else {
            switchToPageMode();
        }
    });

    setNumberingPositionButton.addEventListener('click', () => {
        isSettingNumberingPosition = !isSettingNumberingPosition;
        if (isSettingNumberingPosition) {
            switchToNumberingMode();
            setNumberingPositionButton.style.backgroundColor = 'lightblue';
        } else {
            setNumberingPositionButton.style.backgroundColor = '';
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            isSettingNumberingPosition = false;
            setNumberingPositionButton.style.backgroundColor = '';
            switchToPageMode();
        }
    });

    imageCanvas.addEventListener('click', (event) => {
        if (isSettingNumberingPosition) {
            const rect = imageCanvas.getBoundingClientRect();
            const x = (event.clientX - rect.left - state.originX) / (state.img.width * state.scale);
            const y = (event.clientY - rect.top - state.originY) / (state.img.height * state.scale);
            state.numberingPosition = { x, y };
            document.getElementById('numbering_position_x').value = x;
            document.getElementById('numbering_position_y').value = y;
            console.log(`Numbering position set at (${x}, ${y})`);
            // Optionally, you can keep the button highlighted until ESC is pressed
        }
    });

    function switchToNumberingMode() {
        modeSwitchButton.style.backgroundColor = 'lightblue';
        modeSwitchButton.innerText = 'Mode Numbering';
        document.getElementById('mode_numbering').checked = true;
        state.mode = 'Numbering';
        toggleFields();
        console.log("Current mode:", state.mode);
    }

    function switchToPageMode() {
        modeSwitchButton.style.backgroundColor = '';
        modeSwitchButton.innerText = 'Mode Page';
        document.getElementById('mode_page').checked = true;
        state.mode = 'Page';
        toggleFields();
        console.log("Current mode:", state.mode);
    }

    // Initial call to set correct visibility
    toggleFields();
});
