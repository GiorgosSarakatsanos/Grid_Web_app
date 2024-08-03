from __init__ import create_app, Image, ImageDraw, ImageFont, ImageFilter, canvas, landscape, mm, get_paper_size, img_size, page_margins, mark_margin_top, mark_line_length, mark_margin_bottom, mark_line_thickness, mark_margin_left, mark_margin_right, ImageForm, request, secure_filename, send_file, render_template
import os
import json

app = create_app()

def draw_boxes(image, boxes):
    draw = ImageDraw.Draw(image)
    for box in boxes:
        x = box['x'] * image.width
        y = box['y'] * image.height
        width = box['width'] * image.width
        height = box['height'] * image.height
        draw.rectangle([x, y, x + width, y + height], fill="white")
    return image

def draw_text(image, texts):
    draw = ImageDraw.Draw(image)

    # Define the paper size in millimeters (A4 size for example: 210mm x 297mm)
    paper_width_mm = 210
    paper_height_mm = 297

    # Get the image dimensions in pixels
    image_width_px, image_height_px = image.size

    # Calculate the pixel-to-millimeter ratio for both dimensions
    px_to_mm_x = paper_width_mm / image_width_px
    px_to_mm_y = paper_height_mm / image_height_px

    # Use the average of both ratios to ensure consistent scaling
    px_to_mm = (px_to_mm_x + px_to_mm_y) / 2

    for text in texts:
        x = text['x'] * image.width
        y = text['y'] * image.height
        font_size_mm = text['fontSize']  # font size in millimeters
        rotation = text['rotation']
        content = text['content']

        # Convert font size from millimeters to pixels
        font_size_px = font_size_mm / px_to_mm

        # Load a font
        try:
            font = ImageFont.truetype("arial.ttf", int(font_size_px))
        except IOError:
            font = ImageFont.load_default()

        # Rotate text
        text_image = Image.new('RGBA', (image.width, image.height), (255, 255, 255, 0))
        text_draw = ImageDraw.Draw(text_image)
        text_draw.text((x, y), content, fill="black", font=font)
        rotated_text_image = text_image.rotate(rotation, expand=1)

        # Composite the rotated text onto the original image
        image = Image.alpha_composite(image.convert('RGBA'), rotated_text_image)

    return image

def calculate_image_position(width, margin_left, img_width, gap, num_images_horizontal):
    """Calculates the starting x position for the image on the page to center the grid horizontally."""
    total_img_width = num_images_horizontal * img_width + (num_images_horizontal - 1) * gap
    x = (width - total_img_width) / 2
    return x

def generate_pdf_content(c, image_path, form, width, height, margins, gap, img_width, img_height, rel_x, rel_y):
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
        reverse_order = form.reverse_order.data

        if reverse_order:
            number = end_number
            step = -1
        else:
            number = start_number
            step = 1

        # Mirror the vertical coordinate
        mirrored_rel_y = 1 - rel_y

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

            # Convert relative coordinates to absolute positions
            abs_x = x + (rel_x * img_width)
            abs_y = y + (mirrored_rel_y * img_height)

            # Position numbering text at the top of the horizontal line
            c.setFont("Arial", font_size)
            c.drawString(abs_x, abs_y, str(number))  # Adjusted position

            number += step
            x += img_width + gap

