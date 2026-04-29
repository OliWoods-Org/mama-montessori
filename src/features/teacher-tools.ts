/**
 * Teacher / Guide Tools Module
 *
 * Competitors: MagicSchool AI (teacher tools), Montessori Compass (observations)
 * Our advantage: Montessori-specific lesson planning, observation templates,
 *   and classroom management designed for mixed-age environments
 *
 * Features:
 * - Lesson plan generator aligned to Montessori scope & sequence
 * - Observation templates (AMI/AMS-style)
 * - Classroom management tools for mixed-age groups
 * - Individual education plan (IEP) support
 * - Parent communication templates
 * - Record-keeping for state reporting requirements
 */

import { z } from "zod";

// ============================================================================
// Observation System
// ============================================================================

export const ObservationTypeSchema = z.enum([
  "spontaneous",      // Unplanned observation during work time
  "planned",          // Scheduled observation of specific child/material
  "anecdotal",        // Brief note about a notable moment
  "running-record",   // Detailed minute-by-minute record
  "checklist",        // Structured checklist assessment
  "photo-doc",        // Photo with annotation
]);
export type ObservationType = z.infer<typeof ObservationTypeSchema>;

export const ObservationSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  childId: z.string(),
  classroomId: z.string(),
  type: ObservationTypeSchema,
  date: z.string(),
  timeOfDay: z.enum(["morning-work", "group-lesson", "outdoor", "afternoon-work", "transition"]),
  duration: z.number().optional(),          // minutes observed
  material: z.string().optional(),          // What the child was working with
  domain: z.string().optional(),
  narrative: z.string(),                    // What happened
  concentration: z.enum(["deep", "focused", "moderate", "light", "distracted"]).optional(),
  socialContext: z.enum(["individual", "parallel", "pair", "small-group", "large-group"]).optional(),
  repetitions: z.number().optional(),
  independence: z.enum(["full", "minimal-guidance", "moderate-guidance", "significant-support"]).optional(),
  mood: z.string().optional(),
  skills: z.array(z.string()).default([]),
  nextSteps: z.string().optional(),         // What to present next
  followUp: z.enum(["none", "re-present", "extend", "refer", "parent-conference"]).default("none"),
  tags: z.array(z.string()).default([]),
  photoUrls: z.array(z.string()).default([]),
  createdAt: z.string(),
});
export type Observation = z.infer<typeof ObservationSchema>;

// ============================================================================
// Lesson Plan Generator
// ============================================================================

export const LessonPlanTypeSchema = z.enum([
  "individual-presentation", // One-on-one material presentation
  "small-group",             // 3-5 children
  "large-group",             // Whole class
  "great-lesson",            // Montessori Great Lesson (elementary)
  "grace-and-courtesy",      // Social skills lesson
  "outdoor",                 // Nature/outdoor education
  "art-music",               // Creative arts
]);
export type LessonPlanType = z.infer<typeof LessonPlanTypeSchema>;

