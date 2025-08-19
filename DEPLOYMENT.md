# 🚀 WorkBoard Deployment Guide

This guide will help you deploy your WorkBoard application to make it live using GitHub and Railway.

## 📋 Prerequisites

- GitHub account
- Railway account (free at [railway.app](https://railway.app))
- Git installed on your computer

## 🎯 Deployment Options

### Option 1: Railway (Recommended - Easy & Free)
- **Pros**: Free tier, automatic deployments, easy setup
- **Cons**: Limited free usage
- **Best for**: Personal projects, MVPs

### Option 2: Render
- **Pros**: Free tier, good performance
- **Cons**: Slower cold starts
- **Best for**: Small to medium projects

### Option 3: Heroku
- **Pros**: Reliable, good documentation
- **Cons**: No free tier anymore
- **Best for**: Production applications

---

## 🚀 Railway Deployment (Step-by-Step)

### Step 1: Prepare Your Repository

1. **Create a new GitHub repository**
   ```bash
   # Initialize git (if not already done)
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create repository on GitHub and push
   git remote add origin https://github.com/yourusername/workboard-app.git
   git push -u origin main
   ```

2. **Verify your project structure**
   ```
   workboard-app/
   ├── workboard/          # Django backend
   │   ├── requirements.txt
   │   ├── Procfile
   │   ├── runtime.txt
   │   └── ...
   └── workboards/         # React frontend
       ├── package.json
       ├── railway.json
       └── ...
   ```

### Step 2: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Select the `workboard` folder as the source**
7. **Railway will automatically detect it's a Python app**

### Step 3: Configure Backend Environment Variables

In Railway dashboard, go to your backend service and add these environment variables:

```
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=your-backend-domain.railway.app
```

### Step 4: Deploy Frontend to Railway

1. **Create another Railway project**
2. **Select the same GitHub repository**
3. **Select the `workboards` folder as the source**
4. **Railway will detect it's a Node.js app**

### Step 5: Configure Frontend Environment Variables

In Railway dashboard, go to your frontend service and add:

```
VITE_API_URL=https://your-backend-domain.railway.app/api
```

### Step 6: Update CORS Settings

In your backend `settings.py`, update the CORS settings with your frontend domain:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.railway.app",
]
```

---

## 🔧 Alternative: Render Deployment

### Backend Deployment on Render

1. **Go to [Render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn workboard.wsgi:application`
   - **Environment**: Python 3

### Frontend Deployment on Render

1. **Create a new Static Site**
2. **Connect your GitHub repository**
3. **Configure:**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

---

## 🌐 Custom Domain Setup

### Option 1: Railway Custom Domain
1. Go to your Railway service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Option 2: Cloudflare (Free)
1. Sign up for Cloudflare
2. Add your domain
3. Update nameservers
4. Create CNAME records pointing to your Railway domains

---

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive data to Git
- Use environment variables for:
  - Database URLs
  - API keys
  - Secret keys

### HTTPS
- Railway provides free SSL certificates
- Always use HTTPS in production

### Database
- Consider using PostgreSQL for production
- Railway offers free PostgreSQL databases

---

## 📊 Monitoring & Maintenance

### Railway Dashboard
- Monitor resource usage
- View logs
- Check deployment status

### Health Checks
- Backend: `/api/`
- Frontend: `/`

### Automatic Deployments
- Railway automatically deploys on Git push
- Configure branch protection rules on GitHub

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check requirements.txt
   - Verify Python/Node.js versions
   - Check build logs

2. **CORS Errors**
   - Update CORS settings with correct domains
   - Check environment variables

3. **Database Issues**
   - Run migrations: `python manage.py migrate`
   - Check database connection

4. **Static Files**
   - Ensure WhiteNoise is configured
   - Run: `python manage.py collectstatic`

### Getting Help
- Check Railway logs
- Review Django/React error messages
- Use Railway's built-in terminal

---

## 🎉 Success!

Once deployed, your app will be available at:
- **Frontend**: `https://your-frontend-domain.railway.app`
- **Backend API**: `https://your-backend-domain.railway.app/api`

Your WorkBoard application is now live! 🚀