/**
 * Physical Manipulative Tracking Module
 *
 * Competitor: KidX (NFC-based physical material tracking)
 * Our advantage: Multi-method tracking (NFC, QR, image recognition, manual),
 *   bridges physical and digital Montessori experience
 *
 * Features:
 * - Track physical Montessori material usage via NFC, QR, camera, or manual entry
 * - Material library with Montessori curriculum alignment
 * - Usage frequency analytics and material rotation suggestions
 * - Classroom inventory management for schools
 * - Bridge physical work to digital portfolio
 */

import { z } from "zod";

// ============================================================================
// Tracking Method Types
// ============================================================================

export const TrackingMethodSchema = z.enum([
  "nfc",              // NFC tag on physical material
  "qr-code",         // QR code sticker on material
  "image-recognition", // Camera identifies the material
  "manual",          // Child or guide manually logs
  "ble-beacon",      // Bluetooth Low Energy proximity
]);
export type TrackingMethod = z.infer<typeof TrackingMethodSchema>;

// ============================================================================
// Physical Material Catalog
// ============================================================================

export const MontessoriDomainSchema = z.enum([
  "practical-life",
  "sensorial",
  "language",
  "mathematics",
  "cultural",
]);
export type MontessoriDomain = z.infer<typeof MontessoriDomainSchema>;

export const PhysicalMaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: MontessoriDomainSchema,
  shelfArea: z.string(),                   // e.g., "Math Shelf 2"
  ageRange: z.tuple([z.number(), z.number()]),
  prerequisites: z.array(z.string()).default([]),  // Material IDs
  nextMaterials: z.array(z.string()).default([]),   // What comes after
  skills: z.array(z.string()),
  description: z.string(),
  imageUrl: z.string().optional(),
  nfcTagId: z.string().optional(),
  qrCode: z.string().optional(),
  presentationSteps: z.array(z.string()),   // Montessori presentation steps
  controlOfError: z.string(),              // Built-in error control
  directAim: z.string(),                   // Primary learning objective
  indirectAim: z.string(),                 // Secondary learning objective
  vocabulary: z.array(z.string()),         // Key terms introduced
});
export type PhysicalMaterial = z.infer<typeof PhysicalMaterialSchema>;

// ============================================================================
// Usage Tracking
// ============================================================================

export const MaterialUsageEventSchema = z.object({
  id: z.string(),
  childId: z.string(),
  materialId: z.string(),
  trackingMethod: TrackingMethodSchema,
  startedAt: z.string(),
  endedAt: z.string().nullable().default(null),
  durationMinutes: z.number().nullable().default(null),
  repetitions: z.number().default(1),       // How many times they repeated the work
  concentration: z.enum(["deep", "moderate", "light", "distracted"]).default("moderate"),
  completedIndependently: z.boolean().default(true),
  guideAssistance: z.enum(["none", "minimal", "moderate", "full"]).default("none"),
  notes: z.string().default(""),
  photoUrl: z.string().optional(),          // Photo of completed work
  classroomId: z.string().optional(),
});
export type MaterialUsageEvent = z.infer<typeof MaterialUsageEventSchema>;

// ============================================================================
// Usage Analytics
// ============================================================================

export const MaterialUsageSummarySchema = z.object({
  childId: z.string(),
  materialId: z.string(),
  materialName: z.string(),
  domain: MontessoriDomainSchema,
  totalSessions: z.number(),
  totalMinutes: z.number(),
  averageDuration: z.number(),
  averageConcentration: z.number().min(0).max(100),
  independenceRate: z.number().min(0).max(100),  // % completed independently
  lastUsedAt: z.string(),
  firstUsedAt: z.string(),
  trend: z.enum(["increasing", "stable", "decreasing", "new"]),
  masteryEstimate: z.enum(["introduced", "developing", "practicing", "proficient", "mastered"]),
});
export type MaterialUsageSummary = z.infer<typeof MaterialUsageSummarySchema>;

