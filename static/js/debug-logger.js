// debug-logger.js
export function logBoxSummary(boxes) {
    console.log("Box Data Summary:");
    boxes.forEach((box, index) => {
        console.log(`Box ${index + 1}:`);
        console.log(`  Position X: ${box.x}`);
        console.log(`  Position Y: ${box.y}`);
        console.log(`  Size X: ${box.width}`);
        console.log(`  Size Y: ${box.height}`);
    });
}

export function logTextSummary(texts) {
    console.log("Text Data Summary:");
    texts.forEach((text, index) => {
        console.log(`Text ${index + 1}:`);
        console.log(`  Position X: ${text.x}`);
        console.log(`  Position Y: ${text.y}`);
        console.log(`  Content: ${text.content}`);
        console.log(`  Font Size: ${text.fontSize}`);
        console.log(`  Rotation: ${text.rotation}`);
    });
}

export function debugLog(...args) {
    console.log(...args);
}

export function errorLog(...args) {
    console.error(...args);
}
