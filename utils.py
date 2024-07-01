from reportlab.lib.pagesizes import A3, A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image
import os

def mm_to_points(mm):
    return mm * 2.83465

def get_paper_size(size):
    sizes = {
        'C3': (458 * mm, 324 * mm),
        'A3': (420 * mm, 297 * mm),
        'A4': (297 * mm, 210 * mm)
    }
    return sizes.get(size, (458 * mm, 324 * mm))

def img_size(size):
    sizes = {
        'Card': (85 * mm, 55 * mm),
        'Square': (55 * mm, 55 * mm)
    }
    return sizes.get(size, (85 * mm, 55 * mm))

def generate_pdf(image_path, form):
    mode = form.mode.data
    if mode == 'Page':
        image = Image.open(image_path)
        width, height = get_paper_size(form.paper_size.data)
        if form.paper_size.data == 'Custom':
            width = (form.custom_width.data or 297)
            height = (form.custom_height.data or 210)

        pdf_path = os.path.splitext(image_path)[0] + '_grid.pdf'
        c = canvas.Canvas(pdf_path, pagesize=landscape((width, height)))
        
        # Numbers in mm
        margin_bottom = 15  * mm
        margin_top = 15  * mm
        margin_left = 37  * mm
        margin_right = 17  * mm
        padding = 5  * mm
        gap = (form.gap.data or 10)
        
        # define image size
        img_width, img_height = img_size(form.img_size.data)
        
        x = margin_left + padding
        y = height - margin_top - img_height - padding

        while y > margin_bottom:
            while x + img_width < width - margin_right:
                c.drawImage(image_path, x, y, width=img_width, height=img_height)
                x += img_width + gap + padding * 2
            y -= img_height + gap + padding * 2
            x = margin_left + padding
        
        c.save()
        return pdf_path
    
    if mode == 'Numbering':
        start_number = form.start_number.data or 1
        end_number = form.end_number.data or 10
        image = Image.open(image_path)
        width, height = get_paper_size(form.paper_size.data)
        if form.paper_size.data == 'Custom':
            width = (form.custom_width.data or 297)
            height = (form.custom_height.data or 210)

        pdf_path = os.path.splitext(image_path)[0] + '_numbering.pdf'
        c = canvas.Canvas(pdf_path, pagesize=landscape((width, height)))
        
        # Numbers in mm
        margin_bottom = 15  * mm
        margin_top = 15  * mm
        margin_left = 37  * mm
        margin_right = 17  * mm
        padding = 5  * mm
        gap = (form.gap.data or 10)
        
        # define image size
        img_width, img_height = img_size(form.img_size.data)
        
        x = margin_left + padding
        y = height - margin_top - img_height - padding
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
            c.drawString(x + padding, y + padding, str(number))
            number += 1
            x += img_width + gap + padding * 2
        
        c.save()
        return pdf_path

def generate_outline_pdf(image_path, form):
    width, height = get_paper_size(form.paper_size.data)
    if form.paper_size.data == 'Custom':
        width = (form.custom_width.data or 297)
        height = (form.custom_height.data or 210)

    outline_pdf_path = os.path.splitext(image_path)[0] + '_outline.pdf'
    c = canvas.Canvas(outline_pdf_path, pagesize=landscape((width, height)))
    
    margin_top = 15
    margin_bottom = 15
    margin_left = 37
    margin_right = 17

    # Draw corner lines
    corner_line_length = 50
    line_thickness = 3  # Adjust as needed
    c.setLineWidth(line_thickness)

    # Top-left corner
    c.line(margin_left, height - margin_top, margin_left + corner_line_length, height - margin_bottom)
    c.line(margin_left, height - margin_top, margin_left, height - margin_bottom - corner_line_length)

    # Top-right corner
    c.line(width - margin_right, height - margin_top, width - margin_right - corner_line_length, height - margin_bottom)
    c.line(width - margin_right, height - margin_top, width - margin_right, height - margin_bottom - corner_line_length)

    # Bottom-left corner
    c.line(margin_left, margin_top, margin_left + corner_line_length, margin_bottom)
    c.line(margin_left, margin_top, margin_left, margin_bottom + corner_line_length)

    # Bottom-right corner
    c.line(width - margin_right, margin_top, width - margin_right - corner_line_length, margin_bottom)
    c.line(width - margin_right, margin_top, width - margin_right, margin_bottom + corner_line_length)

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
    temp_image_path = "temp_image.png"
    image.save(temp_image_path)

    c.drawImage(temp_image_path, margin_left, margin_top, margin_bottom, mask='auto')

    c.save()
    # os.remove(temp_image_path)
    return outline_pdf_path
