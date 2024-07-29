from PIL import Image, ImageDraw, ImageFont

def process_image_with_texts(image_path, boxes, texts, output_path):
    image = Image.open(image_path).convert('RGBA')
    draw = ImageDraw.Draw(image)

    # Draw boxes
    for box in boxes:
        left = box['position_x'] * image.width
        top = box['position_y'] * image.height
        right = left + (box['size_x'] * image.width)
        bottom = top + (box['size_y'] * image.height)
        draw.rectangle([left, top, right, bottom], outline='red', width=3)

    # Draw texts
    for text in texts:
        x = text['x'] * image.width
        y = text['y'] * image.height
        content = text['content']
        font_size = text['font_size']
        rotation = text['rotation']
        font = ImageFont.truetype("arial.ttf", font_size)

        # Rotate and draw the text
        text_image = Image.new('RGBA', image.size, (255, 255, 255, 0))
        text_draw = ImageDraw.Draw(text_image)
        text_draw.text((x, y), content, font=font, fill='black')
        if rotation != 0:
            rotated_text_image = text_image.rotate(rotation, resample=Image.Resampling.BICUBIC, center=(x, y))
            image = Image.alpha_composite(image, rotated_text_image)
        else:
            image = Image.alpha_composite(image, text_image)

    image = image.convert('RGB')  # Convert back to RGB mode before saving
    image.save(output_path)

# Example usage
# process_image_with_texts('input_image.jpg', boxes, texts, 'output_image.jpg')
