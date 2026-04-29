/**
 * Work Curve Analytics Module
 *
 * Competitor: Transparent Classroom (work cycle tracking)
 * Our advantage: Real-time flow state detection, concentration pattern visualization,
 *   Montessori work cycle analytics with normalization curve tracking
 *
 * Features:
 * - Track concentration patterns during Montessori work cycles
 * - Detect and visualize flow states
 * - Identify false fatigue vs. true fatigue
 * - Work cycle normalization curve (Montessori's famous bell curve of concentration)
 * - Optimal work period recommendations
 * - Environmental correlation (time of day, noise, etc.)
 */

import { z } from "zod";

// ============================================================================
// Concentration Measurement
// ============================================================================

export const ConcentrationLevelSchema = z.enum([
  "unfocused",      // Not engaged with material
  "settling",       // Beginning to engage, not yet deep
  "focused",        // Engaged, working purposefully
  "deep-flow",      // Fully absorbed, peak concentration
  "false-fatigue",  // Temporary dip — often precedes deepest work
  "winding-down",   // Naturally completing work cycle
  "fatigued",       // Genuinely tired, needs break
]);
export type ConcentrationLevel = z.infer<typeof ConcentrationLevelSchema>;

export const ConcentrationSampleSchema = z.object({
  timestamp: z.string(),
  level: ConcentrationLevelSchema,
  confidence: z.number().min(0).max(1),     // How confident the measurement is
  source: z.enum([
    "self-report",       // Child rates own focus
    "guide-observation", // Teacher/parent observation
    "interaction-rate",  // Derived from interaction frequency
    "iot-sensor",        // Environmental sensor data
    "ai-inference",      // AI analysis of behavior patterns
  ]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type ConcentrationSample = z.infer<typeof ConcentrationSampleSchema>;

// ============================================================================
// Work Cycle
// ============================================================================

export const WorkCyclePhaseSchema = z.enum([
  "choosing",         // Selecting work from shelf
  "setting-up",       // Preparing workspace
  "initial-work",     // First engagement with material
  "concentration",    // Deep work phase
  "false-fatigue",    // The dip before deepest concentration
  "great-work",       // Post-false-fatigue deep concentration (Montessori's key insight)
  "completion",       // Finishing and putting away
  "rest",             // Natural pause between cycles
]);
export type WorkCyclePhase = z.infer<typeof WorkCyclePhaseSchema>;

export const WorkCycleSchema = z.object({
  id: z.string(),
  childId: z.string(),
  sessionId: z.string().optional(),
  date: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable().default(null),
  durationMinutes: z.number().nullable().default(null),
  materialId: z.string().optional(),          // Physical or virtual material
  activityDescription: z.string(),
  phases: z.array(z.object({
    phase: WorkCyclePhaseSchema,
    startedAt: z.string(),
    durationSeconds: z.number(),
  })),
  concentrationSamples: z.array(ConcentrationSampleSchema),
  peakConcentrationReached: z.boolean().default(false),
  falseFatigueDetected: z.boolean().default(false),
  repetitions: z.number().default(1),         // Self-chosen repetition count
  interruptionCount: z.number().default(0),
  interruptionSources: z.array(z.string()).default([]),
  environmentalFactors: z.object({
    timeOfDay: z.enum(["morning", "late-morning", "afternoon", "evening"]),
    noiseLevel: z.enum(["quiet", "moderate", "noisy"]).optional(),
    otherChildrenPresent: z.number().optional(),
    outdoors: z.boolean().default(false),
  }),
});
export type WorkCycle = z.infer<typeof WorkCycleSchema>;

// ============================================================================
// Work Curve Analytics
// ============================================================================

export const WorkCurveProfileSchema = z.object({
  childId: z.string(),
  averageCycleDuration: z.number(),          // minutes
  optimalTimeOfDay: z.enum(["morning", "late-morning", "afternoon", "evening"]),
  averageTimeToPeakConcentration: z.number(), // minutes from start
  falseFatigueFrequency: z.number().min(0).max(1), // % of cycles with false fatigue
  greatWorkFrequency: z.number().min(0).max(1),     // % reaching great work phase
  averageRepetitions: z.number(),
  interruptionSensitivity: z.enum(["low", "moderate", "high"]),
  preferredWorkDomains: z.array(z.string()),
  concentrationTrend: z.enum(["improving", "stable", "declining"]),
  normalizationProgress: z.number().min(0).max(100), // % toward normalized work cycle
  totalCyclesTracked: z.number(),
  updatedAt: z.string(),
});
export type WorkCurveProfile = z.infer<typeof WorkCurveProfileSchema>;

export const DailyWorkCurveSummarySchema = z.object({
  childId: z.string(),
  date: z.string(),
  totalWorkMinutes: z.number(),
  cycleCount: z.number(),
  deepFlowMinutes: z.number(),
  peakConcentrationEvents: z.number(),
  longestUninterruptedStretch: z.number(),   // minutes
  averageConcentration: z.number().min(0).max(100),
  timeDistribution: z.record(WorkCyclePhaseSchema, z.number()), // minutes per phase
  bestCycleId: z.string().nullable(),
});
export type DailyWorkCurveSummary = z.infer<typeof DailyWorkCurveSummarySchema>;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Start tracking a new work cycle
 */
export function startWorkCycle(params: {
  childId: string;
  sessionId?: string;
  activityDescription: string;
  materialId?: string;
  timeOfDay: WorkCycle["environmentalFactors"]["timeOfDay"];
}): WorkCycle {
  const now = new Date().toISOString();
  return {
    id: `wc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId: params.childId,
    sessionId: params.sessionId,
    date: now.split("T")[0],
    startedAt: now,
    endedAt: null,
    durationMinutes: null,
    materialId: params.materialId,
    activityDescription: params.activityDescription,
    phases: [{
      phase: "choosing",
      startedAt: now,
      durationSeconds: 0,
    }],
    concentrationSamples: [],
    peakConcentrationReached: false,
    falseFatigueDetected: false,
    repetitions: 1,
    interruptionCount: 0,
    interruptionSources: [],
    environmentalFactors: {
      timeOfDay: params.timeOfDay,
      outdoors: false,
    },
  };
}

/**
 * Add a concentration sample to an active work cycle
 */
export function addConcentrationSample(
  cycle: WorkCycle,
  level: ConcentrationLevel,
  source: ConcentrationSample["source"],
  confidence: number = 0.8,
): WorkCycle {
  const sample: ConcentrationSample = {
    timestamp: new Date().toISOString(),
    level,
    confidence,
    source,
    metadata: {},
  };

  const updatedSamples = [...cycle.concentrationSamples, sample];

  // Detect false fatigue pattern
  let falseFatigueDetected = cycle.falseFatigueDetected;
  if (updatedSamples.length >= 3) {
    const recent = updatedSamples.slice(-3);
    if (
      (recent[0].level === "focused" || recent[0].level === "deep-flow") &&
      (recent[1].level === "unfocused" || recent[1].level === "settling") &&
      (recent[2].level === "focused" || recent[2].level === "deep-flow")
    ) {
      falseFatigueDetected = true;
    }
  }

  const peakConcentrationReached = cycle.peakConcentrationReached ||
    level === "deep-flow";

  return {
    ...cycle,
    concentrationSamples: updatedSamples,
    falseFatigueDetected,
    peakConcentrationReached,
  };
}

/**
 * Complete a work cycle and compute analytics
 */
export function completeWorkCycle(cycle: WorkCycle): WorkCycle {
  const now = new Date();
  const started = new Date(cycle.startedAt);
  const durationMinutes = Math.round((now.getTime() - started.getTime()) / 60000);

  return {
    ...cycle,
    endedAt: now.toISOString(),
    durationMinutes,
  };
}

/**
 * Analyze concentration patterns across multiple work cycles
 */
export function analyzeWorkCurves(
  childId: string,
  cycles: WorkCycle[],
): WorkCurveProfile {
  const childCycles = cycles.filter((c) => c.childId === childId && c.endedAt);

  if (childCycles.length === 0) {
    return {
      childId,
      averageCycleDuration: 0,
      optimalTimeOfDay: "morning",
      averageTimeToPeakConcentration: 0,
      falseFatigueFrequency: 0,
      greatWorkFrequency: 0,
      averageRepetitions: 1,
      interruptionSensitivity: "moderate",
      preferredWorkDomains: [],
      concentrationTrend: "stable",
      normalizationProgress: 0,
      totalCyclesTracked: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const durations = childCycles.map((c) => c.durationMinutes ?? 0);
  const averageCycleDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  // Optimal time of day
  const timeGroups: Record<string, number[]> = {};
  for (const cycle of childCycles) {
    const tod = cycle.environmentalFactors.timeOfDay;
    if (!timeGroups[tod]) timeGroups[tod] = [];
    const deepSamples = cycle.concentrationSamples.filter(
      (s) => s.level === "deep-flow" || s.level === "focused",
    ).length;
    timeGroups[tod].push(deepSamples / Math.max(1, cycle.concentrationSamples.length));
  }
  const optimalTimeOfDay = (Object.entries(timeGroups)
    .sort((a, b) => {
      const avgA = a[1].reduce((s, v) => s + v, 0) / a[1].length;
      const avgB = b[1].reduce((s, v) => s + v, 0) / b[1].length;
      return avgB - avgA;
    })[0]?.[0] ?? "morning") as WorkCurveProfile["optimalTimeOfDay"];

  // False fatigue and great work frequencies
  const falseFatigueCount = childCycles.filter((c) => c.falseFatigueDetected).length;
  const peakCount = childCycles.filter((c) => c.peakConcentrationReached).length;
  const falseFatigueFrequency = falseFatigueCount / childCycles.length;
  const greatWorkFrequency = peakCount / childCycles.length;

  // Average repetitions
  const avgReps = childCycles.reduce((s, c) => s + c.repetitions, 0) / childCycles.length;

  // Interruption sensitivity
  const avgInterruptions = childCycles.reduce((s, c) => s + c.interruptionCount, 0) / childCycles.length;
  const interruptionSensitivity: WorkCurveProfile["interruptionSensitivity"] =
    avgInterruptions > 3 ? "high" : avgInterruptions > 1 ? "moderate" : "low";

  // Time to peak
  let totalTimeToPeak = 0;
  let peakCycleCount = 0;
  for (const cycle of childCycles) {
    const peakSample = cycle.concentrationSamples.find((s) => s.level === "deep-flow");
    if (peakSample) {
      const peakTime = new Date(peakSample.timestamp).getTime();
      const startTime = new Date(cycle.startedAt).getTime();
      totalTimeToPeak += (peakTime - startTime) / 60000;
      peakCycleCount++;
    }
  }
  const averageTimeToPeakConcentration = peakCycleCount > 0
    ? totalTimeToPeak / peakCycleCount : 0;

  // Normalization progress (Montessori concept: a normalized child shows sustained concentration)
  const normalizationProgress = Math.min(100, Math.round(
    greatWorkFrequency * 40 +
    (averageCycleDuration > 20 ? 20 : averageCycleDuration) +
    (1 - falseFatigueFrequency) * 20 +
    Math.min(avgReps, 3) * 6.67
  ));

  // Concentration trend (compare first half vs second half)
  const midpoint = Math.floor(childCycles.length / 2);
  const firstHalf = childCycles.slice(0, midpoint);
  const secondHalf = childCycles.slice(midpoint);
  const firstHalfPeak = firstHalf.filter((c) => c.peakConcentrationReached).length / Math.max(1, firstHalf.length);
  const secondHalfPeak = secondHalf.filter((c) => c.peakConcentrationReached).length / Math.max(1, secondHalf.length);
  const concentrationTrend: WorkCurveProfile["concentrationTrend"] =
    secondHalfPeak > firstHalfPeak + 0.1 ? "improving" :
    secondHalfPeak < firstHalfPeak - 0.1 ? "declining" : "stable";

  return {
    childId,
    averageCycleDuration: Math.round(averageCycleDuration),
    optimalTimeOfDay,
    averageTimeToPeakConcentration: Math.round(averageTimeToPeakConcentration),
    falseFatigueFrequency: Math.round(falseFatigueFrequency * 100) / 100,
    greatWorkFrequency: Math.round(greatWorkFrequency * 100) / 100,
    averageRepetitions: Math.round(avgReps * 10) / 10,
    interruptionSensitivity,
    preferredWorkDomains: [],
    concentrationTrend,
    normalizationProgress,
    totalCyclesTracked: childCycles.length,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a daily work curve summary
 */
export function generateDailySummary(
  childId: string,
  date: string,
  cycles: WorkCycle[],
): DailyWorkCurveSummary {
  const dayCycles = cycles.filter(
    (c) => c.childId === childId && c.date === date && c.endedAt,
  );

  const totalWorkMinutes = dayCycles.reduce((s, c) => s + (c.durationMinutes ?? 0), 0);

  const deepFlowMinutes = dayCycles.reduce((s, c) => {
    const deepSamples = c.concentrationSamples.filter(
      (cs) => cs.level === "deep-flow",
    ).length;
    const totalSamples = Math.max(1, c.concentrationSamples.length);
    return s + ((c.durationMinutes ?? 0) * deepSamples / totalSamples);
  }, 0);

  const peakEvents = dayCycles.filter((c) => c.peakConcentrationReached).length;
  const longestStretch = Math.max(0, ...dayCycles.map((c) => c.durationMinutes ?? 0));

  const allSamples = dayCycles.flatMap((c) => c.concentrationSamples);
  const concentrationMap: Record<ConcentrationLevel, number> = {
    "unfocused": 10, "settling": 30, "focused": 60, "deep-flow": 100,
    "false-fatigue": 40, "winding-down": 50, "fatigued": 15,
  };
  const avgConcentration = allSamples.length > 0
    ? allSamples.reduce((s, cs) => s + concentrationMap[cs.level], 0) / allSamples.length
    : 0;

  const timeDistribution: Record<string, number> = {};
  for (const cycle of dayCycles) {
    for (const phase of cycle.phases) {
      timeDistribution[phase.phase] = (timeDistribution[phase.phase] ?? 0) +
        phase.durationSeconds / 60;
    }
  }

  const bestCycle = dayCycles.sort((a, b) => {
    const aDeep = a.concentrationSamples.filter((s) => s.level === "deep-flow").length;
    const bDeep = b.concentrationSamples.filter((s) => s.level === "deep-flow").length;
    return bDeep - aDeep;
  })[0];

  return {
    childId,
    date,
    totalWorkMinutes: Math.round(totalWorkMinutes),
    cycleCount: dayCycles.length,
    deepFlowMinutes: Math.round(deepFlowMinutes),
    peakConcentrationEvents: peakEvents,
    longestUninterruptedStretch: Math.round(longestStretch),
    averageConcentration: Math.round(avgConcentration),
    timeDistribution: timeDistribution as any,
    bestCycleId: bestCycle?.id ?? null,
  };
}
