# image_processing.py
from PIL import Image, ImageDraw, ImageFont

def process_image_with_texts(image_path, boxes, texts, output_path):
    # Open the image
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    # Draw boxes
    for box in boxes:
        x = box['x'] * image.width
        y = box['y'] * image.height
        width = box['width'] * image.width
        height = box['height'] * image.height
        draw.rectangle([x, y, x + width, y + height], outline="red", width=2)

    # Draw texts
    for text in texts:
        x = text['x'] * image.width
        y = text['y'] * image.height
        font_size = int(text['fontSize'])
        font = ImageFont.truetype("arial.ttf", font_size)
        draw.text((x, y), text['content'], font=font, fill="blue")

    # Save the modified image
    image.save(output_path)
