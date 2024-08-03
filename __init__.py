import os
import logging
import json
from flask import Flask, render_template, send_file, request
from flask_wtf.csrf import CSRFProtect
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from definitions import get_paper_size, img_size, page_margins, mark_margin_top, mark_line_length, mark_margin_bottom, margin_options, mark_line_thickness, mark_margin_left, mark_margin_right
from forms import ImageForm
import numpy as np
import cv2
import shutil

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    csrf = CSRFProtect(app)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your secret key')
    app.config['UPLOAD_FOLDER'] = 'static/uploads/'  # Ensure this folder exists

    font_path = os.path.join(os.path.dirname(__file__), 'static', 'fonts', 'Arial.ttf')
    pdfmetrics.registerFont(TTFont('Arial', font_path))

    return app
