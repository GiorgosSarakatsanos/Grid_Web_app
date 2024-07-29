// mode-events.js
import { state } from './shared-state.js';
import { toggleFields } from './ui-controls.js';
import { debugLog } from './debug-logger.js';

export function setupModeSwitchButton() {
    const modeSwitchButton = document.getElementById('mode-switch');
    let isNumberingMode = false;

    modeSwitchButton.addEventListener('click', () => {
        isNumberingMode = !isNumberingMode;
        if (isNumberingMode) {
            modeSwitchButton.style.backgroundColor = 'lightblue';
            modeSwitchButton.innerText = 'Mode Numbering';
            state.mode = 'Numbering';
        } else {
            modeSwitchButton.style.backgroundColor = '';
            modeSwitchButton.innerText = 'Mode Page';
            state.mode = 'Page';
        }
        toggleFields();
        debugLog("Current mode:", state.mode);
    });
}

export function setupDrawBoxButton() {
    const drawBoxButton = document.getElementById('add-box');
    let canDrawBox = false;

    drawBoxButton.addEventListener('click', () => {
        canDrawBox = !canDrawBox;
        if (canDrawBox) {
            activateButton(drawBoxButton);
        } else {
            deactivateAllButtons();
        }
    });
}

export function setupAddTextButton() {
    const addTextButton = document.getElementById('add-text');
    let canAddText = false;

    addTextButton.addEventListener('click', () => {
        canAddText = !canAddText;
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
}

export function setupSetNumberingPositionButton() {
    const setNumberingPositionButton = document.getElementById('set-numbering-position');
    let isSettingNumberingPosition = false;

    setNumberingPositionButton.addEventListener('click', () => {
        isSettingNumberingPosition = !isSettingNumberingPosition;
        if (isSettingNumberingPosition) {
            activateButton(setNumberingPositionButton);
        } else {
            deactivateAllButtons();
        }
    });
}

export function setupEscapeKeyHandler() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            deactivateAllButtons();
            switchToPageMode();
        }
    });
}

function activateButton(button) {
    const buttons = [
        document.getElementById('mode-switch'),
        document.getElementById('set-numbering-position'),
        document.getElementById('add-text'),
        document.getElementById('add-box')
    ];
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
    const buttons = [
        document.getElementById('mode-switch'),
        document.getElementById('set-numbering-position'),
        document.getElementById('add-text'),
        document.getElementById('add-box')
    ];
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.disabled = false;
    });
}

function switchToPageMode() {
    const modeSwitchButton = document.getElementById('mode-switch');
    modeSwitchButton.style.backgroundColor = '';
    modeSwitchButton.innerText = 'Mode Page';
    document.getElementById('mode_page').checked = true;
    state.mode = 'Page';
    toggleFields();
    debugLog("Current mode:", state.mode);
}
