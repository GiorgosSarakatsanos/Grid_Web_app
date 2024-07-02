document.addEventListener('DOMContentLoaded', () => {
    const modeField = document.querySelector('#mode');
    const numberingFields = document.querySelector('#numbering-fields');
    const paperSizeField = document.querySelector('#paper_size');
    const toggleCustomSize = document.querySelector('#toggleCustomSize');
    const imgSizeField = document.querySelector('#img_size');
    const toggleCustomImgSize = document.querySelector('#toggleCustomImgSize');
    const marginField = document.querySelector('#margin');
    const toggleCustomMargins = document.querySelector('#toggleCustomMargins');

    function toggleFields() {
        const mode = modeField.value;
        const paperSize = paperSizeField.value;
        const imgSize = imgSizeField.value;
        const margin = marginField.value;


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
        if (margin === 'Custom') {
            toggleCustomMargins.style.display = 'block';
        } else {
            toggleCustomMargins.style.display = 'none';
        }
        
    }

    modeField.addEventListener('change', toggleFields);
    paperSizeField.addEventListener('change', toggleFields);
    imgSizeField.addEventListener('change', toggleFields);
    marginField.addEventListener('change', toggleFields);


    toggleFields(); // Initial call to set correct visibility
});