# Project835 - Django + React with TOTP Authentication

A modern authentication system with Two-Factor Authentication (TOTP) featuring:
- Django REST API Backend
- React Frontend with Dark Navy Theme
- JWT Token Authentication
- Google Authenticator / Microsoft Authenticator Support

## 🎨 Features

- ✅ User Registration & Login
- ✅ Two-Factor Authentication (TOTP)
- ✅ QR Code Generation for Authenticator Apps
- ✅ Recovery Codes (10 backup codes)
- ✅ JWT Token Management with Auto-Refresh
- ✅ Protected Routes
- ✅ Dark Navy Theme UI

## 📋 Prerequisites

- Python 3.11+
- Node.js 16+
- MySQL/MariaDB (via XAMPP)

## 🚀 Setup Instructions

### 1. Start MySQL (XAMPP)

1. Open **XAMPP Control Panel**
2. Click **Start** next to MySQL
3. Ensure it's running on port 3306

### 2. Setup Django Backend

```powershell
# Navigate to project directory
cd c:\Users\hansa\Downloads\835mir\835_to_mir

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies (if not already installed)
pip install djangorestframework djangorestframework-simplejwt django-cors-headers

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

Django API will run at: **http://127.0.0.1:8000/**

### 3. Setup React Frontend

Open a **NEW PowerShell window**:

```powershell
# Navigate to frontend directory
cd c:\Users\hansa\Downloads\835mir\835_to_mir\frontend

# Install dependencies (if not already installed)
npm install

# Start React development server
npm run dev
```

React app will run at: **http://localhost:5173/**

## 🌐 How to Use

1. **Open your browser** and go to: `http://localhost:5173/`

2. **Create Account**:
   - Click "Create account"
   - Fill in your details
   - Click "Create Account"

3. **Setup Authenticator**:
   - You'll be redirected to TOTP Setup
   - Download **Google Authenticator** or **Microsoft Authenticator** on your phone
   - Scan the QR code
   - Enter the 6-digit code from your app
   - **Save your recovery codes** in a safe place

4. **Login**:
   - Enter your email and password
   - Enter the 6-digit code from your authenticator app
   - Access your dashboard

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/` | Register new user |
| POST | `/api/auth/login/` | User login |
| GET | `/api/auth/totp-setup/` | Get QR code |
| POST | `/api/auth/totp-setup/` | Verify TOTP setup |
| POST | `/api/auth/totp-verify/` | Verify TOTP code |
| GET | `/api/user/profile/` | Get user profile |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |

## 📂 Project Structure

```
835_to_mir/
├── accounts/              # Django app for authentication
│   ├── api_views.py      # REST API views
│   ├── api_urls.py       # API URL routing
│   └── serializers.py    # DRF serializers
├── frontend/             # React application
│   └── src/
│       ├── components/   # React components
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── TOTPSetup.jsx
│       │   ├── TOTPVerify.jsx
│       │   └── Home.jsx
│       ├── services/
│       │   └── api.js    # Axios API client
│       ├── App.jsx       # Main app with routing
│       ├── main.jsx      # Entry point
│       └── index.css     # Dark theme styles
└── project835/
    └── settings.py       # Django settings with CORS
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **TOTP 2FA**: Time-based One-Time Passwords
- **Recovery Codes**: 10 backup codes for account recovery
- **CORS Protection**: Configured for localhost:3000 and 5173
- **Password Validation**: Django built-in validators
- **CSRF Protection**: Django CSRF middleware

## 🎨 Theme

The UI features a **dark navy blue theme** similar to enterprise admin panels:
- Background: Navy blue gradient (`#1a2332` → `#2d3e52`)
- Cards: White with shadow
- Buttons: Dark navy (`#1e3a5f`)
- Clean, modern design

## 🐛 Troubleshooting

### MySQL Connection Error
```
django.db.utils.OperationalError: (2002, "Can't connect to server")
```
**Solution**: Start MySQL in XAMPP Control Panel

### CORS Error in Browser Console
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Ensure Django is running on port 8000 and React on port 5173

### React Not Starting
```
npm run dev fails
```
**Solution**: Run `npm install` in the frontend directory

## 📱 Authenticator Apps

Compatible with any TOTP authenticator app:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator

## 🔄 Development Workflow

1. Keep both servers running (Django on :8000, React on :5173)
2. Django handles API requests
3. React handles UI and routing
4. Changes to React code hot-reload automatically
5. Changes to Django code auto-reload with runserver

## 📝 Notes

- The Django templates are still available at `http://127.0.0.1:8000/accounts/login/`
- React frontend is completely separate and uses the REST API
- JWT tokens are stored in localStorage
- Tokens auto-refresh when expired

## ✅ Testing Checklist

- [ ] Can create new account
- [ ] QR code displays correctly
- [ ] Can scan QR code with authenticator app
- [ ] 6-digit code verification works
- [ ] Recovery codes are displayed and saved
- [ ] Can login with email/password
- [ ] TOTP verification at login works
- [ ] Dashboard shows user information
- [ ] Logout works correctly
- [ ] Protected routes redirect to login

---

**Enjoy your secure authentication system! 🔐**
