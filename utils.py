from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image, ImageFilter
from definitions import get_paper_size, img_size, page_margins, mark_margin_top, mark_line_length, mark_margin_bottom
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os

import os
from PyPDF2 import PdfReader, PdfWriter
font_path = os.path.join(os.path.dirname(__file__), 'static', 'fonts', 'Arial.ttf')
pdfmetrics.registerFont(TTFont('Arial', font_path))

def calculate_image_position(width, margin_left, img_width, gap, num_images_horizontal):
    """Calculates the starting x position for the image on the page to center the grid horizontally."""
    total_img_width = num_images_horizontal * img_width + (num_images_horizontal - 1) * gap
    x = (width - total_img_width) / 2
    return x

def generate_pdf_content(c, image_path, form, width, height, margins, gap, img_width, img_height):
    """Generates the PDF content based on the selected mode."""
    margin_top, margin_right, margin_bottom, margin_left = page_margins

    num_images_horizontal = int((width - margin_left - margin_right + gap) / (img_width + gap))

    x = calculate_image_position(width, margin_left, img_width, gap, num_images_horizontal)
    y = height - mark_margin_top - img_height - mark_line_length

    if form.mode.data == 'Page':
        while y > mark_margin_bottom + mark_line_length:
            while x + img_width < width - margin_right:
                c.drawImage(image_path, x, y, width=img_width, height=img_height)
                x += img_width + gap
            y -= img_height + gap
            x = calculate_image_position(width, margin_left, img_width, gap, num_images_horizontal)

    elif form.mode.data == 'Numbering':
        start_number = form.start_number.data or 1
        end_number = form.end_number.data or 10
        font_size = (form.font_size.data or 8)
        offset_number_y = (form.offset_number_x.data or 0) * mm
        offset_number_x = (form.offset_number_y.data or 0) * mm
        reverse_order = form.reverse_order.data

        if reverse_order:
            number = end_number
            step = -1
        else:
            number = start_number
            step = 1

        while (reverse_order and number >= start_number) or (not reverse_order and number <= end_number):
            if y <= mark_margin_bottom + mark_line_length:
                c.showPage()
                y = height - mark_margin_top - mark_line_length - img_height
            if x + img_width >= width - margin_right:
                x = calculate_image_position(width, margin_left, img_width, gap, num_images_horizontal)
                y -= img_height + gap
                if y <= mark_margin_bottom + mark_line_length:
                    c.showPage()
                    y = height - mark_margin_top - mark_line_length - img_height
            c.drawImage(image_path, x, y, width=img_width, height=img_height)
            c.setFont("Arial", font_size)
            c.drawString(x + offset_number_x, y + offset_number_y, str(number))
            number += step
            x += img_width + gap

def generate_pdf(image_path: str, form):
    """Generates the main PDF with images arranged in a grid."""
    mode = form.mode.data

    # Open the image and replace alpha with white if necessary
    image = Image.open(image_path)
    if image.mode in ('RGBA', 'LA'):
        background = Image.new('RGBA', image.size, (255, 255, 255, 255))
        background.paste(image, (0, 0), image)
        image = background.convert('RGB')

    # Save the modified image temporarily
    temp_image_path = os.path.splitext(image_path)[0] + '_temp.jpg'
    image.save(temp_image_path)

    width, height = get_paper_size(form.paper_size.data)
    if form.paper_size.data == 'Custom':
        width = (form.custom_paper_width.data * mm or 297 * mm)
        height = (form.custom_paper_height.data * mm or 210 * mm)

    images_pdf_path = os.path.splitext(image_path)[0] + '_grid_images.pdf'
    c = canvas.Canvas(images_pdf_path, pagesize=landscape((width, height)))

    gap = (form.gap.data or 0) * mm

    img_width, img_height = img_size(form.img_size.data)
    if form.img_size.data == 'Custom':
        img_width = (form.custom_image_width.data or 85) * mm
        img_height = (form.custom_image_height.data or 55) * mm

    generate_pdf_content(c, temp_image_path, form, width, height, page_margins, gap, img_width, img_height)

    c.save()
    os.remove(temp_image_path)
    return images_pdf_path
