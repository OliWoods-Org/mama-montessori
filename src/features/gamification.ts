/**
 * Gamification Module (Montessori-Appropriate)
 *
 * Competitor: Strew (study points system)
 * Our advantage: Non-competitive, intrinsic-motivation-focused gamification
 *   that respects Montessori philosophy — no leaderboards, no comparison
 *
 * Features:
 * - Achievement badges for personal milestones (not rankings)
 * - Learning streaks that celebrate consistency without punishing breaks
 * - Personal challenges (self-set goals)
 * - Celebration moments (not rewards — the work IS the reward)
 * - Curiosity sparks (discoveries tracked and celebrated)
 * - No points, no rankings, no competition between children
 */

import { z } from "zod";

// ============================================================================
// Achievement Badges
// ============================================================================

export const BadgeCategorySchema = z.enum([
  "curiosity",        // Explored new areas
  "persistence",      // Stuck with something challenging
  "mastery",          // Achieved deep understanding
  "creativity",       // Made something original
  "kindness",         // Helped others learn
  "independence",     // Worked without assistance
  "exploration",      // Tried something new
  "collaboration",    // Worked well with others
  "reflection",       // Showed self-awareness
  "growth",           // Showed significant improvement
]);
export type BadgeCategory = z.infer<typeof BadgeCategorySchema>;

export const BadgeTierSchema = z.enum([
  "seed",       // First step (a seed planted)
  "sprout",     // Growing (early progress)
  "bloom",      // Flourishing (strong development)
  "tree",       // Deeply rooted (mastery)
]);
export type BadgeTier = z.infer<typeof BadgeTierSchema>;

export const AchievementBadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: BadgeCategorySchema,
  tier: BadgeTierSchema,
  iconUrl: z.string().optional(),
  criteria: z.object({
    type: z.enum([
      "session-count",
      "skill-mastery",
      "streak-days",
      "materials-explored",
      "projects-completed",
      "mentoring-sessions",
      "domains-explored",
      "artifacts-created",
      "curiosity-sparks",
      "custom",
    ]),
    threshold: z.number(),
    description: z.string(),
  }),
  celebrationMessage: z.string(),           // What MAMA says when badge is earned
  montessoriConnection: z.string(),         // How this connects to Montessori values
});
export type AchievementBadge = z.infer<typeof AchievementBadgeSchema>;

export const EarnedBadgeSchema = z.object({
  badgeId: z.string(),
  childId: z.string(),
  earnedAt: z.string(),
  context: z.string(),                      // What specifically triggered it
  celebrationDelivered: z.boolean().default(false),
  sharedWithParent: z.boolean().default(false),
});
export type EarnedBadge = z.infer<typeof EarnedBadgeSchema>;

// ============================================================================
// Learning Streaks
// ============================================================================

export const StreakSchema = z.object({
  childId: z.string(),
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  lastActivityDate: z.string().nullable().default(null),
  totalActiveDays: z.number().default(0),
  graceDaysUsed: z.number().default(0),     // Breaks don't immediately reset
  graceDaysAllowed: z.number().default(2),  // Montessori: rest is natural
  weekendsCounted: z.boolean().default(false), // Optional: only count school days
  milestones: z.array(z.object({
    days: z.number(),
    reachedAt: z.string(),
    celebrationMessage: z.string(),
  })).default([]),
});
export type Streak = z.infer<typeof StreakSchema>;

// ============================================================================
// Personal Challenges
// ============================================================================

export const ChallengeTypeSchema = z.enum([
  "exploration",      // "Try 3 new activities this week"
  "depth",            // "Spend 30 minutes on one material"
  "creative",         // "Make something you've never made before"
  "social",           // "Help someone learn something new"
  "physical",         // "Do a practical life activity each day"
  "reflection",       // "Write about your favorite discovery"
  "curiosity",        // "Ask 5 great questions"
]);
export type ChallengeType = z.infer<typeof ChallengeTypeSchema>;

export const PersonalChallengeSchema = z.object({
  id: z.string(),
  childId: z.string(),
  type: ChallengeTypeSchema,
  title: z.string(),
  description: z.string(),
  childWords: z.string(),                   // Goal in child's own words
  targetValue: z.number(),
  currentValue: z.number().default(0),
  unit: z.string(),                         // e.g., "activities", "minutes", "questions"
  status: z.enum(["active", "completed", "paused", "expired"]).default("active"),
  selfChosen: z.boolean().default(true),    // Child picked this themselves
  startedAt: z.string(),
  dueAt: z.string().optional(),
  completedAt: z.string().nullable().default(null),
});
export type PersonalChallenge = z.infer<typeof PersonalChallengeSchema>;

// ============================================================================
// Default Badge Library
// ============================================================================

