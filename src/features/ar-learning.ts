/**
 * AR / Mixed Reality Learning Module
 *
 * Competitors: Montessorium (AR flashcards), Edoki (3D elements)
 * Our advantage: Full AR lesson plans, virtual manipulatives, spatial learning
 *
 * Features:
 * - AR scene types (tabletop, room-scale, overlay)
 * - Virtual Montessori manipulatives (golden beads, pink tower, etc.)
 * - Lesson plans with AR integration points
 * - Spatial reasoning assessment
 * - Works with WebXR for browser-based AR (no app install)
 */

import { z } from "zod";

// ============================================================================
// AR Scene Types
// ============================================================================

export const ARSceneTypeSchema = z.enum([
  "tabletop",     // Small-scale AR placed on a surface
  "room-scale",   // Room-scale immersive AR
  "overlay",      // Camera overlay with annotations
  "passthrough",  // Mixed reality with virtual objects in real space
  "360-scene",    // 360-degree explorable environment
]);
export type ARSceneType = z.infer<typeof ARSceneTypeSchema>;

export const ARInteractionTypeSchema = z.enum([
  "tap",          // Tap to select/activate
  "drag",         // Drag objects in 3D space
  "pinch-zoom",   // Resize objects
  "rotate",       // Rotate objects by gesture
  "voice",        // Voice commands for pre-readers
  "gaze",         // Look-at targeting for accessibility
]);
export type ARInteractionType = z.infer<typeof ARInteractionTypeSchema>;

// ============================================================================
// Virtual Manipulatives
// ============================================================================

export const MontessoriMaterialCategorySchema = z.enum([
  "practical-life",
  "sensorial",
  "language",
  "mathematics",
  "cultural",
  "science",
  "geography",
  "art",
]);
export type MontessoriMaterialCategory = z.infer<typeof MontessoriMaterialCategorySchema>;

export const VirtualManipulativeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: MontessoriMaterialCategorySchema,
  description: z.string(),
  physicalEquivalent: z.string(),           // Real Montessori material this represents
  ageRange: z.tuple([z.number(), z.number()]),
  sceneType: ARSceneTypeSchema,
  interactions: z.array(ARInteractionTypeSchema),
  learningObjectives: z.array(z.string()),
  prerequisiteMaterials: z.array(z.string()).default([]),
  modelUrl: z.string().optional(),          // 3D model asset URL
  thumbnailUrl: z.string().optional(),
});
export type VirtualManipulative = z.infer<typeof VirtualManipulativeSchema>;

// ============================================================================
// AR Lesson Plans
// ============================================================================

export const ARLessonStepSchema = z.object({
  order: z.number(),
  instruction: z.string(),
  manipulativeId: z.string().optional(),
  sceneType: ARSceneTypeSchema,
  durationSeconds: z.number(),
  voiceGuidance: z.string(),                // For pre-readers
  successCriteria: z.string(),
  adaptationHints: z.record(z.string(), z.string()).default({}),
});
export type ARLessonStep = z.infer<typeof ARLessonStepSchema>;

export const ARLessonPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  domain: MontessoriMaterialCategorySchema,
  ageRange: z.tuple([z.number(), z.number()]),
  objectives: z.array(z.string()),
  materials: z.array(z.string()),           // VirtualManipulative IDs
  steps: z.array(ARLessonStepSchema),
  estimatedMinutes: z.number(),
  skillsAssessed: z.array(z.string()),
  createdAt: z.string(),
});
export type ARLessonPlan = z.infer<typeof ARLessonPlanSchema>;

// ============================================================================
// AR Session Tracking
// ============================================================================

export const ARSessionEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  childId: z.string(),
  lessonPlanId: z.string(),
  manipulativeId: z.string().optional(),
  eventType: z.enum([
    "scene-loaded",
    "object-placed",
    "object-manipulated",
    "step-completed",
    "hint-requested",
    "spatial-error",
    "lesson-completed",
  ]),
  metadata: z.record(z.string(), z.unknown()).default({}),
  timestamp: z.string(),
});
export type ARSessionEvent = z.infer<typeof ARSessionEventSchema>;

// ============================================================================
// Default Virtual Manipulatives Library
// ============================================================================

