import { setupCanvasEvents } from '../app/static/js/canvas-events';
import { state } from '../app/static/js/shared-state';

describe('Canvas Event Handlers', () => {
    let imageCanvas;
    let drawButton;
    let contextMenu;
    let deleteBoxOption;
    let cancelMenuOption;
    let ctx;

    beforeEach(() => {
        document.body.innerHTML = `
            <canvas id="image-canvas"></canvas>
            <button id="add-box"></button>
            <div id="context-menu">
                <button id="delete-box"></button>
                <button id="cancel-menu"></button>
            </div>
        `;
        imageCanvas = document.getElementById('image-canvas');
        drawButton = document.getElementById('add-box');
        contextMenu = document.getElementById('context-menu');
        deleteBoxOption = document.getElementById('delete-box');
        cancelMenuOption = document.getElementById('cancel-menu');
        ctx = imageCanvas.getContext('2d');

        setupCanvasEvents();
    });

    test('should initialize canvas events', () => {
        expect(imageCanvas).toBeDefined();
        expect(drawButton).toBeDefined();
        expect(contextMenu).toBeDefined();
        expect(deleteBoxOption).toBeDefined();
        expect(cancelMenuOption).toBeDefined();
    });

    test('should start drawing mode on button click', () => {
        drawButton.click();
        imageCanvas.dispatchEvent(new MouseEvent('mousedown', { offsetX: 50, offsetY: 50 }));
        expect(state.boxes.length).toBe(0);
        imageCanvas.dispatchEvent(new MouseEvent('mousemove', { offsetX: 100, offsetY: 100 }));
        imageCanvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(state.boxes.length).toBe(1);
    });

    test('should show context menu on right-clicking a box', () => {
        state.boxes.push({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 });
        const event = new MouseEvent('contextmenu', { offsetX: 50, offsetY: 50 });
        imageCanvas.dispatchEvent(event);
        expect(contextMenu.style.display).toBe('block');
    });

    test('should delete a box on delete box option click', () => {
        state.boxes.push({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 });
        const event = new MouseEvent('contextmenu', { offsetX: 50, offsetY: 50 });
        imageCanvas.dispatchEvent(event);
        deleteBoxOption.click();
        expect(state.boxes.length).toBe(0);
    });

    test('should cancel context menu on cancel option click', () => {
        state.boxes.push({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 });
        const event = new MouseEvent('contextmenu', { offsetX: 50, offsetY: 50 });
        imageCanvas.dispatchEvent(event);
        cancelMenuOption.click();
        expect(contextMenu.style.display).toBe('none');
    });
});
