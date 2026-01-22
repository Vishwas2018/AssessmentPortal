# EduAssess Platform - Educational Assessment System

A comprehensive online platform to deliver educational assessments for Australian students in Years 2–9, with a strong focus on NAPLAN and ICAS exam preparation.

## 🚀 Live Demo

Coming soon!

## 🛠️ Tech Stack

- React + TypeScript + Vite
- TailwindCSS
- Supabase
- Zustand

## 📦 Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

See QUICKSTART.md for detailed setup instructions.

## 🚀 Project Status

**Phase 1: Foundation & Setup** ✅ COMPLETE

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Roadmap](#development-roadmap)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

## ✨ Features (Planned)

- 🎯 NAPLAN & ICAS practice exams
- 📊 Detailed performance analytics
- ⏱️ Timed exam simulations
- 📈 Progress tracking
- 🎨 Kid-friendly, modern UI
- 🔐 Secure authentication
- 💳 Subscription management
- 📱 Fully responsive design

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend & Services

- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security

### Deployment

- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend hosting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd edu-assessment-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
edu-assessment-platform/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── exam/         # Exam-related components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components (Shadcn-style)
│   ├── data/             # Static data
│   │   ├── constants/    # App constants
│   │   └── exams/        # Exam JSON data
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Libraries & configs
│   │   ├── router.tsx    # Router configuration
│   │   └── supabase.ts   # Supabase client
│   ├── pages/            # Page components
│   ├── store/            # Zustand stores
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── vite-env.d.ts     # Vite types
├── .env.example          # Environment template
├── .eslintrc.cjs         # ESLint config
├── .gitignore           # Git ignore rules
├── index.html           # HTML template
├── package.json         # Dependencies
├── postcss.config.js    # PostCSS config
├── tailwind.config.js   # Tailwind config
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite config
```

## 🗺️ Development Roadmap

### ✅ Phase 1: Foundation & Setup (Weeks 1-2)

- [x] Initialize project with Vite + React + TypeScript
- [x] Configure TailwindCSS
- [x] Set up folder structure
- [x] Configure routing
- [x] Integrate Supabase
- [x] Create type definitions
- [x] Set up state management

### 📍 Phase 2: Landing Page & Authentication (Weeks 3-4)

- [ ] Design and build landing page
- [ ] Implement hero section with animations
- [ ] Create feature highlights
- [ ] Build authentication forms
- [ ] Integrate social logins
- [ ] Password reset functionality

### 📍 Phase 3: Exam Data Structure & Dashboard (Weeks 5-6)

- [ ] Design exam JSON schema
- [ ] Create sample exam data
- [ ] Build dashboard UI
- [ ] Implement progress tracking
- [ ] Set up database tables

### 📍 Phase 4: Exam Flow & Testing (Weeks 7-9)

- [ ] Build exam selection interface
- [ ] Create exam-taking UI
- [ ] Implement timer system
- [ ] Add answer persistence
- [ ] Build submission flow

### 📍 Phase 5: Results & Analytics (Weeks 10-12)

- [ ] Create results page
- [ ] Implement performance analytics
- [ ] Build data visualizations
- [ ] Add topic-wise breakdowns

### 📍 Phase 6: Payment & Polish (Weeks 13-15)

- [ ] Integrate Stripe
- [ ] Build pricing page
- [ ] Add subscription management
- [ ] Performance optimization
- [ ] Content population
- [ ] Production deployment

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=EduAssess Platform
VITE_APP_URL=http://localhost:3000
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Manual Build

```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

## 📝 License

© 2026 EduAssess Platform. All rights reserved.

## 🤝 Contributing

This is a proprietary project. Contributions are not currently accepted.

## 📧 Support

For support, email support@eduassess.com (placeholder)

---

**Built with ❤️ for Australian students**