export const ChildMaterialProfileSchema = z.object({
  childId: z.string(),
  domainBreakdown: z.record(MontessoriDomainSchema, z.object({
    totalMinutes: z.number(),
    materialCount: z.number(),
    averageConcentration: z.number(),
  })),
  favoredMaterials: z.array(z.string()),     // Top 5 most used
  neglectedDomains: z.array(MontessoriDomainSchema),
  readyForNext: z.array(z.string()),         // Materials they're ready to try
  recentActivity: z.array(MaterialUsageSummarySchema),
  updatedAt: z.string(),
});
export type ChildMaterialProfile = z.infer<typeof ChildMaterialProfileSchema>;

// ============================================================================
// Classroom Inventory (for schools)
// ============================================================================

export const ClassroomInventoryItemSchema = z.object({
  materialId: z.string(),
  classroomId: z.string(),
  quantity: z.number().default(1),
  condition: z.enum(["new", "good", "fair", "needs-repair", "retired"]).default("good"),
  shelfLocation: z.string(),
  nfcTagIds: z.array(z.string()).default([]),
  lastInventoriedAt: z.string(),
  purchaseDate: z.string().optional(),
  cost: z.number().optional(),
});
export type ClassroomInventoryItem = z.infer<typeof ClassroomInventoryItemSchema>;

// ============================================================================
// Default Material Library
// ============================================================================

