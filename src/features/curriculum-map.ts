/**
 * Curriculum Scope & Sequence Module
 *
 * Competitor: Montessori Compass (curriculum mapping)
 * Our advantage: Full open-source curriculum map across all 5 Montessori domains,
 *   tied to individual child progression, AI-powered sequencing
 *
 * Features:
 * - Complete Montessori curriculum across 5 domains (Practical Life, Sensorial, Language, Math, Cultural)
 * - Scope and sequence with prerequisites and learning paths
 * - Individual child progress tracking against curriculum
 * - Standards alignment (Common Core, state standards) for reporting
 * - Custom curriculum extensions (e.g., coding, financial literacy)
 */

import { z } from "zod";

// ============================================================================
// Curriculum Structure
// ============================================================================

export const CurriculumDomainSchema = z.enum([
  "practical-life",
  "sensorial",
  "language",
  "mathematics",
  "cultural",
]);
export type CurriculumDomain = z.infer<typeof CurriculumDomainSchema>;

export const CurriculumSubdomainSchema = z.object({
  id: z.string(),
  domain: CurriculumDomainSchema,
  name: z.string(),
  description: z.string(),
  ageRange: z.tuple([z.number(), z.number()]),
  sortOrder: z.number(),
});
export type CurriculumSubdomain = z.infer<typeof CurriculumSubdomainSchema>;

export const LessonStatusSchema = z.enum([
  "not-started",
  "presented",        // Teacher has presented the lesson
  "practicing",       // Child is working with the material
  "progressing",      // Showing improvement
  "mastered",         // Consistent independent performance
]);
export type LessonStatus = z.infer<typeof LessonStatusSchema>;

export const CurriculumLessonSchema = z.object({
  id: z.string(),
  subdomainId: z.string(),
  domain: CurriculumDomainSchema,
  name: z.string(),
  description: z.string(),
  ageRange: z.tuple([z.number(), z.number()]),
  prerequisites: z.array(z.string()),        // Lesson IDs
  nextLessons: z.array(z.string()),          // Lesson IDs that follow
  materials: z.array(z.string()),            // Physical/virtual material IDs
  directAim: z.string(),
  indirectAim: z.string(),
  controlOfError: z.string(),
  vocabulary: z.array(z.string()),
  extensions: z.array(z.string()),           // Extension activities
  standardsAlignment: z.array(z.object({
    standard: z.string(),                    // e.g., "CCSS.Math.K.CC.1"
    description: z.string(),
  })).default([]),
  sortOrder: z.number(),
});
export type CurriculumLesson = z.infer<typeof CurriculumLessonSchema>;

// ============================================================================
// Child Progress Against Curriculum
// ============================================================================

export const ChildLessonProgressSchema = z.object({
  childId: z.string(),
  lessonId: z.string(),
  status: LessonStatusSchema,
  presentedAt: z.string().nullable().default(null),
  masteredAt: z.string().nullable().default(null),
  practiceCount: z.number().default(0),
  lastPracticedAt: z.string().nullable().default(null),
  notes: z.string().default(""),
  guideId: z.string().optional(),
});
export type ChildLessonProgress = z.infer<typeof ChildLessonProgressSchema>;

export const ChildCurriculumOverviewSchema = z.object({
  childId: z.string(),
  domainProgress: z.record(CurriculumDomainSchema, z.object({
    totalLessons: z.number(),
    mastered: z.number(),
    practicing: z.number(),
    presented: z.number(),
    notStarted: z.number(),
    completionPercent: z.number().min(0).max(100),
  })),
  readyLessons: z.array(z.string()),         // Lessons with all prerequisites met
  currentFocus: z.array(z.string()),          // Active practicing lessons
  suggestedNext: z.array(z.string()),         // AI-recommended next presentations
  lastUpdatedAt: z.string(),
});
export type ChildCurriculumOverview = z.infer<typeof ChildCurriculumOverviewSchema>;

// ============================================================================
// Standards Alignment
// ============================================================================

export const StandardsFrameworkSchema = z.enum([
  "common-core",
  "ngss",             // Next Generation Science Standards
  "c3",               // College, Career, and Civic Life (Social Studies)
  "state-custom",
  "ib-pyp",           // International Baccalaureate Primary Years
  "cambridge",
  "montessori-ami",   // AMI curriculum scope
  "montessori-ams",   // AMS curriculum scope
]);
export type StandardsFramework = z.infer<typeof StandardsFrameworkSchema>;

