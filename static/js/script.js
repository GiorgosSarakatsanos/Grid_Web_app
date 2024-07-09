document.addEventListener('DOMContentLoaded', () => {
    const modeField = document.querySelector('#mode');
    const numberingFields = document.querySelector('#numbering-fields');
    const paperSizeField = document.querySelector('#paper_size');
    const toggleCustomSize = document.querySelector('#toggleCustomSize');
    const imgSizeField = document.querySelector('#img_size');
    const toggleCustomImgSize = document.querySelector('#toggleCustomImgSize');
    const imageInput = document.getElementById('image');
    const imageCanvas = document.getElementById('image-canvas');
    const imageName = document.getElementById('image-name');
    const ctx = imageCanvas.getContext('2d');
    let img = new Image();

    function toggleFields() {
        const mode = modeField.value;
        const paperSize = paperSizeField.value;
        const imgSize = imgSizeField.value;

        if (mode === 'Numbering') {
            numberingFields.style.display = 'block';
        } else {
            numberingFields.style.display = 'none';
        }

        if (paperSize === 'Custom') {
            toggleCustomSize.style.display = 'block';
        } else {
            toggleCustomSize.style.display = 'none';
        }

        if (imgSize === 'Custom') {
            toggleCustomImgSize.style.display = 'block';
        } else {
            toggleCustomImgSize.style.display = 'none';
        }
    }

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img = new Image();
                img.onload = () => {
                    const displayWidth = 200;  // Assuming max-width is 200px
                    const scale = displayWidth / img.width;
                    const displayHeight = img.height * scale;

                    imageCanvas.width = img.width;
                    imageCanvas.height = img.height;
                    imageCanvas.style.width = `${displayWidth}px`;
                    imageCanvas.style.height = `${displayHeight}px`;

                    ctx.drawImage(img, 0, 0, img.width, img.height);
                };
                img.src = e.target.result;
                imageName.textContent = `Εικόνα: ${file.name}`;
            };
            reader.readAsDataURL(file);
        }
    });

    modeField.addEventListener('change', toggleFields);
    paperSizeField.addEventListener('change', toggleFields);
    imgSizeField.addEventListener('change', toggleFields);

    toggleFields(); // Initial call to set correct visibility

    // Function to handle image click and set numbering position
    window.setNumberingPosition = function(event) {
        const rect = imageCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate relative position
        const relX = x / rect.width;
        const relY = y / rect.height;

        document.getElementById('numbering_position_x').value = relX;
        document.getElementById('numbering_position_y').value = relY;

        // Draw green mark on the canvas
        const fontSize = parseFloat(document.querySelector('input[name="font_size"]').value) || 8;
        const markLength = fontSize * 1.5; // Example scaling

        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
        const scaledX = relX * imageCanvas.width;
        const scaledY = relY * imageCanvas.height;
        ctx.strokeStyle = 'green';
        ctx.beginPath();
        ctx.moveTo(scaledX, scaledY - markLength / 2);
        ctx.lineTo(scaledX, scaledY + markLength / 2);
        ctx.stroke();
    };
});
