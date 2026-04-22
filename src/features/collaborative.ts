/**
 * Collaborative Learning Module
 *
 * Competitor: Prisma (peer-to-peer learning, group projects)
 * Our advantage: Montessori mixed-age mentorship model, COPPA-safe collaboration,
 *   group projects with individual accountability
 *
 * Features:
 * - Peer-to-peer learning sessions (older children mentor younger)
 * - Group project coordination with role assignment
 * - Mentorship matching based on skills and interests
 * - Safe communication (no direct messaging, guided interactions only)
 * - Collaboration analytics and social skill tracking
 */

import { z } from "zod";

// ============================================================================
// Collaboration Types
// ============================================================================

export const CollaborationTypeSchema = z.enum([
  "peer-tutoring",      // Older child teaches younger (Montessori mixed-age)
  "group-project",      // 2-5 children working toward shared goal
  "study-group",        // Same-age peer learning on shared topic
  "presentation",       // Child presents work to group
  "pair-work",          // Two children on complementary tasks
  "community-service",  // Service-oriented group activity
]);
export type CollaborationType = z.infer<typeof CollaborationTypeSchema>;

export const CollaborationStatusSchema = z.enum([
  "forming",    // Group being assembled
  "active",     // Collaboration in progress
  "paused",     // Temporarily on hold
  "completed",  // Successfully finished
  "dissolved",  // Ended before completion
]);
export type CollaborationStatus = z.infer<typeof CollaborationStatusSchema>;

// ============================================================================
// Mentorship Matching
// ============================================================================

export const MentorshipMatchSchema = z.object({
  id: z.string(),
  mentorChildId: z.string(),
  menteeChildId: z.string(),
  skillArea: z.string(),
  matchScore: z.number().min(0).max(100),   // Compatibility score
  matchReasons: z.array(z.string()),
  status: z.enum(["proposed", "active", "completed", "ended"]),
  sessionsCompleted: z.number().default(0),
  mentorGrowthAreas: z.array(z.string()),   // What the mentor gains
  menteeGrowthAreas: z.array(z.string()),   // What the mentee gains
  parentConsentMentor: z.boolean().default(false),
  parentConsentMentee: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MentorshipMatch = z.infer<typeof MentorshipMatchSchema>;

// ============================================================================
// Group Projects
// ============================================================================

export const ProjectRoleSchema = z.enum([
  "leader",       // Coordinates the group (rotates)
  "researcher",   // Gathers information
  "creator",      // Builds/makes the artifact
  "presenter",    // Shares the work with others
  "documenter",   // Records the process
  "reviewer",     // Provides feedback
]);
export type ProjectRole = z.infer<typeof ProjectRoleSchema>;

export const GroupProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: CollaborationTypeSchema,
  status: CollaborationStatusSchema,
  members: z.array(z.object({
    childId: z.string(),
    role: ProjectRoleSchema,
    contributionNotes: z.string().default(""),
    participationScore: z.number().min(0).max(100).default(0),
  })),
  maxMembers: z.number().default(5),
  ageRange: z.tuple([z.number(), z.number()]),
  skillsTargeted: z.array(z.string()),
  milestones: z.array(z.object({
    id: z.string(),
    description: z.string(),
    dueDate: z.string().optional(),
    completedAt: z.string().nullable().default(null),
    assignedTo: z.array(z.string()).default([]),
  })).default([]),
  artifacts: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    createdBy: z.string(),
    url: z.string().optional(),
  })).default([]),
  socialSkillsObserved: z.array(z.string()).default([]),
  guideNotes: z.string().default(""),
  startedAt: z.string(),
  completedAt: z.string().nullable().default(null),
});
export type GroupProject = z.infer<typeof GroupProjectSchema>;

// ============================================================================
// Collaboration Session (real-time guided interaction)
// ============================================================================

