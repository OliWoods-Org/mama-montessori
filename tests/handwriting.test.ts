import { describe, it, expect } from "vitest";
import {
  analyzeTracing,
  assessHandwritingStage,
  getNextCharactersToPractice,
  type HandwritingProfile,
} from "../src/features/handwriting";

function makeProfile(overrides: Partial<HandwritingProfile> = {}): HandwritingProfile {
  return {
    childId: "child-1",
    dominantHand: "right",
    gripType: "tripod",
    fineMotorScore: 60,
    scripts: ["latin-lowercase"],
    masteredCharacters: { "latin-lowercase": ["c", "m", "a"] },
    inProgressCharacters: { "latin-lowercase": ["t"] },
    totalCharactersTraced: 50,
    averageAccuracy: 55,
    sessionsCompleted: 10,
    ...overrides,
  };
}

describe("analyzeTracing", () => {
  it("analyzes a simple vertical stroke", () => {
    const result = analyzeTracing({
      childId: "child-1",
      character: "l",
      script: "latin-lowercase",
      strokes: [
        {
          points: [
            { x: 10, y: 10, pressure: 0.5, timestamp: 0 },
            { x: 10, y: 20, pressure: 0.5, timestamp: 50 },
            { x: 10, y: 30, pressure: 0.5, timestamp: 100 },
            { x: 10, y: 40, pressure: 0.5, timestamp: 150 },
            { x: 10, y: 50, pressure: 0.5, timestamp: 200 },
          ],
        },
      ],
      referenceStrokeCount: 1,
    });
    expect(result.character).toBe("l");
    expect(result.strokes.length).toBe(1);
    expect(result.metrics.smoothness).toBeGreaterThan(0);
    expect(result.metrics.pressureConsistency).toBeGreaterThan(0);
  });

  it("gives higher smoothness for smoother strokes", () => {
    const smooth = analyzeTracing({
      childId: "child-1", character: "i", script: "latin-lowercase",
      strokes: [{
        points: Array.from({ length: 10 }, (_, i) => ({
          x: 10, y: 10 + i * 5, pressure: 0.5, timestamp: i * 20,
        })),
      }],
      referenceStrokeCount: 1,
    });
    const jagged = analyzeTracing({
      childId: "child-1", character: "i", script: "latin-lowercase",
      strokes: [{
        points: Array.from({ length: 10 }, (_, i) => ({
          x: 10 + (i % 2 === 0 ? 15 : -15),
          y: 10 + i * 5,
          pressure: 0.5,
          timestamp: i * 20,
        })),
      }],
      referenceStrokeCount: 1,
    });
    expect(smooth.metrics.smoothness).toBeGreaterThan(jagged.metrics.smoothness);
  });
});

describe("assessHandwritingStage", () => {
  it("returns pre-writing for low fine motor score", () => {
    const stage = assessHandwritingStage(makeProfile({ fineMotorScore: 20 }));
    expect(stage).toBe("pre-writing");
  });

  it("returns letter-formation for moderate accuracy", () => {
    const stage = assessHandwritingStage(makeProfile({
      fineMotorScore: 60,
      totalCharactersTraced: 50,
      averageAccuracy: 45,
    }));
    expect(stage).toBe("letter-formation");
  });
});

describe("getNextCharactersToPractice", () => {
  it("returns characters not yet mastered in Montessori order", () => {
    const profile = makeProfile();
    const next = getNextCharactersToPractice(profile, "latin-lowercase", 3);
    expect(next.length).toBeLessThanOrEqual(3);
    // Should not include mastered chars (c, m, a)
    next.forEach((c) => {
      expect(["c", "m", "a"]).not.toContain(c);
    });
  });

  it("returns empty when all mastered", () => {
    const allLetters = "cmatsripblnhogdfekujwvxyzq".split("");
    const profile = makeProfile({
      masteredCharacters: { "latin-lowercase": allLetters },
      inProgressCharacters: { "latin-lowercase": [] },
    });
    const next = getNextCharactersToPractice(profile, "latin-lowercase", 3);
    expect(next.length).toBe(0);
  });
});
