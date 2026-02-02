# 🎓 Entropy Community Forum

[![Live Demo](https://img.shields.io/badge/🌍_Live_Demo-entropy--community--forum.vercel.app-blue?style=for-the-badge)](https://entropy-community-forum.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **The future of academic collaboration is here.** An AI-powered community platform that transforms how students learn, share knowledge, and grow together.

---

## 🚀 **Live Demo**
🌐 **[entropy-community-forum.vercel.app](https://entropy-community-forum.vercel.app/)**

---

## ✨ **What Makes Entropy Special**

**Entropy** isn't just another Q&A platform—it's a **gamified academic ecosystem** that turns learning into an adventure. Built with cutting-edge AI and modern web technologies, it creates an environment where knowledge-sharing becomes engaging, rewarding, and transformative.

### 🎯 **Core Features**

#### 🤖 **AI-Powered Learning Assistant**
- **RAG (Retrieval-Augmented Generation)** powered by LangChain & Pinecone
- **Document Analysis**: Upload PDFs, DOCX, and text files for intelligent Q&A
- **Contextual Answers**: AI understands your documents and provides relevant insights
- **Multi-modal Support**: Text, code, and mathematical expressions

#### 🎮 **Advanced Gamification System**
- **🪙 Entropy Coins**: Earn currency through contributions and daily activities
- **📈 XP & Leveling**: Exponential progression system (Freshman → Scholar → Expert → Sage)
- **🏆 Achievements & Badges**: Unlock milestones and showcase expertise
- **⚡ Streak System**: Maintain consistency and earn bonus rewards
- **🥇 Leaderboards**: Compete and climb the academic ranks

#### 🌐 **Community-Driven Learning**
- **Subject-Specific Communities**: Join or create focused learning groups
- **Smart Q&A System**: Post doubts with rich text, code snippets, and LaTeX support
- **Voting & Reputation**: Community-validated answers with upvote/downvote system
- **Mentorship Programs**: Connect with experienced students and mentors

#### 🎨 **Modern User Experience**
- **Responsive Design**: Perfect experience across all devices
- **Dark/Light Themes**: Customizable interface
- **Real-time Interactions**: Live updates and notifications
- **Accessible UI**: Built with Radix UI primitives

---

## 🏗️ **Architecture & Tech Stack**

### **Frontend (Next.js App)**
```
🎨 Next.js 14 + TypeScript
🎯 TailwindCSS + Radix UI
🔐 NextAuth.js Authentication
🗃️ Prisma ORM + PostgreSQL
⚡ Turbo Monorepo
```

### **Backend (AI Agent)**
```
🤖 FastAPI + Python
🧠 LangChain + LangGraph
📊 Pinecone Vector Database
📄 Document Processing (PDF, DOCX, TXT)
☁️ Vercel Serverless Deployment
```

### **Key Technologies**
- **Frontend**: Next.js, TypeScript, TailwindCSS, Radix UI, Prisma
- **Backend**: FastAPI, LangChain, Pinecone, Python
- **Database**: PostgreSQL, Vector Store (Pinecone)
- **AI/ML**: Google Gemini, RAG Architecture
- **DevOps**: Turbo, Docker, Vercel, GitHub Actions
- **Auth**: NextAuth.js with Google & GitHub providers

---

## 📦 **Project Structure**

```
entropy-community-forum/
├── 📱 apps/
│   ├── 🌐 app/                    # Next.js Frontend
│   │   ├── app/                   # App Router pages
│   │   ├── components/            # Reusable UI components
│   │   ├── lib/                   # Utilities & configurations
│   │   └── prisma/               # Database schema & migrations
│   │
│   ├── 🤖 ai-agent/              # FastAPI AI Backend
│   │   ├── app/                   # FastAPI application
│   │   │   ├── api/              # API routes
│   │   │   ├── core/             # Core configurations
│   │   │   ├── services/         # AI & business logic
│   │   │   └── utils/            # Helper functions
│   │   └── requirements.txt      # Python dependencies
│   │
│   └── 🧪 tests/                  # Test suites
│
├── 📚 packages/                   # Shared packages
│   ├── eslint-config/            # Shared ESLint configs
│   ├── typescript-config/        # Shared TypeScript configs
│   └── ui/                       # Shared UI components
│
├── 📖 docs/                       # Documentation
└── 🔧 Configuration files
    ├── turbo.json               # Turbo monorepo config
    ├── docker-compose.yml       # Docker setup
    └── package.json             # Root dependencies
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js** 18+ 
- **Python** 3.9+
- **PostgreSQL** database
- **API Keys**: Google Gemini, Pinecone (for AI features)

### **1. Clone & Install**
```bash
# Clone the repository
git clone https://github.com/yourusername/entropy-community-forum.git
cd entropy-community-forum

# Install dependencies
npm install

# Setup Python environment for AI agent
cd apps/ai-agent
python setup.py
```

### **2. Environment Configuration**
Create `.env` files in both apps:

**Frontend (`apps/app/.env.local`)**
```env
# Database
DATABASE_URL="your_postgresql_url"
DIRECT_URL="your_direct_postgresql_url"

# Authentication
NEXTAUTH_URL="http://localhost:5000"
NEXTAUTH_SECRET="your_nextauth_secret"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# AI Agent
AI_AGENT_URL="http://localhost:8000"
AI_BACKEND_TOKEN="your_backend_token"
```

**AI Agent (`apps/ai-agent/.env`)**
```env
# AI Services
GROQ_API_KEY="your_groq_api_key"
GOOGLE_API_KEY="your_google_api_key"
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_INDEX_NAME="entropy-docs"

# Configuration
AI_BACKEND_TOKEN="your_backend_token"
ENVIRONMENT="development"
```

### **3. Database Setup**
```bash
cd apps/app

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### **4. Run Development Servers**
```bash
# Run all services concurrently
npm run dev

# Or run individually:
npm run dev:app    # Frontend (http://localhost:5000)
npm run dev:agent  # AI Agent (http://localhost:8000)
```

---

## 🎮 **Gamification Deep Dive**

Entropy's gamification system is designed to make learning addictive and rewarding:

### **🪙 Entropy Coins Economy**
- **Daily Login**: +1 coin every day
- **Quality Contributions**: Earn coins from community appreciation
- **Premium Features**: Spend coins on advanced AI tools and analysis

### **📊 Level Progression System**
```
🆙 Level Formula: XP = 100 * (1.5 ^ (Level - 2))

🎯 Rank Progression:
Level 1  (0 XP)     → 👶 Freshman
Level 2  (100 XP)   → 📖 Scholar  
Level 5  (506 XP)   → 🔬 Researcher
Level 10 (3,844 XP) → 🎓 Expert
Level 50 (12.7M XP) → 🧙 Sage
```

### **⚡ Action Rewards**
- **Post Quality Doubt**: +15 XP
- **Provide Helpful Answer**: +25 XP
- **Receive Upvote**: +5 XP
- **Answer Accepted**: +50 XP
- **Daily Login Streak**: Bonus multipliers

---

## 🤖 **AI Features Spotlight**

### **Document Intelligence**
- **Multi-format Support**: PDF, DOCX, TXT processing
- **Vector Embeddings**: Semantic search through your documents
- **Contextual Q&A**: Ask questions about uploaded content
- **Code Analysis**: Understand programming concepts and debug code

### **LangChain Integration**
- **RAG Pipeline**: Retrieval-Augmented Generation for accurate answers
- **Memory Management**: Maintains conversation context
- **Tool Integration**: Dynamic tool calling for enhanced capabilities
- **Safety Features**: Content filtering and appropriate responses

---

## 🚢 **Deployment**

### **Frontend (Vercel)**
```bash
cd apps/app
vercel --prod
```

### **AI Agent (Vercel Functions)**
```bash
cd apps/ai-agent
vercel --prod
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access services:
# Frontend: http://localhost:5000
# AI Agent: http://localhost:8000
```

---

## 🧪 **Testing**

```bash
# Run all tests
npm run test

# Test specific app
cd apps/app && npm test
cd apps/tests && npm test

# Lint codebase
npm run lint
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow **TypeScript** best practices
- Write **comprehensive tests**
- Update **documentation**
- Ensure **accessibility** compliance
- Follow **conventional commits**

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Next.js Team** for the incredible React framework
- **Vercel** for seamless deployment platform
- **LangChain** for powerful AI orchestration
- **Radix UI** for accessible component primitives
- **TailwindCSS** for utility-first styling
- **Prisma** for type-safe database access

---

## 📞 **Connect With Us**

- **🌐 Live Demo**: [entropy-community-forum.vercel.app](https://entropy-community-forum.vercel.app/)
- **📧 Email**: [contact@entropy-forum.dev](mailto:contact@entropy-forum.dev)
- **💼 LinkedIn**: [Entropy Community](https://linkedin.com/company/entropy-community)
- **🐦 Twitter**: [@EntropyForum](https://twitter.com/EntropyForum)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

*Made with ❤️ by the Entropy Team*

</div>