export const DEFAULT_BADGES: AchievementBadge[] = [
  // Curiosity
  {
    id: "badge-first-spark", name: "First Spark", category: "curiosity", tier: "seed",
    description: "Asked your first curious question",
    criteria: { type: "curiosity-sparks", threshold: 1, description: "Record 1 curiosity spark" },
    celebrationMessage: "Your very first spark of curiosity! That question you asked shows a beautiful, wondering mind.",
    montessoriConnection: "Maria Montessori said the child's mind is like a sponge — you're absorbing the world!",
  },
  {
    id: "badge-wonder-seeker", name: "Wonder Seeker", category: "curiosity", tier: "sprout",
    description: "Asked 10 curious questions",
    criteria: { type: "curiosity-sparks", threshold: 10, description: "Record 10 curiosity sparks" },
    celebrationMessage: "Ten wonderful questions! Your curiosity is growing stronger every day.",
    montessoriConnection: "The child who questions is the child who learns — you're a natural explorer.",
  },
  // Persistence
  {
    id: "badge-steady-hands", name: "Steady Hands", category: "persistence", tier: "seed",
    description: "Completed your first 3-day streak",
    criteria: { type: "streak-days", threshold: 3, description: "Maintain a 3-day learning streak" },
    celebrationMessage: "Three days in a row! You're building a beautiful habit of learning.",
    montessoriConnection: "Consistency is the foundation of mastery — you're laying that foundation now.",
  },
  {
    id: "badge-deep-roots", name: "Deep Roots", category: "persistence", tier: "bloom",
    description: "Maintained a 30-day learning streak",
    criteria: { type: "streak-days", threshold: 30, description: "Maintain a 30-day learning streak" },
    celebrationMessage: "Thirty days of dedicated learning! Your roots are deep and strong.",
    montessoriConnection: "Maria Montessori called this 'normalization' — when learning becomes as natural as breathing.",
  },
  // Mastery
  {
    id: "badge-first-mastery", name: "First Mastery", category: "mastery", tier: "seed",
    description: "Mastered your first skill",
    criteria: { type: "skill-mastery", threshold: 1, description: "Achieve mastery on 1 skill" },
    celebrationMessage: "You truly mastered something! You worked until you understood it deeply.",
    montessoriConnection: "In Montessori, we don't rush — we go deep. You've shown what real learning looks like.",
  },
  // Creativity
  {
    id: "badge-maker-spark", name: "Maker Spark", category: "creativity", tier: "seed",
    description: "Created your first artifact",
    criteria: { type: "artifacts-created", threshold: 1, description: "Create 1 artifact" },
    celebrationMessage: "You made something! Every great creator started with a first creation.",
    montessoriConnection: "The hand is the instrument of the mind — you're expressing your ideas in the world.",
  },
  {
    id: "badge-prolific-maker", name: "Prolific Maker", category: "creativity", tier: "bloom",
    description: "Created 25 artifacts",
    criteria: { type: "artifacts-created", threshold: 25, description: "Create 25 artifacts" },
    celebrationMessage: "Twenty-five creations! You have a gallery of your learning and imagination.",
    montessoriConnection: "Each creation is a record of your thinking — look how far you've come!",
  },
  // Kindness
  {
    id: "badge-helping-hand", name: "Helping Hand", category: "kindness", tier: "seed",
    description: "Helped another child learn something new",
    criteria: { type: "mentoring-sessions", threshold: 1, description: "Complete 1 mentoring session" },
    celebrationMessage: "You helped someone learn! Teaching others is the highest form of understanding.",
    montessoriConnection: "In Montessori, older children help younger ones — it strengthens both the teacher and the learner.",
  },
  // Exploration
  {
    id: "badge-explorer", name: "Explorer", category: "exploration", tier: "seed",
    description: "Tried materials from 3 different domains",
    criteria: { type: "domains-explored", threshold: 3, description: "Explore 3 different domains" },
    celebrationMessage: "You've explored three different areas of learning! What a well-rounded mind.",
    montessoriConnection: "Montessori's 'cosmic education' connects all subjects — you're seeing the big picture.",
  },
  // Independence
  {
    id: "badge-self-starter", name: "Self-Starter", category: "independence", tier: "seed",
    description: "Completed 5 sessions independently",
    criteria: { type: "session-count", threshold: 5, description: "Complete 5 sessions" },
    celebrationMessage: "Five sessions on your own! You're becoming truly independent in your learning.",
    montessoriConnection: "Help me to do it myself — Montessori's most famous phrase, and you're living it.",
  },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Check if a child has earned any new badges
 */
export function checkBadgeEligibility(
  childId: string,
  stats: {
    sessionCount: number;
    skillsMastered: number;
    streakDays: number;
    materialsExplored: number;
    projectsCompleted: number;
    mentoringSessions: number;
    domainsExplored: number;
    artifactsCreated: number;
    curiositySparks: number;
  },
  alreadyEarned: string[],
): AchievementBadge[] {
  const earnedSet = new Set(alreadyEarned);

  return DEFAULT_BADGES.filter((badge) => {
    if (earnedSet.has(badge.id)) return false;

    const { type, threshold } = badge.criteria;
    switch (type) {
      case "session-count": return stats.sessionCount >= threshold;
      case "skill-mastery": return stats.skillsMastered >= threshold;
      case "streak-days": return stats.streakDays >= threshold;
      case "materials-explored": return stats.materialsExplored >= threshold;
      case "projects-completed": return stats.projectsCompleted >= threshold;
      case "mentoring-sessions": return stats.mentoringSessions >= threshold;
      case "domains-explored": return stats.domainsExplored >= threshold;
      case "artifacts-created": return stats.artifactsCreated >= threshold;
      case "curiosity-sparks": return stats.curiositySparks >= threshold;
      default: return false;
    }
  });
}

/**
 * Update a streak with today's activity
 */
export function updateStreak(streak: Streak, activityDate: string): Streak {
  const today = new Date(activityDate);
  const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;

  if (!lastActivity) {
    return {
      ...streak,
      currentStreak: 1,
      longestStreak: Math.max(1, streak.longestStreak),
      lastActivityDate: activityDate,
      totalActiveDays: streak.totalActiveDays + 1,
    };
  }

  const daysDiff = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysDiff === 0) return streak; // Same day, no change
  if (daysDiff === 1) {
    // Consecutive day
    const newStreak = streak.currentStreak + 1;
    const milestones = [...streak.milestones];
    if ([7, 14, 30, 60, 100].includes(newStreak)) {
      milestones.push({
        days: newStreak,
        reachedAt: activityDate,
        celebrationMessage: `${newStreak} days of learning! What an incredible journey.`,
      });
    }
    return {
      ...streak,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActivityDate: activityDate,
      totalActiveDays: streak.totalActiveDays + 1,
      milestones,
    };
  }

  if (daysDiff <= streak.graceDaysAllowed + 1) {
    // Within grace period — streak continues (rest is natural)
    const newStreak = streak.currentStreak + 1;
    return {
      ...streak,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActivityDate: activityDate,
      totalActiveDays: streak.totalActiveDays + 1,
      graceDaysUsed: streak.graceDaysUsed + (daysDiff - 1),
    };
  }

  // Streak broken, but gently — no punishment messaging
  return {
    ...streak,
    currentStreak: 1,
    lastActivityDate: activityDate,
    totalActiveDays: streak.totalActiveDays + 1,
  };
}