// ============================================================================
// Default Curriculum Data
// ============================================================================

export const CURRICULUM_SUBDOMAINS: CurriculumSubdomain[] = [
  // Practical Life
  { id: "pl-care-of-self", domain: "practical-life", name: "Care of Self", description: "Dressing, hygiene, food preparation for self", ageRange: [2.5, 6], sortOrder: 1 },
  { id: "pl-care-of-environment", domain: "practical-life", name: "Care of Environment", description: "Cleaning, organizing, plant care, animal care", ageRange: [2.5, 6], sortOrder: 2 },
  { id: "pl-grace-courtesy", domain: "practical-life", name: "Grace and Courtesy", description: "Social skills, manners, conflict resolution", ageRange: [2.5, 12], sortOrder: 3 },
  { id: "pl-fine-motor", domain: "practical-life", name: "Fine Motor Control", description: "Pouring, spooning, threading, cutting, folding", ageRange: [2.5, 6], sortOrder: 4 },
  { id: "pl-gross-motor", domain: "practical-life", name: "Gross Motor Control", description: "Walking on the line, carrying objects, balance", ageRange: [2.5, 6], sortOrder: 5 },
  // Sensorial
  { id: "se-visual", domain: "sensorial", name: "Visual Sense", description: "Discrimination of size, color, form, distance", ageRange: [2.5, 6], sortOrder: 1 },
  { id: "se-tactile", domain: "sensorial", name: "Tactile Sense", description: "Texture, temperature, weight, stereognostic", ageRange: [2.5, 6], sortOrder: 2 },
  { id: "se-auditory", domain: "sensorial", name: "Auditory Sense", description: "Sound discrimination, music appreciation, silence game", ageRange: [2.5, 6], sortOrder: 3 },
  { id: "se-olfactory-gustatory", domain: "sensorial", name: "Olfactory & Gustatory", description: "Smell and taste discrimination", ageRange: [2.5, 6], sortOrder: 4 },
  // Language
  { id: "la-spoken", domain: "language", name: "Spoken Language", description: "Vocabulary enrichment, conversation, storytelling", ageRange: [2.5, 12], sortOrder: 1 },
  { id: "la-writing-prep", domain: "language", name: "Writing Preparation", description: "Sandpaper letters, metal insets, moveable alphabet", ageRange: [3, 7], sortOrder: 2 },
  { id: "la-reading", domain: "language", name: "Reading", description: "Phonetic reading, sight words, comprehension", ageRange: [4, 12], sortOrder: 3 },
  { id: "la-grammar", domain: "language", name: "Grammar", description: "Parts of speech, sentence analysis, function of words", ageRange: [6, 12], sortOrder: 4 },
  { id: "la-composition", domain: "language", name: "Composition", description: "Creative writing, research reports, poetry", ageRange: [6, 18], sortOrder: 5 },
  // Mathematics
  { id: "ma-numeration", domain: "mathematics", name: "Numeration", description: "Numbers 1-10, teens, tens, decimal system", ageRange: [3, 9], sortOrder: 1 },
  { id: "ma-operations", domain: "mathematics", name: "Operations", description: "Addition, subtraction, multiplication, division", ageRange: [4, 12], sortOrder: 2 },
  { id: "ma-fractions", domain: "mathematics", name: "Fractions", description: "Fraction concepts, equivalence, operations", ageRange: [6, 12], sortOrder: 3 },
  { id: "ma-geometry", domain: "mathematics", name: "Geometry", description: "Shapes, measurement, spatial reasoning", ageRange: [3, 12], sortOrder: 4 },
  { id: "ma-algebra", domain: "mathematics", name: "Algebra", description: "Patterns, functions, equations", ageRange: [9, 18], sortOrder: 5 },
  // Cultural
  { id: "cu-geography", domain: "cultural", name: "Geography", description: "Land/water forms, continents, maps, cultures", ageRange: [3, 12], sortOrder: 1 },
  { id: "cu-history", domain: "cultural", name: "History", description: "Timeline of life, civilizations, personal timeline", ageRange: [6, 18], sortOrder: 2 },
  { id: "cu-science", domain: "cultural", name: "Science", description: "Botany, zoology, physics, chemistry, earth science", ageRange: [3, 18], sortOrder: 3 },
  { id: "cu-art-music", domain: "cultural", name: "Art & Music", description: "Art appreciation, techniques, music theory, instrument", ageRange: [2.5, 18], sortOrder: 4 },
];

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  // Practical Life — Fine Motor
  {
    id: "les-pouring-dry", subdomainId: "pl-fine-motor", domain: "practical-life",
    name: "Pouring (Dry)", description: "Pouring dry materials (beans, rice) from one container to another",
    ageRange: [2.5, 4], prerequisites: [], nextLessons: ["les-pouring-wet"],
    materials: ["mat-practical-life-pouring"], directAim: "Control of movement in pouring",
    indirectAim: "Independence in serving food", controlOfError: "Spilled material on tray",
    vocabulary: ["pour", "steady", "full", "empty"], extensions: ["Pouring with a funnel", "Pouring into multiple containers"],
    sortOrder: 1,
  },
  {
    id: "les-pouring-wet", subdomainId: "pl-fine-motor", domain: "practical-life",
    name: "Pouring (Water)", description: "Pouring water between two small pitchers",
    ageRange: [2.5, 5], prerequisites: ["les-pouring-dry"], nextLessons: ["les-spooning"],
    materials: [], directAim: "Control of movement with liquid",
    indirectAim: "Independence in serving drinks", controlOfError: "Spilled water on tray",
    vocabulary: ["pour", "water", "careful", "sponge"], extensions: ["Pouring with a tea strainer", "Using a turkey baster"],
    sortOrder: 2,
  },
  // Sensorial
  {
    id: "les-pink-tower", subdomainId: "se-visual", domain: "sensorial",
    name: "Pink Tower", description: "Building tower of 10 graduated cubes from largest to smallest",
    ageRange: [2.5, 5], prerequisites: [], nextLessons: ["les-brown-stair"],
    materials: ["mat-pink-tower"], directAim: "Visual discrimination of dimension",
    indirectAim: "Preparation for mathematics (cube root)", controlOfError: "Tower unstable if out of order",
    vocabulary: ["large", "small", "larger", "smaller"], extensions: ["Build horizontally", "Build with brown stair combination"],
    sortOrder: 1,
  },
  // Mathematics
  {
    id: "les-number-rods", subdomainId: "ma-numeration", domain: "mathematics",
    name: "Number Rods", description: "Associate quantities 1-10 with number names using graduated rods",
    ageRange: [3.5, 5.5], prerequisites: [], nextLessons: ["les-sandpaper-numerals", "les-spindle-box"],
    materials: ["mat-number-rods"], directAim: "Quantity-name association 1-10",
    indirectAim: "Preparation for addition", controlOfError: "Visual staircase pattern",
    vocabulary: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    extensions: ["Memory game with rods", "Addition with rods"],
    standardsAlignment: [{ standard: "CCSS.Math.K.CC.1", description: "Count to 100 by ones and by tens" }],
    sortOrder: 1,
  },
  {
    id: "les-golden-beads-intro", subdomainId: "ma-numeration", domain: "mathematics",
    name: "Golden Beads — Introduction", description: "Introduction to the decimal system using golden bead material",
    ageRange: [4, 6], prerequisites: ["les-number-rods"], nextLessons: ["les-golden-beads-operations"],
    materials: ["mat-golden-beads"], directAim: "Understanding the decimal system (units, tens, hundreds, thousands)",
    indirectAim: "Foundation for all operations", controlOfError: "Quantity mismatches are visible",
    vocabulary: ["unit", "ten", "hundred", "thousand"], extensions: ["Building numbers with cards and beads"],
    standardsAlignment: [{ standard: "CCSS.Math.1.NBT.2", description: "Understand place value (tens and ones)" }],
    sortOrder: 3,
  },
  // Language
  {
    id: "les-sandpaper-letters", subdomainId: "la-writing-prep", domain: "language",
    name: "Sandpaper Letters", description: "Tracing textured letters while saying the sound",
    ageRange: [3, 5], prerequisites: [], nextLessons: ["les-moveable-alphabet"],
    materials: ["mat-sandpaper-letters"], directAim: "Association of letter symbol and sound",
    indirectAim: "Preparation for writing and reading", controlOfError: "Teacher-guided",
    vocabulary: ["sound", "letter", "trace"], extensions: ["Sandpaper letter matching game", "Letters in sand tray"],
    sortOrder: 1,
  },
  {
    id: "les-moveable-alphabet", subdomainId: "la-writing-prep", domain: "language",
    name: "Moveable Alphabet", description: "Building words using individual letter tiles",
    ageRange: [3.5, 6], prerequisites: ["les-sandpaper-letters"], nextLessons: ["les-phonetic-reading"],
    materials: ["mat-moveable-alphabet"], directAim: "Encoding words with letter symbols",
    indirectAim: "Preparation for creative writing", controlOfError: "Teacher reads back child's word",
    vocabulary: ["word", "sound it out", "vowel", "consonant"], extensions: ["Sentence building", "Story writing"],
    sortOrder: 2,
  },
  // Cultural
  {
    id: "les-continent-globe", subdomainId: "cu-geography", domain: "cultural",
    name: "Continent Globe", description: "Explore the sandpaper globe and identify continents by touch and color",
    ageRange: [3, 6], prerequisites: [], nextLessons: ["les-puzzle-maps"],
    materials: ["mat-continent-globe"], directAim: "Identify the seven continents",
    indirectAim: "Global awareness and cultural curiosity", controlOfError: "Color coding matches continent cards",
    vocabulary: ["continent", "ocean", "globe", "earth"], extensions: ["Continent song", "Animals of each continent"],
    sortOrder: 1,
  },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get all lessons in a domain, optionally filtered by age
 */
