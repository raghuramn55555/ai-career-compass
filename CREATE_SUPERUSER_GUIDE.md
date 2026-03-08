# Create Django Superuser & Setup JWT Authentication

## Step 1: Start Backend Server

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

## Step 2: Activate Virtual Environment (if you have one)

### Windows:
```bash
venv\Scripts\activate
```

### Mac/Linux:
```bash
source venv/bin/activate
```

## Step 3: Install Dependencies (if not already installed)

```bash
pip install -r requirements.txt
```

## Step 4: Run Database Migrations

This creates all the necessary database tables:

```bash
python manage.py makemigrations
python manage.py migrate
```

You should see output like:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, users, careers
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  ...
```

## Step 5: Create Superuser

Run this command:

```bash
python manage.py createsuperuser
```

You'll be prompted to enter:

```
Email address: admin@example.com
Name: Admin User
Password: ********
Password (again): ********
```

**Example:**
- Email: `admin@example.com`
- Name: `Admin User`
- Password: `admin123` (use a strong password in production!)

You should see:
```
Superuser created successfully.
```

## Step 6: Start the Backend Server

```bash
python manage.py runserver
```

The server will start at `http://localhost:8000`

## Step 7: Access Django Admin Panel

1. Open your browser
2. Go to: `http://localhost:8000/admin/`
3. Login with your superuser credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

## Step 8: View Registered Users

In the Django admin panel:
1. Click on "Users" under the "USERS" section
2. You'll see all registered users
3. You can view, edit, or delete users

## Step 9: Enable JWT Authentication in Frontend

### Option A: Temporary Test (No Code Changes)

Keep using localStorage authentication (current setup). Users won't be saved to database.

### Option B: Enable Full JWT Authentication

1. Open `ai-career-compass/src/App.tsx`
2. Change line 7 from:
   ```typescript
   import { AuthProvider } from "@/contexts/AuthContext";
   ```
   To:
   ```typescript
   import { AuthProvider } from "@/contexts/AuthContext.API-Integrated";
   ```

3. Make sure backend is running: `python manage.py runserver`
4. Restart frontend: `npm run dev`

## Step 10: Test User Registration

### With JWT Enabled:

1. Go to `http://localhost:5173/auth`
2. Click "Sign Up" tab
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Confirm Password: test123456
4. Click "Create Account"

### Verify in Django Admin:

1. Go to `http://localhost:8000/admin/`
2. Login with superuser credentials
3. Click "Users"
4. You should see "Test User" in the list!

## Database Location

Your user data is stored in:
```
backend/db.sqlite3
```

This is a SQLite database file. You can view it with tools like:
- DB Browser for SQLite
- SQLite Studio
- Or through Django admin panel

## API Endpoints for User Management

### Register New User
```bash
POST http://localhost:8000/api/users/register/
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

### Login
```bash
POST http://localhost:8000/api/users/login/
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123456"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get User Profile (Protected)
```bash
GET http://localhost:8000/api/users/profile/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Troubleshooting

### Issue 1: "No module named 'rest_framework'"

**Solution:**
```bash
pip install djangorestframework djangorestframework-simplejwt
```

### Issue 2: "Table doesn't exist"

**Solution:**
```bash
python manage.py migrate
```

### Issue 3: "Superuser already exists"

**Solution:**
You can either:
- Use the existing superuser
- Delete and recreate:
  ```bash
  python manage.py shell
  >>> from django.contrib.auth import get_user_model
  >>> User = get_user_model()
  >>> User.objects.filter(is_superuser=True).delete()
  >>> exit()
  python manage.py createsuperuser
  ```

### Issue 4: Can't access admin panel

**Solution:**
- Make sure backend is running: `python manage.py runserver`
- Check URL: `http://localhost:8000/admin/` (note the trailing slash)
- Verify superuser was created successfully

### Issue 5: CORS errors in frontend

**Solution:**
Check `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

And verify `backend/config/settings.py` has:
```python
CORS_ALLOWED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'http://localhost:5173'),
]
```

## Viewing User Data

### Method 1: Django Admin Panel
1. Go to `http://localhost:8000/admin/`
2. Login with superuser
3. Click "Users"
4. View all registered users

### Method 2: Django Shell
```bash
python manage.py shell
```

Then:
```python
from django.contrib.auth import get_user_model
User = get_user_model()

# List all users
for user in User.objects.all():
    print(f"{user.name} - {user.email}")

# Get specific user
user = User.objects.get(email='test@example.com')
print(user.name, user.email, user.created_at)
```

### Method 3: Database Browser
1. Download "DB Browser for SQLite"
2. Open `backend/db.sqlite3`
3. Browse the `users_user` table

## User Model Fields

The User model includes:
- `id` - Unique identifier
- `email` - Email address (used for login)
- `name` - Full name
- `password` - Hashed password
- `is_active` - Account status
- `is_staff` - Can access admin panel
- `is_superuser` - Has all permissions
- `created_at` - Registration date
- `updated_at` - Last update date
- `progress` - JSON field for career progress

## Security Best Practices

1. **Never commit database files**
   - `db.sqlite3` is in `.gitignore`

2. **Use strong passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols

3. **Change default superuser password**
   - Don't use `admin123` in production

4. **Use environment variables**
   - Store secrets in `.env` file
   - Never commit `.env` to Git

5. **Enable HTTPS in production**
   - Use SSL certificates
   - Set `SECURE_SSL_REDIRECT = True`

## Next Steps

After creating superuser:

1. ✅ Create superuser
2. ✅ Access admin panel
3. ✅ Test user registration
4. ✅ Verify users in database
5. 🔄 Enable JWT in frontend (optional)
6. 🔄 Test login/logout flow
7. 🔄 Integrate career data with user accounts
8. 🔄 Add password reset functionality

## Quick Reference Commands

```bash
# Create superuser
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver

# Access admin
http://localhost:8000/admin/

# Django shell
python manage.py shell

# Create migrations after model changes
python manage.py makemigrations

# View all users (in shell)
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.all()
```
