from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image, ImageFilter

import os
from PyPDF2 import PdfReader, PdfWriter

def get_paper_size(size, custom_width=None, custom_height=None):
    sizes = {
        '255x235': (255 * mm, 235 * mm),
        '255x210': (255 * mm, 210 * mm),
        '487x330': (487 * mm, 330 * mm),
        '350x330': (350 * mm, 330 * mm),
        'A3': (420 * mm, 297 * mm),
        'A4': (297 * mm, 210 * mm),
        'Custom': (custom_width, custom_height)
    }
    if size == 'Custom' and custom_width and custom_height:
        return (custom_width * mm, custom_height * mm)
    return sizes.get(size, (297 * mm, 210 * mm))

def img_size(size, custom_width=None, custom_height=None):
    sizes = {
        'Sticker': (60 * mm, 90 * mm),
        'Card': (85 * mm, 55 * mm),
        'Square': (55 * mm, 55 * mm),
        'Custom': (custom_width, custom_height)
    }
    if size == 'Custom' and custom_width and custom_height:
        return (custom_width * mm, custom_height * mm)
    return sizes.get(size, (85 * mm, 55 * mm))



# Constants for margin sizes (assuming mm is defined/imported)
CUTTER_STANDARD = (15, 37, 15, 17)
NARROW_MARGIN = (5, 2, 5, 2)
DEFAULT_MARGIN = CUTTER_STANDARD

# Margin options function
def margin_options(size, custom_margin_top=None, custom_margin_right=None, custom_margin_bottom=None, custom_margin_left=None):
    sizes = {
        'cutter standard': CUTTER_STANDARD,
        'narrow margin': NARROW_MARGIN,
        'Custom': (custom_margin_top or 4, custom_margin_right or 4, custom_margin_bottom or 4, custom_margin_left or 4)
    }
    margins = sizes.get(size.lower(), DEFAULT_MARGIN)
    return tuple(margin * mm for margin in margins)

def generate_pdf(image_path: str, form):
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

    if mode == 'Page':
        width, height = get_paper_size(form.paper_size.data)
        if form.paper_size.data == 'Custom':
            width = (form.custom_paper_width.data * mm  or 297 * mm)
            height = (form.custom_paper_height.data * mm  or 210 * mm)

        pdf_path = os.path.splitext(image_path)[0] + '_grid.pdf'
        c = canvas.Canvas(pdf_path, pagesize=landscape((width, height)))

        margins = margin_options(form.margin_options.data, 
                                form.custom_margin_top.data, 
                                form.custom_margin_right.data, 
                                form.custom_margin_bottom.data, 
                                form.custom_margin_left.data)
        margin_top, margin_right, margin_bottom, margin_left = margins
        
        padding = (form.padding.data or 0) * mm
        gap = (form.gap.data or 0) * mm

        x = margin_left + padding
        y = height - margin_top - img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)[1] - padding
        
        while y > margin_bottom:
            while x + img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)[0] < width - margin_right:
                c.drawImage(temp_image_path, x, y, width=img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)[0], height=img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)[1])
                x += img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)[0] + gap + padding * 2
            y -= img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)[1] + gap + padding * 2
            x = margin_left + padding

        c.save()
        os.remove(temp_image_path)
        return pdf_path

    if mode == 'Numbering':
        start_number = form.start_number.data or 1
        end_number = form.end_number.data or 10
        width, height = get_paper_size(form.paper_size.data)
        if form.paper_size.data == 'Custom':
            width = (form.custom_paper_width.data * mm or 297 * mm)
            height = (form.custom_paper_height.data * mm  or 210 * mm)

        pdf_path = os.path.splitext(image_path)[0] + '_numbering.pdf'
        c = canvas.Canvas(pdf_path, pagesize=landscape((width, height)))

        margin_left = (form.custom_margin_left.data or 37) * mm
        margin_right = (form.custom_margin_right.data or 17) * mm
        margin_top = (form.custom_margin_top.data or 15) * mm
        margin_bottom = (form.custom_margin_bottom.data or 15) * mm
        padding = (form.padding.data or 0) * mm
        gap = (form.gap.data or 0) * mm
        font_size = (form.font_size.data or 8)

        offset_number_y = (form.offset_number_x.data or 0) * mm
        offset_number_x = (form.offset_number_y.data or 0) * mm
        
        img_width, img_height = img_size(form.img_size.data) # define image size
        if form.img_size.data == 'Custom':  # add custom image size
            img_width = (form.custom_image_width.data or 85) * mm
            img_height = (form.custom_image_height.data or 55) * mm

        x = margin_left + padding   # Initial ud/down position
        y = height - margin_top - img_height - padding # Initial left right position
        number = start_number # Initial number
        
        

        while number <= end_number:
            if y <= margin_bottom:
                c.showPage()
                y = height - margin_top - img_height - padding # Reset y position
            if x + img_width >= width - margin_right: # Check if image exceeds the right margin
                x = margin_left + padding # Reset x position
                y -= img_height + gap + padding * 2 # Move to the next line
                if y <= margin_bottom: # Check if image exceeds the bottom margin
                    c.showPage() # Show the next page
                    y = height - margin_top - img_height - padding  # Reset y position
            c.drawImage(temp_image_path, x, y, width=img_width, height=img_height) # Draw the image
            c.setFont("Times-Roman", form.font_size.data)  # Set font to Times New Roman, size 8
            c.drawString(x + offset_number_x, y + offset_number_y, str(number))   # Draw the number
            number += 1 # Increment the number
            x += img_width + gap + padding * 2 # Move to the next column

        c.save()
        os.remove(temp_image_path)
        return pdf_path


