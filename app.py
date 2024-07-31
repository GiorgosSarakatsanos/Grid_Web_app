# app.py
import logging
from flask import Flask, render_template, send_file, request, jsonify, session
from flask_wtf.csrf import CSRFProtect
from forms import ImageForm, DataForm
from utils import generate_pdf
from corners import generate_corner_lines
from image_processing import process_image
from PyPDF2 import PdfReader, PdfWriter
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_cors import CORS
import os
import json

load_dotenv()

app = Flask(__name__)
CORS(app)
csrf = CSRFProtect(app)
app.config['SECRET_KEY'] = 'your_secret_key'

@app.route('/submit-data', methods=['POST'])
def submit_data():
    print("Request received")
    try:
        # Extract form data
        box_data = request.form.get('box_data')
        text_data = request.form.get('text_data')
        print("Form data received: box_data:", box_data, "text_data:", text_data)

        # Convert the received JSON strings back to Python lists
        boxes = json.loads(box_data) if box_data else []
        texts = json.loads(text_data) if text_data else []
        print("Parsed data: boxes:", boxes, "texts:", texts)

        # Log detailed data for debugging
        print("Received box data:", json.dumps(boxes, indent=4))
        print("Received text data:", json.dumps(texts, indent=4))

        response = {
            'status': 'success',
            'message': 'Data received successfully',
        }
        return jsonify(response), 200

    except Exception as e:
        print("Error processing data:", str(e))
        response = {
            'status': 'error',
            'message': 'Failed to process data'
        }
        return jsonify(response), 400


app.config['DEBUG'] = os.environ['FLASK_DEBUG'] == 'True'
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your secret key')
app.config['UPLOAD_FOLDER'] = 'static/uploads/'

# Configure logging
logging.basicConfig(level=logging.DEBUG)
handler = logging.FileHandler('flask_app.log')
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)

@app.route('/', methods=['GET', 'POST'])
def index():
    form = ImageForm()
    if request.method == 'POST' and form.validate_on_submit():
        image = form.image.data
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(image.filename))
        image.save(image_path)

        # Retrieve the box data and text data from session
        boxes = session.get('box_data', [])
        texts = session.get('text_data', [])

        if not boxes:
            print("No box data found in session.")
        if not texts:
            print("No text data found in session.")

        for idx, box in enumerate(boxes):
            print(f"Box {idx + 1}: Position X = {box['x']}, Position Y = {box['y']}, Width = {box['width']}, Height = {box['height']}")

        for idx, text in enumerate(texts):
            print(f"Text {idx + 1}: Content = {text['content']}, Font Size = {text['fontSize']}, X = {text['x']}, Y = {text['y']}, Rotation = {text['rotation']}")

        # Extract relative numbering position ONLY if mode is 'Numbering'
        if form.mode.data == 'Numbering':
            rel_x = float(form.numbering_position_x.data)
            rel_y = float(form.numbering_position_y.data)
        else:
            rel_x = 0.0  # Default to 0.0 if not in Numbering mode
            rel_y = 0.0

        # Draw boxes and texts on image
        boxed_image_path = os.path.splitext(image_path)[0] + '_boxed.png'
        process_image(image_path, boxes, texts, boxed_image_path)

        # Generate PDF with the boxed image
        grid_images_path = generate_pdf(boxed_image_path, form, rel_x, rel_y)
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
        os.remove(str(image_path))  # Remove the uploaded image
        os.remove(str(boxed_image_path))  # Remove the boxed image

        # Clear the session data after processing
        session.pop('box_data', None)
        session.pop('text_data', None)

        # Return the path to the merged PDF in JSON response
        return jsonify({'merged_pdf_path': merged_pdf_path})

    return render_template('index.html', form=form)

@app.route('/download/<filename>')
def download(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

if __name__ == '__main__':
    app.run()
