import { state } from './shared-state.js';

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this); // Use FormData to handle file upload
    formData.append('box_data', JSON.stringify(state.boxes));
    formData.append('text_data', JSON.stringify(state.texts));

    console.log("This data going to server:", state); // Log data before sending

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
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);
        if (data.status === 'success') {
            console.log('Form submission successful:', data);
            // Handle success, e.g., display the path to the merged PDF
            alert(`PDF created successfully: ${data.merged_pdf_path}`);
        } else {
            console.error('Form submission failed:', data);
            alert(`Form submission failed: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        alert(`Error submitting form: ${error.message}`);
    });
});
