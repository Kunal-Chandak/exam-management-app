from mongoengine import Document, StringField, ReferenceField
from datetime import datetime

class Subject(Document):
    name = StringField(max_length=100, required=True)
    subject_code = StringField(max_length=20, unique=True, required=True)
    department = ReferenceField('Department', blank=True)  # Department offering this subject
    exam_date = StringField(blank=True)  # Date in YYYY-MM-DD format
    exam_time = StringField(blank=True)  # Time in HH:MM format
    # Hidden field to allow reading old documents with exam_id without breaking
    exam_id = StringField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    meta = {
        'collection': 'subjects'
    }
