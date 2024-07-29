// debug-logger.js

export function logBoxSummary(boxData) {
    console.log('Box Data Summary:');
    boxData.forEach((box, index) => {
        console.log(`Box ${index + 1}:`);
        console.log(`  Position X: ${box.position_x}`);
        console.log(`  Position Y: ${box.position_y}`);
        console.log(`  Size X: ${box.size_x}`);
        console.log(`  Size Y: ${box.size_y}`);
    });
}

export function logTextSummary(textData) {
    console.log('Text Data Summary:');
    textData.forEach((text, index) => {
        console.log(`Text ${index + 1}:`);
        console.log(`  Position X: ${text.position_x}`);
        console.log(`  Position Y: ${text.position_y}`);
        console.log(`  Content: ${text.content}`);
        console.log(`  Font Size: ${text.font_size}`);
        console.log(`  Rotation: ${text.rotation}`);
    });
}

export function debugLog(message, ...args) {
    console.debug(message, ...args);
}

export function errorLog(message, ...args) {
    console.error(message, ...args);
}
