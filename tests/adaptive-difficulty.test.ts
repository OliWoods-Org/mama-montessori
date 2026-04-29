import { describe, it, expect } from "vitest";
import {
  processPerformanceSignal,
  initializeSkillProfile,
  detectEngagement,
  DIFFICULTY_ORDER,
  SCAFFOLD_ORDER,
  type SkillAdaptiveProfile,
  type PerformanceSignal,
} from "../src/features/adaptive-difficulty";

function makeProfile(overrides: Partial<SkillAdaptiveProfile> = {}): SkillAdaptiveProfile {
  return {
    childId: "child-1",
    skillId: "math-addition",
    skillName: "Addition",
    currentDifficulty: "concrete",
    currentScaffold: "none",
    currentZone: "zpd",
    successRate: 50,
    averageResponseTimeMs: 3000,
    totalAttempts: 10,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    selfCorrectionRate: 10,
    voluntaryRepetitionRate: 5,
    lastAdjustedAt: new Date().toISOString(),
    history: [],
    ...overrides,
  };
}

function makeSignal(overrides: Partial<PerformanceSignal> = {}): PerformanceSignal {
  return {
    childId: "child-1",
    skillId: "math-addition",
    sessionId: "session-1",
    timestamp: new Date().toISOString(),
    signal: "correct-first-try",
    difficultyLevel: "concrete",
    scaffoldLevel: "none",
    attemptNumber: 1,
    ...overrides,
  };
}

describe("processPerformanceSignal", () => {
  it("increases success rate on correct answer", () => {
    const profile = makeProfile({ successRate: 50 });
    const { updatedProfile } = processPerformanceSignal(profile, makeSignal());
    expect(updatedProfile.successRate).toBeGreaterThan(50);
  });

  it("decreases success rate on incorrect answer", () => {
    const profile = makeProfile({ successRate: 50 });
    const { updatedProfile } = processPerformanceSignal(
      profile,
      makeSignal({ signal: "incorrect" }),
    );
    expect(updatedProfile.successRate).toBeLessThan(50);
  });

  it("promotes difficulty after 5 consecutive successes with high rate", () => {
    const profile = makeProfile({
      successRate: 95,
      consecutiveSuccesses: 4,
      currentDifficulty: "concrete",
    });
    const { updatedProfile, adjustment } = processPerformanceSignal(profile, makeSignal());
    expect(updatedProfile.currentDifficulty).toBe("pictorial");
    expect(adjustment).toContain("Increased difficulty");
  });

  it("adds scaffolding after 3 consecutive failures in frustration zone", () => {
    const profile = makeProfile({
      successRate: 20,
      consecutiveFailures: 2,
      currentDifficulty: "abstract",
      currentScaffold: "visual-cue",
    });
    const { updatedProfile, adjustment } = processPerformanceSignal(
      profile,
      makeSignal({ signal: "incorrect" }),
    );
    expect(adjustment).toContain("scaffolding");
  });

  it("does not adjust on voluntary repetition (Montessori normalization)", () => {
    const profile = makeProfile({ currentDifficulty: "pictorial" });
    const { updatedProfile, adjustment } = processPerformanceSignal(
      profile,
      makeSignal({ signal: "repeated-voluntarily" }),
    );
    expect(updatedProfile.currentDifficulty).toBe("pictorial");
    expect(adjustment).toBeNull();
  });

  it("caps history at 50 entries", () => {
    const profile = makeProfile({
      successRate: 95,
      consecutiveSuccesses: 4,
      history: Array.from({ length: 50 }, (_, i) => ({
        difficulty: "concrete" as const,
        scaffold: "none" as const,
        zone: "zpd" as const,
        timestamp: new Date().toISOString(),
        reason: `adjustment-${i}`,
      })),
    });
    const { updatedProfile } = processPerformanceSignal(profile, makeSignal());
    expect(updatedProfile.history.length).toBeLessThanOrEqual(50);
  });

  it("increments totalAttempts", () => {
    const profile = makeProfile({ totalAttempts: 10 });
    const { updatedProfile } = processPerformanceSignal(profile, makeSignal());
    expect(updatedProfile.totalAttempts).toBe(11);
  });
});

describe("initializeSkillProfile", () => {
  it("creates a fresh profile with sensible defaults", () => {
    const profile = initializeSkillProfile("child-1", "math-addition", "Addition");
    expect(profile.childId).toBe("child-1");
    expect(profile.currentDifficulty).toBe("concrete");
    expect(profile.currentZone).toBe("zpd");
    expect(profile.successRate).toBe(50);
    expect(profile.totalAttempts).toBe(0);
  });
});

describe("DIFFICULTY_ORDER", () => {
  it("progresses from concrete to extension", () => {
    expect(DIFFICULTY_ORDER[0]).toBe("concrete");
    expect(DIFFICULTY_ORDER[DIFFICULTY_ORDER.length - 1]).toBe("extension");
  });
});
