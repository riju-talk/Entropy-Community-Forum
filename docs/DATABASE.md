# Database Schema Documentation

Complete PostgreSQL database schema for the Entropy Academic Platform.

---

## Table of Contents
1. [Overview](#overview)
2. [Core Tables](#core-tables)
3. [Gamification Tables](#gamification-tables)
4. [AI Integration Tables](#ai-integration-tables)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Migrations](#migrations)

---

## Overview

### Database Information
- **Type**: PostgreSQL 12+
- **ORM**: Prisma
- **Provider**: Supabase / Neon (recommended)
- **Connection**: Via `DATABASE_URL` environment variable

### Key Features
- **ACID Compliance**: Full transaction support
- **Referential Integrity**: Foreign keys with cascade rules
- **Optimized Queries**: Strategic indexing
- **Type Safety**: Prisma type generation
- **Migrations**: Version-controlled schema changes

---

## Core Tables

### 1. Users Table

Stores user accounts and authentication data.

```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR,
    email VARCHAR UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    image VARCHAR,
    role VARCHAR DEFAULT 'STUDENT',  -- STUDENT, TEACHER, ADMIN
    bio TEXT,
    university VARCHAR,
    course VARCHAR,
    year INTEGER,
    reputation INTEGER DEFAULT 0,
    credits INTEGER DEFAULT 100,
    subscription_tier VARCHAR DEFAULT 'FREE',  -- FREE, PRO, PREMIUM
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Fields**:
- `id`: Unique identifier (CUID)
- `email`: User's email (unique)
- `role`: Access level (STUDENT, TEACHER, ADMIN)
- `reputation`: Gamification score
- `credits`: Available credits for AI features
- `subscription_tier`: Current plan (FREE, PRO, PREMIUM)

### 2. Accounts Table

OAuth provider accounts (NextAuth.js).

```sql
CREATE TABLE accounts (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    provider VARCHAR NOT NULL,
    provider_account_id VARCHAR NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR,
    scope VARCHAR,
    id_token TEXT,
    session_state VARCHAR,
    
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

### 3. Sessions Table

User sessions (NextAuth.js).

```sql
CREATE TABLE sessions (
    id VARCHAR PRIMARY KEY,
    session_token VARCHAR UNIQUE NOT NULL,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

### 4. Doubts Table

Questions posted by users.

```sql
CREATE TABLE doubts (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    subject VARCHAR NOT NULL,  -- Enum: COMPUTER_SCIENCE, MATHEMATICS, etc.
    tags VARCHAR[] DEFAULT '{}',
    image_url VARCHAR,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    votes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    author_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doubts_author_created ON doubts(author_id, created_at);
CREATE INDEX idx_doubts_subject_created ON doubts(subject, created_at);
CREATE INDEX idx_doubts_resolved_created ON doubts(is_resolved, created_at);
CREATE INDEX idx_doubts_votes ON doubts(votes);
```

**Key Fields**:
- `subject`: Categorization (MATHEMATICS, PHYSICS, etc.)
- `is_anonymous`: Whether author is hidden
- `is_resolved`: Whether question has accepted answer
- `votes`: Net votes (upvotes - downvotes)

### 5. Comments Table

Answers and nested replies.

```sql
CREATE TABLE comments (
    id VARCHAR PRIMARY KEY,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE,
    votes INTEGER DEFAULT 0,
    doubt_id VARCHAR NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    author_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    parent_id VARCHAR REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_doubt_created ON comments(doubt_id, created_at);
CREATE INDEX idx_comments_author_created ON comments(author_id, created_at);
CREATE INDEX idx_comments_accepted ON comments(is_accepted);
CREATE INDEX idx_comments_votes ON comments(votes);
```

**Features**:
- **Threaded Replies**: `parent_id` for nested comments
- **Accepted Answers**: `is_accepted` marks the solution
- **Voting**: `votes` for quality ranking

### 6. Votes Table

Tracks upvotes/downvotes on doubts and comments.

```sql
CREATE TABLE votes (
    id VARCHAR PRIMARY KEY,
    type VARCHAR NOT NULL,  -- UP or DOWN
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doubt_id VARCHAR REFERENCES doubts(id) ON DELETE CASCADE,
    comment_id VARCHAR REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, doubt_id),
    UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_votes_user_created ON votes(user_id, created_at);
CREATE INDEX idx_votes_doubt ON votes(doubt_id);
CREATE INDEX idx_votes_comment ON votes(comment_id);
```

**Constraints**:
- One vote per user per doubt
- One vote per user per comment
- Must vote on either doubt OR comment (not both)

---

## Gamification Tables

### 7. UserStat Table

Aggregated user statistics.

```sql
CREATE TABLE user_stats (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    doubts_asked INTEGER DEFAULT 0,
    doubts_resolved INTEGER DEFAULT 0,
    comments_posted INTEGER DEFAULT 0,
    accepted_answers INTEGER DEFAULT 0,
    upvotes_received INTEGER DEFAULT 0,
    downvotes_received INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_stats_points ON user_stats(total_points);
CREATE INDEX idx_user_stats_level ON user_stats(current_level);
```

### 8. PointsLedger Table

Transaction log for all point activities.

```sql
CREATE TABLE points_ledger (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR NOT NULL,
    points INTEGER NOT NULL,
    description VARCHAR,
    doubt_id VARCHAR REFERENCES doubts(id) ON DELETE SET NULL,
    comment_id VARCHAR REFERENCES comments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_points_user_created ON points_ledger(user_id, created_at);
CREATE INDEX idx_points_event_type ON points_ledger(event_type);
```

**Event Types**:
- DOUBT_CREATED, COMMENT_CREATED
- UPVOTE_RECEIVED, DOWNVOTE_RECEIVED
- ANSWER_ACCEPTED, DOUBT_RESOLVED
- DAILY_LOGIN, STREAK_BONUS
- ACHIEVEMENT_UNLOCKED, BADGE_EARNED

### 9. Levels Table

Level definitions and requirements.

```sql
CREATE TABLE levels (
    id VARCHAR PRIMARY KEY,
    level INTEGER UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    icon VARCHAR,
    color VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_levels_min_points ON levels(min_points);
```

### 10. Achievements Table

Achievement definitions.

```sql
CREATE TABLE achievements (
    id VARCHAR PRIMARY KEY,
    type VARCHAR NOT NULL,
    name VARCHAR UNIQUE NOT NULL,
    description VARCHAR NOT NULL,
    criteria JSONB NOT NULL,
    points INTEGER NOT NULL,
    rarity VARCHAR NOT NULL,  -- COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
    icon VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 11. AchievementUnlock Table

Tracks unlocked achievements per user.

```sql
CREATE TABLE achievement_unlocks (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_achievement_unlocks_user ON achievement_unlocks(user_id, unlocked_at);
```

### 12. Badges Table

Badge definitions.

```sql
CREATE TABLE badges (
    id VARCHAR PRIMARY KEY,
    type VARCHAR NOT NULL,
    name VARCHAR UNIQUE NOT NULL,
    description VARCHAR NOT NULL,
    icon VARCHAR,
    color VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. BadgeGrant Table

Tracks awarded badges per user.

```sql
CREATE TABLE badge_grants (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id VARCHAR NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_badge_grants_user ON badge_grants(user_id, granted_at);
```

### 14. Streaks Table

Daily activity streaks.

```sql
CREATE TABLE streaks (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_streaks_last_activity ON streaks(last_activity_date);
```

### 15. LeaderboardSnapshot Table

Historical leaderboard data.

```sql
CREATE TABLE leaderboard_snapshots (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR NOT NULL,  -- DAILY, WEEKLY, MONTHLY, ALL_TIME
    scope VARCHAR NOT NULL,   -- GLOBAL, SUBJECT_CS, SUBJECT_MATH, etc.
    points INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, period, scope, period_start)
);

CREATE INDEX idx_leaderboard_period_scope ON leaderboard_snapshots(period, scope, period_start);
CREATE INDEX idx_leaderboard_rank ON leaderboard_snapshots(period, scope, rank, period_start);
```

---

## AI Integration Tables

### 16. Conversations Table

AI chat conversations.

```sql
CREATE TABLE conversations (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR,
    context JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at);
```

### 17. Messages Table

Chat messages within conversations.

```sql
CREATE TABLE messages (
    id VARCHAR PRIMARY KEY,
    conversation_id VARCHAR NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL,  -- user, assistant, system
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
```

### 18. AIRecommendations Table

AI-generated recommendations for users.

```sql
CREATE TABLE ai_recommendations (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doubt_id VARCHAR REFERENCES doubts(id) ON DELETE SET NULL,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id, is_read, created_at);
CREATE INDEX idx_ai_recommendations_doubt ON ai_recommendations(doubt_id);
```

---

## Relationships

### Entity Relationship Diagram

```
users (1) ──< (M) doubts
users (1) ──< (M) comments
users (1) ──< (M) votes
users (1) ──── (1) user_stats
users (1) ──< (M) points_ledger
users (1) ──< (M) achievement_unlocks
users (1) ──< (M) badge_grants
users (1) ──── (1) streaks
users (1) ──< (M) leaderboard_snapshots
users (1) ──< (M) conversations

doubts (1) ──< (M) comments
doubts (1) ──< (M) votes
doubts (1) ──< (M) ai_recommendations
doubts (1) ──< (M) points_ledger

comments (1) ──< (M) comments (self-referential)
comments (1) ──< (M) votes
comments (1) ──< (M) points_ledger

conversations (1) ──< (M) messages

achievements (1) ──< (M) achievement_unlocks
badges (1) ──< (M) badge_grants
```

### Key Relationships

1. **User → Doubts**: One user can ask many questions
2. **Doubt → Comments**: One question can have many answers
3. **Comment → Comments**: Nested replies (threaded discussions)
4. **User → Votes**: One user can vote on many items
5. **User → UserStat**: One-to-one relationship for aggregated stats
6. **User → PointsLedger**: Transaction history of all point activities
7. **Conversation → Messages**: Chat history

---

## Indexes

### Performance Optimization

```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Doubt queries
CREATE INDEX idx_doubts_author_created ON doubts(author_id, created_at);
CREATE INDEX idx_doubts_subject_created ON doubts(subject, created_at);
CREATE INDEX idx_doubts_resolved_created ON doubts(is_resolved, created_at);
CREATE INDEX idx_doubts_votes ON doubts(votes);

-- Comment queries
CREATE INDEX idx_comments_doubt_created ON comments(doubt_id, created_at);
CREATE INDEX idx_comments_author_created ON comments(author_id, created_at);
CREATE INDEX idx_comments_accepted ON comments(is_accepted);

-- Vote queries
CREATE INDEX idx_votes_user_created ON votes(user_id, created_at);
CREATE INDEX idx_votes_doubt ON votes(doubt_id);
CREATE INDEX idx_votes_comment ON votes(comment_id);

-- Gamification queries
CREATE INDEX idx_user_stats_points ON user_stats(total_points);
CREATE INDEX idx_points_user_created ON points_ledger(user_id, created_at);
CREATE INDEX idx_achievement_unlocks_user ON achievement_unlocks(user_id, unlocked_at);

-- Leaderboard queries
CREATE INDEX idx_leaderboard_period_scope ON leaderboard_snapshots(period, scope, period_start);
CREATE INDEX idx_leaderboard_rank ON leaderboard_snapshots(period, scope, rank, period_start);
```

---

## Migrations

### Using Prisma Migrate

```bash
# Create migration
npx prisma migrate dev --name add_feature_name

# Apply to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Common Migration Commands

```bash
# Check migration status
npx prisma migrate status

# Create migration from schema changes
npx prisma migrate dev

# Apply pending migrations
npx prisma migrate deploy

# View migration history
npx prisma migrate history
```

### Seed Database

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed levels
  await prisma.level.createMany({
    data: [
      { level: 1, name: 'Novice', minPoints: 0, maxPoints: 99 },
      { level: 2, name: 'Learner', minPoints: 100, maxPoints: 249 },
      // ... more levels
    ],
  })

  // Seed achievements
  await prisma.achievement.createMany({
    data: [
      {
        type: 'FIRST_DOUBT',
        name: 'First Question',
        description: 'Ask your first question',
        criteria: { doubtsAsked: 1 },
        points: 10,
        rarity: 'COMMON',
      },
      // ... more achievements
    ],
  })

  // Seed badges
  await prisma.badge.createMany({
    data: [
      {
        type: 'MATH_WIZARD',
        name: 'Math Wizard',
        description: 'Expert in Mathematics',
      },
      // ... more badges
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run seed:
```bash
npx prisma db seed
```

---

## Backup & Recovery

### Backup Strategy

```bash
# Backup production database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20240115.sql
```

### Automated Backups

Use Supabase/Neon built-in backup features:
- **Supabase**: Automatic daily backups (Point-in-time recovery on Pro plan)
- **Neon**: Branch-based backups

---

## Query Examples

### Get user with stats
```sql
SELECT u.*, us.total_points, us.current_level
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE u.id = $1;
```

### Get top doubts by votes
```sql
SELECT * FROM doubts
WHERE subject = 'MATHEMATICS'
ORDER BY votes DESC, created_at DESC
LIMIT 10;
```

### Get leaderboard
```sql
SELECT u.name, l.points, l.rank
FROM leaderboard_snapshots l
JOIN users u ON l.user_id = u.id
WHERE l.period = 'WEEKLY'
  AND l.scope = 'GLOBAL'
  AND l.period_start = (
    SELECT MAX(period_start)
    FROM leaderboard_snapshots
    WHERE period = 'WEEKLY' AND scope = 'GLOBAL'
  )
ORDER BY l.rank ASC
LIMIT 100;
```

---

## Performance Tips

1. **Use Indexes**: On frequently queried columns
2. **Pagination**: Always limit and offset large queries
3. **Connection Pooling**: Prisma handles this automatically
4. **Avoid N+1 Queries**: Use Prisma's `include` and `select`
5. **Caching**: Use Redis for frequently accessed data

---

This comprehensive schema supports all features of the Entropy platform with optimal performance!
