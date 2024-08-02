from PIL import Image, ImageDraw, ImageFont

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

    return image

# Example usage
# image = Image.open("path/to/your/image.jpg")
# boxes = [{'x': 0.1, 'y': 0.1, 'width': 0.5, 'height': 0.5}, ...]
# texts = [{'x': 0.1, 'y': 0.1, 'fontSize': 12, 'rotation': 0, 'content': 'Hello'}, ...]
# image_with_boxes = draw_boxes(image, boxes)
# image_with_texts = draw_text(image_with_boxes, texts)
# image_with_texts.save("path/to/your/output_image.jpg")