export const LessonPlanSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  classroomId: z.string(),
  type: LessonPlanTypeSchema,
  title: z.string(),
  domain: z.string(),
  subdomain: z.string().optional(),
  targetChildren: z.array(z.string()),       // Child IDs (empty = whole class)
  ageRange: z.tuple([z.number(), z.number()]),
  objectives: z.array(z.string()),
  materialsNeeded: z.array(z.string()),
  preparation: z.array(z.string()),
  presentation: z.array(z.object({
    step: z.number(),
    action: z.string(),
    guideNotes: z.string().optional(),
    childResponse: z.string().optional(),
    duration: z.number().optional(),         // seconds
  })),
  controlOfError: z.string(),
  directAim: z.string(),
  indirectAim: z.string(),
  vocabulary: z.array(z.string()),
  extensions: z.array(z.string()),
  adaptations: z.object({
    younger: z.string().optional(),
    older: z.string().optional(),
    specialNeeds: z.string().optional(),
    ell: z.string().optional(),              // English Language Learner
  }).default({}),
  assessment: z.string(),                    // How to assess understanding
  followUpLessons: z.array(z.string()),
  standardsAlignment: z.array(z.string()).default([]),
  scheduledFor: z.string().optional(),
  status: z.enum(["draft", "ready", "presented", "revisit"]).default("draft"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LessonPlan = z.infer<typeof LessonPlanSchema>;

// ============================================================================
// Classroom Management
// ============================================================================

export const ClassroomSchema = z.object({
  id: z.string(),
  name: z.string(),
  schoolId: z.string().optional(),
  guideIds: z.array(z.string()),
  childIds: z.array(z.string()),
  ageRange: z.tuple([z.number(), z.number()]),
  capacity: z.number(),
  programType: z.enum(["primary", "lower-elementary", "upper-elementary", "adolescent", "mixed"]),
  schedule: z.object({
    workCycleStart: z.string(),             // HH:MM
    workCycleEnd: z.string(),
    lunchTime: z.string(),
    outdoorTime: z.string(),
    dismissalTime: z.string(),
  }),
  materialInventoryIds: z.array(z.string()),
  createdAt: z.string(),
});
export type Classroom = z.infer<typeof ClassroomSchema>;

export const DailyPlanSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  classroomId: z.string(),
  date: z.string(),
  plannedPresentations: z.array(z.object({
    lessonPlanId: z.string(),
    childIds: z.array(z.string()),
    timeSlot: z.string().optional(),
    priority: z.enum(["must-do", "if-time", "observe-only"]),
  })),
  groupLessons: z.array(z.object({
    title: z.string(),
    time: z.string(),
    children: z.enum(["all", "subset"]),
    notes: z.string(),
  })),
  observationFocus: z.array(z.string()),    // Children to observe today
  materials: z.array(z.string()),            // Materials to prepare/rotate
  notes: z.string().default(""),
  reflections: z.string().optional(),        // End of day reflection
});
export type DailyPlan = z.infer<typeof DailyPlanSchema>;

// ============================================================================
// Parent Communication
// ============================================================================

export const ParentCommunicationSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  parentId: z.string(),
  childId: z.string(),
  type: z.enum([
    "progress-update",
    "conference-notes",
    "concern",
    "celebration",
    "request",
    "newsletter",
  ]),
  subject: z.string(),
  body: z.string(),
  attachments: z.array(z.string()).default([]),
  sentAt: z.string().nullable().default(null),
  readAt: z.string().nullable().default(null),
  createdAt: z.string(),
});
export type ParentCommunication = z.infer<typeof ParentCommunicationSchema>;

// ============================================================================
// Record Keeping
// ============================================================================

export const AttendanceRecordSchema = z.object({
  childId: z.string(),
  classroomId: z.string(),
  date: z.string(),
  status: z.enum(["present", "absent", "tardy", "early-dismissal"]),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  note: z.string().optional(),
});
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate a lesson plan from parameters
 */
