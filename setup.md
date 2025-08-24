# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Backend Setup

```bash
cd workboard
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd workboards
npm install

# Create .env.local file with:
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

## 🎯 What You Can Do

1. **Sign Up/Login** - Create an account or sign in
2. **Create Work Boards** - Add boards with multiple tasks
3. **Drag & Drop Tasks** - Move tasks between To-Do, In Progress, Completed
4. **Assign Users** - Assign tasks to team members
5. **Real-time Updates** - See changes instantly

## 🔧 Troubleshooting

### If you get CORS errors:

- Make sure both servers are running
- Check that the API URL in `.env.local` is correct
- Restart both servers

### If authentication doesn't work:

- Clear browser localStorage
- Check that the token is being sent in requests
- Verify the backend is running on port 8000

### If drag and drop doesn't work:

- Make sure you're using a modern browser
- Check the browser console for errors
- Verify React Beautiful DnD is installed

## 📱 Features Included

✅ **Complete Authentication System**
✅ **Work Board Management**
✅ **Kanban Board Interface**
✅ **Drag & Drop Functionality**
✅ **User Assignment**
✅ **Real-time Updates**
✅ **Responsive Design**
✅ **Modern UI/UX**

Your Kanban Work Board application is ready to use! 🎉
