from flask_wtf import FlaskForm
from wtforms import FileField, SelectField, SubmitField, IntegerField, FloatField
from wtforms.validators import DataRequired, NumberRange, Optional, ValidationError


def validate_custom_dimensions(form, field):
    if form.paper_size.data == 'Custom' and not field.data:
        raise ValidationError('This field is required for custom paper sizes.')

class ImageForm(FlaskForm):
    image = FileField('Upload Image', validators=[DataRequired()])
    
    paper_size = SelectField('Paper Size', choices=[
        ('255x235', '235 mm x 255 mm'),
        ('255x235', '235 mm x 255 mm'),
        ('255x210', '255 mm x 210 mm'),
        ('487x330', '330 mm x 487 mm'),
        ('350x330', '330 mm x 350 mm'),
        ('A3', 'A3 (420mm x 297mm)'),
        ('A4', 'A4 (297mm x 210mm)'),
        ('Custom', 'Custom')
        ], validators=[DataRequired()])
   
    gap = FloatField('Gap Between Images (mm)', default=0, validators=[Optional(), NumberRange(min=0)])
    padding = FloatField('Padding (mm)', default=0, validators=[Optional(), NumberRange(min=0)])
    font_size = IntegerField('Font Size (px)', default=8, validators=[Optional(), NumberRange(min=0)])
    
    img_size = SelectField('Image Size', choices=[
        
        ('Sticker', 'Sticker (60mm x 90mm)'),
        ('Card', 'Card (85mm x 55mm)'),
        ('Square', 'Square (55mm x 55mm)'),
        ('Custom', 'Custom')
        ], validators=[DataRequired()])
    
    

    margin_options = SelectField('Margin Options', choices=[
        ('cutter standard', 'Cutter standard'),
        ('narrow margin', 'Narrow margin'),
        ('Custom', 'Custom')
    ], validators=[DataRequired()])

    mode = SelectField('Mode', choices=[('Page', 'Page'), ('Numbering', 'Numbering')], validators=[DataRequired()])
    
    start_number = IntegerField('Start Number', default=1, validators=[Optional()])
    end_number = IntegerField('End Number', default=10, validators=[Optional()])
    
    offset_number_x = IntegerField('Offset Number X Position', default=15, validators=[Optional()])
    offset_number_y = IntegerField('Offset Number Y Position', default=15, validators=[Optional()])
    
    custom_paper_width = IntegerField('Custom Paper Width (mm)', default=1000, validators=[Optional()])
    custom_paper_height = IntegerField('Custom Paper Height (mm)', default=700, validators=[Optional()])
    custom_image_width = IntegerField('Custom Image Width (mm)', validators=[Optional()])
    custom_image_height = IntegerField('Custom Image Height (mm)', validators=[Optional()])
    
    custom_margin_left = IntegerField('Custom Margin Left (mm)', default=10, validators=[Optional()])
    custom_margin_right = IntegerField('Custom Margin Right (mm)', default=10, validators=[Optional()])
    custom_margin_top = IntegerField('Custom Margin Top (mm)', default=10, validators=[Optional()])
    custom_margin_bottom = IntegerField('Custom Margin Bottom (mm)', default=10, validators=[Optional()])
    
    submit = SubmitField('Create PDF')