export const CollaborationSessionSchema = z.object({
  id: z.string(),
  type: CollaborationTypeSchema,
  projectId: z.string().optional(),
  participantIds: z.array(z.string()),
  guidePresent: z.boolean().default(true),  // AI guide moderates
  topic: z.string(),
  duration: z.number(),                      // minutes
  interactions: z.array(z.object({
    childId: z.string(),
    type: z.enum(["spoke", "helped", "asked", "shared", "listened", "encouraged"]),
    timestamp: z.string(),
    note: z.string().optional(),
  })).default([]),
  outcomes: z.array(z.string()).default([]),
  socialSkillsRatings: z.record(z.string(), z.number()).default({}),
  startedAt: z.string(),
  endedAt: z.string().nullable().default(null),
});
export type CollaborationSession = z.infer<typeof CollaborationSessionSchema>;

// ============================================================================
// Social Skills Tracking
// ============================================================================

export const SocialSkillSchema = z.enum([
  "active-listening",
  "turn-taking",
  "perspective-taking",
  "conflict-resolution",
  "encouragement",
  "constructive-feedback",
  "asking-for-help",
  "offering-help",
  "sharing-materials",
  "respecting-differences",
  "leadership",
  "followership",
]);
export type SocialSkill = z.infer<typeof SocialSkillSchema>;

export const SocialSkillProfileSchema = z.object({
  childId: z.string(),
  skills: z.record(SocialSkillSchema, z.object({
    level: z.enum(["emerging", "developing", "consistent", "exemplary"]),
    observations: z.number(),
    lastObservedAt: z.string().nullable(),
  })),
  collaborationCount: z.number(),
  mentoringSessions: z.number(),
  preferredRole: ProjectRoleSchema.nullable(),
  groupWorkComfort: z.enum(["low", "moderate", "high"]),
  updatedAt: z.string(),
});
export type SocialSkillProfile = z.infer<typeof SocialSkillProfileSchema>;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Find mentorship matches based on skill complementarity
 */
