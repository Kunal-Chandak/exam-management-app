from mongoengine import Document, StringField
from django.contrib.auth.hashers import make_password, check_password

class User(Document):
    username = StringField(max_length=150, unique=True, required=True)
    email = StringField(max_length=254, required=False)
    password = StringField(max_length=128, required=True)
    role = StringField(max_length=20, choices=[('ADMIN', 'Admin'), ('OFFICE_INCHARGE', 'Office Incharge')])

    def set_password(self, raw):
        self.password = make_password(raw)

    def check_password(self, raw):
        return check_password(raw, self.password)

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        """DRF expects this attribute; return True for any valid user."""
        return True

    @property
    def is_anonymous(self):
        return False

    meta = {
        'collection': 'users'
    }
