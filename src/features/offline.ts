/**
 * Offline-First / Raspberry Pi Module
 *
 * Inspired by: mama-ai-clinic ($170 offline health clinic for Raspberry Pi)
 * Our advantage: Full Montessori education system runs offline on commodity hardware,
 *   serving underserved communities with no internet requirement
 *
 * Features:
 * - Offline-first architecture with local-first data storage
 * - Raspberry Pi deployment (Pi 4/5, 4GB+ RAM)
 * - Local LLM support (Ollama, llama.cpp)
 * - Sync when connectivity is available
 * - Content pre-loading and caching
 * - Low-bandwidth mode
 * - Multi-device classroom sync over local network
 * - Works without cloud services
 */

import { z } from "zod";

// ============================================================================
// Device & Deployment Configuration
// ============================================================================

export const DeploymentTargetSchema = z.enum([
  "raspberry-pi-4",
  "raspberry-pi-5",
  "android-tablet",
  "chromebook",
  "linux-desktop",
  "mac",
  "windows",
  "docker",
  "cloud",
]);
export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;

export const ConnectivityModeSchema = z.enum([
  "online",           // Full cloud connectivity
  "low-bandwidth",    // Connected but limited — minimize transfers
  "intermittent",     // Occasional connectivity — batch sync
  "offline",          // No internet — fully local operation
  "lan-only",         // Local network only — classroom sync
]);
export type ConnectivityMode = z.infer<typeof ConnectivityModeSchema>;

export const OfflineDeviceConfigSchema = z.object({
  deviceId: z.string(),
  deviceName: z.string(),
  target: DeploymentTargetSchema,
  connectivityMode: ConnectivityModeSchema,
  storageCapacityMB: z.number(),
  availableStorageMB: z.number(),
  ramMB: z.number(),
  localLLMEnabled: z.boolean().default(false),
  localLLMModel: z.string().optional(),       // e.g., "phi-3-mini", "tinyllama"
  contentPacksInstalled: z.array(z.string()).default([]),
  lastSyncAt: z.string().nullable().default(null),
  pendingSyncItems: z.number().default(0),
  classroomNetworkId: z.string().optional(),
  registeredAt: z.string(),
});
export type OfflineDeviceConfig = z.infer<typeof OfflineDeviceConfigSchema>;

// ============================================================================
// Content Packs (pre-downloadable bundles)
// ============================================================================

export const ContentPackSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  sizeMB: z.number(),
  domains: z.array(z.string()),
  ageRange: z.tuple([z.number(), z.number()]),
  languages: z.array(z.string()),
  lessonCount: z.number(),
  materialCount: z.number(),
  includesLLMModel: z.boolean().default(false),
  llmModelName: z.string().optional(),
  llmModelSizeMB: z.number().optional(),
  checksum: z.string(),
  downloadUrl: z.string(),
  createdAt: z.string(),
});
export type ContentPack = z.infer<typeof ContentPackSchema>;

// ============================================================================
// Sync System
// ============================================================================

export const SyncStatusSchema = z.enum([
  "idle",
  "syncing",
  "paused",
  "error",
  "completed",
]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const SyncItemSchema = z.object({
  id: z.string(),
  type: z.enum([
    "child-profile",
    "session-data",
    "mastery-record",
    "portfolio-item",
    "work-cycle",
    "assessment",
    "badge",
    "settings",
  ]),
  entityId: z.string(),
  action: z.enum(["create", "update", "delete"]),
  data: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  syncedAt: z.string().nullable().default(null),
  conflictResolution: z.enum(["local-wins", "remote-wins", "merge", "manual"]).optional(),
});
export type SyncItem = z.infer<typeof SyncItemSchema>;

export const SyncSessionSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  status: SyncStatusSchema,
  direction: z.enum(["upload", "download", "bidirectional"]),
  itemsTotal: z.number(),
  itemsSynced: z.number(),
  itemsFailed: z.number(),
  conflicts: z.number(),
  bandwidthUsedKB: z.number(),
  startedAt: z.string(),
  completedAt: z.string().nullable().default(null),
  errorMessage: z.string().optional(),
});
export type SyncSession = z.infer<typeof SyncSessionSchema>;

// ============================================================================
// Local Storage Schema
// ============================================================================

