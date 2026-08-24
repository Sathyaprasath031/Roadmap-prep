# 🚀 Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)

---

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
gh repo create interview-prep --public --push
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account → Create cluster (M0 free tier)
3. **Database Access**: Create user with password
4. **Network Access**: Add IP `0.0.0.0/0` (allow all)
5. **Connect**: Copy connection string

Connection string format:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/interview-prep?retryWrites=true&w=majority
```

---

## Step 3: Deploy Backend on Render

1. Go to [render.com](https://render.com) → Sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. **Configure:**
   - **Name**: `interview-prep-backend`
   - **Runtime**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. **Add Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/interview-prep?retryWrites=true&w=majority
   NODE_ENV=production
   ```
6. Click **"Create Web Service"**
7. Wait for deployment → Copy your backend URL (e.g., `https://interview-prep-backend.onrender.com`)

---

## Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Import your repo
4. **Configure:**
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Add Environment Variable:**
   ```
   VITE_API_URL=https://interview-prep-backend.onrender.com
   ```
6. Click **"Deploy"**

---

## Step 5: Update Backend CORS

Update `backend/server.js` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

---

## Step 6: Test

1. Visit your Vercel URL
2. Test login/register
3. Check API calls in browser DevTools → Network tab

---

## 🔄 Auto-Deploy

Both platforms auto-deploy when you push to GitHub:
- **Vercel**: Auto-deploys frontend on every push
- **Render**: Auto-deploys backend on every push

---

## 🐛 Common Issues

### CORS Error
- Add your Vercel URL to backend CORS config
- Check `cors()` in `server.js`

### API 404 Errors
- Verify `VITE_API_URL` is set correctly
- Check backend is running (Render dashboard)

### MongoDB Connection Error
- Verify connection string in Render env vars
- Check Atlas network access includes `0.0.0.0/0`

### Backend Cold Starts
- Free tier on Render sleeps after inactivity
- First request may take 30-50 seconds
- Consider upgrading to paid plan for always-on

---

## 📊 Cost Estimate

| Service | Free Tier Limits |
|---------|------------------|
| Vercel | 100GB bandwidth/month |
| Render | 750 hours/month (sleeps after 15min idle) |
| MongoDB Atlas | 512MB storage |

---

## 🔐 Environment Variables Summary

### Backend (Render)
```
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
```
