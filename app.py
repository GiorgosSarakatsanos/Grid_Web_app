from flask import Flask, render_template, send_file, request, jsonify, session
from flask_wtf.csrf import CSRFProtect
from forms import ImageForm, DataForm
from utils import generate_pdf
from corners import generate_corner_lines
from image_processing import draw_boxes, draw_text
from PyPDF2 import PdfReader, PdfWriter
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_cors import CORS
import os
import json
from PIL import Image

load_dotenv()

app = Flask(__name__)
CORS(app)
csrf = CSRFProtect(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your secret key')
app.config['UPLOAD_FOLDER'] = 'static/uploads/'  # Ensure this folder exists

@app.route('/', methods=['GET', 'POST'])
def index():
    form = ImageForm()
    if request.method == 'POST' and form.validate_on_submit():
        image = form.image.data
        image_filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)

        # Save the image
        image.save(image_path)
        app.logger.info(f"Image {image_filename} uploaded successfully")

        # Log all form data received
        for key in request.form.keys():
            app.logger.info(f"Form data key: {key}, value: {request.form.get(key)}")

        # Retrieve the box data and text data from form
        box_data = request.form.get('box_data')
        text_data = request.form.get('text_data')

        app.logger.info(f"Box data received: {box_data}")
        app.logger.info(f"Text data received: {text_data}")

        if box_data:
            boxes = json.loads(box_data)
        else:
            boxes = []

        if text_data:
            texts = json.loads(text_data)
        else:
            texts = []

        if not boxes:
            app.logger.info("No box data found.")
        if not texts:
            app.logger.info("No text data found.")

        for idx, box in enumerate(boxes):
            app.logger.info(f"Box {idx + 1}: Position X = {box['x']}, Position Y = {box['y']}, Width = {box['width']}, Height = {box['height']}")

        for idx, text in enumerate(texts):
            app.logger.info(f"Text {idx + 1}: Position X = {text['x']}, Position Y = {text['y']}, Font Size = {text['fontSize']}, Rotation = {text['rotation']}, Content = {text['content']}")

        # Open the image
        image = Image.open(image_path)

        # Draw boxes and text on the image
        image = draw_boxes(image, boxes)
        image = draw_text(image, texts)

        # Save the processed image
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], f"processed_{image_filename}")
        image.save(output_path)
        app.logger.info(f"Processed image saved as {output_path}")

        return send_file(output_path, mimetype='image/png')  # Send the image file as response

    return render_template('index.html', form=form)

if __name__ == '__main__':
    app.run(debug=True)
