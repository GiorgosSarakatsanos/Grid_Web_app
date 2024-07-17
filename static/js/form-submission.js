     // AJAX form submission
     document.getElementById('upload-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        var formData = new FormData(this);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.action, true);

        xhr.setRequestHeader('X-CSRFToken', document.querySelector('input[name="csrf_token"]').value); // Add CSRF token header

        xhr.onload = function() {
            if (xhr.status === 200) {
                // Handle success response
                var response = JSON.parse(xhr.responseText);
                var mergedPdfPath = response.merged_pdf_path;
                // Handle the response as needed, e.g., updating the DOM with the response data
                // Example: Display the merged PDF link
                var pdfPreview = document.querySelector('.pdf-preview');
                pdfPreview.innerHTML = `<iframe src="${mergedPdfPath}" frameborder="0"></iframe>`;
            } else {
                // Handle error response
                console.error('Form submission failed');
            }
        };

        xhr.send(formData);
    });
