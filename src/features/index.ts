/**
 * MAMA Montessori — Competitive Features Index
 *
 * 15 feature modules that put MAMA Montessori ahead of every competitor
 * in the AI education space. All open-source. All free.
 */

// 1. AR / Mixed Reality Learning (vs. Montessorium, Edoki)
export {
  type ARSceneType,
  type ARInteractionType,
  type VirtualManipulative,
  type ARLessonPlan,
  type ARSessionEvent,
  type MontessoriMaterialCategory,
  VIRTUAL_MANIPULATIVES,
  getManipulativesForAge,
  buildARLessonPlan,
  recordAREvent,
  assessSpatialReasoning,
} from "./ar-learning";

// 2. AI Handwriting Recognition (vs. Edoki)
export {
  type StrokePoint,
  type Stroke,
  type ScriptType,
  type TracingAnalysis,
  type HandwritingProfile,
  type HandwritingStage,
  type PreWritingAssessment,
  analyzeTracing,
  assessHandwritingStage,
  runPreWritingAssessment,
  getNextCharactersToPractice,
} from "./handwriting";

// 3. Physical Manipulative Tracking (vs. KidX NFC)
export {
  type TrackingMethod,
  type PhysicalMaterial,
  type MaterialUsageEvent,
  type MaterialUsageSummary,
  type ChildMaterialProfile,
  type ClassroomInventoryItem,
  MONTESSORI_MATERIALS,
  recordMaterialUsage,
  computeMaterialSummary,
  getRecommendedMaterials,
  suggestMaterialRotation,
} from "./manipulatives";

// 4. Work Curve Analytics (vs. Transparent Classroom)
export {
  type ConcentrationLevel,
  type ConcentrationSample,
  type WorkCycle,
  type WorkCyclePhase,
  type WorkCurveProfile,
  type DailyWorkCurveSummary,
  startWorkCycle,
  addConcentrationSample,
  completeWorkCycle,
  analyzeWorkCurves,
  generateDailySummary,
} from "./work-curves";

// 5. Multi-Language Support (vs. Edoki 20+ languages)
export {
  type SupportedLanguage,
  type LanguageConfig,
  type TranslationEntry,
  type CulturalAdaptation,
  type MontessoriTerm,
  LANGUAGE_CONFIGS,
  MONTESSORI_GLOSSARY,
  getLanguageConfig,
  getRTLLanguages,
  translate,
  getMontessoriTerm,
  getTranslationStatus,
  resolveLanguage,
  getDefaultCulturalAdaptation,
} from "./i18n";

// 6. Curriculum Scope & Sequence (vs. Montessori Compass)
export {
  type CurriculumDomain,
  type CurriculumSubdomain,
  type CurriculumLesson,
  type ChildLessonProgress,
  type ChildCurriculumOverview,
  type LessonStatus,
  CURRICULUM_SUBDOMAINS,
  CURRICULUM_LESSONS,
  getLessonsForDomain,
  getReadyLessons,
  buildCurriculumOverview,
  getLearningPath,
  findLessonsForStandard,
} from "./curriculum-map";

// 7. Collaborative Learning (vs. Prisma)
export {
  type CollaborationType,
  type MentorshipMatch,
  type GroupProject,
  type ProjectRole,
  type CollaborationSession,
  type SocialSkill,
  type SocialSkillProfile,
  findMentorshipMatches,
  createGroupProject,
  startCollaborationSession,
  recordInteraction,
  buildSocialSkillProfile,
} from "./collaborative";

// 8. IoT Classroom Sensors (vs. Wildflower Labs / MIT)
export {
  type SensorType,
  type SensorDevice,
  type SensorReading,
  type EnvironmentQuality,
  type ClassroomZone,
  OPTIMAL_RANGES,
  assessReadingQuality,
  assessEnvironmentQuality,
  getLayoutRecommendations,
  registerSensor,
} from "./iot-classroom";

// 9. Gamification (vs. Strew, Montessori-appropriate)
export {
  type AchievementBadge,
  type EarnedBadge,
  type BadgeCategory,
  type BadgeTier,
  type Streak,
  type PersonalChallenge,
  type ChallengeType,
  DEFAULT_BADGES,
  checkBadgeEligibility,
  updateStreak,
  createChallenge,
  updateChallengeProgress,
  suggestChallenges,
} from "./gamification";

// 10. Portfolio & Showcase
export {
  type PortfolioItem,
  type PortfolioItemType,
  type PortfolioCollection,
  type PortfolioShare,
  type GrowthSnapshot,
  type PortfolioExport,
  addPortfolioItem,
  createCollection,
  createShareLink,
  takeGrowthSnapshot,
  autoCurateBestOf,
  buildSchoolTransitionPortfolio,
} from "./portfolio";

// 11. Offline-First / Raspberry Pi (like mama-ai-clinic)
export {
  type DeploymentTarget,
  type ConnectivityMode,
  type OfflineDeviceConfig,
  type ContentPack,
  type SyncItem,
  type SyncSession,
  type LocalStorageStats,
  DEFAULT_CONTENT_PACKS,
  initializeDevice,
  getRecommendedPacks,
  createSyncItem,
  estimateStorageRequirements,
  validateOfflineReadiness,
} from "./offline";

// 12. Teacher / Guide Tools
export {
  type Observation,
  type ObservationType,
  type LessonPlan,
  type LessonPlanType,
  type Classroom,
  type DailyPlan,
  type ParentCommunication,
  type AttendanceRecord,
  generateLessonPlan,
  createObservation,
  generateDailyPlan,
  generateProgressUpdate,
  getUnderobservedChildren,
} from "./teacher-tools";

// 13. Adaptive Difficulty (vs. Khanmigo / MagicSchool)
export {
  type DifficultyLevel,
  type ZPDZone,
  type ScaffoldLevel,
  type PerformanceSignal,
  type EngagementState,
  type SkillAdaptiveProfile,
  type ChildAdaptiveProfile,
  DIFFICULTY_ORDER,
  SCAFFOLD_ORDER,
  processPerformanceSignal,
  initializeSkillProfile,
  recommendNextActivity,
  detectEngagement,
} from "./adaptive-difficulty";

// 14. Voice Interaction
export {
  type VoicePersona,
  type VoiceConfig,
  type SpeechRecognitionResult,
  type VoiceCommand,
  type PronunciationAssessment,
  type VoiceEvent,
  DEFAULT_VOICE_COMMANDS,
  getVoiceConfigForAge,
  matchVoiceCommand,
  assessPronunciation,
  recordVoiceEvent,
  analyzeVoicePatterns,
} from "./voice-interaction";

// 15. Parent Community
export {
  type ParentCommunityProfile,
  type ForumCategory,
  type ForumPost,
  type ForumReply,
  type SharedResource,
  type LocalGroup,
  type CommunityEvent,
  createPost,
  createReply,
  shareResource,
  findLocalGroups,
  getTrendingTopics,
  createEvent,
  type ModerationAction,
} from "./parent-community";