def generate_pdf(image_path: str, form, numbering_position_x, numbering_position_y):
    """Generates the main PDF with images arranged in a grid."""
    mode = form.mode.data

    # Open the image and replace alpha with white if necessary
    image = Image.open(image_path)
    if image.mode in ('RGBA', 'LA'):
        background = Image.new('RGBA', image.size, (255, 255, 255, 255))
        background.paste(image, (0, 0), image)
        image = background.convert('RGB')

    # Save the modified image temporarily
    temp_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'contours.png')

    image.save(temp_image_path)

    width, height = get_paper_size(form.paper_size.data)
    if form.paper_size.data == 'Custom':
        width = (form.custom_paper_width.data * mm or 297 * mm)
        height = (form.custom_paper_height.data * mm or 210 * mm)

    images_pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], 'result.pdf')
    c = canvas.Canvas(images_pdf_path, pagesize=landscape((width, height)))

    gap = (form.gap.data or 0) * mm

    img_width, img_height = img_size(form.img_size.data)
    if form.img_size.data == 'Custom':
        img_width = (form.custom_image_width.data or 85) * mm
        img_height = (form.custom_image_height.data or 55) * mm

    generate_pdf_content(c, temp_image_path, form, width, height, page_margins, gap, img_width, img_height, numbering_position_x, numbering_position_y)

    c.save()
    os.remove(temp_image_path)
    return images_pdf_path

def generate_corner_lines(image_path: str, form):
    width, height = get_paper_size(form.paper_size.data, form.custom_paper_width.data, form.custom_paper_height.data)
    if form.paper_size.data == 'Custom':  # Use custom paper size if selected
        width, height = get_paper_size(form.paper_size.data, form.custom_paper_width.data, form.custom_paper_height.data)
        img_width, img_height = img_size(form.img_size.data, form.custom_image_width.data, form.custom_image_height.data)
    # Path for the corner lines PDF
    corner_lines_pdf_path = images_pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], 'corners.pdf')
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

def generate_outlines(image_path, form):
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
    temp_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'edges.png')
    final_image.save(temp_image_path)  # Save the image
    return temp_image_path

@app.route('/', methods=['GET', 'POST'])
def index():
    form = ImageForm()
    if request.method == 'POST' and form.validate_on_submit():
        image = form.image.data
        image_filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'],'uploaded.png')

        # Save the image
        image.save(image_path)
        app.logger.info(f"Image {image_filename} uploaded successfully")

        # Log all form data received
        for key in request.form.keys():
            app.logger.info(f"Form data key: {key}, value: {request.form.get(key)}")

        # Retrieve the box data and text data from form
        box_data = request.form.get('box_data')
        text_data = request.form.get('text_data')

        app.logger.info(f"Box data received: {box_data}")
        app.logger.info(f"Text data received: {text_data}")

        if box_data:
            boxes = json.loads(box_data)
        else:
            boxes = []

        if text_data:
            texts = json.loads(text_data)
        else:
            texts = []

        if not boxes:
            app.logger.info("No box data found.")
        if not texts:
            app.logger.info("No text data found.")

        for idx, box in enumerate(boxes):
            app.logger.info(f"Box {idx + 1}: Position X = {box['x']}, Position Y = {box['y']}, Width = {box['width']}, Height = {box['height']}")

        for idx, text in enumerate(texts):
            app.logger.info(f"Text {idx + 1}: Position X = {text['x']}, Position Y = {text['y']}, Font Size = {text['fontSize']}, Rotation = {text['rotation']}, Content = {text['content']}")

        # Open the image
        image = Image.open(image_path)

        # Draw boxes and text on the image
        image = draw_boxes(image, boxes)
        image = draw_text(image, texts)

        # Save the processed image
        output_path = os.path.join(app.config['UPLOAD_FOLDER'],'processed.png')
        image.save(output_path)
        app.logger.info(f"Processed image saved as {output_path}")

        # Generate PDF from the processed image
        pdf_path = generate_pdf(output_path, form, numbering_position_x=0.5, numbering_position_y=0.5)

        # Generate image with corner lines
        corner_pdf_path = generate_corner_lines(output_path, form)

        # Generate outline image
        outline_image_path = generate_outlines(output_path, form)

        # Generate PDF with outline images
        outline_pdf_path = generate_pdf(outline_image_path, form, numbering_position_x=0.5, numbering_position_y=0.5)

        return send_file(pdf_path, mimetype='application/pdf')  # Send the PDF file as response

    return render_template('index.html', form=form)

if __name__ == '__main__':
    app.run(debug=True)
