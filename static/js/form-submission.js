import { state } from './shared-state.js';

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    var formData = new FormData(this);
    formData.append('box_data', JSON.stringify(state.boxes)); // Append box data to formData
    formData.append('text_data', JSON.stringify(state.texts)); // Append text data to formData

    fetch('/submit-data', {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('input[name="csrf_token"]').value
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Form submission successful:', data);
        } else {
            console.error('Form submission failed:', data);
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
    });
});
