# Entropy - Global Learning Platform

A comprehensive Next.js application for students to ask doubts, share knowledge, and learn collaboratively. Built with modern technologies including Next.js 14, Prisma, Supabase, and NextAuth.js.

## Features

### Core Functionality
- **Ask & Answer Doubts**: Students can post questions and get answers from peers and teachers
- **Anonymous Posting**: Option to post questions and answers anonymously
- **Voting System**: Upvote/downvote questions and answers to highlight quality content
- **Subject Categories**: Organize content by academic subjects
- **Tagging System**: Add relevant tags to improve discoverability
- **Accepted Answers**: Question authors can mark the best answer as accepted
- **Real-time Updates**: Live updates when new answers are posted

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Infinite Scroll**: Lazy loading with smooth pagination
- **Search Functionality**: Find relevant doubts and topics quickly
- **User Profiles**: View user activity and reputation
- **Markdown Support**: Rich text formatting in questions and answers

### Authentication & Security
- **Multiple Sign-in Options**: Google, GitHub, and email/password
- **Secure Sessions**: JWT-based authentication with NextAuth.js
- **Role-based Access**: Different permissions for students, teachers, and admins
- **Data Validation**: Server-side validation with Zod schemas

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Form handling and validation
- **React Markdown**: Markdown rendering with syntax highlighting

### Backend
- **Prisma ORM**: Type-safe database client
- **Supabase**: PostgreSQL database hosting
- **NextAuth.js**: Authentication solution
- **Server Actions**: Server-side form handling
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## Getting Started

### Prerequisites
- **Node.js**: 18+ 
- **Python**: 3.11+ (for AI Agent)
- **PostgreSQL**: 15+ or Supabase account
- **OpenAI API Key**: Required for AI features
- **OAuth Apps** (optional): Google/GitHub for social login

### Quick Setup

#### Automated Setup (Windows, Recommended)

```powershell
.\setup.ps1
```

If you are on Linux/Mac, follow the Manual Setup steps below.

The setup script will:
- Check prerequisites
- Create environment files
- Generate secure secrets
- Install dependencies
- Setup database schema

#### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd entropy-community-forum
   ```

2. **Install dependencies**
   ```bash
   # Next.js dependencies
   npm install
   
   # AI Agent dependencies
   cd spark-ai-agent
   pip install -r requirements.txt
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/entropy_db"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:5000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # AI Agent
   NEXT_PUBLIC_SPARK_API_URL="http://localhost:8000"
   NEXT_PUBLIC_AI_BACKEND_TOKEN="your-secure-token"
   
   # OpenAI (Required)
   OPENAI_API_KEY="sk-your-openai-api-key"
   
   # OAuth Providers (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development servers**
   
   **Terminal 1 - Next.js:**
   ```bash
   npm run dev
   ```
   
   **Terminal 2 - AI Agent:**
   ```bash
   cd spark-ai-agent
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access the application**
   - Frontend: [http://localhost:5000](http://localhost:5000)
   - AI Agent API: [http://localhost:8000/docs](http://localhost:8000/docs)

### Database Setup

The application uses Prisma with Supabase PostgreSQL. The schema includes:

- **Users**: Authentication and profile information
- **Doubts**: Questions posted by users
- **Comments**: Answers and replies to doubts
- **Votes**: Upvote/downvote system
- **Sessions/Accounts**: NextAuth.js authentication tables

### Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

#### Quick Deploy Options

**Option 1: Docker Compose (Recommended)**
```bash
docker-compose up -d
```

**Option 2: Vercel + Railway**
- Deploy Next.js to Vercel
- Deploy AI Agent to Railway
- Use Supabase for database

**Option 3: VPS with PM2**
```bash
npm run build
pm2 start npm --name "entropy" -- start
cd spark-ai-agent
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name "spark-ai"
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

## Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── auth/              # Authentication pages
│   ├── ask/               # Ask doubt page
│   ├── doubts/            # Doubt detail pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature components
├── lib/                   # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── utils.ts           # Helper functions
│   └── validations.ts     # Zod schemas
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema
└── hooks/                 # Custom React hooks
\`\`\`

## API Endpoints

### REST API
- `GET /api/doubts` - Fetch doubts with pagination
- `POST /api/doubts` - Create new doubt (via Server Action)

### Server Actions
- `createDoubt` - Create a new doubt
- `createComment` - Add answer to doubt
- `voteOnDoubt` - Vote on doubt
- `voteOnComment` - Vote on answer
- `markCommentAsAccepted` - Mark answer as accepted

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@entropy-platform.com or join our Discord community.

## Roadmap

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] AI-powered doubt suggestions
- [ ] Advanced search with filters
- [ ] Reputation and badge system
- [ ] Video/audio support
- [ ] Study groups and classrooms
- [ ] Integration with learning management systems
