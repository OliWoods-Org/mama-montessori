import { describe, it, expect } from "vitest";
import {
  checkBadgeEligibility,
  updateStreak,
  createChallenge,
  updateChallengeProgress,
  suggestChallenges,
  DEFAULT_BADGES,
  type Streak,
} from "../src/features/gamification";

function makeStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    childId: "child-1",
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalActiveDays: 0,
    graceDaysAllowed: 2,
    graceDaysUsed: 0,
    milestones: [],
    ...overrides,
  };
}

const fullStats = {
  sessionCount: 100,
  skillsMastered: 20,
  streakDays: 30,
  materialsExplored: 15,
  projectsCompleted: 5,
  mentoringSessions: 10,
  domainsExplored: 5,
  artifactsCreated: 10,
  curiositySparks: 20,
};

describe("checkBadgeEligibility", () => {
  it("returns badges the child qualifies for", () => {
    const badges = checkBadgeEligibility("child-1", fullStats, []);
    expect(badges.length).toBeGreaterThan(0);
  });

  it("excludes already-earned badges", () => {
    const allBadgeIds = DEFAULT_BADGES.map((b) => b.id);
    const badges = checkBadgeEligibility("child-1", fullStats, allBadgeIds);
    expect(badges.length).toBe(0);
  });

  it("returns nothing for zero stats", () => {
    const emptyStats = {
      sessionCount: 0, skillsMastered: 0, streakDays: 0, materialsExplored: 0,
      projectsCompleted: 0, mentoringSessions: 0, domainsExplored: 0,
      artifactsCreated: 0, curiositySparks: 0,
    };
    const badges = checkBadgeEligibility("child-1", emptyStats, []);
    expect(badges.length).toBe(0);
  });
});

describe("updateStreak", () => {
  it("starts a new streak on first activity", () => {
    const streak = makeStreak();
    const result = updateStreak(streak, "2026-04-01");
    expect(result.currentStreak).toBe(1);
    expect(result.totalActiveDays).toBe(1);
  });

  it("increments on consecutive day", () => {
    const streak = makeStreak({ currentStreak: 3, lastActivityDate: "2026-04-01", totalActiveDays: 3 });
    const result = updateStreak(streak, "2026-04-02");
    expect(result.currentStreak).toBe(4);
  });

  it("does not change on same day", () => {
    const streak = makeStreak({ currentStreak: 3, lastActivityDate: "2026-04-01", totalActiveDays: 3 });
    const result = updateStreak(streak, "2026-04-01");
    expect(result.currentStreak).toBe(3);
    expect(result.totalActiveDays).toBe(3);
  });

  it("continues streak within grace period", () => {
    const streak = makeStreak({
      currentStreak: 5,
      lastActivityDate: "2026-04-01",
      graceDaysAllowed: 2,
      totalActiveDays: 5,
    });
    const result = updateStreak(streak, "2026-04-03"); // Skipped 1 day
    expect(result.currentStreak).toBe(6);
    expect(result.graceDaysUsed).toBe(1);
  });

  it("resets streak after grace period expires", () => {
    const streak = makeStreak({
      currentStreak: 10,
      lastActivityDate: "2026-04-01",
      graceDaysAllowed: 2,
      totalActiveDays: 10,
    });
    const result = updateStreak(streak, "2026-04-05"); // 4 days gap
    expect(result.currentStreak).toBe(1);
  });

  it("records milestone at 7 days", () => {
    const streak = makeStreak({
      currentStreak: 6,
      lastActivityDate: "2026-04-06",
      longestStreak: 6,
      totalActiveDays: 6,
    });
    const result = updateStreak(streak, "2026-04-07");
    expect(result.milestones.length).toBe(1);
    expect(result.milestones[0].days).toBe(7);
  });
});

describe("createChallenge", () => {
  it("creates a challenge with active status", () => {
    const challenge = createChallenge({
      childId: "child-1",
      type: "skill-mastery",
      title: "Master addition",
      description: "Practice addition facts",
      childWords: "I want to learn adding!",
      targetValue: 10,
      unit: "problems",
    });
    expect(challenge.status).toBe("active");
    expect(challenge.currentValue).toBe(0);
    expect(challenge.selfChosen).toBe(true);
  });
});

describe("updateChallengeProgress", () => {
  it("completes challenge when target reached", () => {
    const challenge = createChallenge({
      childId: "child-1", type: "skill-mastery", title: "Test",
      description: "Test", childWords: "", targetValue: 5, unit: "items",
    });
    const result = updateChallengeProgress(challenge, 5);
    expect(result.status).toBe("completed");
    expect(result.completedAt).not.toBeNull();
  });

  it("does not exceed target value", () => {
    const challenge = createChallenge({
      childId: "child-1", type: "skill-mastery", title: "Test",
      description: "Test", childWords: "", targetValue: 5, unit: "items",
    });
    const result = updateChallengeProgress(challenge, 100);
    expect(result.currentValue).toBe(5);
  });
});

describe("suggestChallenges", () => {
  it("returns suggestions appropriate for age", () => {
    const suggestions = suggestChallenges({
      age: 5, interests: ["math", "nature"],
      recentActivityCount: 10, masteredSkillCount: 3,
    });
    expect(suggestions.length).toBeGreaterThan(0);
    suggestions.forEach((s) => expect(s.targetValue).toBeGreaterThan(0));
  });
});
