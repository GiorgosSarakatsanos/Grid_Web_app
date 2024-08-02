import { state } from './shared-state.js';

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Update the hidden input fields with the current state
    const boxDataInput = document.getElementById('box_data');
    const textDataInput = document.getElementById('text_data');

    if (boxDataInput && textDataInput) {
        boxDataInput.value = JSON.stringify(state.boxes);
        textDataInput.value = JSON.stringify(state.texts);
    } else {
        console.error('Box data or text data input fields are missing');
        return;
    }

    const formData = new FormData(this); // Use FormData to handle file upload

    // Log the FormData content to verify it before sending
    console.log("FormData content:", Array.from(formData.entries()));

    fetch('/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('input[name="csrf_token"]').value
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob(); // Expecting a binary response (image)
    })
    .then(blob => {
        // Create a URL for the image
        const imageUrl = URL.createObjectURL(blob);
        // Display the image or provide a download link
        const img = document.createElement('img');
        img.src = imageUrl;
        document.body.appendChild(img); // Append image to body (or handle it as needed)
        console.log('Image successfully received and displayed.');
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        alert(`Error submitting form: ${error.message}`);
    });
});
