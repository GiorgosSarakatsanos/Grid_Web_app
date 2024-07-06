from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image, ImageFilter
from definitions import get_paper_size, margin_options, img_size

import os
from PyPDF2 import PdfReader, PdfWriter

def calculate_image_position(width, height, margin_left, margin_top, img_width, img_height, gap, padding):
    """Calculates the starting position for the image on the page."""
    x = margin_left + padding
    y = height - margin_top - img_height - padding
    return x, y

def generate_pdf_content(c, image_path, form, width, height, margins, gap, padding, img_width, img_height):
    """Generates the PDF content based on the selected mode."""
    margin_top, margin_right, margin_bottom, margin_left = margins
    x, y = calculate_image_position(width, height, margin_left, margin_top, img_width, img_height, gap, padding)

    if form.mode.data == 'Page':
        while y > margin_bottom:
            while x + img_width < width - margin_right:
                c.drawImage(image_path, x, y, width=img_width, height=img_height)
                x += img_width + gap + padding * 2
            y -= img_height + gap + padding * 2
            x = margin_left + padding

    elif form.mode.data == 'Numbering':
        start_number = form.start_number.data or 1
        end_number = form.end_number.data or 10
        font_size = (form.font_size.data or 8)
        offset_number_y = (form.offset_number_x.data or 0) * mm
        offset_number_x = (form.offset_number_y.data or 0) * mm
        number = start_number

        while number <= end_number:
            if y <= margin_bottom:
                c.showPage()
                y = height - margin_top - img_height - padding
            if x + img_width >= width - margin_right:
                x = margin_left + padding
                y -= img_height + gap + padding * 2
                if y <= margin_bottom:
                    c.showPage()
                    y = height - margin_top - img_height - padding
            c.drawImage(image_path, x, y, width=img_width, height=img_height)
            c.setFont("Times-Roman", font_size)
            c.drawString(x + offset_number_x, y + offset_number_y, str(number))
            number += 1
            x += img_width + gap + padding * 2

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

    margins = margin_options(form.margin_options.data,
                            form.custom_margin_top.data,
                            form.custom_margin_right.data,
                            form.custom_margin_bottom.data,
                            form.custom_margin_left.data)

    padding = (form.padding.data or 0) * mm
    gap = (form.gap.data or 0) * mm

    img_width, img_height = img_size(form.img_size.data)
    if form.img_size.data == 'Custom':
        img_width = (form.custom_image_width.data or 85) * mm
        img_height = (form.custom_image_height.data or 55) * mm

    generate_pdf_content(c, temp_image_path, form, width, height, margins, gap, padding, img_width, img_height)

    c.save()
    os.remove(temp_image_path)
    return images_pdf_path


    

    
