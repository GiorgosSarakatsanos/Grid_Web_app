from flask_wtf import FlaskForm
from wtforms import FileField, SelectField, SubmitField, IntegerField, FloatField
from wtforms.validators import DataRequired

class ImageForm(FlaskForm):
    image = FileField('Upload Image', validators=[DataRequired()])
    paper_size = SelectField('Paper Size', choices=[('C3', 'C3'), ('A3', 'A3'), ('A4', 'A4'), ('Custom', 'Custom')])
    custom_width = IntegerField('Custom Width (mm)', default=297)
    custom_height = IntegerField('Custom Height (mm)', default=210)
    gap = FloatField('Gap Between Images (mm)', default=2.0)
    submit = SubmitField('Create PDF')
