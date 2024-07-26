// shared-state.js
export const state = {
    img: new Image(),
    scale: 1,
    originX: 0,
    originY: 0,
    boxes: [], // Each box will have { x: 0, y: 0, width: 0, height: 0 }
    texts: [] // Each text will have { x: 0, y: 0, content: '', fontSize: 16 }
};
