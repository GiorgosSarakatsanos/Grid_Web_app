from PIL import Image, ImageDraw, ImageFont

def process_image(image_path, boxes, texts, output_path):
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    # Draw boxes on the image
    for box in boxes:
        x = box['x'] * image.width
        y = box['y'] * image.height
        width = box['width'] * image.width
        height = box['height'] * image.height
        draw.rectangle([x, y, x + width, y + height], outline="red", width=3)

    # Draw texts on the image
    for text in texts:
        x = text['x'] * image.width
        y = text['y'] * image.height
        font_size = text['fontSize']
        rotation = text['rotation']
        content = text['content']

        # Load a font
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

        # Rotate text
        text_image = Image.new('RGBA', (image.width, image.height), (255, 255, 255, 0))
        text_draw = ImageDraw.Draw(text_image)
        text_draw.text((x, y), content, fill="black", font=font)
        rotated_text_image = text_image.rotate(rotation, expand=1)

        # Composite the rotated text onto the original image
        image = Image.alpha_composite(image.convert('RGBA'), rotated_text_image)

    # Save the processed image
    image.save(output_path)

# Example function call
# process_image("input_image_path.jpg", boxes, texts, "output_image_path.jpg")
