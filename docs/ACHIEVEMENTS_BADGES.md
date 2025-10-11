# Achievements & Badges System Guide

Complete guide for implementing the gamification system including achievements, badges, levels, and leaderboards.

---

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Points System](#points-system)
4. [Achievements](#achievements)
5. [Badges](#badges)
6. [Levels](#levels)
7. [Streaks](#streaks)
8. [Leaderboards](#leaderboards)
9. [Implementation](#implementation)

---

## Overview

### Gamification Features
- **Points System**: Earn points for various activities
- **Levels**: Progress through 20+ levels
- **Achievements**: Unlock 30+ achievements
- **Badges**: Earn subject-specific and special badges
- **Streaks**: Daily activity tracking
- **Leaderboards**: Global and subject-specific rankings

### Goals
- Increase user engagement
- Encourage quality contributions
- Reward consistent activity
- Build community competition

---

## Database Schema

All tables already exist in `prisma/schema.prisma`. Key models:

### UserStat
```prisma
model UserStat {
  id                  String   @id @default(cuid())
  userId              String   @unique
  totalPoints         Int      @default(0)
  currentLevel        Int      @default(1)
  doubtsAsked         Int      @default(0)
  doubtsResolved      Int      @default(0)
  commentsPosted      Int      @default(0)
  acceptedAnswers     Int      @default(0)
  upvotesReceived     Int      @default(0)
  downvotesReceived   Int      @default(0)
  
  user User @relation(fields: [userId], references: [id])
}
```

### PointsLedger
Tracks all point transactions:
```prisma
model PointsLedger {
  id          String         @id @default(cuid())
  userId      String
  eventType   PointEventType
  points      Int
  description String?
  doubtId     String?
  commentId   String?
  createdAt   DateTime       @default(now())
}

enum PointEventType {
  DOUBT_CREATED
  COMMENT_CREATED
  UPVOTE_RECEIVED
  DOWNVOTE_RECEIVED
  ANSWER_ACCEPTED
  DOUBT_RESOLVED
  DAILY_LOGIN
  STREAK_BONUS
  ACHIEVEMENT_UNLOCKED
  BADGE_EARNED
}
```

### Achievement
```prisma
model Achievement {
  id          String          @id @default(cuid())
  type        AchievementType
  name        String          @unique
  description String
  criteria    Json
  points      Int
  rarity      AchievementRarity
  icon        String?
}

enum AchievementRarity {
  COMMON      // 5-10 points
  UNCOMMON    // 15-25 points
  RARE        // 30-50 points
  EPIC        // 75-100 points
  LEGENDARY   // 150+ points
}
```

### Badge
```prisma
model Badge {
  id          String    @id @default(cuid())
  type        BadgeType
  name        String    @unique
  description String
  icon        String?
  color       String?
}

enum BadgeType {
  AI_MASTER
  PHYSICS_GURU
  MATH_WIZARD
  CODE_NINJA
  BIO_EXPERT
  PROBLEM_SOLVER
  HELPER
  INNOVATOR
  TUTOR
  RESEARCH_STAR
}
```

---

## Points System

### Point Values

```typescript
const POINTS = {
  // Content Creation
  DOUBT_CREATED: 5,
  COMMENT_CREATED: 2,
  
  // Recognition
  UPVOTE_RECEIVED: 3,
  DOWNVOTE_RECEIVED: -1,
  ANSWER_ACCEPTED: 15,
  DOUBT_RESOLVED: 10,
  
  // Engagement
  DAILY_LOGIN: 1,
  STREAK_3_DAYS: 5,
  STREAK_7_DAYS: 15,
  STREAK_30_DAYS: 50,
  
  // Milestones
  ACHIEVEMENT_UNLOCKED: 10, // + achievement points
  BADGE_EARNED: 20,
  LEVEL_UP: 25,
}
```

### Point Ledger Service

**app/actions/points.ts**
```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { PointEventType } from '@prisma/client'

export async function awardPoints(
  userId: string,
  eventType: PointEventType,
  points: number,
  description?: string,
  metadata?: { doubtId?: string; commentId?: string }
) {
  // Create ledger entry
  await prisma.pointsLedger.create({
    data: {
      userId,
      eventType,
      points,
      description,
      doubtId: metadata?.doubtId,
      commentId: metadata?.commentId,
    },
  })

  // Update user stats
  const userStat = await prisma.userStat.upsert({
    where: { userId },
    create: {
      userId,
      totalPoints: points,
      currentLevel: 1,
    },
    update: {
      totalPoints: {
        increment: points,
      },
    },
  })

  // Check for level up
  await checkLevelUp(userId, userStat.totalPoints)

  // Check for achievements
  await checkAchievements(userId)

  return { success: true, newTotal: userStat.totalPoints + points }
}

async function checkLevelUp(userId: string, totalPoints: number) {
  const currentLevel = await prisma.level.findFirst({
    where: {
      minPoints: { lte: totalPoints },
      maxPoints: totalPoints < 10000 ? { gte: totalPoints } : null,
    },
  })

  if (!currentLevel) return

  const userStat = await prisma.userStat.findUnique({
    where: { userId },
  })

  if (userStat && currentLevel.level > userStat.currentLevel) {
    // Level up!
    await prisma.userStat.update({
      where: { userId },
      data: { currentLevel: currentLevel.level },
    })

    // Award level up points
    await awardPoints(
      userId,
      'ACHIEVEMENT_UNLOCKED',
      25,
      `Leveled up to ${currentLevel.name}`
    )
  }
}
```

---

## Achievements

### Achievement Definitions

**lib/achievements.ts**
```typescript
export const ACHIEVEMENTS = {
  FIRST_DOUBT: {
    name: 'First Question',
    description: 'Ask your first question',
    criteria: { doubtsAsked: 1 },
    points: 10,
    rarity: 'COMMON',
    icon: '🎯',
  },
  
  FIRST_COMMENT: {
    name: 'First Answer',
    description: 'Post your first answer',
    criteria: { commentsPosted: 1 },
    points: 10,
    rarity: 'COMMON',
    icon: '💬',
  },
  
  PROBLEM_SOLVER: {
    name: 'Problem Solver',
    description: 'Get 10 answers accepted',
    criteria: { acceptedAnswers: 10 },
    points: 50,
    rarity: 'RARE',
    icon: '🏆',
  },
  
  STREAK_MASTER: {
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    criteria: { longestStreak: 30 },
    points: 100,
    rarity: 'EPIC',
    icon: '🔥',
  },
  
  MENTOR: {
    name: 'Mentor',
    description: 'Help 50 students with answers',
    criteria: { commentsPosted: 50 },
    points: 75,
    rarity: 'EPIC',
    icon: '👨‍🏫',
  },
  
  TOP_CONTRIBUTOR: {
    name: 'Top Contributor',
    description: 'Reach 1000 total points',
    criteria: { totalPoints: 1000 },
    points: 150,
    rarity: 'LEGENDARY',
    icon: '⭐',
  },
  
  SUBJECT_EXPERT: {
    name: 'Subject Expert',
    description: 'Get 25 upvotes in one subject',
    criteria: { subjectUpvotes: 25 },
    points: 100,
    rarity: 'EPIC',
    icon: '🎓',
  },
}
```

### Achievement Checker

**app/actions/achievements.ts**
```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { ACHIEVEMENTS } from '@/lib/achievements'

export async function checkAchievements(userId: string) {
  const userStat = await prisma.userStat.findUnique({
    where: { userId },
  })

  if (!userStat) return

  const unlockedAchievements = await prisma.achievementUnlock.findMany({
    where: { userId },
    select: { achievementId: true },
  })

  const unlockedIds = new Set(unlockedAchievements.map((a) => a.achievementId))

  // Check each achievement
  for (const [type, config] of Object.entries(ACHIEVEMENTS)) {
    const achievement = await prisma.achievement.findUnique({
      where: { name: config.name },
    })

    if (!achievement || unlockedIds.has(achievement.id)) continue

    // Check criteria
    const criteria = config.criteria as any
    const meetsRequirements = Object.entries(criteria).every(
      ([key, value]) => userStat[key as keyof typeof userStat] >= (value as number)
    )

    if (meetsRequirements) {
      // Unlock achievement
      await prisma.achievementUnlock.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      })

      // Award points
      await awardPoints(
        userId,
        'ACHIEVEMENT_UNLOCKED',
        achievement.points,
        `Unlocked: ${achievement.name}`
      )

      // Return for notification
      return achievement
    }
  }
}
```

---

## Badges

### Badge Grant Logic

**app/actions/badges.ts**
```typescript
'use server'

import { prisma } from '@/lib/prisma'

export async function checkBadges(userId: string, subject?: string) {
  // Math Wizard: 100 points in Mathematics
  if (subject === 'MATHEMATICS') {
    const mathPoints = await prisma.pointsLedger.aggregate({
      where: {
        userId,
        doubt: { subject: 'MATHEMATICS' },
      },
      _sum: { points: true },
    })

    if (mathPoints._sum.points && mathPoints._sum.points >= 100) {
      const badge = await prisma.badge.findUnique({
        where: { name: 'Math Wizard' },
      })

      if (badge) {
        await prisma.badgeGrant.upsert({
          where: {
            userId_badgeId: {
              userId,
              badgeId: badge.id,
            },
          },
          create: { userId, badgeId: badge.id },
          update: {},
        })
      }
    }
  }

  // Helper: 20 accepted answers
  const acceptedCount = await prisma.userStat.findUnique({
    where: { userId },
    select: { acceptedAnswers: true },
  })

  if (acceptedCount && acceptedCount.acceptedAnswers >= 20) {
    const helperBadge = await prisma.badge.findUnique({
      where: { name: 'Helper' },
    })

    if (helperBadge) {
      await prisma.badgeGrant.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: helperBadge.id,
          },
        },
        create: { userId, badgeId: helperBadge.id },
        update: {},
      })
    }
  }
}
```

---

## Levels

### Level Definitions

**prisma/seed.ts** (add this)
```typescript
const LEVELS = [
  { level: 1, name: 'Novice', minPoints: 0, maxPoints: 99, icon: '🌱', color: '#gray' },
  { level: 2, name: 'Learner', minPoints: 100, maxPoints: 249, icon: '📚', color: '#blue' },
  { level: 3, name: 'Scholar', minPoints: 250, maxPoints: 499, icon: '🎓', color: '#green' },
  { level: 4, name: 'Expert', minPoints: 500, maxPoints: 999, icon: '⭐', color: '#purple' },
  { level: 5, name: 'Master', minPoints: 1000, maxPoints: 1999, icon: '🏆', color: '#orange' },
  { level: 6, name: 'Grandmaster', minPoints: 2000, maxPoints: 4999, icon: '👑', color: '#red' },
  { level: 7, name: 'Legend', minPoints: 5000, maxPoints: null, icon: '💎', color: '#gold' },
]

async function seedLevels() {
  for (const level of LEVELS) {
    await prisma.level.upsert({
      where: { level: level.level },
      create: level,
      update: level,
    })
  }
}
```

---

## Streaks

### Streak Tracking

**app/actions/streaks.ts**
```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { awardPoints } from './points'

export async function updateStreak(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const streak = await prisma.streak.findUnique({
    where: { userId },
  })

  if (!streak) {
    // Create new streak
    await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      },
    })

    await awardPoints(userId, 'DAILY_LOGIN', 1, 'Daily login')
    return
  }

  const lastActivity = new Date(streak.lastActivityDate!)
  lastActivity.setHours(0, 0, 0, 0)

  const daysDiff = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysDiff === 0) {
    // Already logged in today
    return
  } else if (daysDiff === 1) {
    // Continue streak
    const newStreak = streak.currentStreak + 1
    const longestStreak = Math.max(newStreak, streak.longestStreak)

    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: today,
      },
    })

    await awardPoints(userId, 'DAILY_LOGIN', 1, 'Daily login')

    // Streak bonuses
    if (newStreak === 3) {
      await awardPoints(userId, 'STREAK_BONUS', 5, '3-day streak bonus')
    } else if (newStreak === 7) {
      await awardPoints(userId, 'STREAK_BONUS', 15, '7-day streak bonus')
    } else if (newStreak === 30) {
      await awardPoints(userId, 'STREAK_BONUS', 50, '30-day streak bonus')
    }
  } else {
    // Streak broken
    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastActivityDate: today,
      },
    })

    await awardPoints(userId, 'DAILY_LOGIN', 1, 'Daily login')
  }
}
```

---

## Leaderboards

### Leaderboard Generation

**app/actions/leaderboard.ts**
```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { LeaderboardPeriod, LeaderboardScope } from '@prisma/client'

export async function generateLeaderboard(
  period: LeaderboardPeriod,
  scope: LeaderboardScope
) {
  const { periodStart, periodEnd } = getPeriodDates(period)

  // Get points for period
  const userPoints = await prisma.pointsLedger.groupBy({
    by: ['userId'],
    where: {
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
      // Add subject filter for subject-specific leaderboards
      ...(scope !== 'GLOBAL' && {
        doubt: {
          subject: scope.replace('SUBJECT_', ''),
        },
      }),
    },
    _sum: {
      points: true,
    },
    orderBy: {
      _sum: {
        points: 'desc',
      },
    },
    take: 100,
  })

  // Create snapshots
  for (let i = 0; i < userPoints.length; i++) {
    const { userId, _sum } = userPoints[i]
    
    await prisma.leaderboardSnapshot.upsert({
      where: {
        userId_period_scope_periodStart: {
          userId,
          period,
          scope,
          periodStart,
        },
      },
      create: {
        userId,
        period,
        scope,
        points: _sum.points || 0,
        rank: i + 1,
        periodStart,
        periodEnd,
      },
      update: {
        points: _sum.points || 0,
        rank: i + 1,
      },
    })
  }

  return userPoints.length
}

function getPeriodDates(period: LeaderboardPeriod) {
  const now = new Date()
  let periodStart: Date
  let periodEnd: Date = now

  switch (period) {
    case 'DAILY':
      periodStart = new Date(now)
      periodStart.setHours(0, 0, 0, 0)
      break
    case 'WEEKLY':
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - now.getDay())
      periodStart.setHours(0, 0, 0, 0)
      break
    case 'MONTHLY':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'ALL_TIME':
      periodStart = new Date(0)
      break
  }

  return { periodStart, periodEnd }
}

// Cron job: Run daily at midnight
export async function updateAllLeaderboards() {
  await generateLeaderboard('DAILY', 'GLOBAL')
  await generateLeaderboard('WEEKLY', 'GLOBAL')
  await generateLeaderboard('MONTHLY', 'GLOBAL')
  
  // Subject-specific
  const subjects = ['SUBJECT_CS', 'SUBJECT_MATH', 'SUBJECT_PHYSICS']
  for (const subject of subjects) {
    await generateLeaderboard('WEEKLY', subject as LeaderboardScope)
  }
}
```

---

## Implementation

### Integration Points

1. **Doubt Created** → Award 5 points
```typescript
// In app/actions/doubts.ts
await awardPoints(userId, 'DOUBT_CREATED', 5, 'Created a question')
```

2. **Comment Posted** → Award 2 points
```typescript
// In app/actions/comments.ts
await awardPoints(userId, 'COMMENT_CREATED', 2, 'Posted an answer')
```

3. **Upvote Received** → Award 3 points
```typescript
// In app/actions/votes.ts
await awardPoints(authorId, 'UPVOTE_RECEIVED', 3, 'Received an upvote')
```

4. **Answer Accepted** → Award 15 points
```typescript
// In app/actions/comments.ts
await awardPoints(commentAuthorId, 'ANSWER_ACCEPTED', 15, 'Answer accepted')
```

### UI Components

**components/user-level-badge.tsx**
```typescript
import { Badge } from '@/components/ui/badge'

export function UserLevelBadge({ level, icon, color }: { 
  level: number
  icon: string
  color: string 
}) {
  return (
    <Badge 
      variant="outline" 
      className={`bg-${color}-100 text-${color}-700`}
    >
      {icon} Level {level}
    </Badge>
  )
}
```

**components/achievement-card.tsx**
```typescript
export function AchievementCard({ achievement, unlocked }: {
  achievement: Achievement
  unlocked: boolean
}) {
  return (
    <Card className={unlocked ? '' : 'opacity-50 grayscale'}>
      <CardContent className="p-4">
        <div className="text-4xl mb-2">{achievement.icon}</div>
        <h3 className="font-bold">{achievement.name}</h3>
        <p className="text-sm text-muted-foreground">
          {achievement.description}
        </p>
        <div className="mt-2">
          <Badge variant={getRarityVariant(achievement.rarity)}>
            {achievement.rarity}
          </Badge>
          <span className="ml-2 text-sm">+{achievement.points} pts</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Testing

```typescript
// Test point awarding
describe('Points System', () => {
  it('awards points for doubt creation', async () => {
    const result = await awardPoints(userId, 'DOUBT_CREATED', 5)
    expect(result.success).toBe(true)
  })

  it('checks for level up', async () => {
    // Award 100 points
    await awardPoints(userId, 'DOUBT_CREATED', 100)
    const user = await prisma.userStat.findUnique({ where: { userId } })
    expect(user?.currentLevel).toBe(2)
  })
})
```

---

## Next Steps

1. ✅ Seed achievements and badges in database
2. ✅ Integrate point awarding in all actions
3. ✅ Build UI components for achievements page
4. ✅ Implement streak tracking
5. ✅ Create leaderboard page
6. ✅ Set up cron job for daily leaderboard updates
7. ✅ Add notifications for achievements
8. ✅ Build profile page with stats

This gamification system will drive engagement and make learning more fun!
