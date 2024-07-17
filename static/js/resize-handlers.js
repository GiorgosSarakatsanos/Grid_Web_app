export function isInsideHandle(x, y, handleX, handleY, handleSize) {
    return x >= handleX - handleSize / 2 && x <= handleX + handleSize / 2 &&
           y >= handleY - handleSize / 2 && y <= handleY + handleSize / 2;
}
