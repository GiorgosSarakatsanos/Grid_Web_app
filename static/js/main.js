// main.js
import { setupCanvasEvents } from './canvas-events.js';
import { setupEventHandlers } from './event-handlers.js';
import { setupZoomEvents } from './zoom-events.js';
import { state } from './shared-state.js';
import { toggleFields } from './ui-controls.js';
import { drawImageWithBoxes } from './canvas-operations.js';
import { populateBoxFields } from './box-handlers.js';
import './form-submission.js';

document.addEventListener('DOMContentLoaded', () => {
    setupCanvasEvents();  // Initialize canvas events
    setupEventHandlers(); // Initialize other event handlers
    setupZoomEvents();    // Initialize zoom events

    // Example box data to populate the form
    const exampleBoxData = [
        { position_x: 0.12, position_y: 0.19, size_x: 0.56, size_y: 0.08 }
    ];
    populateBoxFields(exampleBoxData);

    const modeSwitchButton = document.getElementById('mode-switch');
    const setNumberingPositionButton = document.getElementById('set-numbering-position');
    const addTextButton = document.getElementById('add-text');
    const drawBoxButton = document.getElementById('add-box');
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');
    let isNumberingMode = false;
    let isSettingNumberingPosition = false;
    let canAddText = false;
    let canDrawBox = false;

    const buttons = [modeSwitchButton, setNumberingPositionButton, addTextButton, drawBoxButton];

    function activateButton(button) {
        buttons.forEach(btn => {
            if (btn === button) {
                btn.classList.add('active');
                btn.disabled = false;
            } else {
                btn.classList.remove('active');
                btn.disabled = true;
            }
        });
    }

    function deactivateAllButtons() {
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.disabled = false;
        });
    }

    drawBoxButton.addEventListener('click', () => {
        canDrawBox = !canDrawBox; // Toggle the drawing mode
        if (canDrawBox) {
            activateButton(drawBoxButton);
        } else {
            deactivateAllButtons();
        }
    });

    addTextButton.addEventListener('click', () => {
        canAddText = !canAddText; // Toggle the add text mode
        if (canAddText) {
            activateButton(addTextButton);
            const textInputContainer = document.getElementById('add-text-input-container');
            textInputContainer.style.display = 'block';
        } else {
            deactivateAllButtons();
            const textInputContainer = document.getElementById('add-text-input-container');
            textInputContainer.style.display = 'none';
        }
    });

    setNumberingPositionButton.addEventListener('click', () => {
        isSettingNumberingPosition = !isSettingNumberingPosition; // Toggle the numbering position mode
        if (isSettingNumberingPosition) {
            activateButton(setNumberingPositionButton);
        } else {
            deactivateAllButtons();
        }
    });

    modeSwitchButton.addEventListener('click', () => {
        isNumberingMode = !isNumberingMode;
        if (isNumberingMode) {
            switchToNumberingMode();
            activateButton(modeSwitchButton);
        } else {
            switchToPageMode();
            deactivateAllButtons();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            isSettingNumberingPosition = false;
            canAddText = false;
            canDrawBox = false;
            deactivateAllButtons();
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
            // Draw the image with boxes and the numbering position
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
        } else if (canAddText) {
            const rect = imageCanvas.getBoundingClientRect();
            const x = (event.clientX - rect.left - state.originX) / (state.img.width * state.scale);
            const y = (event.clientY - rect.top - state.originY) / (state.img.height * state.scale);
            drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes, state.texts);
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