export function getLessonsForDomain(
  domain: CurriculumDomain,
  age?: number,
): CurriculumLesson[] {
  return CURRICULUM_LESSONS
    .filter((l) => l.domain === domain)
    .filter((l) => !age || (age >= l.ageRange[0] && age <= l.ageRange[1]))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get lessons a child is ready for (all prerequisites mastered)
 */
export function getReadyLessons(
  age: number,
  masteredLessonIds: string[],
  currentLessonIds: string[],
): CurriculumLesson[] {
  const masteredSet = new Set(masteredLessonIds);
  const currentSet = new Set(currentLessonIds);

  return CURRICULUM_LESSONS.filter((lesson) => {
    if (age < lesson.ageRange[0] || age > lesson.ageRange[1]) return false;
    if (masteredSet.has(lesson.id) || currentSet.has(lesson.id)) return false;
    return lesson.prerequisites.every((p) => masteredSet.has(p));
  });
}

/**
 * Build a curriculum overview for a child
 */
export function buildCurriculumOverview(
  childId: string,
  age: number,
  progressRecords: ChildLessonProgress[],
): ChildCurriculumOverview {
  const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));
  const masteredIds = progressRecords.filter((p) => p.status === "mastered").map((p) => p.lessonId);
  const currentIds = progressRecords.filter((p) => p.status === "practicing" || p.status === "progressing").map((p) => p.lessonId);

  const domains: CurriculumDomain[] = ["practical-life", "sensorial", "language", "mathematics", "cultural"];
  const domainProgress: ChildCurriculumOverview["domainProgress"] = {} as any;

  for (const domain of domains) {
    const domainLessons = CURRICULUM_LESSONS.filter(
      (l) => l.domain === domain && age >= l.ageRange[0] && age <= l.ageRange[1],
    );
    const total = domainLessons.length;
    let mastered = 0, practicing = 0, presented = 0, notStarted = 0;

    for (const lesson of domainLessons) {
      const progress = progressMap.get(lesson.id);
      if (!progress || progress.status === "not-started") notStarted++;
      else if (progress.status === "mastered") mastered++;
      else if (progress.status === "practicing" || progress.status === "progressing") practicing++;
      else if (progress.status === "presented") presented++;
    }

    domainProgress[domain] = {
      totalLessons: total,
      mastered,
      practicing,
      presented,
      notStarted,
      completionPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  }

  const readyLessons = getReadyLessons(age, masteredIds, currentIds).map((l) => l.id);

  return {
    childId,
    domainProgress,
    readyLessons,
    currentFocus: currentIds,
    suggestedNext: readyLessons.slice(0, 5),
    lastUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Get the learning path from a lesson to its goal (series of prerequisites)
 */
export function getLearningPath(targetLessonId: string): CurriculumLesson[] {
  const path: CurriculumLesson[] = [];
  const visited = new Set<string>();

  function collectPrereqs(lessonId: string) {
    if (visited.has(lessonId)) return;
    visited.add(lessonId);
    const lesson = CURRICULUM_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) return;
    for (const prereq of lesson.prerequisites) {
      collectPrereqs(prereq);
    }
    path.push(lesson);
  }

  collectPrereqs(targetLessonId);
  return path;
}

/**
 * Align Montessori lessons to external standards
 */
export function findLessonsForStandard(standardCode: string): CurriculumLesson[] {
  return CURRICULUM_LESSONS.filter((l) =>
    l.standardsAlignment.some((sa) => sa.standard === standardCode),
  );
}
