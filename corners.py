from reportlab.lib.pagesizes import landscape
from reportlab.pdfgen import canvas
from definitions import get_paper_size, margin_options, img_size
import os

def generate_corner_lines(image_path: str, form):
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

    c.save()
    return corner_lines_pdf_path  # Return the path to the corner lines PDF

