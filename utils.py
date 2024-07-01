from reportlab.lib.pagesizes import A3, A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image, ImageFilter
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
        gap = (form.gap.data or 10) * mm
        offset_number_position = (form.offset_number_position.data or 0) * mm
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
            c.drawString((x + img_width / 2) + offset_number_position, y + padding, str(number)) # Number position in x
            number += 1
            x += img_width + gap + padding * 2
            
        c.save()
        return pdf_path

def generate_outline_pdf(image_path, form):
    width, height = get_paper_size(form.paper_size.data) # Default to A4
    if form.paper_size.data == 'Custom': # Use custom paper size if selected
        width = (form.custom_width.data or 297) # Default to A4 width
        height = (form.custom_height.data or 210) # Default to A4 height

    outline_pdf_path = os.path.splitext(image_path)[0] + '_outline.pdf' # Output path for the outline PDF
    c = canvas.Canvas(outline_pdf_path, pagesize=landscape((width, height))) # Create a canvas for the outline PDF
    
    margin_top = 15 * mm
    margin_bottom = 15 * mm
    margin_left = 37 * mm
    margin_right = 17 * mm

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

    image = Image.open(image_path)  # Open the image
    alpha = image.split()[-1]  # Get the alpha channel
    
# Create an image to hold the alpha channel with a transparent background
    contour_image = Image.new('L', image.size, 0)
    contour_image.paste(alpha, mask=alpha)  # Paste the alpha channel

    # Detect edges in the alpha channel
    edges = contour_image.filter(ImageFilter.FIND_EDGES)

    # Convert edges to black lines on a transparent background
    final_image = Image.new('RGBA', image.size, (0, 0, 0, 0))
    final_image.paste(Image.new('RGBA', image.size, (0, 0, 0, 255)), mask=edges)
    # Invert the image
    final_image = Image.composite(final_image, Image.new('RGBA', image.size, (255, 255, 255, 255)), edges)
    temp_image_path = os.path.splitext(image_path)[0] + '_temp.png'
    final_image.save(temp_image_path)  # Save the image
    
    # Set form mode to 'Page' for generating outline PDF
    original_mode = form.mode.data
    form.mode.data = 'Page'
    outline_pdf_path = generate_pdf(temp_image_path, form)
    form.mode.data = original_mode  # Restore the original mode
    
   # os.remove(temp_image_path)
    return outline_pdf_path