/**
 * Create a personal challenge for a child
 */
export function createChallenge(params: {
  childId: string;
  type: ChallengeType;
  title: string;
  description: string;
  childWords: string;
  targetValue: number;
  unit: string;
  durationDays?: number;
}): PersonalChallenge {
  const now = new Date();
  return {
    id: `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId: params.childId,
    type: params.type,
    title: params.title,
    description: params.description,
    childWords: params.childWords,
    targetValue: params.targetValue,
    currentValue: 0,
    unit: params.unit,
    status: "active",
    selfChosen: true,
    startedAt: now.toISOString(),
    dueAt: params.durationDays
      ? new Date(now.getTime() + params.durationDays * 86400000).toISOString()
      : undefined,
    completedAt: null,
  };
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(
  challenge: PersonalChallenge,
  incrementBy: number,
): PersonalChallenge {
  const newValue = Math.min(challenge.targetValue, challenge.currentValue + incrementBy);
  const completed = newValue >= challenge.targetValue;

  return {
    ...challenge,
    currentValue: newValue,
    status: completed ? "completed" : challenge.status,
    completedAt: completed ? new Date().toISOString() : challenge.completedAt,
  };
}

/**
 * Suggest challenges appropriate for a child's interests and stage
 */
export function suggestChallenges(params: {
  age: number;
  interests: string[];
  recentActivityCount: number;
  masteredSkillCount: number;
}): Array<{ type: ChallengeType; title: string; description: string; targetValue: number; unit: string }> {
  const suggestions: Array<{ type: ChallengeType; title: string; description: string; targetValue: number; unit: string }> = [];

  if (params.recentActivityCount < 3) {
    suggestions.push({
      type: "exploration",
      title: "Week of Discovery",
      description: "Try a different activity each day for a week",
      targetValue: 5,
      unit: "activities",
    });
  }

  if (params.interests.length > 0) {
    suggestions.push({
      type: "depth",
      title: `Deep Dive: ${params.interests[0]}`,
      description: `Spend extra time exploring ${params.interests[0]} this week`,
      targetValue: 60,
      unit: "minutes",
    });
  }

  suggestions.push({
    type: "creative",
    title: "Create Something New",
    description: "Make something you've never made before — a drawing, story, song, or invention",
    targetValue: 1,
    unit: "creations",
  });

  if (params.age >= 7) {
    suggestions.push({
      type: "reflection",
      title: "Thinking About Thinking",
      description: "After each session, write one sentence about what surprised you",
      targetValue: 5,
      unit: "reflections",
    });
  }

  if (params.age >= 8) {
    suggestions.push({
      type: "social",
      title: "Share Your Knowledge",
      description: "Teach someone something you've learned",
      targetValue: 1,
      unit: "teaching moments",
    });
  }

  return suggestions;
}
