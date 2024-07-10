from flask import Flask, render_template, send_file, session, redirect, url_for
from forms import ImageForm
from utils import generate_pdf  # Import generate_pdf
from corners import generate_corner_lines
from PyPDF2 import PdfReader, PdfWriter
from werkzeug.utils import secure_filename

from dotenv import load_dotenv
from flask_cors import CORS
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Get environment variables
app.config['DEBUG'] = os.environ['FLASK_DEBUG']

app.config['SECRET_KEY'] = 'your_secret_key'
app.config['UPLOAD_FOLDER'] = 'static/uploads/'

@app.route('/', methods=['GET', 'POST'])
def index():
    form = ImageForm()
    if form.validate_on_submit():
        image = form.image.data
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(image.filename))
        image.save(image_path)

        # Extract relative numbering position ONLY if mode is 'Numbering'
        if form.mode.data == 'Numbering':
            rel_x = float(form.numbering_position_x.data)
            rel_y = float(form.numbering_position_y.data)
        else:
            rel_x = 0.0  # Default to 0.0 if not in Numbering mode
            rel_y = 0.0

        # Generate PDF
        grid_images_path = generate_pdf(image_path, form, rel_x, rel_y)
        corner_lines_path = generate_corner_lines(image_path, form)

        # Merge the corner lines PDF with the images grid PDF
        merged_pdf_path = os.path.splitext(image_path)[0] + '_merged_corner_lines.pdf'
        pdf_writer = PdfWriter()

        # Read the PDFs
        with open(str(grid_images_path), 'rb') as f1, open(str(corner_lines_path), 'rb') as f2:
            grid_pdf = PdfReader(f1)
            corner_lines_pdf = PdfReader(f2)

            # Get the first page of corner lines
            corner_lines_page = corner_lines_pdf.pages[0]

            # Merge each page of the grid with the corner lines page
            for page_num in range(len(grid_pdf.pages)):
                grid_page = grid_pdf.pages[page_num]
                grid_page.merge_page(corner_lines_page)
                pdf_writer.add_page(grid_page)

            # Write the merged PDF to a file
            with open(merged_pdf_path, 'wb') as out_f:
                pdf_writer.write(out_f)

        # Clean up temporary files
        os.remove(str(corner_lines_path))
        os.remove(str(grid_images_path))  # Remove the generated grid PDF
        os.remove(str(image_path))  # Remove the generated grid PDF

         # Pass the merged_pdf_path to the template
        return render_template('index.html', form=form, merged_pdf_path=merged_pdf_path)

    return render_template('index.html', form=form)

@app.route('/download/<filename>')
def download(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

if __name__ == '__main__':
    app.run()
