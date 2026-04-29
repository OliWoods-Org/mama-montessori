import { describe, it, expect } from "vitest";
import {
  findMentorshipMatches,
  createGroupProject,
  buildSocialSkillProfile,
} from "../src/features/collaborative";

describe("findMentorshipMatches", () => {
  const children = [
    { id: "c1", name: "Alice", age: 8, skills: ["reading", "math"], interests: ["science"] },
    { id: "c2", name: "Bob", age: 5, skills: ["counting"], interests: ["science", "art"] },
    { id: "c3", name: "Carol", age: 10, skills: ["reading", "writing", "math"], interests: ["music"] },
    { id: "c4", name: "Dave", age: 4, skills: [], interests: ["art"] },
  ];

  it("pairs older mentors with younger mentees", () => {
    const matches = findMentorshipMatches(children);
    matches.forEach((m) => {
      const mentor = children.find((c) => c.id === m.mentorId)!;
      const mentee = children.find((c) => c.id === m.menteeId)!;
      expect(mentor.age).toBeGreaterThan(mentee.age);
    });
  });

  it("caps age gap at 4 years", () => {
    const matches = findMentorshipMatches(children);
    matches.forEach((m) => {
      const mentor = children.find((c) => c.id === m.mentorId)!;
      const mentee = children.find((c) => c.id === m.menteeId)!;
      expect(mentor.age - mentee.age).toBeLessThanOrEqual(4);
    });
  });

  it("returns empty for single child", () => {
    const matches = findMentorshipMatches([children[0]]);
    expect(matches.length).toBe(0);
  });
});

describe("createGroupProject", () => {
  it("creates a project with assigned roles", () => {
    const project = createGroupProject({
      title: "Nature Journal",
      description: "Observe and document local plants",
      type: "cross-age-mentoring",
      memberIds: ["c1", "c2", "c3"],
      ageRange: [4, 10],
      skillsTargeted: ["observation", "writing"],
    });
    expect(project.title).toBe("Nature Journal");
    expect(project.members.length).toBe(3);
    project.members.forEach((m) => expect(m.role).toBeDefined());
  });
});

describe("buildSocialSkillProfile", () => {
  it("builds profile from sessions and projects", () => {
    const profile = buildSocialSkillProfile("c1", [], []);
    expect(profile.childId).toBe("c1");
    expect(profile.collaborationCount).toBe(0);
  });
});