export function generateLessonPlan(params: {
  guideId: string;
  classroomId: string;
  type: LessonPlanType;
  title: string;
  domain: string;
  targetChildIds: string[];
  ageRange: [number, number];
  objectives: string[];
  materialsNeeded: string[];
}): LessonPlan {
  const now = new Date().toISOString();

  // Generate basic Montessori three-period lesson structure
  const presentation = [
    {
      step: 1,
      action: "Invite the child and carry material to workspace together",
      guideNotes: "Let the child help carry — builds ownership and fine motor",
      duration: 60,
    },
    {
      step: 2,
      action: "Name the material and demonstrate slowly, with minimal words",
      guideNotes: "Slow is key — the child's eyes need to follow each movement",
      childResponse: "Child watches attentively",
      duration: 120,
    },
    {
      step: 3,
      action: "First period: 'This is...' — name the concept",
      guideNotes: "Clear, simple naming. Repeat 2-3 times.",
      duration: 60,
    },
    {
      step: 4,
      action: "Second period: 'Show me...' — recognition",
      guideNotes: "Ask child to identify. Make it playful.",
      childResponse: "Child points to or selects the correct item",
      duration: 90,
    },
    {
      step: 5,
      action: "Third period: 'What is this?' — recall",
      guideNotes: "Only proceed if child was successful in period 2",
      childResponse: "Child names the concept independently",
      duration: 60,
    },
    {
      step: 6,
      action: "Invite the child to work independently",
      guideNotes: "Step back and observe. Do not interrupt concentration.",
      duration: 300,
    },
    {
      step: 7,
      action: "Child returns material to shelf when finished",
      guideNotes: "Material care is part of the lesson",
      duration: 60,
    },
  ];

  return {
    id: `lp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    guideId: params.guideId,
    classroomId: params.classroomId,
    type: params.type,
    title: params.title,
    domain: params.domain,
    targetChildren: params.targetChildIds,
    ageRange: params.ageRange,
    objectives: params.objectives,
    materialsNeeded: params.materialsNeeded,
    preparation: [
      "Ensure material is complete and in good condition",
      "Clear a workspace (table or mat)",
      "Check that the child has completed prerequisites",
    ],
    presentation,
    controlOfError: "Built into the material — observe the child's self-correction",
    directAim: params.objectives[0] ?? "Introduce new concept",
    indirectAim: "Build concentration, independence, and love of learning",
    vocabulary: [],
    extensions: [],
    adaptations: {},
    assessment: "Observe child's independent work with the material over the following days",
    followUpLessons: [],
    standardsAlignment: [],
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create an observation record
 */
export function createObservation(params: {
  guideId: string;
  childId: string;
  classroomId: string;
  type: ObservationType;
  narrative: string;
  material?: string;
  domain?: string;
  concentration?: Observation["concentration"];
  independence?: Observation["independence"];
  nextSteps?: string;
}): Observation {
  return {
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    guideId: params.guideId,
    childId: params.childId,
    classroomId: params.classroomId,
    type: params.type,
    date: new Date().toISOString().split("T")[0],
    timeOfDay: "morning-work",
    material: params.material,
    domain: params.domain,
    narrative: params.narrative,
    concentration: params.concentration,
    independence: params.independence,
    nextSteps: params.nextSteps,
    followUp: params.nextSteps ? "extend" : "none",
    skills: [],
    tags: [],
    photoUrls: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate a daily plan for a guide
 */
export function generateDailyPlan(params: {
  guideId: string;
  classroomId: string;
  date: string;
  childrenToObserve: string[];
  plannedLessonIds: string[];
}): DailyPlan {
  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    guideId: params.guideId,
    classroomId: params.classroomId,
    date: params.date,
    plannedPresentations: params.plannedLessonIds.map((id) => ({
      lessonPlanId: id,
      childIds: [],
      priority: "must-do" as const,
    })),
    groupLessons: [],
    observationFocus: params.childrenToObserve,
    materials: [],
    notes: "",
  };
}

/**
 * Generate a parent progress update
 */
export function generateProgressUpdate(params: {
  guideId: string;
  parentId: string;
  childId: string;
  childName: string;
  observations: Observation[];
  period: string;
}): ParentCommunication {
  const obs = params.observations.filter((o) => o.childId === params.childId);

  const domains = [...new Set(obs.map((o) => o.domain).filter(Boolean))];
  const highlights = obs.filter((o) => o.concentration === "deep" || o.independence === "full");

  const body = [
    `Dear Family,`,
    ``,
    `Here is ${params.childName}'s progress update for ${params.period}.`,
    ``,
    `**Areas of Work:** ${domains.join(", ") || "Various areas"}`,
    `**Observations Recorded:** ${obs.length}`,
    highlights.length > 0 ? `**Highlights:** ${highlights.map((h) => h.narrative.slice(0, 100)).join("; ")}` : "",
    ``,
    `${params.childName} continues to grow and develop at their own pace. Please feel free to schedule a conference if you'd like to discuss in more detail.`,
    ``,
    `Warm regards`,
  ].filter(Boolean).join("\n");

  return {
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    guideId: params.guideId,
    parentId: params.parentId,
    childId: params.childId,
    type: "progress-update",
    subject: `${params.childName}'s Progress — ${params.period}`,
    body,
    attachments: [],
    sentAt: null,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Compute which children need attention (haven't been observed recently)
 */
export function getUnderobservedChildren(
  childIds: string[],
  observations: Observation[],
  daysSinceThreshold: number = 5,
): string[] {
  const now = new Date();
  const lastObserved: Record<string, Date> = {};

  for (const obs of observations) {
    const date = new Date(obs.createdAt);
    if (!lastObserved[obs.childId] || date > lastObserved[obs.childId]) {
      lastObserved[obs.childId] = date;
    }
  }

  return childIds.filter((id) => {
    const last = lastObserved[id];
    if (!last) return true; // Never observed
    const daysSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= daysSinceThreshold;
  });
}
