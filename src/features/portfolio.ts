/**
 * Portfolio & Showcase Module
 *
 * Our advantage: Digital portfolio of child's best work with family sharing,
 *   school transition support, and longitudinal growth documentation
 *
 * Features:
 * - Curated portfolio of child's best work across all domains
 * - Shareable galleries for family members
 * - School transition portfolios (evidence-based)
 * - Growth timeline with before/after comparisons
 * - Export to PDF for parent-teacher conferences
 * - Privacy controls per item
 */

import { z } from "zod";

// ============================================================================
// Portfolio Items
// ============================================================================

export const PortfolioItemTypeSchema = z.enum([
  "artifact",         // Session artifact (drawing, story, code, etc.)
  "photo",            // Photo of physical work
  "video",            // Video recording
  "audio",            // Voice recording
  "writing-sample",   // Written work
  "assessment",       // Mastery assessment snapshot
  "milestone",        // Developmental milestone achieved
  "reflection",       // Child's self-reflection
  "project",          // Completed group or solo project
]);
export type PortfolioItemType = z.infer<typeof PortfolioItemTypeSchema>;

export const PortfolioItemSchema = z.object({
  id: z.string(),
  childId: z.string(),
  type: PortfolioItemTypeSchema,
  title: z.string(),
  description: z.string(),
  childNarrative: z.string(),               // Child's own words about this work
  domain: z.string(),
  skills: z.array(z.string()),
  contentUrl: z.string().optional(),         // File URL
  thumbnailUrl: z.string().optional(),
  textContent: z.string().optional(),        // Inline text content
  metadata: z.record(z.string(), z.unknown()).default({}),
  isFeatured: z.boolean().default(false),    // Highlighted in portfolio
  isPublic: z.boolean().default(false),      // Visible in shared gallery
  tags: z.array(z.string()).default([]),
  sessionId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

// ============================================================================
// Portfolio Collections
// ============================================================================

export const PortfolioCollectionSchema = z.object({
  id: z.string(),
  childId: z.string(),
  title: z.string(),
  description: z.string(),
  purpose: z.enum([
    "showcase",         // Best work gallery
    "growth-timeline",  // Chronological progress
    "domain-focus",     // Single domain deep-dive
    "school-transition", // For school applications
    "family-sharing",   // For grandparents, relatives
    "parent-conference", // For parent-teacher meetings
    "custom",
  ]),
  itemIds: z.array(z.string()),
  coverImageUrl: z.string().optional(),
  isShared: z.boolean().default(false),
  shareToken: z.string().optional(),         // Access token for sharing
  shareExpiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PortfolioCollection = z.infer<typeof PortfolioCollectionSchema>;

// ============================================================================
// Sharing & Access
// ============================================================================

export const SharePermissionSchema = z.enum([
  "view",             // Can view only
  "comment",          // Can view and leave comments
  "download",         // Can view and download
]);
export type SharePermission = z.infer<typeof SharePermissionSchema>;

export const PortfolioShareSchema = z.object({
  id: z.string(),
  collectionId: z.string(),
  childId: z.string(),
  sharedByParentId: z.string(),
  recipientEmail: z.string().optional(),
  recipientName: z.string(),
  relationship: z.enum(["grandparent", "family", "teacher", "school", "therapist", "other"]),
  permission: SharePermissionSchema,
  token: z.string(),
  accessedAt: z.string().nullable().default(null),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
});
export type PortfolioShare = z.infer<typeof PortfolioShareSchema>;

// ============================================================================
// Growth Documentation
// ============================================================================

export const GrowthSnapshotSchema = z.object({
  id: z.string(),
  childId: z.string(),
  date: z.string(),
  age: z.number(),
  domainScores: z.record(z.string(), z.number()),  // Domain -> mastery %
  totalSkillsMastered: z.number(),
  activeInterests: z.array(z.string()),
  recentAchievements: z.array(z.string()),
  socialSkillLevel: z.string(),
  streakDays: z.number(),
  sessionsCompleted: z.number(),
  portfolioItemCount: z.number(),
  guideObservation: z.string().optional(),
});
export type GrowthSnapshot = z.infer<typeof GrowthSnapshotSchema>;

// ============================================================================
// Export Formats
// ============================================================================

export const ExportFormatSchema = z.enum([
  "pdf",
  "html",
  "json",
  "zip",              // All files + metadata
]);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const PortfolioExportSchema = z.object({
  id: z.string(),
  collectionId: z.string(),
  format: ExportFormatSchema,
  includeNarratives: z.boolean().default(true),
  includeAssessments: z.boolean().default(true),
  includeGrowthTimeline: z.boolean().default(true),
  customCoverPage: z.string().optional(),
  generatedAt: z.string(),
  downloadUrl: z.string().optional(),
  expiresAt: z.string().optional(),
});
export type PortfolioExport = z.infer<typeof PortfolioExportSchema>;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Add an item to a child's portfolio
 */
export function addPortfolioItem(params: {
  childId: string;
  type: PortfolioItemType;
  title: string;
  description: string;
  childNarrative: string;
  domain: string;
  skills: string[];
  contentUrl?: string;
  textContent?: string;
  sessionId?: string;
  tags?: string[];
}): PortfolioItem {
  const now = new Date().toISOString();
  return {
    id: `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId: params.childId,
    type: params.type,
    title: params.title,
    description: params.description,
    childNarrative: params.childNarrative,
    domain: params.domain,
    skills: params.skills,
    contentUrl: params.contentUrl,
    textContent: params.textContent,
    metadata: {},
    isFeatured: false,
    isPublic: false,
    tags: params.tags ?? [],
    sessionId: params.sessionId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a portfolio collection
 */
export function createCollection(params: {
  childId: string;
  title: string;
  description: string;
  purpose: PortfolioCollection["purpose"];
  itemIds?: string[];
}): PortfolioCollection {
  const now = new Date().toISOString();
  return {
    id: `collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId: params.childId,
    title: params.title,
    description: params.description,
    purpose: params.purpose,
    itemIds: params.itemIds ?? [],
    isShared: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generate a share link for a collection
 */
export function createShareLink(params: {
  collectionId: string;
  childId: string;
  parentId: string;
  recipientName: string;
  relationship: PortfolioShare["relationship"];
  permission: SharePermission;
  expirationDays?: number;
}): PortfolioShare {
  const token = `share-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const now = new Date();

  return {
    id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    collectionId: params.collectionId,
    childId: params.childId,
    sharedByParentId: params.parentId,
    recipientName: params.recipientName,
    relationship: params.relationship,
    permission: params.permission,
    token,
    accessedAt: null,
    expiresAt: params.expirationDays
      ? new Date(now.getTime() + params.expirationDays * 86400000).toISOString()
      : undefined,
    createdAt: now.toISOString(),
  };
}

/**
 * Take a growth snapshot for longitudinal tracking
 */
export function takeGrowthSnapshot(params: {
  childId: string;
  age: number;
  domainScores: Record<string, number>;
  totalSkillsMastered: number;
  activeInterests: string[];
  recentAchievements: string[];
  streakDays: number;
  sessionsCompleted: number;
  portfolioItemCount: number;
}): GrowthSnapshot {
  return {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId: params.childId,
    date: new Date().toISOString().split("T")[0],
    age: params.age,
    domainScores: params.domainScores,
    totalSkillsMastered: params.totalSkillsMastered,
    activeInterests: params.activeInterests,
    recentAchievements: params.recentAchievements,
    socialSkillLevel: "developing",
    streakDays: params.streakDays,
    sessionsCompleted: params.sessionsCompleted,
    portfolioItemCount: params.portfolioItemCount,
  };
}

/**
 * Auto-curate a "best of" collection from portfolio items
 */
export function autoCurateBestOf(
  childId: string,
  items: PortfolioItem[],
  maxItems: number = 20,
): string[] {
  const childItems = items.filter((i) => i.childId === childId);

  // Score each item
  const scored = childItems.map((item) => {
    let score = 0;
    if (item.isFeatured) score += 50;
    if (item.childNarrative.length > 50) score += 20; // Child engaged with reflection
    if (item.skills.length >= 3) score += 15;         // Multi-skill demonstration
    if (item.type === "project") score += 10;          // Projects are rich evidence
    if (item.type === "milestone") score += 10;
    if (item.tags.length > 0) score += 5;
    return { id: item.id, score };
  });

  // Ensure domain diversity
  const byDomain: Record<string, typeof scored> = {};
  for (const item of scored) {
    const portfolioItem = childItems.find((i) => i.id === item.id)!;
    const domain = portfolioItem.domain;
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(item);
  }

  // Pick top items with domain balance
  const selected: string[] = [];
  const domains = Object.keys(byDomain);
  let round = 0;
  while (selected.length < maxItems && round < 10) {
    for (const domain of domains) {
      const domainItems = byDomain[domain]
        .filter((i) => !selected.includes(i.id))
        .sort((a, b) => b.score - a.score);
      if (domainItems.length > 0 && selected.length < maxItems) {
        selected.push(domainItems[0].id);
      }
    }
    round++;
  }

  return selected;
}

/**
 * Prepare a school transition portfolio
 */
export function buildSchoolTransitionPortfolio(params: {
  childId: string;
  items: PortfolioItem[];
  snapshots: GrowthSnapshot[];
  targetSchoolType: "montessori" | "traditional" | "progressive" | "homeschool";
}): PortfolioCollection {
  const { childId, items, snapshots, targetSchoolType } = params;

  // Select items that demonstrate key competencies for the target school
  const relevantItems = items.filter((i) => i.childId === childId);

  const priorityDomains: Record<string, string[]> = {
    "montessori": ["practical-life", "sensorial", "mathematics", "language", "cultural"],
    "traditional": ["mathematics", "language", "science", "writing"],
    "progressive": ["creativity", "collaboration", "projects", "reflection"],
    "homeschool": ["independence", "curiosity", "mastery", "breadth"],
  };

  const domains = priorityDomains[targetSchoolType] ?? priorityDomains["traditional"];
  const selectedIds = relevantItems
    .filter((i) => domains.some((d) => i.domain.includes(d) || i.tags.includes(d)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15)
    .map((i) => i.id);

  return createCollection({
    childId,
    title: `School Transition Portfolio`,
    description: `Curated portfolio for ${targetSchoolType} school transition, showcasing growth across ${domains.join(", ")}`,
    purpose: "school-transition",
    itemIds: selectedIds,
  });
}
