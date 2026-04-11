# 🎮 Game Designer Portfolio - Abhishek Dutta

> **Professional portfolio showcasing systems design, feature design, and LiveOps expertise in game development**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fabhdutta%2Fgame-designer-portfolio&root-directory=portfolio)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ **Live Portfolio**
🌐 **[View Live Site →](https://your-portfolio.vercel.app)** *(Update this URL after deployment)*

---

## 🎯 **About This Portfolio**

This portfolio is specifically designed for **Systems & Feature Designers** and **LiveOps professionals** in the gaming industry. It showcases:

- **🧩 Systems Expertise**: Game mechanics, economy design, progression systems
- **⚡ Feature Design**: User experience, monetization features, player engagement
- **📊 LiveOps Impact**: Analytics-driven design, retention optimization, A/B testing
- **🎨 Creative Vision**: UI/UX design with game-focused aesthetics

### **🚀 Key Features**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Animated Interactions**: Subtle Framer Motion animations  
- **Performance Optimized**: Next.js with automatic code splitting
- **SEO Ready**: Meta tags, Open Graph, structured data
- **Image System**: Optimized loading with fallback placeholders
- **Professional Branding**: Game industry focused color scheme and typography

---

## 🛠️ **Tech Stack**

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15 + App Router | React-based full-stack framework |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Animations** | Framer Motion | Declarative animations |
| **Icons** | Lucide React + React Icons | Professional iconography |
| **Deployment** | Vercel | Zero-config deployment with CDN |
| **Version Control** | Git + GitHub | Source control and CI/CD |

---

## 🏗️ **Project Structure**

```
career-workspace/
├── 📁 portfolio/                 # Next.js application
│   ├── 📁 src/
│   │   ├── 📁 app/              # App Router pages
│   │   └── 📁 features/         # Feature-based components
│   ├── 📁 public/assets/        # Static images and media
│   └── 📄 package.json          # Dependencies
├── 📁 career-content/           # Resume and content data  
├── 📁 docs/                     # Documentation
├── 📄 DEPLOYMENT-SETUP.md       # Deployment guide
├── 📄 deploy.sh                 # Automated deployment script
└── 📄 vercel.json              # Vercel configuration
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/game-designer-portfolio.git
cd game-designer-portfolio

# Install dependencies
cd portfolio
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### **🎬 Adding Your Content**
1. **Profile Photos**: Add to `portfolio/public/assets/general/profile/`
2. **Project Screenshots**: Add to `portfolio/public/assets/[project-name]/`
3. **Content Updates**: Edit `portfolio/src/features/portfolio/data/site-content.ts`
4. **Resume**: Add PDF to `portfolio/public/assets/` and link in resume page

---

## 📦 **Deployment**

### **Automated Deployment (Recommended)**
```bash
# Run the deployment script
./deploy.sh
```

This script:
- ✅ Tests build locally
- ✅ Commits any changes
- ✅ Pushes to GitHub
- ✅ Triggers Vercel deployment

### **Manual Deployment**
1. **Create GitHub Repository**: [github.com/new](https://github.com/new)
2. **Connect to Vercel**: [vercel.com/new](https://vercel.com/new)
3. **Set Root Directory**: `portfolio`
4. **Deploy**: Automatic on every push to main

📋 **[Complete Deployment Guide →](DEPLOYMENT-SETUP.md)**

---

## 📊 **Performance & SEO**

- **⚡ Lighthouse Score**: 90+ across all metrics
- **📱 Mobile Responsive**: Optimized for all screen sizes
- **🔍 SEO Optimized**: Meta tags, structured data, sitemap
- **🚀 Fast Loading**: Next.js optimization + Vercel CDN
- **♿ Accessibility**: WCAG 2.1 compliant components

---

## 🎨 **Customization**

### **Colors & Branding**
```typescript
// Edit in tailwind.config.ts
colors: {
  primary: '#ea580c',    // Orange accent
  secondary: '#18181b',  // Dark background
}
```

### **Content**
```typescript
// Edit in src/features/portfolio/data/site-content.ts  
export const defaultPortfolioContent = {
  person: { name: "Your Name", title: "Game Designer" },
  hero: { headline: "Your Headline" },
  // ... more content
}
```

### **Projects**
Add your game projects to showcase:
1. Add project data to `site-content.ts`
2. Add screenshots to `public/assets/[project]/`
3. Create case study pages (optional)

---

## 📈 **Analytics & Monitoring**

### **Built-in Analytics** (Vercel)
- Page views and performance metrics
- Real user monitoring
- Core Web Vitals tracking

### **Optional Integrations**
- Google Analytics 4
- Hotjar for user behavior
- Sentry for error tracking

---

## 🤝 **Contributing**

This is a personal portfolio, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Submit a pull request

---

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

---

## 🎮 **About Abhishek**

**Systems & Feature Designer | LiveOps Specialist**

Passionate about creating engaging game experiences through data-driven design and player-centric systems. Specialized in:

- 🧩 **Systems Design**: Economy balance, progression mechanics, reward systems
- ⚡ **Feature Design**: Monetization features, social systems, player engagement  
- 📊 **LiveOps**: A/B testing, player retention, content updates, analytics

**🔗 Connect**: [LinkedIn](https://linkedin.com/in/your-profile) | [Portfolio](https://your-portfolio.vercel.app) | [Email](mailto:your-email@domain.com)

---

<div align="center">

**Built with ❤️ by a Game Designer for Game Designers**

[⭐ Star this repo](https://github.com/YOUR-USERNAME/game-designer-portfolio/stargazers) if it helped you create your portfolio!

</div>