document.addEventListener('DOMContentLoaded', function() {
    const modeSelect = document.querySelector('#mode'); // Assuming the ID of the mode select field is 'mode'
    const numberingFields = document.querySelector('#numbering-fields');

    function toggleNumberingFields() {
        if (modeSelect.value === 'Numbering') {
            numberingFields.style.display = 'block';
        } else {
            numberingFields.style.display = 'none';
        }
    }

    modeSelect.addEventListener('change', toggleNumberingFields);
    toggleNumberingFields(); // Initial call to set the correct display based on the current mode selection
});