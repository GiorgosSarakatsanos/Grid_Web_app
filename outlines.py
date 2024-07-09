# from reportlab.lib.pagesizes import landscape
# from reportlab.lib.units import mm
# from reportlab.pdfgen import canvas
# from PIL import Image, ImageFilter
# from definitions import get_paper_size, margin_options, img_size
# import os

# def generate_outlines(image_path, form):

# # Generate the main content PDF
#     image = Image.open(str(image_path))  # Open the image
#     alpha = image.split()[-1]  # Get the alpha channel

#     # Create an image to hold the alpha channel with a transparent background
#     contour_image = Image.new('L', image.size, 0)
#     contour_image.paste(alpha, mask=alpha)  # Paste the alpha channel

#     # Detect edges in the alpha channel
#     edges = contour_image.filter(ImageFilter.FIND_EDGES)

#     # Convert edges to black lines on a transparent background
#     final_image = Image.new('RGBA', image.size, (0, 0, 0, 0))
#     final_image.paste(Image.new('RGBA', image.size, (0, 0, 0, 255)), mask=edges)
#     # Invert the image
#     final_image = Image.composite(final_image, Image.new('RGBA', image.size, (255, 255, 255, 255)), edges)
#     temp_image_path = os.path.splitext(image_path)[0] + '_temp.png'
#     final_image.save(temp_image_path)  # Save the image

#     # Set form mode to 'Page' for generating outline PDF
#     original_mode = form.mode.data
#     form.mode.data = 'Page'
#     outline_pdf_path = generate_pdf(temp_image_path, form)
#     form.mode.data = original_mode  # Restore the original mode

#     os.remove(temp_image_path)
