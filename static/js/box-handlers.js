// box-handlers.js

import { state } from './shared-state.js';

export function populateBoxFields(boxData) {

    boxData.forEach((box, index) => {
        const boxDiv = document.createElement('div');

        const positionXLabel = document.createElement('label');
        positionXLabel.innerHTML = `Position X: `;
        const positionXInput = document.createElement('input');
        positionXInput.type = 'text';
        positionXInput.name = `boxes-${index}-position_x`;
        positionXInput.value = box.position_x;

        const positionYLabel = document.createElement('label');
        positionYLabel.innerHTML = `Position Y: `;
        const positionYInput = document.createElement('input');
        positionYInput.type = 'text';
        positionYInput.name = `boxes-${index}-position_y`;
        positionYInput.value = box.position_y;

        const sizeXLabel = document.createElement('label');
        sizeXLabel.innerHTML = `Size X: `;
        const sizeXInput = document.createElement('input');
        sizeXInput.type = 'text';
        sizeXInput.name = `boxes-${index}-size_x`;
        sizeXInput.value = box.size_x;

        const sizeYLabel = document.createElement('label');
        sizeYLabel.innerHTML = `Size Y: `;
        const sizeYInput = document.createElement('input');
        sizeYInput.type = 'text';
        sizeYInput.name = `boxes-${index}-size_y`;
        sizeYInput.value = box.size_y;
    });
}
