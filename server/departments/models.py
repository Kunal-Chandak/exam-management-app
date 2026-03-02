from mongoengine import Document, StringField

class Department(Document):
    name = StringField(max_length=100, required=True)
    code = StringField(max_length=20, unique=True, required=True)

    def __str__(self):
        return self.name

    meta = {
        'collection': 'departments'
    }
