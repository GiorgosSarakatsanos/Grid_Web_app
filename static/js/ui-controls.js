// ui-controls.js
export function toggleFields() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const paperSize = document.getElementById('paper_size').value;
    const imgSize = document.getElementById('img_size').value;
    const numberingFields = document.querySelector('.field-group-numbering');

    numberingFields.style.display = mode === 'Numbering' ? 'block' : 'none';

    document.getElementById('custom_paper_settings').style.display = paperSize === 'Custom' ? 'block' : 'none';
    document.getElementById('custom_paper_width').style.display = paperSize === 'Custom' ? 'block' : 'none';
    document.getElementById('custom_paper_height').style.display = paperSize === 'Custom' ? 'block' : 'none';
    document.getElementById('custom_image_width').style.display = imgSize === 'Custom' ? 'block' : 'none';
    document.getElementById('custom_image_height').style.display = imgSize === 'Custom' ? 'block' : 'none';
    document.getElementById('custom_image_settings').style.display = imgSize === 'Custom' ? 'block' : 'none';
}
