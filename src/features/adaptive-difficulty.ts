/**
 * Adaptive Difficulty Module
 *
 * Competitors: Khanmigo (Khan Academy), MagicSchool AI
 * Our advantage: Montessori-aligned Zone of Proximal Development (ZPD) tracking,
 *   not just "harder/easier" — respects the child's sensitive periods and readiness
 *
 * Features:
 * - Real-time difficulty adjustment based on performance signals
 * - Zone of Proximal Development tracking per skill
 * - Mastery-based progression (not time-based)
 * - Frustration and boredom detection
 * - Scaffolding levels with gradual release
 * - Multi-domain difficulty profiles
 */

import { z } from "zod";

// ============================================================================
// Difficulty & ZPD Types
// ============================================================================

export const DifficultyLevelSchema = z.enum([
  "concrete",       // Physical/tangible manipulation (Montessori first step)
  "pictorial",      // Visual representation
  "abstract-guided", // Abstract with scaffolding
  "abstract",       // Fully abstract, independent
  "extension",      // Beyond standard — creative application
]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const ZPDZoneSchema = z.enum([
  "mastered",         // Can do independently — too easy, move on
  "independent",      // Can do with occasional errors — comfortable zone
  "zpd",              // Can do with support — optimal learning zone
  "frustration",      // Cannot do even with support — too hard
]);
export type ZPDZone = z.infer<typeof ZPDZoneSchema>;

export const ScaffoldLevelSchema = z.enum([
  "none",             // No support — child works independently
  "environmental",    // Materials arranged to guide (Montessori prepared environment)
  "visual-cue",       // Visual hints available
  "verbal-prompt",    // Verbal/text guidance
  "guided-practice",  // Step-by-step with guide
  "modeled",          // Full demonstration provided
]);
export type ScaffoldLevel = z.infer<typeof ScaffoldLevelSchema>;

// ============================================================================
// Performance Signals
// ============================================================================

export const PerformanceSignalSchema = z.object({
  childId: z.string(),
  skillId: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  signal: z.enum([
    "correct-first-try",
    "correct-with-retry",
    "correct-with-hint",
    "incorrect",
    "abandoned",
    "help-requested",
    "self-corrected",
    "repeated-voluntarily",
    "time-exceeded",
    "completed-quickly",
  ]),
  responseTimeMs: z.number().optional(),
  attemptNumber: z.number().default(1),
  difficultyLevel: DifficultyLevelSchema,
  scaffoldLevel: ScaffoldLevelSchema,
});
export type PerformanceSignal = z.infer<typeof PerformanceSignalSchema>;

// ============================================================================
// Emotional Engagement Signals
// ============================================================================

export const EngagementStateSchema = z.enum([
  "flow",           // Optimal challenge, fully engaged
  "interested",     // Engaged, learning well
  "comfortable",    // Can do it but not being stretched
  "bored",          // Material is too easy
  "challenged",     // Material is hard but manageable
  "struggling",     // Having difficulty, may need support
  "frustrated",     // Material is too hard, needs intervention
  "anxious",        // Emotional block, not related to difficulty
]);
export type EngagementState = z.infer<typeof EngagementStateSchema>;

export const EngagementSignalSchema = z.object({
  childId: z.string(),
  sessionId: z.string(),
  state: EngagementStateSchema,
  confidence: z.number().min(0).max(1),
  source: z.enum(["self-report", "behavior-analysis", "guide-observation", "ai-inference"]),
  timestamp: z.string(),
});
export type EngagementSignal = z.infer<typeof EngagementSignalSchema>;

// ============================================================================
// Adaptive Profile
// ============================================================================

export const SkillAdaptiveProfileSchema = z.object({
  childId: z.string(),
  skillId: z.string(),
  skillName: z.string(),
  currentDifficulty: DifficultyLevelSchema,
  currentScaffold: ScaffoldLevelSchema,
  currentZone: ZPDZoneSchema,
  successRate: z.number().min(0).max(100),  // Recent success rate
  averageResponseTimeMs: z.number(),
  totalAttempts: z.number(),
  consecutiveSuccesses: z.number(),
  consecutiveFailures: z.number(),
  selfCorrectionRate: z.number().min(0).max(100),
  voluntaryRepetitionRate: z.number().min(0).max(100),
  lastAdjustedAt: z.string(),
  history: z.array(z.object({
    difficulty: DifficultyLevelSchema,
    scaffold: ScaffoldLevelSchema,
    zone: ZPDZoneSchema,
    timestamp: z.string(),
    reason: z.string(),
  })).default([]),
});
export type SkillAdaptiveProfile = z.infer<typeof SkillAdaptiveProfileSchema>;

export const ChildAdaptiveProfileSchema = z.object({
  childId: z.string(),
  skills: z.record(z.string(), SkillAdaptiveProfileSchema),
  globalEngagementTrend: z.enum(["increasing", "stable", "decreasing"]),
  preferredDifficultyZone: DifficultyLevelSchema,
  frustrationType: z.enum([
    "persists",       // Keeps trying when frustrated
    "seeks-help",     // Asks for guidance
    "avoids",         // Switches to easier work
    "emotional",      // Shows emotional response
  ]).optional(),
  optimalSessionLength: z.number(),          // minutes
  bestTimeOfDay: z.string().optional(),
  updatedAt: z.string(),
});
export type ChildAdaptiveProfile = z.infer<typeof ChildAdaptiveProfileSchema>;

// ============================================================================
// Difficulty Adjustment Rules
// ============================================================================

export const DIFFICULTY_ORDER: DifficultyLevel[] = [
  "concrete", "pictorial", "abstract-guided", "abstract", "extension",
];

export const SCAFFOLD_ORDER: ScaffoldLevel[] = [
  "modeled", "guided-practice", "verbal-prompt", "visual-cue", "environmental", "none",
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Process a performance signal and determine if difficulty should be adjusted
 */
export function processPerformanceSignal(
  profile: SkillAdaptiveProfile,
  signal: PerformanceSignal,
): { updatedProfile: SkillAdaptiveProfile; adjustment: string | null } {
  let { consecutiveSuccesses, consecutiveFailures, totalAttempts, successRate } = profile;
  totalAttempts++;

  const isSuccess = ["correct-first-try", "correct-with-retry", "self-corrected"].includes(signal.signal);
  const isVoluntaryRepeat = signal.signal === "repeated-voluntarily";

  if (isSuccess) {
    consecutiveSuccesses++;
    consecutiveFailures = 0;
  } else if (signal.signal === "incorrect" || signal.signal === "abandoned") {
    consecutiveFailures++;
    consecutiveSuccesses = 0;
  }

  // Rolling success rate (weighted toward recent)
  const recentWeight = 0.3;
  const oldRate = successRate / 100;
  const newRate = isSuccess ? 1 : 0;
  successRate = Math.round((oldRate * (1 - recentWeight) + newRate * recentWeight) * 100);

  let adjustment: string | null = null;
  let { currentDifficulty, currentScaffold, currentZone } = profile;

  // Determine ZPD zone
  if (successRate >= 90 && consecutiveSuccesses >= 5) {
    currentZone = "mastered";
  } else if (successRate >= 70) {
    currentZone = "independent";
  } else if (successRate >= 40) {
    currentZone = "zpd";
  } else {
    currentZone = "frustration";
  }

  // Adjust difficulty based on zone
  if (currentZone === "mastered" && consecutiveSuccesses >= 5) {
    // Move up difficulty
    const currentIdx = DIFFICULTY_ORDER.indexOf(currentDifficulty);
    if (currentIdx < DIFFICULTY_ORDER.length - 1) {
      currentDifficulty = DIFFICULTY_ORDER[currentIdx + 1];
      adjustment = `Increased difficulty to ${currentDifficulty} — child has mastered current level`;
      consecutiveSuccesses = 0;
    }
    // Also reduce scaffolding
    const scaffoldIdx = SCAFFOLD_ORDER.indexOf(currentScaffold);
    if (scaffoldIdx < SCAFFOLD_ORDER.length - 1) {
      currentScaffold = SCAFFOLD_ORDER[scaffoldIdx + 1];
    }
  } else if (currentZone === "frustration" && consecutiveFailures >= 3) {
    // Move down difficulty or increase scaffolding
    const scaffoldIdx = SCAFFOLD_ORDER.indexOf(currentScaffold);
    if (scaffoldIdx > 0) {
      currentScaffold = SCAFFOLD_ORDER[scaffoldIdx - 1];
      adjustment = `Added more scaffolding (${currentScaffold}) — child needs more support`;
    } else {
      const currentIdx = DIFFICULTY_ORDER.indexOf(currentDifficulty);
      if (currentIdx > 0) {
        currentDifficulty = DIFFICULTY_ORDER[currentIdx - 1];
        adjustment = `Decreased difficulty to ${currentDifficulty} — returning to more concrete work`;
      }
    }
    consecutiveFailures = 0;
  }

  // Voluntary repetition is a sign of Montessori normalization — note but don't change difficulty
  if (isVoluntaryRepeat) {
    // This is GOOD — the child is choosing to repeat, a key Montessori sign of deep learning
  }

  const history = [...profile.history];
  if (adjustment) {
    history.push({
      difficulty: currentDifficulty,
      scaffold: currentScaffold,
      zone: currentZone,
      timestamp: new Date().toISOString(),
      reason: adjustment,
    });
  }

  return {
    updatedProfile: {
      ...profile,
      currentDifficulty,
      currentScaffold,
      currentZone,
      successRate,
      totalAttempts,
      consecutiveSuccesses,
      consecutiveFailures,
      lastAdjustedAt: adjustment ? new Date().toISOString() : profile.lastAdjustedAt,
      history: history.slice(-50), // Keep last 50 adjustments
    },
    adjustment,
  };
}

/**
 * Initialize an adaptive profile for a new skill
 */
export function initializeSkillProfile(
  childId: string,
  skillId: string,
  skillName: string,
  startingDifficulty?: DifficultyLevel,
): SkillAdaptiveProfile {
  return {
    childId,
    skillId,
    skillName,
    currentDifficulty: startingDifficulty ?? "concrete",
    currentScaffold: "environmental",
    currentZone: "zpd",
    successRate: 50,
    averageResponseTimeMs: 0,
    totalAttempts: 0,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    selfCorrectionRate: 0,
    voluntaryRepetitionRate: 0,
    lastAdjustedAt: new Date().toISOString(),
    history: [],
  };
}

/**
 * Determine optimal next activity based on adaptive profiles
 */
export function recommendNextActivity(
  childProfile: ChildAdaptiveProfile,
): { skillId: string; reason: string } | null {
  const skills = Object.values(childProfile.skills);

  // Priority 1: Skills in ZPD (optimal learning zone)
  const zpdSkills = skills.filter((s) => s.currentZone === "zpd");
  if (zpdSkills.length > 0) {
    const best = zpdSkills.sort((a, b) => a.totalAttempts - b.totalAttempts)[0];
    return {
      skillId: best.skillId,
      reason: `"${best.skillName}" is in your optimal learning zone — challenging but achievable`,
    };
  }

  // Priority 2: Skills that are independent (comfortable, ready for challenge)
  const independentSkills = skills.filter((s) => s.currentZone === "independent" && s.consecutiveSuccesses < 5);
  if (independentSkills.length > 0) {
    const best = independentSkills[0];
    return {
      skillId: best.skillId,
      reason: `You're doing well with "${best.skillName}" — let's keep building on that confidence`,
    };
  }

  // Priority 3: Mastered skills that could move to next difficulty
  const readyToAdvance = skills.filter(
    (s) => s.currentZone === "mastered" && DIFFICULTY_ORDER.indexOf(s.currentDifficulty) < DIFFICULTY_ORDER.length - 1,
  );
  if (readyToAdvance.length > 0) {
    const best = readyToAdvance[0];
    return {
      skillId: best.skillId,
      reason: `You've mastered "${best.skillName}" at this level — ready for the next challenge!`,
    };
  }

  return null;
}

/**
 * Detect engagement state from performance patterns
 */
export function detectEngagement(
  recentSignals: PerformanceSignal[],
  timeInActivityMs: number,
): EngagementState {
  if (recentSignals.length < 3) return "interested";

  const last5 = recentSignals.slice(-5);
  const successCount = last5.filter((s) =>
    ["correct-first-try", "correct-with-retry", "self-corrected"].includes(s.signal),
  ).length;
  const abandonCount = last5.filter((s) => s.signal === "abandoned").length;
  const helpCount = last5.filter((s) => s.signal === "help-requested").length;
  const quickCount = last5.filter((s) => s.signal === "completed-quickly").length;

  if (abandonCount >= 2) return "frustrated";
  if (helpCount >= 3) return "struggling";
  if (quickCount >= 4 && successCount >= 4) return "bored";
  if (successCount >= 4 && quickCount < 3) return "flow";
  if (successCount >= 3) return "interested";
  if (successCount >= 2) return "challenged";
  return "struggling";
}
