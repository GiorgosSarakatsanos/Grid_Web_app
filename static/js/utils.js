// utils.js
export function getScaleRatio(wheelDelta) {
    return wheelDelta < 0 ? 1.1 : 0.9;  // Determine zoom scale ratio based on wheel direction
}

export function adjustOrigin(origin, mouseX, scaleRatio) {
    return mouseX - (mouseX - origin) * scaleRatio;  // Adjust canvas origin for zoom and pan
}
