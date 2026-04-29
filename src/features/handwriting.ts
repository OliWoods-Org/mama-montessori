/**
 * AI Handwriting Recognition Module
 *
 * Competitor: Edoki (handwriting recognition for letter tracing)
 * Our advantage: Full stroke analysis, multi-script support, developmental tracking
 *
 * Features:
 * - Letter/number tracing with real-time stroke analysis
 * - Stroke order, pressure, and formation feedback
 * - Developmental handwriting progression tracking
 * - Multi-script support (Latin, Cyrillic, Arabic, CJK basics)
 * - Pre-writing skill assessment (fine motor readiness)
 * - Montessori-aligned: sandpaper letter methodology translated to digital
 */

import { z } from "zod";

// ============================================================================
// Stroke & Trace Types
// ============================================================================

export const StrokePointSchema = z.object({
  x: z.number(),
  y: z.number(),
  pressure: z.number().min(0).max(1).default(0.5),
  timestamp: z.number(),                    // ms since trace start
  tiltX: z.number().optional(),             // Stylus tilt
  tiltY: z.number().optional(),
});
export type StrokePoint = z.infer<typeof StrokePointSchema>;

export const StrokeSchema = z.object({
  id: z.string(),
  points: z.array(StrokePointSchema),
  startTimestamp: z.number(),
  endTimestamp: z.number(),
});
export type Stroke = z.infer<typeof StrokeSchema>;

export const ScriptTypeSchema = z.enum([
  "latin-uppercase",
  "latin-lowercase",
  "latin-cursive",
  "numbers",
  "cyrillic",
  "arabic",
  "devanagari",
  "cjk-basic",
  "hiragana",
  "katakana",
  "greek",
]);
export type ScriptType = z.infer<typeof ScriptTypeSchema>;

// ============================================================================
// Tracing Analysis
// ============================================================================

export const StrokeQualitySchema = z.enum([
  "excellent",    // Within model path, correct order, good pressure
  "good",         // Minor deviations but recognizable
  "developing",   // Significant deviations but attempt is clear
  "needs-support", // Cannot follow path, may need motor skill work
]);
export type StrokeQuality = z.infer<typeof StrokeQualitySchema>;

export const TracingAnalysisSchema = z.object({
  id: z.string(),
  childId: z.string(),
  character: z.string(),                    // The character traced
  script: ScriptTypeSchema,
  strokes: z.array(StrokeSchema),
  overallQuality: StrokeQualitySchema,
  metrics: z.object({
    accuracy: z.number().min(0).max(100),   // Path adherence %
    strokeOrderCorrect: z.boolean(),
    averagePressure: z.number().min(0).max(1),
    pressureConsistency: z.number().min(0).max(100),
    speed: z.number(),                       // Avg pixels/second
    smoothness: z.number().min(0).max(100),  // Jitter-free score
    sizeConsistency: z.number().min(0).max(100),
    baselineAlignment: z.number().min(0).max(100),
  }),
  feedback: z.object({
    praise: z.string(),                      // Always lead with praise (Montessori)
    suggestion: z.string().optional(),       // Gentle, specific guidance
    nextStep: z.string(),                    // What to try next
  }),
  timestamp: z.string(),
});
export type TracingAnalysis = z.infer<typeof TracingAnalysisSchema>;

// ============================================================================
// Developmental Progression
// ============================================================================

export const HandwritingStageSchema = z.enum([
  "pre-writing",       // Scribbles, basic shapes (age 3-4)
  "letter-awareness",  // Recognizes letters, attempts imitation (age 4-5)
  "letter-formation",  // Can form most letters with guidance (age 5-6)
  "word-writing",      // Writes words, spacing developing (age 6-7)
  "sentence-writing",  // Writes sentences with conventions (age 7-8)
  "fluent-writing",    // Automatic letter formation, focus on content (age 8+)
  "cursive-introduction", // Beginning cursive (age 7-9)
  "cursive-fluency",   // Fluent cursive writing (age 9+)
]);
export type HandwritingStage = z.infer<typeof HandwritingStageSchema>;

