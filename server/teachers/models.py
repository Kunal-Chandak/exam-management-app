from mongoengine import Document, StringField, ReferenceField

class Teacher(Document):
    name = StringField(max_length=100, required=True)
    employee_id = StringField(max_length=50, unique=True, required=True)
    department = ReferenceField('Department')

    def __str__(self):
        return self.name

    meta = {
        'collection': 'teachers'
    }