export const LocalStorageStatsSchema = z.object({
  deviceId: z.string(),
  totalStorageMB: z.number(),
  usedStorageMB: z.number(),
  breakdown: z.object({
    contentPacksMB: z.number(),
    llmModelMB: z.number(),
    childDataMB: z.number(),
    portfolioMediaMB: z.number(),
    cacheMB: z.number(),
    systemMB: z.number(),
  }),
  childProfileCount: z.number(),
  sessionDataCount: z.number(),
  portfolioItemCount: z.number(),
  oldestUnsynced: z.string().nullable(),
});
export type LocalStorageStats = z.infer<typeof LocalStorageStatsSchema>;

// ============================================================================
// Default Content Packs
// ============================================================================

export const DEFAULT_CONTENT_PACKS: ContentPack[] = [
  {
    id: "pack-core-3-6",
    name: "Core Montessori (Ages 3-6)",
    description: "Essential Montessori curriculum for the primary classroom: Practical Life, Sensorial, early Language and Math",
    version: "1.0.0",
    sizeMB: 250,
    domains: ["practical-life", "sensorial", "language", "mathematics"],
    ageRange: [3, 6],
    languages: ["en"],
    lessonCount: 120,
    materialCount: 45,
    includesLLMModel: false,
    checksum: "sha256:placeholder",
    downloadUrl: "https://mama.oliwoods.ai/packs/core-3-6-v1.0.0.tar.gz",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "pack-core-6-12",
    name: "Core Montessori (Ages 6-12)",
    description: "Elementary Montessori curriculum: Great Lessons, advanced Math, Language arts, Cultural studies",
    version: "1.0.0",
    sizeMB: 400,
    domains: ["language", "mathematics", "cultural", "science", "history"],
    ageRange: [6, 12],
    languages: ["en"],
    lessonCount: 200,
    materialCount: 60,
    includesLLMModel: false,
    checksum: "sha256:placeholder",
    downloadUrl: "https://mama.oliwoods.ai/packs/core-6-12-v1.0.0.tar.gz",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "pack-llm-tiny",
    name: "Local AI Model (Tiny)",
    description: "TinyLlama model for offline AI tutoring — fits on Raspberry Pi 4 (4GB RAM)",
    version: "1.0.0",
    sizeMB: 1200,
    domains: [],
    ageRange: [3, 18],
    languages: ["en"],
    lessonCount: 0,
    materialCount: 0,
    includesLLMModel: true,
    llmModelName: "tinyllama-1.1b-q4",
    llmModelSizeMB: 1100,
    checksum: "sha256:placeholder",
    downloadUrl: "https://mama.oliwoods.ai/packs/llm-tiny-v1.0.0.tar.gz",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "pack-llm-standard",
    name: "Local AI Model (Standard)",
    description: "Phi-3 Mini model for higher-quality offline AI tutoring — requires 8GB RAM",
    version: "1.0.0",
    sizeMB: 2500,
    domains: [],
    ageRange: [3, 18],
    languages: ["en", "es", "fr", "de", "zh"],
    lessonCount: 0,
    materialCount: 0,
    includesLLMModel: true,
    llmModelName: "phi-3-mini-q4",
    llmModelSizeMB: 2300,
    checksum: "sha256:placeholder",
    downloadUrl: "https://mama.oliwoods.ai/packs/llm-standard-v1.0.0.tar.gz",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "pack-multilingual-es",
    name: "Spanish Language Pack",
    description: "Full Spanish translation + cultural adaptations for Latin America",
    version: "1.0.0",
    sizeMB: 80,
    domains: ["practical-life", "sensorial", "language", "mathematics", "cultural"],
    ageRange: [3, 18],
    languages: ["es"],
    lessonCount: 320,
    materialCount: 0,
    includesLLMModel: false,
    checksum: "sha256:placeholder",
    downloadUrl: "https://mama.oliwoods.ai/packs/lang-es-v1.0.0.tar.gz",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Initialize an offline device configuration
 */
export function initializeDevice(params: {
  deviceName: string;
  target: DeploymentTarget;
  storageMB: number;
  ramMB: number;
}): OfflineDeviceConfig {
  const canRunLLM = params.ramMB >= 4000;

  return {
    deviceId: `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    deviceName: params.deviceName,
    target: params.target,
    connectivityMode: "offline",
    storageCapacityMB: params.storageMB,
    availableStorageMB: params.storageMB,
    ramMB: params.ramMB,
    localLLMEnabled: canRunLLM,
    localLLMModel: canRunLLM
      ? (params.ramMB >= 8000 ? "phi-3-mini-q4" : "tinyllama-1.1b-q4")
      : undefined,
    contentPacksInstalled: [],
    lastSyncAt: null,
    pendingSyncItems: 0,
    registeredAt: new Date().toISOString(),
  };
}

/**
 * Get recommended content packs for a device
 */
export function getRecommendedPacks(
  device: OfflineDeviceConfig,
  childAges: number[],
  languages: string[],
): ContentPack[] {
  const available = device.availableStorageMB;
  const installedSet = new Set(device.contentPacksInstalled);

  return DEFAULT_CONTENT_PACKS
    .filter((pack) => {
      if (installedSet.has(pack.id)) return false;
      if (pack.sizeMB > available) return false;
      if (pack.includesLLMModel && !device.localLLMEnabled) return false;
      if (pack.includesLLMModel && device.localLLMModel) return false; // Already has one

      // Check age relevance
      if (pack.lessonCount > 0) {
        const ageRelevant = childAges.some(
          (age) => age >= pack.ageRange[0] && age <= pack.ageRange[1],
        );
        if (!ageRelevant && pack.lessonCount > 0) return false;
      }

      // Check language relevance
      if (pack.languages.length > 0 && !pack.languages.some((l) => l === "en" || languages.includes(l))) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Prioritize: core content > LLM > language packs
      if (a.lessonCount > 0 && b.lessonCount === 0) return -1;
      if (a.lessonCount === 0 && b.lessonCount > 0) return 1;
      return a.sizeMB - b.sizeMB;
    });
}

/**
 * Create a sync item for eventual upload
 */
export function createSyncItem(params: {
  type: SyncItem["type"];
  entityId: string;
  action: SyncItem["action"];
  data: Record<string, unknown>;
}): SyncItem {
  return {
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: params.type,
    entityId: params.entityId,
    action: params.action,
    data: params.data,
    createdAt: new Date().toISOString(),
    syncedAt: null,
  };
}

/**
 * Estimate storage requirements for a classroom deployment
 */
export function estimateStorageRequirements(params: {
  childCount: number;
  ageRange: [number, number];
  languages: string[];
  wantLocalLLM: boolean;
  llmTier: "tiny" | "standard";
}): {
  totalMB: number;
  breakdown: { content: number; llm: number; childData: number; system: number };
  recommendedTarget: DeploymentTarget;
  minimumRAM: number;
} {
  const contentMB = params.ageRange[1] <= 6 ? 250 : params.ageRange[0] >= 6 ? 400 : 650;
  const langPackMB = (params.languages.length - 1) * 80; // -1 for English included
  const llmMB = params.wantLocalLLM ? (params.llmTier === "standard" ? 2500 : 1200) : 0;
  const childDataMB = params.childCount * 50;            // ~50MB per child over time
  const systemMB = 500;                                   // OS + runtime

  const totalMB = contentMB + langPackMB + llmMB + childDataMB + systemMB;
  const minimumRAM = params.wantLocalLLM
    ? (params.llmTier === "standard" ? 8000 : 4000) : 2000;

  const recommendedTarget: DeploymentTarget =
    totalMB < 8000 && minimumRAM <= 4000 ? "raspberry-pi-4" :
    totalMB < 16000 && minimumRAM <= 8000 ? "raspberry-pi-5" :
    "linux-desktop";

  return {
    totalMB,
    breakdown: {
      content: contentMB + langPackMB,
      llm: llmMB,
      childData: childDataMB,
      system: systemMB,
    },
    recommendedTarget,
    minimumRAM,
  };
}

/**
 * Check if the device can operate offline with current configuration
 */
export function validateOfflineReadiness(
  device: OfflineDeviceConfig,
): { ready: boolean; issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (device.contentPacksInstalled.length === 0) {
    issues.push("No content packs installed — download at least one curriculum pack");
  }

  if (device.localLLMEnabled && !device.localLLMModel) {
    issues.push("Local LLM enabled but no model installed");
    recommendations.push("Download the appropriate LLM pack for your device");
  }

  if (device.availableStorageMB < 500) {
    issues.push("Low storage — less than 500MB available");
    recommendations.push("Free up storage or add external storage");
  }

  if (device.ramMB < 2000) {
    issues.push("Insufficient RAM — minimum 2GB required");
  }

  if (device.pendingSyncItems > 100) {
    recommendations.push(`${device.pendingSyncItems} items pending sync — connect to internet when possible`);
  }

  return {
    ready: issues.length === 0,
    issues,
    recommendations,
  };
}
