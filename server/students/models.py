from mongoengine import Document, StringField, ReferenceField, ListField

class Student(Document):
    name = StringField(max_length=100, required=True)
    roll_number = StringField(max_length=50, unique=True, required=True)
    department = ReferenceField('Department')
    subjects = ListField(ReferenceField('Subject'), blank=True)

    def __str__(self):
        return self.name

    meta = {
        'collection': 'students'
    }
