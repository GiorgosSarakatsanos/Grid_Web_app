from flask import Flask, render_template, send_file, session, redirect, url_for
from forms import ImageForm
from utils import generate_pdf, generate_outline_pdf
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
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
        
        image.save(image_path)

        # Generate PDFs
        pdf_path = generate_pdf(image_path, form)
        outline_pdf_path = generate_outline_pdf(image_path, form)
        return render_template('index.html', form=form, pdf_path=pdf_path, outline_pdf_path=outline_pdf_path)
    return render_template('index.html', form=form)

@app.route('/download/<filename>')
def download(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

if __name__ == '__main__':
    app.run()