def generate_outline_pdf(image_path: str, form):
    width, height = get_paper_size(form.paper_size.data, form.custom_paper_width.data, form.custom_paper_height.data)
    if form.paper_size.data == 'Custom':  # Use custom paper size if selected
        width, height = get_paper_size(form.paper_size.data, form.custom_paper_width.data, form.custom_paper_height.data)
        img_width, img_height = img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)
    # Path for the corner lines PDF
    corner_lines_pdf_path = os.path.splitext(image_path)[0] + '_corner_lines.pdf'
    c = canvas.Canvas(corner_lines_pdf_path, pagesize=landscape((width, height)))  # Create a canvas for the corner lines

    
    # Get margins using margin_options
    margins = margin_options(form.margin_options.data, 
                            form.custom_margin_top.data, 
                            form.custom_margin_right.data, 
                            form.custom_margin_bottom.data, 
                            form.custom_margin_left.data)
    margin_top, margin_right, margin_bottom, margin_left = margins

    # Draw corner lines
    corner_line_length = 50
    line_thickness = 3  # Adjust as needed
    c.setLineWidth(line_thickness)

    # Top-left corner
    c.line(margin_left, height - margin_top, margin_left, height - margin_top - corner_line_length)
    c.line(margin_left, height - margin_top, margin_left + corner_line_length, height - margin_top)

    # Top-right corner
    c.line(width - margin_right, height - margin_top, width - margin_right - corner_line_length, height - margin_top)
    c.line(width - margin_right, height - margin_top, width - margin_right, height - margin_top - corner_line_length)

    # Bottom-left corner
    c.line(margin_left, margin_bottom, margin_left + corner_line_length, margin_bottom)
    c.line(margin_left, margin_bottom, margin_left, margin_bottom + corner_line_length)

    # Bottom-right corner
    c.line(width - margin_right, margin_bottom, width - margin_right - corner_line_length, margin_bottom)
    c.line(width - margin_right, margin_bottom, width - margin_right, margin_bottom + corner_line_length)

    c.save()  # Save the canvas for corner lines

    # Generate the main content PDF
    image = Image.open(str(image_path))  # Open the image
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

    os.remove(temp_image_path)

    # Merge the corner lines PDF with the outline PDF
    merged_pdf_path = os.path.splitext(image_path)[0] + '_merged_outline.pdf'
    pdf_writer = PdfWriter()

    # Read the PDFs
    with open(str(corner_lines_pdf_path), 'rb') as f1, open(str(outline_pdf_path), 'rb') as f2:
        corner_lines_pdf = PdfReader(f1)
        outline_pdf = PdfReader(f2)

        # Assuming both PDFs have the same number of pages
        for page_num in range(len(outline_pdf.pages)):
            outline_page = outline_pdf.pages[page_num]
            corner_lines_page = corner_lines_pdf.pages[page_num]
            outline_page.merge_page(corner_lines_page)
            pdf_writer.add_page(outline_page)
    
        # Write the merged PDF to a file
        with open(merged_pdf_path, 'wb') as out_f:
            pdf_writer.write(out_f)

    # Clean up temporary files
    os.remove(str(corner_lines_pdf_path))
    os.remove(str(outline_pdf_path))

    return merged_pdf_path
