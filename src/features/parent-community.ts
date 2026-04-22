/**
 * Parent Community Module
 *
 * Our advantage: Privacy-first community for Montessori families,
 *   local group finder, resource sharing, no advertising
 *
 * Features:
 * - Discussion forums organized by topic and age group
 * - Resource sharing (activities, materials, book recommendations)
 * - Local Montessori school and group finder
 * - Parent-to-parent Q&A
 * - Expert AMI/AMS guide office hours
 * - Event calendar (workshops, parent education, meetups)
 * - No ads, no data selling, no engagement manipulation
 */

import { z } from "zod";

// ============================================================================
// Community Profile
// ============================================================================

export const ParentCommunityProfileSchema = z.object({
  id: z.string(),
  parentId: z.string(),
  displayName: z.string(),
  bio: z.string().default(""),
  childAgeRanges: z.array(z.string()),      // e.g., ["3-6", "6-12"]
  montessoriExperience: z.enum([
    "curious",          // Just learning about Montessori
    "home-practicing",  // Doing Montessori at home
    "school-parent",    // Child in Montessori school
    "trained-guide",    // AMI/AMS certified
    "educator",         // Other education professional
  ]),
  interests: z.array(z.string()).default([]),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  isVerifiedGuide: z.boolean().default(false),
  joinedAt: z.string(),
  lastActiveAt: z.string(),
});
export type ParentCommunityProfile = z.infer<typeof ParentCommunityProfileSchema>;

// ============================================================================
// Discussion Forums
// ============================================================================

export const ForumCategorySchema = z.enum([
  "general",
  "ages-0-3",
  "ages-3-6",
  "ages-6-12",
  "ages-12-18",
  "practical-life-at-home",
  "materials-and-activities",
  "behavior-and-development",
  "homeschooling",
  "school-search",
  "book-recommendations",
  "montessori-philosophy",
  "special-needs",
  "technology-and-screens",
  "multilingual-families",
]);
export type ForumCategory = z.infer<typeof ForumCategorySchema>;

export const ForumPostSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  category: ForumCategorySchema,
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()).default([]),
  isQuestion: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  replyCount: z.number().default(0),
  helpfulCount: z.number().default(0),       // "This helped" reactions
  isAnswered: z.boolean().default(false),     // For questions
  acceptedAnswerId: z.string().optional(),
  attachmentUrls: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ForumPost = z.infer<typeof ForumPostSchema>;

export const ForumReplySchema = z.object({
  id: z.string(),
  postId: z.string(),
  authorId: z.string(),
  body: z.string(),
  helpfulCount: z.number().default(0),
  isAcceptedAnswer: z.boolean().default(false),
  isGuideResponse: z.boolean().default(false), // From verified Montessori guide
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ForumReply = z.infer<typeof ForumReplySchema>;

// ============================================================================
// Resource Sharing
// ============================================================================

export const SharedResourceSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum([
    "activity-idea",
    "material-diy",
    "book-recommendation",
    "printable",
    "video",
    "blog-post",
    "research-paper",
    "product-review",
    "curriculum-plan",
    "environment-setup",
  ]),
  ageRange: z.tuple([z.number(), z.number()]).optional(),
  domain: z.string().optional(),
  url: z.string().optional(),
  fileUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  saveCount: z.number().default(0),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().default(0),
  createdAt: z.string(),
});
export type SharedResource = z.infer<typeof SharedResourceSchema>;

// ============================================================================
// Local Group Finder
// ============================================================================

export const LocalGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "school",           // Montessori school
    "co-op",            // Parent cooperative
    "playgroup",        // Montessori-inspired playgroup
    "support-group",    // Parent support/discussion group
    "workshop",         // Regular workshop series
    "nature-group",     // Outdoor/nature education group
  ]),
  description: z.string(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  ageRange: z.tuple([z.number(), z.number()]),
  accreditation: z.enum(["ami", "ams", "imsp", "other", "none"]).optional(),
  website: z.string().optional(),
  contactEmail: z.string().optional(),
  meetingSchedule: z.string().optional(),
  memberCount: z.number().optional(),
  isVerified: z.boolean().default(false),
  createdAt: z.string(),
});
export type LocalGroup = z.infer<typeof LocalGroupSchema>;

// ============================================================================
// Events
// ============================================================================

