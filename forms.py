from flask_wtf import FlaskForm
from wtforms import FileField, SelectField, SubmitField, IntegerField, FloatField, FormField
from wtforms.validators import DataRequired, NumberRange, Optional

   
class ImageForm(FlaskForm):
    image = FileField('Upload Image', validators=[DataRequired()])
    paper_size = SelectField('Paper Size', choices=[
        ('C3', 'C3 (458mm x 324mm)'),
        ('A3', 'A3 (420mm x 297mm)'),
        ('A4', 'A4 (297mm x 210mm)')
        ], validators=[DataRequired()])
    gap = FloatField('Gap Between Images (mm)', default=10, validators=[Optional(), NumberRange(min=0)])
    img_size = SelectField('Paper Size', choices=[
        ('Card', 'Card (85mm x 55mm)'),
        ('Square', 'Square (55mm x 55mm)')
        ], validators=[DataRequired()])
    
    mode = SelectField('Mode', choices=[('Page', 'Page'), ('Numbering', 'Numbering')], validators=[DataRequired()])
    start_number = IntegerField('Start Number', validators=[Optional()])
    end_number = IntegerField('End Number', validators=[Optional()])
    
    submit = SubmitField('Create PDF')