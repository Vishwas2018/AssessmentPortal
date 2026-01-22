# Quick Start Guide

Get your EduAssess Platform up and running in 5 minutes!

## 🚀 Fast Track Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd edu-assessment-platform

# Install dependencies
npm install
```

### 2. Set Up Supabase (2 minutes)

1. **Create Account**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up (free)

2. **Create Project**:
   - Click "New Project"
   - Name: "EduAssess Platform"
   - Set database password
   - Choose region: Sydney (for Australia)

3. **Get API Keys**:
   - Go to Settings → API
   - Copy "Project URL" and "anon public key"

### 3. Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and paste your Supabase credentials
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run the App!

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📋 What's Working (Phase 1)

✅ Project structure  
✅ Routing configured  
✅ Tailwind CSS styling  
✅ Supabase integration  
✅ Authentication framework  
✅ State management  
✅ TypeScript types  

## 🎯 Next Steps

### Immediate (Phase 2 - Week 3-4)
1. **Design Landing Page**
   - Hero section with animations
   - Feature highlights
   - Testimonials

2. **Build Authentication**
   - Login/Signup forms
   - Social OAuth (Google/Microsoft)
   - Password reset

### After That (Phase 3+)
- Dashboard
- Exam system
- Results & analytics
- Payment integration

## 📚 Key Files to Know

```
src/
├── pages/          → Add new pages here
├── components/     → Reusable components
│   ├── layout/    → Navbar, Footer, etc.
│   └── ui/        → Buttons, Cards, etc.
├── lib/
│   ├── router.tsx → Configure routes
│   └── supabase.ts → Database client
├── store/         → Global state
├── types/         → TypeScript types
└── data/
    └── constants/ → App constants
```

## 🎨 Styling Guide

We use Tailwind CSS with custom classes:

```jsx
// Buttons
<button className="btn btn-primary">Click me</button>
<button className="btn btn-outline">Outline</button>

// Cards
<div className="card">Content here</div>
<div className="card card-hover">Hover effect</div>

// Inputs
<input className="input" />

// Container
<div className="container-custom">Centered content</div>
```

## 🔧 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check for errors
```

## 🐛 Troubleshooting

### Port already in use?
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in vite.config.ts
```

### Supabase connection error?
- Check `.env` file exists
- Verify credentials are correct
- Make sure URL includes `https://`

### Module not found?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📖 Learn More

- [README.md](./README.md) - Full documentation
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to Vercel

## 🎓 Tech Stack Resources

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## 💡 Tips for Development

1. **Use TypeScript**: Let it help you catch errors early
2. **Follow the structure**: Keep components organized
3. **Reuse components**: Check `components/ui/` before creating new ones
4. **Test locally**: Always test before committing
5. **Keep it simple**: Start small, iterate

## ✨ You're Ready!

The foundation is set. Time to build something amazing! 🚀

Need help? Check the documentation or refer to the roadmap in README.md.

---

**Happy Coding! 🎉**
