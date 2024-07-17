import { drawImageWithBoxes } from './canvas-operations.js';
import { state } from './shared-state.js';

export function setupImageEvents() {
    const imageInput = document.getElementById('image');
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                state.img.onload = () => {
                    const containerWidth = 400;
                    const containerHeight = 600;

                    const widthScale = containerWidth / state.img.width;
                    const heightScale = containerHeight / state.img.height;
                    state.scale = Math.min(widthScale, heightScale);

                    state.originX = (containerWidth - state.img.width * state.scale) / 2;
                    state.originY = (containerHeight - state.img.height * state.scale) / 2;

                    imageCanvas.width = state.img.width;
                    imageCanvas.height = state.img.height;

                    drawImageWithBoxes(ctx, state.img, state.originX, state.originY, state.scale, state.boxes);
                };
                state.img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}
