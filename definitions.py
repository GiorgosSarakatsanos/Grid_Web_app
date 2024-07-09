from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os



def get_paper_size(size, custom_width=None, custom_height=None):
    sizes = {
        '255x235': (255 * mm, 235 * mm),
        '255x210': (255 * mm, 210 * mm),
        '487x330': (487 * mm, 330 * mm),
        '350x330': (350 * mm, 330 * mm),
        'A3': (420 * mm, 297 * mm),
        'A4': (297 * mm, 210 * mm),
        'Custom': (custom_width, custom_height)
    }
    if size == 'Custom' and custom_width and custom_height:
        return (custom_width * mm, custom_height * mm)
    return sizes.get(size, (297 * mm, 210 * mm))


def img_size(size, custom_width=None, custom_height=None):
    sizes = {
        'Sticker': (60 * mm, 90 * mm),
        'Card': (85 * mm, 55 * mm),
        'Square': (55 * mm, 55 * mm),
        'Custom': (custom_width, custom_height)
    }
    if size == 'Custom' and custom_width and custom_height:
        return (custom_width * mm, custom_height * mm)
    return sizes.get(size, (85 * mm, 55 * mm))




# Constants for margin sizes (assuming mm is defined/imported)
CUTTER_STANDARD = (15, 37, 15, 17)
NARROW_MARGIN = (5, 2, 5, 2)
DEFAULT_MARGIN = CUTTER_STANDARD

# Margin options function
def margin_options(size, custom_margin_top=None, custom_margin_right=None, custom_margin_bottom=None, custom_margin_left=None):
    sizes = {
        'cutter standard': CUTTER_STANDARD,
        'narrow margin': NARROW_MARGIN,
        'Custom': (custom_margin_top or 4, custom_margin_right or 4, custom_margin_bottom or 4, custom_margin_left or 4)
    }
    margins = sizes.get(size.lower(), DEFAULT_MARGIN)
    return tuple(margin * mm for margin in margins)

# Corner lines thikness and lenght
mark_line_length = 10 * mm
mark_line_thickness = 3

# Mark margins
mark_margin_top = 15 * mm
mark_margin_right = 17 * mm
mark_margin_bottom = 15 * mm
mark_margin_left = 37 * mm

# Page margins
page_margin_top = 10 * mm
page_margin_right = 5 * mm
page_margin_bottom = 10 * mm
page_margin_left = 28 * mm

page_margins = page_margin_top, page_margin_right, page_margin_bottom, page_margin_left