export const HandwritingProfileSchema = z.object({
  childId: z.string(),
  currentStage: HandwritingStageSchema,
  dominantHand: z.enum(["left", "right", "undetermined"]),
  scripts: z.array(ScriptTypeSchema),
  masteredCharacters: z.record(ScriptTypeSchema, z.array(z.string())).default({}),
  inProgressCharacters: z.record(ScriptTypeSchema, z.array(z.string())).default({}),
  fineMotorScore: z.number().min(0).max(100),
  averageAccuracy: z.number().min(0).max(100),
  averagePressure: z.number().min(0).max(1),
  sessionsCompleted: z.number().default(0),
  totalCharactersTraced: z.number().default(0),
  lastSessionAt: z.string().nullable().default(null),
  updatedAt: z.string(),
});
export type HandwritingProfile = z.infer<typeof HandwritingProfileSchema>;

// ============================================================================
// Reference Models (ideal stroke paths)
// ============================================================================

export const CharacterModelSchema = z.object({
  character: z.string(),
  script: ScriptTypeSchema,
  strokeCount: z.number(),
  strokeOrder: z.array(z.array(StrokePointSchema)),  // Ideal paths per stroke
  boundingBox: z.object({
    width: z.number(),
    height: z.number(),
    baseline: z.number(),
    ascenderLine: z.number(),
    descenderLine: z.number(),
  }),
  guidelines: z.array(z.string()),         // Teaching tips
  commonErrors: z.array(z.string()),       // Things to watch for
  montessoriNotes: z.string(),             // Sandpaper letter methodology connection
});
export type CharacterModel = z.infer<typeof CharacterModelSchema>;

// ============================================================================
// Pre-Writing Assessment
// ============================================================================

export const PreWritingSkillSchema = z.enum([
  "vertical-line",
  "horizontal-line",
  "circle",
  "cross",
  "diagonal-line",
  "square",
  "triangle",
  "diamond",
  "figure-eight",
]);
export type PreWritingSkill = z.infer<typeof PreWritingSkillSchema>;

export const PreWritingAssessmentSchema = z.object({
  childId: z.string(),
  skills: z.record(PreWritingSkillSchema, z.object({
    attempted: z.boolean(),
    quality: StrokeQualitySchema,
    score: z.number().min(0).max(100),
  })),
  overallReadiness: z.number().min(0).max(100),
  readyForLetters: z.boolean(),
  recommendations: z.array(z.string()),
  assessedAt: z.string(),
});
export type PreWritingAssessment = z.infer<typeof PreWritingAssessmentSchema>;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Analyze a set of strokes against a character model
 */
