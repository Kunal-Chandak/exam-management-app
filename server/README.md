# Exam Seating Arrangement Backend

This Django project implements the API for the seating arrangement system described in `../exam-management-app/Exam_Seating_Arrangement_Project_Document.md`.

**Important:** Users have a `role` field (`ADMIN` or `OFFICE_INCHARGE`). The frontend enforces access by role; make sure any account you log in with has one assigned (superusers created via `createsuperuser` may not, in which case the frontend defaults them to `ADMIN`). You can edit or create users with roles via the Django admin or the shell.

## Setup

1. Ensure you've installed Python 3.10+ (3.12 used here).
2. Install dependencies:
   ```sh
   pip install django djangorestframework djangorestframework-simplejwt djongo pymongo django-cors-headers
   ```
   (using sqlite3 by default during development to avoid djongo/Django 6 compatibility)
3. Run migrations:
   ```sh
   python manage.py migrate
   ```
4. Create a superuser (admin):
   ```sh
   python manage.py createsuperuser
   ```
   This account can login via `/api/users/login/` with its username and password, and you can also manage users via the Django admin (`/admin/`).

### Logging in from the frontend

The React app will post credentials to `/api/users/login/`. You must supply a valid **username** (not email) and password for a user that exists in the database.  If you see "Invalid credentials" it means either the username or password is wrong or the user doesn't exist.

Create additional users using the admin interface or the Django shell:

```sh
python manage.py shell
>>> from accounts.models import User
>>> User.objects.create_user('office','office@example.com','secret', role='OFFICE_INCHARGE')
```
## Running

```sh
python manage.py runserver
```

API root will be at `http://localhost:8000/api/`.

## Endpoints

- `POST /api/users/login/` — expects `{username,password}` returns JWT access token.
- Standard CRUD endpoints under `/api/departments/`, `/api/classrooms/`, `/api/subjects/`, `/api/students/`, `/api/teachers/`, `/api/seating/` guarded by JWT authentication.

## Notes

- Custom `User` model with `role` field (ADMIN or OFFICE_INCHARGE).
- Seating generation and download actions are stubs; implementation should enforce validation rules.
- Database currently sqlite for simplicity; update `DATABASES` in `exam_server/settings.py` when switching to MongoDB.