export const CommunityEventSchema = z.object({
  id: z.string(),
  organizerId: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum([
    "workshop",
    "parent-education",
    "observation-day",
    "meetup",
    "book-club",
    "expert-q-and-a",
    "conference",
    "online-webinar",
  ]),
  isOnline: z.boolean(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  maxAttendees: z.number().optional(),
  currentAttendees: z.number().default(0),
  cost: z.number().default(0),               // 0 = free
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
});
export type CommunityEvent = z.infer<typeof CommunityEventSchema>;

// ============================================================================
// Moderation
// ============================================================================

export const ModerationActionSchema = z.object({
  id: z.string(),
  contentType: z.enum(["post", "reply", "resource", "profile"]),
  contentId: z.string(),
  action: z.enum(["flag", "remove", "warn", "ban"]),
  reason: z.string(),
  moderatorId: z.string(),
  timestamp: z.string(),
});
export type ModerationAction = z.infer<typeof ModerationActionSchema>;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Create a forum post
 */
export function createPost(params: {
  authorId: string;
  category: ForumCategory;
  title: string;
  body: string;
  isQuestion?: boolean;
  tags?: string[];
}): ForumPost {
  const now = new Date().toISOString();
  return {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    authorId: params.authorId,
    category: params.category,
    title: params.title,
    body: params.body,
    tags: params.tags ?? [],
    isQuestion: params.isQuestion ?? false,
    isPinned: false,
    replyCount: 0,
    helpfulCount: 0,
    isAnswered: false,
    attachmentUrls: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a reply to a forum post
 */
export function createReply(params: {
  postId: string;
  authorId: string;
  body: string;
  isGuide?: boolean;
}): ForumReply {
  const now = new Date().toISOString();
  return {
    id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    postId: params.postId,
    authorId: params.authorId,
    body: params.body,
    helpfulCount: 0,
    isAcceptedAnswer: false,
    isGuideResponse: params.isGuide ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Share a resource
 */
export function shareResource(params: {
  authorId: string;
  title: string;
  description: string;
  type: SharedResource["type"];
  ageRange?: [number, number];
  domain?: string;
  url?: string;
  tags?: string[];
}): SharedResource {
  return {
    id: `resource-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    authorId: params.authorId,
    title: params.title,
    description: params.description,
    type: params.type,
    ageRange: params.ageRange,
    domain: params.domain,
    url: params.url,
    tags: params.tags ?? [],
    saveCount: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Find local groups near a location
 */
export function findLocalGroups(
  groups: LocalGroup[],
  latitude: number,
  longitude: number,
  radiusKm: number,
  filters?: {
    type?: LocalGroup["type"];
    ageRange?: [number, number];
    accreditation?: string;
  },
): Array<LocalGroup & { distanceKm: number }> {
  return groups
    .map((group) => {
      const distanceKm = haversineDistance(
        latitude, longitude,
        group.location.latitude, group.location.longitude,
      );
      return { ...group, distanceKm };
    })
    .filter((g) => {
      if (g.distanceKm > radiusKm) return false;
      if (filters?.type && g.type !== filters.type) return false;
      if (filters?.ageRange) {
        if (g.ageRange[1] < filters.ageRange[0] || g.ageRange[0] > filters.ageRange[1]) return false;
      }
      if (filters?.accreditation && g.accreditation !== filters.accreditation) return false;
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Get trending discussion topics
 */
export function getTrendingTopics(
  posts: ForumPost[],
  dayWindow: number = 7,
): Array<{ category: ForumCategory; postCount: number; replyCount: number }> {
  const cutoff = new Date(Date.now() - dayWindow * 86400000).toISOString();
  const recent = posts.filter((p) => p.createdAt >= cutoff);

  const categoryStats: Record<string, { postCount: number; replyCount: number }> = {};
  for (const post of recent) {
    if (!categoryStats[post.category]) {
      categoryStats[post.category] = { postCount: 0, replyCount: 0 };
    }
    categoryStats[post.category].postCount++;
    categoryStats[post.category].replyCount += post.replyCount;
  }

  return Object.entries(categoryStats)
    .map(([category, stats]) => ({ category: category as ForumCategory, ...stats }))
    .sort((a, b) => (b.postCount + b.replyCount) - (a.postCount + a.replyCount));
}

/**
 * Create a community event
 */
export function createEvent(params: {
  organizerId: string;
  title: string;
  description: string;
  type: CommunityEvent["type"];
  isOnline: boolean;
  startAt: string;
  endAt: string;
  location?: string;
  meetingUrl?: string;
  maxAttendees?: number;
  cost?: number;
}): CommunityEvent {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizerId: params.organizerId,
    title: params.title,
    description: params.description,
    type: params.type,
    isOnline: params.isOnline,
    location: params.location,
    meetingUrl: params.meetingUrl,
    startAt: params.startAt,
    endAt: params.endAt,
    maxAttendees: params.maxAttendees,
    currentAttendees: 0,
    cost: params.cost ?? 0,
    tags: [],
    createdAt: new Date().toISOString(),
  };
}

// Haversine formula for distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
