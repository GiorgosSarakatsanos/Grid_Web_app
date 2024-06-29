from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image
import os

def mm_to_points(mm):
    return mm * 2.83465

def get_paper_size(size):
    sizes = {
        'C3': (458, 324),
        'A3': (420, 297),
        'A4': (297, 210),
        'Custom': None,
    }
    return sizes.get(size, (458, 324))  # Default to C3 if size not found

def generate_pdf(image_path, form):
    image = Image.open(image_path)
    width, height = get_paper_size(form.paper_size.data)
    if form.paper_size.data == 'Custom':
        width = form.custom_width.data
        height = form.custom_height.data

    pdf_path = os.path.splitext(image_path)[0] + '_grid.pdf'
    c = canvas.Canvas(pdf_path, pagesize=landscape((width, height)))
    
    margin_bottom = 15
    margin_top = 15
    margin_left = 37
    margin_right = 17
    gap_mm = form.gap.data
    gap_pts = mm_to_points(gap_mm)
    paper_width_mm, paper_height_mm = form.paper_size.data
    img_width_mm = form.img_width_mm.data
    img_height_mm = form.img_height_mm.data
    img_width_pts = mm_to_points(img_width_mm)
    img_height_pts = mm_to_points(img_height_mm)

    paper_width_pts = mm_to_points(paper_width_mm)
    paper_height_pts = mm_to_points(paper_height_mm)

    # Calculate the available space for images on the page, in points
    available_width_pts = paper_width_pts - mm_to_points(margin_right + margin_left)
    available_height_pts = paper_height_pts - mm_to_points(margin_bottom + margin_top)

    # Adjust calculations to account for gaps between images
    columns = int((available_width_pts + gap_pts) / (img_width_pts + gap_pts))
    rows = int((available_height_pts + gap_pts) / (img_height_pts + gap_pts))
    
    # Calculate the actual gap between images   
    gap_x = (available_width_pts - columns * img_width_pts) / (columns - 1)
    gap_y = (available_height_pts - rows * img_height_pts) / (rows - 1)
    
    # Calculate the starting point for the first image
    start_x = margin_left
    start_y = margin_bottom
    
    for i in range(rows):
        for j in range(columns):
            x = start_x + j * (img_width_pts + gap_x)
            y = start_y + i * (img_height_pts + gap_y)
            c.drawImage(image_path, x, y, img_width_pts, img_height_pts)
            
    c.save()    
    return pdf_path

    