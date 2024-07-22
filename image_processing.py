from PIL import Image, ImageDraw

def draw_boxes_on_image(image_path, boxes, output_path):
    # Open the image file
    with Image.open(image_path) as img:
        draw = ImageDraw.Draw(img)

        # Get image dimensions
        img_width, img_height = img.size

        print(f"Image dimensions: width={img_width}, height={img_height}")

        for index, box in enumerate(boxes):  # Iterate over each box in the list
            # Convert position and size to float
            position_x = float(box['position_x'])
            position_y = float(box['position_y'])
            size_x = float(box['size_x'])
            size_y = float(box['size_y'])

            # Calculate box coordinates
            x = position_x * img_width
            y = position_y * img_height
            width = size_x * img_width
            height = size_y * img_height

            print(f"Box {index + 1}: x={x}, y={y}, width={width}, height={height}")

            # Draw the filled rectangle (box)
            draw.rectangle([x, y, x + width, y + height], fill="white")
        # Save the modified image
        img.save(output_path)

    return output_path
