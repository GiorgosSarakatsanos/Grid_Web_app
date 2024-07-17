// event-handlers.js
import { toggleFields } from './ui-controls.js';
import { drawImage, setNumberingPosition } from './canvas-operations.js';
import { getScaleRatio, adjustOrigin } from './utils.js';

export function setupEventHandlers() {
    const imageInput = document.getElementById('image');
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');
    let img = new Image();
    let scale = 1;
    let originX = 0;
    let originY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.onload = () => {
                    const containerWidth = 400;
                    const containerHeight = 600;

                    const widthScale = containerWidth / img.width;
                    const heightScale = containerHeight / img.height;
                    scale = Math.min(widthScale, heightScale);

                    originX = (containerWidth - img.width * scale) / 2;
                    originY = (containerHeight - img.height * scale) / 2;

                    imageCanvas.width = img.width;
                    imageCanvas.height = img.height;

                    drawImage(ctx, img, originX, originY, scale);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    imageCanvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        const wheel = event.deltaY < 0 ? 1.1 : 0.9;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImage(ctx, img, originX, originY, scale);
    });

    imageCanvas.addEventListener('mousedown', (event) => {
        startX = event.offsetX - originX;
        startY = event.offsetY - originY;
        isDragging = true;
    });

    imageCanvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            originX = event.offsetX - startX;
            originY = event.offsetY - startY;
            drawImage(ctx, img, originX, originY, scale);
        }
    });

    imageCanvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    imageCanvas.addEventListener('mouseout', () => {
        isDragging = false;
    });

    window.setNumberingPosition = function(event) {
        if (document.querySelector('input[name="mode"]:checked').value !== 'Numbering') {
            return; // Exit if the mode is not "Numbering"
        }

        setNumberingPosition(event, ctx, img, originX, originY, scale);
    };

    // Zoom in and zoom out button event listeners
    document.getElementById('zoom-in').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 1.1;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImage(ctx, img, originX, originY, scale);
    });

    document.getElementById('zoom-out').addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 0.9;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImage(ctx, img, originX, originY, scale);
    });

    document.querySelectorAll('input[name="mode"]').forEach(field =>
        field.addEventListener('change', toggleFields)
    );
    document.getElementById('paper_size').addEventListener('change', toggleFields);
    document.getElementById('img_size').addEventListener('change', toggleFields);

    toggleFields(); // Initial call to set correct visibility
}
