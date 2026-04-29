import { describe, it, expect } from "vitest";
import {
  getLessonsForDomain,
  getReadyLessons,
  getLearningPath,
  buildCurriculumOverview,
  CURRICULUM_LESSONS,
} from "../src/features/curriculum-map";

describe("getLessonsForDomain", () => {
  it("filters lessons by domain", () => {
    const mathLessons = getLessonsForDomain("mathematics");
    mathLessons.forEach((l) => expect(l.domain).toBe("mathematics"));
  });

  it("returns empty for unknown domain", () => {
    const lessons = getLessonsForDomain("underwater-basket-weaving");
    expect(lessons.length).toBe(0);
  });
});

describe("getReadyLessons", () => {
  it("returns lessons with no prerequisites when nothing is completed", () => {
    const ready = getReadyLessons([]);
    ready.forEach((l) =>
      expect(l.prerequisites.length).toBe(0),
    );
  });

  it("unlocks lessons when prerequisites are met", () => {
    const noPrereqIds = CURRICULUM_LESSONS
      .filter((l) => l.prerequisites.length === 0)
      .map((l) => l.id);
    const ready = getReadyLessons(noPrereqIds);
    expect(ready.length).toBeGreaterThanOrEqual(noPrereqIds.length);
  });
});

describe("getLearningPath", () => {
  it("returns a path for a lesson with no prereqs", () => {
    const noPrereq = CURRICULUM_LESSONS.find((l) => l.prerequisites.length === 0);
    if (noPrereq) {
      const path = getLearningPath(noPrereq.id);
      expect(path.length).toBeGreaterThanOrEqual(1);
      expect(path[path.length - 1].id).toBe(noPrereq.id);
    }
  });

  it("returns empty for unknown lesson", () => {
    const path = getLearningPath("nonexistent-lesson");
    expect(path.length).toBe(0);
  });
});

describe("buildCurriculumOverview", () => {
  it("returns overview with domain progress", () => {
    const overview = buildCurriculumOverview("child-1", 6, []);
    expect(overview.childId).toBe("child-1");
    expect(overview.domainProgress).toBeDefined();
    const totalAcrossDomains = Object.values(overview.domainProgress).reduce((s: number, d: any) => s + d.totalLessons, 0);
    expect(totalAcrossDomains).toBeGreaterThan(0);
  });

  it("shows mastery when lessons completed", () => {
    const allProgress = CURRICULUM_LESSONS.map((l) => ({
      childId: "child-1",
      lessonId: l.id,
      status: "mastered" as const,
      startedAt: "2026-01-01",
      lastPracticedAt: "2026-04-01",
      masteredAt: "2026-04-01",
      practiceCount: 10,
      accuracy: 95,
    }));
    const overview = buildCurriculumOverview("child-1", 6, allProgress);
    const totalMastered = Object.values(overview.domainProgress).reduce((s: number, d: any) => s + d.mastered, 0);
    expect(totalMastered).toBeGreaterThan(0);
  });
});
