# 🚀 Portfolio Deployment Setup

## 📋 Quick Setup Checklist

- [ ] Create GitHub repository
- [ ] Connect local repo to GitHub
- [ ] Deploy to Vercel
- [ ] Configure custom domain (optional)
- [ ] Set up automatic deployments

---

## **Step 1: Create GitHub Repository**

### Option A: Via GitHub Website (Recommended)
1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `game-designer-portfolio` (or your preferred name)
3. **Description**: `Professional game design portfolio - Systems & Feature Designer`
4. **Visibility**: Public ✅ (required for free Vercel deployment)
5. **Initialize**: Leave ALL boxes unchecked (we already have files)
6. Click **"Create repository"**

### Option B: Via GitHub CLI (if you have it installed)
```bash
gh repo create game-designer-portfolio --public --description "Professional game design portfolio - Systems & Feature Designer"
```

---

## **Step 2: Connect Local Repository to GitHub**

After creating the GitHub repo, you'll see a page with connection instructions. Use these commands in your terminal:

```bash
# Add GitHub as remote origin (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/game-designer-portfolio.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

**🔐 Authentication**: If prompted, use your GitHub token (not password):
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate new token (classic) with `repo` permissions
- Use token as password when prompted

---

## **Step 3: Deploy to Vercel (Free)**

### Quick Deploy (1-click):
1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Import your `game-designer-portfolio` repository
4. **Framework Preset**: Next.js (auto-detected)
5. **Root Directory**: `portfolio` ⚠️ **IMPORTANT**
6. Click **Deploy**

### Manual Configuration:
If auto-detection fails, use these settings:
- **Framework**: Next.js
- **Root Directory**: `portfolio`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## **Step 4: Environment Variables (if needed)**

Currently your portfolio doesn't need any environment variables, but for future reference:

```env
# Add to Vercel dashboard if you integrate analytics later
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## **Step 5: Custom Domain (Optional)**

### Free Options:
- **Vercel subdomain**: `your-portfolio.vercel.app` (automatic)
- **Custom domain**: Add your own domain in Vercel dashboard

### Domain Setup:
1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your domain: `abhishekgamedesign.com` (example)
3. Configure DNS records as shown by Vercel

---

## **🔄 Automatic Deployments**

Once connected, every `git push` to main branch will:
✅ Trigger automatic build on Vercel
✅ Deploy to your live URL
✅ Run build checks and tests
✅ Update your live site in ~2 minutes

---

## **📱 Testing Your Deployment**

After deployment, test these URLs:
- **Homepage**: `https://your-site.vercel.app/`
- **Resume page**: `https://your-site.vercel.app/resume`
- **Project pages**: `https://your-site.vercel.app/work/food-fiesta`

---

## **🛠️ Troubleshooting**

### Build Fails?
```bash
# Test locally first
cd portfolio
npm run build
```

### Root Directory Issues?
- Ensure Vercel root directory is set to `portfolio`
- Check that `portfolio/package.json` exists

### Images Not Loading?
- Images go in `portfolio/public/assets/`
- Access via `/assets/your-image.jpg` (no 'public' in URL)

---

## **🎯 What You Get**

✅ **Professional URL**: `your-portfolio.vercel.app`
✅ **SSL Certificate**: Automatic HTTPS
✅ **Global CDN**: Fast loading worldwide  
✅ **Automatic deploys**: Push code → Live in minutes
✅ **Build previews**: Every PR gets preview URL
✅ **Analytics**: Built-in performance monitoring
✅ **Custom domains**: Free SSL for your domain

---

## **📊 Post-Deployment Checklist**

- [ ] Share live URL with network
- [ ] Add URL to LinkedIn/resume
- [ ] Test on mobile devices  
- [ ] Add Google Analytics (optional)
- [ ] Set up performance monitoring
- [ ] Plan content updates (add real screenshots)

**🎉 Your portfolio will be live and professional!**