export const VIRTUAL_MANIPULATIVES: VirtualManipulative[] = [
  {
    id: "vm-golden-beads",
    name: "Golden Beads",
    category: "mathematics",
    description: "Units, tens bars, hundred squares, and thousand cubes for understanding the decimal system",
    physicalEquivalent: "Montessori Golden Bead Material",
    ageRange: [5, 9],
    sceneType: "tabletop",
    interactions: ["drag", "pinch-zoom", "tap"],
    learningObjectives: [
      "Understand place value (units, tens, hundreds, thousands)",
      "Perform addition and subtraction with exchange",
      "Visualize large numbers concretely",
    ],
    prerequisiteMaterials: [],
  },
  {
    id: "vm-pink-tower",
    name: "Pink Tower",
    category: "sensorial",
    description: "Ten graduated pink cubes for visual discrimination of dimension",
    physicalEquivalent: "Montessori Pink Tower",
    ageRange: [3, 6],
    sceneType: "tabletop",
    interactions: ["drag", "rotate", "pinch-zoom"],
    learningObjectives: [
      "Visual discrimination of size",
      "Ordering from largest to smallest",
      "Preparation for mathematics (cube root concept)",
    ],
    prerequisiteMaterials: [],
  },
  {
    id: "vm-moveable-alphabet",
    name: "Moveable Alphabet",
    category: "language",
    description: "Individual letters that children arrange to build words before they can write",
    physicalEquivalent: "Montessori Moveable Alphabet",
    ageRange: [4, 7],
    sceneType: "tabletop",
    interactions: ["drag", "tap", "voice"],
    learningObjectives: [
      "Phonemic awareness",
      "Word construction",
      "Spelling patterns",
      "Sentence building",
    ],
    prerequisiteMaterials: ["vm-sandpaper-letters"],
  },
  {
    id: "vm-sandpaper-letters",
    name: "Sandpaper Letters",
    category: "language",
    description: "Tactile letters for learning letter shapes and sounds through touch",
    physicalEquivalent: "Montessori Sandpaper Letters",
    ageRange: [3, 6],
    sceneType: "overlay",
    interactions: ["drag", "voice", "tap"],
    learningObjectives: [
      "Letter recognition",
      "Letter-sound association",
      "Correct letter formation",
    ],
    prerequisiteMaterials: [],
  },
  {
    id: "vm-binomial-cube",
    name: "Binomial Cube",
    category: "sensorial",
    description: "3D puzzle representing (a+b)^3 for spatial reasoning and algebraic preparation",
    physicalEquivalent: "Montessori Binomial Cube",
    ageRange: [4, 10],
    sceneType: "tabletop",
    interactions: ["drag", "rotate", "pinch-zoom"],
    learningObjectives: [
      "Spatial reasoning",
      "Pattern recognition",
      "Preparation for algebra",
    ],
    prerequisiteMaterials: [],
  },
  {
    id: "vm-continent-globe",
    name: "Continent Globe",
    category: "geography",
    description: "Interactive 3D globe with color-coded continents for geography exploration",
    physicalEquivalent: "Montessori Sandpaper Globe / Continent Globe",
    ageRange: [3, 9],
    sceneType: "room-scale",
    interactions: ["rotate", "tap", "pinch-zoom", "voice"],
    learningObjectives: [
      "Continent identification",
      "Ocean identification",
      "Geographic relationships",
      "Cultural awareness",
    ],
    prerequisiteMaterials: [],
  },
  {
    id: "vm-stamp-game",
    name: "Stamp Game",
    category: "mathematics",
    description: "Abstract representation of operations using place-value stamps",
    physicalEquivalent: "Montessori Stamp Game",
    ageRange: [6, 9],
    sceneType: "tabletop",
    interactions: ["drag", "tap"],
    learningObjectives: [
      "Addition with regrouping",
      "Subtraction with exchange",
      "Multiplication concepts",
      "Division concepts",
    ],
    prerequisiteMaterials: ["vm-golden-beads"],
  },
  {
    id: "vm-botany-cabinet",
    name: "Botany Cabinet",
    category: "science",
    description: "Leaf shape puzzles and botanical classification in AR",
    physicalEquivalent: "Montessori Botany Cabinet",
    ageRange: [4, 8],
    sceneType: "overlay",
    interactions: ["tap", "drag", "pinch-zoom"],
    learningObjectives: [
      "Leaf shape identification",
      "Botanical vocabulary",
      "Classification skills",
      "Nature observation",
    ],
    prerequisiteMaterials: [],
  },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get manipulatives appropriate for a child's age and developmental phase
 */
export function getManipulativesForAge(
  age: number,
  category?: MontessoriMaterialCategory,
): VirtualManipulative[] {
  return VIRTUAL_MANIPULATIVES.filter((m) => {
    const inAgeRange = age >= m.ageRange[0] && age <= m.ageRange[1];
    const matchesCategory = !category || m.category === category;
    return inAgeRange && matchesCategory;
  });
}

/**
 * Build an AR lesson plan from a learning objective and available manipulatives
 */
export function buildARLessonPlan(params: {
  title: string;
  domain: MontessoriMaterialCategory;
  age: number;
  objectives: string[];
  durationMinutes: number;
}): ARLessonPlan {
  const available = getManipulativesForAge(params.age, params.domain);
  const materialIds = available.slice(0, 3).map((m) => m.id);

  const steps: ARLessonStep[] = [
    {
      order: 1,
      instruction: "Observe the materials. What do you notice?",
      sceneType: "tabletop",
      durationSeconds: 60,
      voiceGuidance: "Take a look at what's in front of you. What catches your eye?",
      successCriteria: "Child verbally identifies at least one property of the material",
    },
    {
      order: 2,
      instruction: "Try moving and exploring the materials with your hands",
      manipulativeId: materialIds[0],
      sceneType: "tabletop",
      durationSeconds: 120,
      voiceGuidance: "Now try touching and moving things around. What happens?",
      successCriteria: "Child interacts with at least one manipulative",
    },
    {
      order: 3,
      instruction: "Can you find a pattern or solve the challenge?",
      manipulativeId: materialIds[0],
      sceneType: "tabletop",
      durationSeconds: params.durationMinutes * 30,
      voiceGuidance: "See if you can figure out the pattern. Take your time!",
      successCriteria: "Child demonstrates understanding of the core concept",
    },
    {
      order: 4,
      instruction: "Show me what you discovered",
      sceneType: "tabletop",
      durationSeconds: 60,
      voiceGuidance: "Tell me what you learned! What was your favorite part?",
      successCriteria: "Child articulates their learning in own words",
    },
  ];

  return {
    id: `ar-lesson-${Date.now()}`,
    title: params.title,
    domain: params.domain,
    ageRange: [Math.max(3, params.age - 1), params.age + 2],
    objectives: params.objectives,
    materials: materialIds,
    steps,
    estimatedMinutes: params.durationMinutes,
    skillsAssessed: params.objectives.map((o) => o.toLowerCase().replace(/\s+/g, "-")),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Track an AR interaction event during a session
 */
export function recordAREvent(params: {
  sessionId: string;
  childId: string;
  lessonPlanId: string;
  eventType: ARSessionEvent["eventType"];
  manipulativeId?: string;
  metadata?: Record<string, unknown>;
}): ARSessionEvent {
  return {
    id: `ar-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId: params.sessionId,
    childId: params.childId,
    lessonPlanId: params.lessonPlanId,
    manipulativeId: params.manipulativeId,
    eventType: params.eventType,
    metadata: params.metadata ?? {},
    timestamp: new Date().toISOString(),
  };
}

/**
 * Assess spatial reasoning from AR interaction patterns
 */
export function assessSpatialReasoning(events: ARSessionEvent[]): {
  score: number;
  strengths: string[];
  areasForGrowth: string[];
} {
  const manipulations = events.filter((e) => e.eventType === "object-manipulated");
  const completions = events.filter((e) => e.eventType === "step-completed");
  const errors = events.filter((e) => e.eventType === "spatial-error");
  const hints = events.filter((e) => e.eventType === "hint-requested");

  const completionRate = completions.length / Math.max(1, events.length);
  const errorRate = errors.length / Math.max(1, manipulations.length);
  const hintRate = hints.length / Math.max(1, completions.length);

  const score = Math.round(
    Math.max(0, Math.min(100,
      completionRate * 40 +
      (1 - errorRate) * 30 +
      (1 - hintRate) * 20 +
      Math.min(manipulations.length / 10, 1) * 10
    ))
  );

  const strengths: string[] = [];
  const areasForGrowth: string[] = [];

  if (completionRate > 0.8) strengths.push("Strong task completion");
  if (errorRate < 0.2) strengths.push("Accurate spatial manipulation");
  if (hintRate < 0.1) strengths.push("Independent problem-solving");
  if (manipulations.length > 15) strengths.push("Active exploration");

  if (completionRate < 0.5) areasForGrowth.push("Task persistence");
  if (errorRate > 0.5) areasForGrowth.push("Spatial accuracy");
  if (hintRate > 0.5) areasForGrowth.push("Independent reasoning");

  return { score, strengths, areasForGrowth };
}
