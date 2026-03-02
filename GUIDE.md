# Guide - Getting Started

## Stage 1: Setup MongoDB Atlas

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project

### Step 2: Create a Database Cluster
1. Click **Build a Database**
2. Choose the **Free** tier (M0)
3. Select your region and create the cluster
4. Wait for the cluster to deploy (5-10 minutes)

### Step 3: Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Create username and password (save these!)
4. Click **Add User**

### Step 4: Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (for development)
4. Click **Confirm**

### Step 5: Get Connection String
1. Go back to **Databases** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Drivers** → **Node.js**
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials

### Step 6: Add to .env File
1. Open `server/.env` file
2. Add this line:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/exam_seating?retryWrites=true&w=majority
```
3. Save the file

---

## Stage 2: Start Backend

### Prerequisites
- Python 3.8+ installed
- Virtual environment (.venv created in server folder)
- `.env` file configured with MongoDB URI

### Steps to Start Backend

1. **Open Terminal and Navigate to Server**
```bash
cd server
```

2. **Activate Virtual Environment**

**On Windows (PowerShell):**
```bash
& .\.venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```bash
.venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source .venv/bin/activate
```

3. **Start Django Server**
```bash
python manage.py runserver
```

✅ Backend is running on `http://localhost:8000`

---

## Stage 3: Start Frontend

### Prerequisites
- Node.js and npm installed
- Backend server running (from Stage 2)

### Steps to Start Frontend

1. **Open New Terminal and Navigate to Frontend**
```bash
cd frontend
```

2. **Install Dependencies** (only first time)
```bash
npm install
```

3. **Start React Development Server**
```bash
npm start
```

✅ Frontend is running on `http://localhost:3000`

---

## Quick Start Checklist

- [ ] MongoDB Atlas cluster created and deployed
- [ ] Database user created with username and password
- [ ] Network access configured to allow connections
- [ ] Connection string added to `server/.env`
- [ ] Backend started (`python manage.py runserver`)
- [ ] Frontend started (`npm start`)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check `.env` file has correct URI with username/password |
| Backend won't start | Ensure virtual environment is activated and dependencies installed |
| Frontend won't start | Run `npm install` and check Node.js version is 14+ |
| Can't connect frontend to backend | Check backend is running on port 8000 |

---

## Default Login Credentials

After loading sample data, use these to login:
- **Username**: admin
- **Password**: adminpassword

Office Incharge Login:
- **Username**: office_incharge
- **Password**: inchargepassword

Or check the accounts documentation for additional test accounts.
