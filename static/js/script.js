document.addEventListener('DOMContentLoaded', function() {
    const modeSelect = document.querySelector('#mode');
    const numberingFields = document.querySelector('#numbering-fields');
    const paperSizeSelect = document.querySelector('#paper_size');
    const imgSizeSelect = document.querySelector('#img_size');
    const customSizeGroup = document.querySelector('#toggleCustomSize'); // Updated ID reference
    const customImgSizeGroup = document.querySelector('#toggleCustomImgSize'); // Updated ID reference

    function toggleNumberingFields() {
        numberingFields.style.display = modeSelect.value === 'Numbering' ? 'block' : 'none';
    }

    function toggleCustomSize() {
        customSizeGroup.style.display = paperSizeSelect.value === 'Custom' ? 'block' : 'none';
    }

    function toggleCustomImgSize() {
        customImgSizeGroup.style.display = imgSizeSelect.value === 'Custom' ? 'block' : 'none';
    }

    modeSelect.addEventListener('change', toggleNumberingFields);
    paperSizeSelect.addEventListener('change', toggleCustomSize);
    imgSizeSelect.addEventListener('change', toggleCustomImgSize);

    // Initial calls to set the correct display
    toggleNumberingFields();
    toggleCustomSize();
    toggleCustomImgSize();
});