document.addEventListener('DOMContentLoaded', () => {
    const modeField = document.querySelectorAll('input[name="mode"]');
    const numberingFields = document.querySelector('.field-group-numbering'); // Updated class for numbering options
    const paperSizeField = document.querySelector('#paper_size');
    const imgSizeField = document.querySelector('#img_size');
    const imageInput = document.getElementById('image');
    const imageCanvas = document.getElementById('image-canvas');
    const imageName = document.getElementById('image-name');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const ctx = imageCanvas.getContext('2d');
    let img = new Image();

    let scale = 1;
    let originX = 0;
    let originY = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    function toggleFields() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const paperSize = paperSizeField.value;
        const imgSize = imgSizeField.value;

        if (mode === 'Numbering') {
            numberingFields.style.display = 'block';
        } else {
            numberingFields.style.display = 'none';
        }

        if (paperSize === 'Custom') {
            document.getElementById('custom_paper_width').style.display = 'block';
            document.getElementById('custom_paper_height').style.display = 'block';
        } else {
            document.getElementById('custom_paper_width').style.display = 'none';
            document.getElementById('custom_paper_height').style.display = 'none';
        }

        if (imgSize === 'Custom') {
            document.getElementById('custom_image_width').style.display = 'block';
            document.getElementById('custom_image_height').style.display = 'block';
        } else {
            document.getElementById('custom_image_width').style.display = 'none';
            document.getElementById('custom_image_height').style.display = 'none';
        }
    }

    function drawImage() {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        ctx.save();
        ctx.translate(originX, originY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
    }

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img = new Image();
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

                    drawImage();
                };
                img.src = e.target.result;
                imageName.textContent = `Εικόνα: ${file.name}`;
            };
            reader.readAsDataURL(file);
        }
    });

    modeField.forEach(field => field.addEventListener('change', toggleFields));
    paperSizeField.addEventListener('change', toggleFields);
    imgSizeField.addEventListener('change', toggleFields);

    toggleFields(); // Initial call to set correct visibility

    imageCanvas.addEventListener('wheel', (event) => {
        if (!event.ctrlKey && !event.metaKey) {
            return;
        }

        event.preventDefault();
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        const wheel = event.deltaY < 0 ? 1.1 : 0.9;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImage();
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
            drawImage();
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

        const rect = imageCanvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - originX) / scale;
        const y = (event.clientY - rect.top - originY) / scale;

        // Calculate relative position
        const relX = x / img.width;
        const relY = y / img.height;

        document.getElementById('numbering_position_x').value = relX;
        document.getElementById('numbering_position_y').value = relY;

        // Draw green mark on the canvas
        const fontSize = parseFloat(document.querySelector('input[name="font_size"]').value) || 8;
        const verticalMarkLength = fontSize * 1.5; // Vertical mark length
        const horizontalMarkLength = verticalMarkLength * 2; // Horizontal mark length

        drawImage(); // Redraw the image before drawing the mark
        const scaledX = relX * img.width * scale + originX;
        const scaledY = relY * img.height * scale + originY;
        ctx.strokeStyle = 'green';
        ctx.beginPath();
        ctx.moveTo(scaledX, scaledY - verticalMarkLength / 2);
        ctx.lineTo(scaledX, scaledY + verticalMarkLength / 2);
        ctx.stroke();
        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(scaledX, scaledY);
        ctx.lineTo(scaledX + horizontalMarkLength, scaledY);
        ctx.stroke();

        // Position numbering text at the top of the horizontal line with 1px padding
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'green';
        ctx.fillText('ΑΡΙΘΜΗΣΗ', scaledX + 2, scaledY - 2);
    };

    // Add event listener to clear the mark when the mode changes from "Numbering" to another mode
    modeField.forEach(field => field.addEventListener('change', () => {
        if (document.querySelector('input[name="mode"]:checked').value !== 'Numbering') {
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            drawImage(); // Redraw the image to clear the mark
        }
    }));

    // Zoom in and zoom out button event listeners
    zoomInButton.addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 1.1;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImage();
    });

    zoomOutButton.addEventListener('click', (event) => {
        event.preventDefault();
        const mouseX = imageCanvas.width / 2;
        const mouseY = imageCanvas.height / 2;
        const wheel = 0.9;

        const newScale = scale * wheel;
        const scaleRatio = newScale / scale;

        originX = mouseX - (mouseX - originX) * scaleRatio;
        originY = mouseY - (mouseY - originY) * scaleRatio;

        scale = newScale;

        drawImage();
    });
});