export function findMentorshipMatches(
  children: Array<{
    childId: string;
    age: number;
    masteredSkills: string[];
    developingSkills: string[];
    interests: string[];
  }>,
): MentorshipMatch[] {
  const matches: MentorshipMatch[] = [];

  for (const mentor of children) {
    for (const mentee of children) {
      if (mentor.childId === mentee.childId) continue;
      if (mentor.age <= mentee.age) continue; // Mentor must be older (Montessori principle)
      if (mentor.age - mentee.age > 4) continue; // Not too far apart

      // Find skills where mentor is strong and mentee is developing
      const teachableSkills = mentor.masteredSkills.filter(
        (s) => mentee.developingSkills.includes(s),
      );

      if (teachableSkills.length === 0) continue;

      // Shared interests improve match quality
      const sharedInterests = mentor.interests.filter(
        (i) => mentee.interests.includes(i),
      );

      const matchScore = Math.min(100,
        teachableSkills.length * 25 +
        sharedInterests.length * 15 +
        (mentor.age - mentee.age >= 2 ? 10 : 0),
      );

      if (matchScore >= 40) {
        matches.push({
          id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          mentorChildId: mentor.childId,
          menteeChildId: mentee.childId,
          skillArea: teachableSkills[0],
          matchScore,
          matchReasons: [
            `${teachableSkills.length} teachable skill(s)`,
            `${sharedInterests.length} shared interest(s)`,
            `Age gap: ${mentor.age - mentee.age} years`,
          ],
          status: "proposed",
          sessionsCompleted: 0,
          mentorGrowthAreas: ["leadership", "communication", "reinforcing own knowledge"],
          menteeGrowthAreas: teachableSkills,
          parentConsentMentor: false,
          parentConsentMentee: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Create a group project with role assignments
 */
export function createGroupProject(params: {
  title: string;
  description: string;
  type: CollaborationType;
  memberIds: string[];
  ageRange: [number, number];
  skillsTargeted: string[];
}): GroupProject {
  const roles: ProjectRole[] = ["leader", "researcher", "creator", "presenter", "documenter", "reviewer"];

  const members = params.memberIds.map((childId, index) => ({
    childId,
    role: roles[index % roles.length],
    contributionNotes: "",
    participationScore: 0,
  }));

  return {
    id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: params.title,
    description: params.description,
    type: params.type,
    status: "forming",
    members,
    maxMembers: 5,
    ageRange: params.ageRange,
    skillsTargeted: params.skillsTargeted,
    milestones: [],
    artifacts: [],
    socialSkillsObserved: [],
    guideNotes: "",
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

/**
 * Start a collaboration session
 */
export function startCollaborationSession(params: {
  type: CollaborationType;
  participantIds: string[];
  topic: string;
  durationMinutes: number;
  projectId?: string;
}): CollaborationSession {
  return {
    id: `collab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: params.type,
    projectId: params.projectId,
    participantIds: params.participantIds,
    guidePresent: true,
    topic: params.topic,
    duration: params.durationMinutes,
    interactions: [],
    outcomes: [],
    socialSkillsRatings: {},
    startedAt: new Date().toISOString(),
    endedAt: null,
  };
}

/**
 * Record a social interaction during collaboration
 */
export function recordInteraction(
  session: CollaborationSession,
  childId: string,
  type: CollaborationSession["interactions"][number]["type"],
  note?: string,
): CollaborationSession {
  return {
    ...session,
    interactions: [
      ...session.interactions,
      {
        childId,
        type,
        timestamp: new Date().toISOString(),
        note,
      },
    ],
  };
}

/**
 * Compute social skill profile from collaboration history
 */
export function buildSocialSkillProfile(
  childId: string,
  sessions: CollaborationSession[],
  projects: GroupProject[],
): SocialSkillProfile {
  const childSessions = sessions.filter((s) => s.participantIds.includes(childId));
  const childProjects = projects.filter((p) => p.members.some((m) => m.childId === childId));

  const skillCounts: Record<string, number> = {};
  for (const session of childSessions) {
    const childInteractions = session.interactions.filter((i) => i.childId === childId);
    for (const interaction of childInteractions) {
      const skill = interactionToSkill(interaction.type);
      skillCounts[skill] = (skillCounts[skill] ?? 0) + 1;
    }
  }

  const allSkills: SocialSkill[] = [
    "active-listening", "turn-taking", "perspective-taking", "conflict-resolution",
    "encouragement", "constructive-feedback", "asking-for-help", "offering-help",
    "sharing-materials", "respecting-differences", "leadership", "followership",
  ];

  const skills: SocialSkillProfile["skills"] = {} as any;
  for (const skill of allSkills) {
    const count = skillCounts[skill] ?? 0;
    skills[skill] = {
      level: count >= 10 ? "exemplary" : count >= 5 ? "consistent" : count >= 2 ? "developing" : "emerging",
      observations: count,
      lastObservedAt: childSessions.length > 0 ? childSessions[childSessions.length - 1].startedAt : null,
    };
  }

  // Determine preferred role
  const roleCounts: Record<string, number> = {};
  for (const project of childProjects) {
    const member = project.members.find((m) => m.childId === childId);
    if (member) roleCounts[member.role] = (roleCounts[member.role] ?? 0) + 1;
  }
  const preferredRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as ProjectRole ?? null;

  return {
    childId,
    skills,
    collaborationCount: childSessions.length,
    mentoringSessions: childSessions.filter((s) => s.type === "peer-tutoring").length,
    preferredRole,
    groupWorkComfort: childSessions.length >= 10 ? "high" : childSessions.length >= 3 ? "moderate" : "low",
    updatedAt: new Date().toISOString(),
  };
}

function interactionToSkill(type: string): SocialSkill {
  const map: Record<string, SocialSkill> = {
    "spoke": "active-listening",
    "helped": "offering-help",
    "asked": "asking-for-help",
    "shared": "sharing-materials",
    "listened": "active-listening",
    "encouraged": "encouragement",
  };
  return map[type] ?? "active-listening";
}
