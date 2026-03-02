from mongoengine import Document, StringField, ReferenceField, IntField

class Classroom(Document):
    room_number = StringField(max_length=20, required=True)
    department = ReferenceField('Department', required=True)
    capacity = IntField(required=True)

    def __str__(self):
        return self.room_number

    meta = {
        'collection': 'classrooms'
    }