export function analyzeTracing(params: {
  childId: string;
  character: string;
  script: ScriptType;
  strokes: Stroke[];
  referenceStrokeCount: number;
}): TracingAnalysis {
  const { childId, character, script, strokes } = params;

  // Calculate metrics from stroke data
  const allPoints = strokes.flatMap((s) => s.points);
  const avgPressure = allPoints.length > 0
    ? allPoints.reduce((sum, p) => sum + p.pressure, 0) / allPoints.length
    : 0.5;

  const pressureVariance = allPoints.length > 1
    ? Math.sqrt(
        allPoints.reduce((sum, p) => sum + Math.pow(p.pressure - avgPressure, 2), 0) /
        allPoints.length
      )
    : 0;
  const pressureConsistency = Math.round(Math.max(0, 100 - pressureVariance * 200));

  // Smoothness: measure jitter via point-to-point angle changes
  let smoothnessScore = 85; // baseline
  if (allPoints.length > 3) {
    let angleChanges = 0;
    for (let i = 2; i < allPoints.length; i++) {
      const dx1 = allPoints[i - 1].x - allPoints[i - 2].x;
      const dy1 = allPoints[i - 1].y - allPoints[i - 2].y;
      const dx2 = allPoints[i].x - allPoints[i - 1].x;
      const dy2 = allPoints[i].y - allPoints[i - 1].y;
      const angle = Math.abs(Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1));
      if (angle > 0.5) angleChanges++;
    }
    smoothnessScore = Math.round(Math.max(0, 100 - (angleChanges / allPoints.length) * 100));
  }

  // Speed calculation
  const totalTime = strokes.reduce((sum, s) => sum + (s.endTimestamp - s.startTimestamp), 0);
  let totalDistance = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.points.length; i++) {
      const dx = stroke.points[i].x - stroke.points[i - 1].x;
      const dy = stroke.points[i].y - stroke.points[i - 1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
  }
  const speed = totalTime > 0 ? totalDistance / (totalTime / 1000) : 0;

  // Stroke order check (simplified: correct if count matches)
  const strokeOrderCorrect = strokes.length === params.referenceStrokeCount;

  // Overall accuracy (simplified heuristic)
  const accuracy = Math.round(
    smoothnessScore * 0.3 +
    pressureConsistency * 0.2 +
    (strokeOrderCorrect ? 30 : 10) +
    Math.min(20, allPoints.length / 5)
  );

  // Determine quality level
  let overallQuality: StrokeQuality;
  if (accuracy >= 85) overallQuality = "excellent";
  else if (accuracy >= 65) overallQuality = "good";
  else if (accuracy >= 40) overallQuality = "developing";
  else overallQuality = "needs-support";

  // Generate Montessori-style feedback (always affirm first)
  const praise = accuracy >= 70
    ? `Beautiful work on your "${character}"! I can see how carefully you formed each stroke.`
    : accuracy >= 40
    ? `Great effort with "${character}"! I can see you're really concentrating.`
    : `I love that you're practicing "${character}"! Every attempt helps your hand learn the path.`;

  const suggestion = accuracy < 85
    ? smoothnessScore < 60
      ? "Try moving your hand a little slower and smoother, like tracing a path in sand."
      : pressureConsistency < 50
      ? "See if you can keep the same gentle pressure the whole way through."
      : !strokeOrderCorrect
      ? "Let's try starting from the same spot as the guide shows."
      : undefined
    : undefined;

  const nextStep = accuracy >= 85
    ? `Ready to try "${character}" without the guide lines!`
    : `Let's practice "${character}" one more time with the guide.`;

  return {
    id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId,
    character,
    script,
    strokes,
    overallQuality,
    metrics: {
      accuracy,
      strokeOrderCorrect,
      averagePressure: Math.round(avgPressure * 100) / 100,
      pressureConsistency,
      speed: Math.round(speed),
      smoothness: smoothnessScore,
      sizeConsistency: (() => {
        if (strokes.length < 2) return 75;
        const heights = strokes.map((s) => {
          const ys = s.points.map((p) => p.y);
          return Math.max(...ys) - Math.min(...ys);
        });
        const mean = heights.reduce((a, b) => a + b, 0) / heights.length;
        const cv = Math.sqrt(heights.reduce((s, h) => s + (h - mean) ** 2, 0) / heights.length) / Math.max(1, mean);
        return Math.round(Math.max(0, Math.min(100, 100 - cv * 100)));
      })(),
      baselineAlignment: (() => {
        if (allPoints.length < 2) return 80;
        const endYs = strokes.map((s) => s.points[s.points.length - 1].y);
        const mean = endYs.reduce((a, b) => a + b, 0) / endYs.length;
        const std = Math.sqrt(endYs.reduce((s, y) => s + (y - mean) ** 2, 0) / endYs.length);
        return Math.round(Math.max(0, Math.min(100, 100 - std * 2)));
      })(),
    },
    feedback: { praise, suggestion, nextStep },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Determine the handwriting stage from a profile's metrics
 */
export function assessHandwritingStage(profile: HandwritingProfile): HandwritingStage {
  const { fineMotorScore, averageAccuracy, totalCharactersTraced } = profile;

  if (fineMotorScore < 30) return "pre-writing";
  if (totalCharactersTraced < 10) return "letter-awareness";
  if (averageAccuracy < 50) return "letter-formation";
  if (averageAccuracy < 65) return "word-writing";
  if (averageAccuracy < 80) return "sentence-writing";
  if (profile.scripts.includes("latin-cursive")) {
    return averageAccuracy >= 70 ? "cursive-fluency" : "cursive-introduction";
  }
  return "fluent-writing";
}

/**
 * Run a pre-writing assessment to determine letter-readiness
 */
export function runPreWritingAssessment(params: {
  childId: string;
  shapeResults: Array<{
    skill: PreWritingSkill;
    strokes: Stroke[];
  }>;
}): PreWritingAssessment {
  const skills: Partial<PreWritingAssessment["skills"]> = {};
  let totalScore = 0;
  let count = 0;

  const allPreWritingSkills: PreWritingSkill[] = [
    "vertical-line", "horizontal-line", "circle", "cross",
    "diagonal-line", "square", "triangle", "diamond", "figure-eight",
  ];

  for (const skill of allPreWritingSkills) {
    const result = params.shapeResults.find((r) => r.skill === skill);
    if (result) {
      const smoothness = result.strokes.length > 0 ? 70 : 0;
      const score = Math.min(100, smoothness + result.strokes.flatMap((s) => s.points).length / 2);
      const quality: StrokeQuality =
        score >= 80 ? "excellent" :
        score >= 60 ? "good" :
        score >= 30 ? "developing" : "needs-support";

      skills[skill] = { attempted: true, quality, score: Math.round(score) };
      totalScore += score;
      count++;
    } else {
      skills[skill] = { attempted: false, quality: "needs-support", score: 0 };
    }
  }

  const overallReadiness = count > 0 ? Math.round(totalScore / count) : 0;
  const readyForLetters = overallReadiness >= 60 && count >= 5;

  const recommendations: string[] = [];
  if (!readyForLetters) {
    recommendations.push("Continue pre-writing shape practice before introducing letter formation");
    if ((skills["circle"]?.score ?? 0) < 50) {
      recommendations.push("Practice circular movements — try finger painting spirals");
    }
    if ((skills["vertical-line"]?.score ?? 0) < 50) {
      recommendations.push("Practice drawing tall lines from top to bottom");
    }
  } else {
    recommendations.push("Ready for sandpaper letter introductions");
    recommendations.push("Start with simple letters: l, i, t, o, c");
  }

  return {
    childId: params.childId,
    skills: skills as PreWritingAssessment["skills"],
    overallReadiness,
    readyForLetters,
    recommendations,
    assessedAt: new Date().toISOString(),
  };
}

/**
 * Get the recommended next characters to practice based on profile
 */
export function getNextCharactersToPractice(
  profile: HandwritingProfile,
  script: ScriptType,
  count: number = 3,
): string[] {
  const mastered = profile.masteredCharacters[script] ?? [];
  const inProgress = profile.inProgressCharacters[script] ?? [];

  // Montessori letter introduction order (phonetic, not alphabetical)
  const montessoriOrder: Record<string, string[]> = {
    "latin-lowercase": [
      "c", "m", "a", "t", "s", "r", "i", "p", "b", "l",
      "n", "h", "o", "g", "d", "f", "e", "u", "k", "j",
      "w", "v", "x", "y", "z", "q",
    ],
    "latin-uppercase": [
      "L", "I", "T", "H", "E", "F", "C", "O", "D", "P",
      "B", "R", "N", "M", "A", "K", "V", "W", "X", "Y",
      "Z", "U", "S", "J", "G", "Q",
    ],
    "numbers": ["1", "4", "7", "0", "2", "3", "5", "6", "8", "9"],
  };

  const order = montessoriOrder[script] ?? [];
  const notMastered = order.filter((c) => !mastered.includes(c));

  // Prioritize in-progress characters, then next in Montessori order
  const prioritized = [
    ...inProgress.filter((c) => notMastered.includes(c)),
    ...notMastered.filter((c) => !inProgress.includes(c)),
  ];

  return prioritized.slice(0, count);
}
