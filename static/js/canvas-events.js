// canvas-events.js
import { setupBoxEvents } from './box-events.js';
import { setupTextEvents } from './text-events.js';
import { setupNumberingEvents } from './numbering-events.js';
import { setupMouseKeyEvents } from './mouse-key-events.js';

export function setupCanvasEvents() {
    const imageCanvas = document.getElementById('image-canvas');
    const ctx = imageCanvas.getContext('2d');

    setupBoxEvents(ctx, imageCanvas);
    setupTextEvents(ctx, imageCanvas);
    setupNumberingEvents(ctx, imageCanvas);
    setupMouseKeyEvents(ctx, imageCanvas);
}
