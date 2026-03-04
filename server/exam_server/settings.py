"""
Django settings for exam_server project.
Generated manually for exam seating arrangement backend.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

DEBUG = True

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    # include auth and contenttypes for third-party dependencies (JWT, DRF)
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # enable CORS for React frontend
    # project apps
    'accounts',
    'departments',
    'classrooms',
    'subjects',
    'students',
    'teachers',
    'seating',
]

# use custom user model in Mongo; Django auth not used
# AUTH_USER_MODEL = 'accounts.User'  # commented because django.contrib.auth is removed

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.MongoJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# allow cross-origin requests from frontend during development
CORS_ALLOW_ALL_ORIGINS = True

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be high in order
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'exam_server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                # auth context processor removed
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'exam_server.wsgi.application'

# MongoDB via mongoengine
import mongoengine as me

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/exam')

# Connect mongoengine to MongoDB
me.connect('exam', host=MONGO_URI)

# no relational database required; use dummy engine to satisfy Django
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.dummy',
    }
}

# disable migrations for auth and contenttypes since we don't have a relational DB
MIGRATION_MODULES = {
    'auth': None,
    'contenttypes': None,
}
# sessions stored in signed cookies instead of DB
SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'

# use custom mongo backend for authentication
AUTHENTICATION_BACKENDS = ['accounts.backends.MongoBackend']

# no need for AUTH_USER_MODEL when using custom backend
# AUTH_USER_MODEL = 'accounts.User'  # commented out

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = '/static/'
