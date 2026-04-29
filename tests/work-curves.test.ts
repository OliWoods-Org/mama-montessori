import { describe, it, expect } from "vitest";
import {
  startWorkCycle,
  addConcentrationSample,
  completeWorkCycle,
  analyzeWorkCurves,
} from "../src/features/work-curves";

describe("startWorkCycle", () => {
  it("creates a work cycle in choosing phase", () => {
    const cycle = startWorkCycle({
      childId: "child-1",
      activityDescription: "Golden Beads multiplication",
      timeOfDay: "morning-work",
    });
    expect(cycle.childId).toBe("child-1");
    expect(cycle.activityDescription).toBe("Golden Beads multiplication");
    expect(cycle.phases.length).toBe(1);
    expect(cycle.phases[0].phase).toBe("choosing");
    expect(cycle.endedAt).toBeNull();
  });
});

describe("addConcentrationSample", () => {
  it("adds sample to active cycle", () => {
    const cycle = startWorkCycle({
      childId: "child-1",
      activityDescription: "Sandpaper Letters",
      timeOfDay: "morning-work",
    });
    const updated = addConcentrationSample(cycle, {
      timestamp: new Date().toISOString(),
      level: "focused",
      confidence: 0.8,
      source: "guide-observation",
      metadata: {},
    });
    expect(updated.concentrationSamples.length).toBe(1);
  });
});

describe("completeWorkCycle", () => {
  it("marks cycle as completed with duration", () => {
    const cycle = startWorkCycle({
      childId: "child-1",
      activityDescription: "Pink Tower",
      timeOfDay: "morning-work",
    });
    const completed = completeWorkCycle(cycle);
    expect(completed.endedAt).not.toBeNull();
    expect(completed.durationMinutes).not.toBeNull();
  });
});

describe("analyzeWorkCurves", () => {
  it("analyzes completed cycles", () => {
    const cycles = ["Golden Beads", "Sandpaper Letters", "Pink Tower"].map((desc) => {
      const cycle = startWorkCycle({ childId: "child-1", activityDescription: desc, timeOfDay: "morning-work" });
      return completeWorkCycle(
        addConcentrationSample(cycle, {
          timestamp: new Date().toISOString(),
          level: "deep-flow",
          confidence: 0.9,
          source: "ai-inference",
          metadata: {},
        }),
      );
    });
    const analysis = analyzeWorkCurves("child-1", cycles);
    expect(analysis.childId).toBe("child-1");
    expect(analysis.totalCyclesTracked).toBeGreaterThanOrEqual(3);
  });
});
