from reportlab.lib.pagesizes import A3, A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image
import os

def get_paper_size(size):
    sizes = {
        'C3': (458 * mm, 324 * mm),
        'A3': A3,
        'A4': A4,
        'Custom': None,
    }
    return sizes.get(size, A4)

def generate_pdf(image_path, form):
    image = Image.open(image_path)
    width, height = get_paper_size(form.paper_size.data)
    if form.paper_size.data == 'Custom':
        width = form.custom_width.data * mm
        height = form.custom_height.data * mm

    pdf_path = os.path.splitext(image_path)[0] + '_grid.pdf'
    c = canvas.Canvas(pdf_path, pagesize=landscape((width, height)))
    
    margin_top_bottom = 15 * mm
    margin_left = 37 * mm
    margin_right = 17 * mm
    gap = form.gap.data * mm

    img_width, img_height = image.size
    img_width = img_width * mm / 72
    img_height = img_height * mm / 72

    x = margin_left
    y = height - margin_top_bottom - img_height

    while y > margin_top_bottom:
        while x + img_width < width - margin_right:
            c.drawImage(image_path, x, y, width=img_width, height=img_height)
            x += img_width + gap
        y -= img_height + gap
        x = margin_left
    
    c.save()
    return pdf_path

def generate_outline_pdf(image_path, form):
    width, height = get_paper_size(form.paper_size.data)
    if form.paper_size.data == 'Custom':
        width = form.custom_width.data * mm
        height = form.custom_height.data * mm

    outline_pdf_path = os.path.splitext(image_path)[0] + '_outline.pdf'
    c = canvas.Canvas(outline_pdf_path, pagesize=landscape((width, height)))
    
    margin_top_bottom = 15 * mm
    margin_left = 37 * mm
    margin_right = 17 * mm

    # Draw corner lines
    corner_line_length = 50 * mm
    line_thickness = 3  # Adjust as needed
    c.setLineWidth(line_thickness)

    # Top-left corner
    c.line(margin_left, height - margin_top_bottom, margin_left + corner_line_length, height - margin_top_bottom)
    c.line(margin_left, height - margin_top_bottom, margin_left, height - margin_top_bottom - corner_line_length)

    # Top-right corner
    c.line(width - margin_right, height - margin_top_bottom, width - margin_right - corner_line_length, height - margin_top_bottom)
    c.line(width - margin_right, height - margin_top_bottom, width - margin_right, height - margin_top_bottom - corner_line_length)

    # Bottom-left corner
    c.line(margin_left, margin_top_bottom, margin_left + corner_line_length, margin_top_bottom)
    c.line(margin_left, margin_top_bottom, margin_left, margin_top_bottom + corner_line_length)

    # Bottom-right corner
    c.line(width - margin_right, margin_top_bottom, width - margin_right - corner_line_length, margin_top_bottom)
    c.line(width - margin_right, margin_top_bottom, width - margin_right, margin_top_bottom + corner_line_length)

    # Draw the outline of the image
    image = Image.open(image_path)
    image = image.convert("RGBA")
    datas = image.getdata()

    new_data = []
    for item in datas:
        if item[3] == 0:
            new_data.append((255, 255, 255, 255))
        else:
            new_data.append(item)
    image.putdata(new_data)
    image.save("temp_image.png")

    c.drawImage("temp_image.png", margin_left, margin_top_bottom, width=image.width * mm / 72, height=image.height * mm / 72, mask='auto')

    c.save()
    os.remove("temp_image.png")
    return outline_pdf_path
