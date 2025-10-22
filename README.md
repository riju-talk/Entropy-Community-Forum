# Entropy - Academic Community Forum

A modern Next.js application for students to ask doubts, share knowledge, and learn collaboratively. Built with Next.js 14, Prisma, and PostgreSQL.

## Features

- **Ask & Answer Questions**: Post academic doubts and get help from peers
- **Voting System**: Upvote quality answers and questions
- **Subject Categories**: Organize content by academic subjects
- **User Authentication**: Sign up/login with email or OAuth providers
- **Gamification**: Points, badges, and achievements system
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Lucide Icons

## Quick Start

### Prerequisites

- **Node.js**: 18+
- **PostgreSQL**: 15+ (or use a cloud database like Supabase)

### Setup (Automated)

**Windows:**
\`\`\`bash
setup.bat
\`\`\`

**Linux/Mac:**
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

### Manual Setup

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Edit `.env.local` with your database credentials:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/entropy_db"
   NEXTAUTH_URL="http://localhost:5000"
   NEXTAUTH_SECRET="your-secret-key"
   \`\`\`

3. **Set up database**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access the application**
   - Open [http://localhost:5000](http://localhost:5000)

## Development Scripts

- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Project Structure

\`\`\`
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── globals.css     # Global styles
├── components/         # React components
│   └── ui/            # Reusable UI components
├── lib/               # Utility functions
│   ├── auth.ts       # NextAuth configuration
│   └── prisma.ts     # Prisma client
├── prisma/           # Database schema
└── hooks/           # Custom React hooks
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
