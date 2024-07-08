from reportlab.lib.pagesizes import landscape
from reportlab.pdfgen import canvas
from definitions import get_paper_size, margin_options, img_size, mark_line_length, mark_line_thickness,mark_margin_left, mark_margin_top, mark_margin_right, mark_margin_bottom
import os

def generate_corner_lines(image_path: str, form):
    width, height = get_paper_size(form.paper_size.data, form.custom_paper_width.data, form.custom_paper_height.data)
    if form.paper_size.data == 'Custom':  # Use custom paper size if selected
        width, height = get_paper_size(form.paper_size.data, form.custom_paper_width.data, form.custom_paper_height.data)
        img_width, img_height = img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)
    # Path for the corner lines PDF
    corner_lines_pdf_path = os.path.splitext(image_path)[0] + '_corner_lines.pdf'
    c = canvas.Canvas(corner_lines_pdf_path, pagesize=landscape((width, height)))  # Create a canvas for the corner lines

    # Draw corner lines
    c.setLineWidth(mark_line_thickness)

    # Top-left corner
    c.line(mark_margin_left, height - mark_margin_top, mark_margin_left, height - mark_margin_top - mark_line_length)
    c.line(mark_margin_left, height - mark_margin_top, mark_margin_left + mark_line_length, height - mark_margin_top)

    # Top-right corner
    c.line(width - mark_margin_right, height - mark_margin_top, width - mark_margin_right - mark_line_length, height - mark_margin_top)
    c.line(width - mark_margin_right, height - mark_margin_top, width - mark_margin_right, height - mark_margin_top - mark_line_length)

    # Bottom-left corner
    c.line(mark_margin_left, mark_margin_bottom, mark_margin_left + mark_line_length, mark_margin_bottom)
    c.line(mark_margin_left, mark_margin_bottom, mark_margin_left, mark_margin_bottom + mark_line_length)

    # Bottom-right corner
    c.line(width - mark_margin_right, mark_margin_bottom, width - mark_margin_right - mark_line_length, mark_margin_bottom)
    c.line(width - mark_margin_right, mark_margin_bottom, width - mark_margin_right, mark_margin_bottom + mark_line_length)

    c.save()
    return corner_lines_pdf_path  # Return the path to the corner lines PDF