export const MONTESSORI_MATERIALS: PhysicalMaterial[] = [
  {
    id: "mat-pink-tower",
    name: "Pink Tower",
    domain: "sensorial",
    shelfArea: "Sensorial Shelf 1",
    ageRange: [2.5, 6],
    prerequisites: [],
    nextMaterials: ["mat-brown-stair"],
    skills: ["visual-discrimination", "fine-motor", "concentration", "order"],
    description: "Ten pink wooden cubes graduated in size from 1cm to 10cm",
    presentationSteps: [
      "Carry cubes one at a time from shelf to mat",
      "Build tower from largest to smallest",
      "Admire the completed tower",
      "Disassemble and return to shelf",
    ],
    controlOfError: "Visual — tower becomes unstable if cubes are out of order",
    directAim: "Visual discrimination of dimension (size)",
    indirectAim: "Preparation for mathematics (cube root)",
    vocabulary: ["large", "small", "larger", "smaller", "largest", "smallest"],
  },
  {
    id: "mat-number-rods",
    name: "Number Rods",
    domain: "mathematics",
    shelfArea: "Math Shelf 1",
    ageRange: [3.5, 6],
    prerequisites: ["mat-red-rods"],
    nextMaterials: ["mat-sandpaper-numerals", "mat-spindle-box"],
    skills: ["counting", "quantity", "number-sequence", "one-to-one-correspondence"],
    description: "Ten rods in alternating red and blue segments, 10cm to 100cm",
    presentationSteps: [
      "Carry rods one at a time to mat",
      "Arrange from shortest to longest",
      "Count segments on each rod",
      "Associate quantity with number name",
    ],
    controlOfError: "Visual — staircase pattern is disrupted if rods are out of order",
    directAim: "Association of quantity and number name 1-10",
    indirectAim: "Preparation for addition and subtraction",
    vocabulary: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  },
  {
    id: "mat-moveable-alphabet",
    name: "Moveable Alphabet",
    domain: "language",
    shelfArea: "Language Shelf 2",
    ageRange: [3.5, 7],
    prerequisites: ["mat-sandpaper-letters"],
    nextMaterials: ["mat-grammar-symbols"],
    skills: ["word-building", "phonemic-awareness", "spelling", "writing-preparation"],
    description: "Box of individual lowercase letters, vowels in blue, consonants in red",
    presentationSteps: [
      "Bring moveable alphabet box to mat",
      "Choose a word to build",
      "Sound out each phoneme",
      "Find corresponding letter and place left to right",
      "Read the completed word",
    ],
    controlOfError: "Teacher guidance during initial presentations",
    directAim: "Building words with letter symbols",
    indirectAim: "Preparation for reading and written expression",
    vocabulary: ["vowel", "consonant", "word", "sound", "letter"],
  },
  {
    id: "mat-golden-beads",
    name: "Golden Bead Material",
    domain: "mathematics",
    shelfArea: "Math Shelf 2",
    ageRange: [4, 9],
    prerequisites: ["mat-number-rods", "mat-sandpaper-numerals"],
    nextMaterials: ["mat-stamp-game"],
    skills: ["place-value", "decimal-system", "operations", "large-numbers"],
    description: "Units (single beads), tens (10-bead bars), hundreds (100-bead squares), thousands (1000-bead cubes)",
    presentationSteps: [
      "Introduction to quantities: unit, ten, hundred, thousand",
      "Three-period lesson for each quantity",
      "Building numbers with bead material",
      "Operations: addition with carrying, subtraction with borrowing",
    ],
    controlOfError: "Material is self-correcting — quantity mismatches become visible",
    directAim: "Understanding the decimal system",
    indirectAim: "Foundation for all four operations",
    vocabulary: ["unit", "ten", "hundred", "thousand", "exchange"],
  },
  {
    id: "mat-practical-life-pouring",
    name: "Pouring Exercise",
    domain: "practical-life",
    shelfArea: "Practical Life Shelf 1",
    ageRange: [2.5, 5],
    prerequisites: [],
    nextMaterials: ["mat-practical-life-spooning"],
    skills: ["fine-motor", "concentration", "independence", "order", "coordination"],
    description: "Two small pitchers for pouring water or dry goods",
    presentationSteps: [
      "Carry tray with two pitchers to table",
      "Demonstrate slow, controlled pour from right pitcher to left",
      "Pour back from left to right",
      "If spills, demonstrate use of sponge",
      "Return tray to shelf",
    ],
    controlOfError: "Visual — water spills if pouring is too fast or aimed incorrectly",
    directAim: "Coordination of movement in pouring",
    indirectAim: "Preparation for serving food and drink independently",
    vocabulary: ["pour", "pitcher", "slow", "steady", "full", "empty"],
  },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Record a physical material usage event
 */
export function recordMaterialUsage(params: {
  childId: string;
  materialId: string;
  trackingMethod: TrackingMethod;
  durationMinutes?: number;
  concentration?: MaterialUsageEvent["concentration"];
  completedIndependently?: boolean;
  guideAssistance?: MaterialUsageEvent["guideAssistance"];
  notes?: string;
  classroomId?: string;
}): MaterialUsageEvent {
  const now = new Date().toISOString();
  return {
    id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId: params.childId,
    materialId: params.materialId,
    trackingMethod: params.trackingMethod,
    startedAt: now,
    endedAt: params.durationMinutes
      ? new Date(Date.now() + params.durationMinutes * 60000).toISOString()
      : null,
    durationMinutes: params.durationMinutes ?? null,
    repetitions: 1,
    concentration: params.concentration ?? "moderate",
    completedIndependently: params.completedIndependently ?? true,
    guideAssistance: params.guideAssistance ?? "none",
    notes: params.notes ?? "",
    classroomId: params.classroomId,
  };
}

/**
 * Compute usage summary for a child's interaction with a material
 */
export function computeMaterialSummary(
  childId: string,
  materialId: string,
  events: MaterialUsageEvent[],
): MaterialUsageSummary {
  const materialEvents = events.filter(
    (e) => e.childId === childId && e.materialId === materialId,
  );

  const totalMinutes = materialEvents.reduce((s, e) => s + (e.durationMinutes ?? 0), 0);
  const avgDuration = materialEvents.length > 0 ? totalMinutes / materialEvents.length : 0;
  const independentCount = materialEvents.filter((e) => e.completedIndependently).length;

  const concentrationMap = { deep: 100, moderate: 65, light: 35, distracted: 10 };
  const avgConcentration = materialEvents.length > 0
    ? materialEvents.reduce((s, e) => s + concentrationMap[e.concentration], 0) / materialEvents.length
    : 0;

  const material = MONTESSORI_MATERIALS.find((m) => m.id === materialId);
  const sorted = materialEvents.sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  // Estimate mastery from usage patterns
  let masteryEstimate: MaterialUsageSummary["masteryEstimate"];
  if (materialEvents.length <= 1) masteryEstimate = "introduced";
  else if (avgConcentration < 40) masteryEstimate = "developing";
  else if (independentCount / materialEvents.length < 0.5) masteryEstimate = "practicing";
  else if (materialEvents.length >= 5 && avgConcentration >= 70) masteryEstimate = "mastered";
  else masteryEstimate = "proficient";

  return {
    childId,
    materialId,
    materialName: material?.name ?? materialId,
    domain: material?.domain ?? "practical-life",
    totalSessions: materialEvents.length,
    totalMinutes: Math.round(totalMinutes),
    averageDuration: Math.round(avgDuration),
    averageConcentration: Math.round(avgConcentration),
    independenceRate: materialEvents.length > 0
      ? Math.round((independentCount / materialEvents.length) * 100) : 0,
    lastUsedAt: sorted.length > 0 ? sorted[sorted.length - 1].startedAt : new Date().toISOString(),
    firstUsedAt: sorted.length > 0 ? sorted[0].startedAt : new Date().toISOString(),
    trend: materialEvents.length <= 1 ? "new" : "stable",
    masteryEstimate,
  };
}

/**
 * Get recommended next materials based on what a child has used and mastered
 */
export function getRecommendedMaterials(
  age: number,
  usedMaterialIds: string[],
  masteredMaterialIds: string[],
): PhysicalMaterial[] {
  return MONTESSORI_MATERIALS.filter((m) => {
    // Must be age-appropriate
    if (age < m.ageRange[0] || age > m.ageRange[1]) return false;
    // Must not already be in use
    if (usedMaterialIds.includes(m.id)) return false;
    // Prerequisites must be mastered
    if (m.prerequisites.length > 0 && !m.prerequisites.every((p) => masteredMaterialIds.includes(p))) {
      return false;
    }
    return true;
  });
}

/**
 * Suggest material rotation for a classroom to keep shelves balanced
 */
export function suggestMaterialRotation(
  inventory: ClassroomInventoryItem[],
  recentUsage: MaterialUsageEvent[],
  classroomChildCount: number,
): { add: string[]; remove: string[]; reasons: string[] } {
  const usageByMaterial: Record<string, number> = {};
  for (const event of recentUsage) {
    usageByMaterial[event.materialId] = (usageByMaterial[event.materialId] ?? 0) + 1;
  }

  const add: string[] = [];
  const remove: string[] = [];
  const reasons: string[] = [];

  for (const item of inventory) {
    const uses = usageByMaterial[item.materialId] ?? 0;
    if (uses === 0) {
      remove.push(item.materialId);
      reasons.push(`${item.materialId} has had no use in the tracking period — consider rotating to storage`);
    }
  }

  // Find materials from catalog not in inventory but age-appropriate
  const inventoryIds = new Set(inventory.map((i) => i.materialId));
  const highDemandDomains = Object.entries(usageByMaterial)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => MONTESSORI_MATERIALS.find((m) => m.id === id)?.domain)
    .filter(Boolean);

  for (const material of MONTESSORI_MATERIALS) {
    if (!inventoryIds.has(material.id) && highDemandDomains.includes(material.domain)) {
      add.push(material.id);
      reasons.push(`${material.name} would complement high-demand ${material.domain} area`);
    }
  }

  return { add: add.slice(0, 5), remove: remove.slice(0, 5), reasons };
}
