/**
 * Voice Interaction Module
 *
 * Our advantage: Voice-first learning for pre-readers (ages 3-6),
 *   accessibility support, multi-language voice synthesis
 *
 * Features:
 * - Voice-based learning interactions for pre-readers
 * - Speech-to-text for child voice input
 * - Text-to-speech with age-appropriate voice personas
 * - Voice commands for hands-free navigation
 * - Pronunciation practice and feedback
 * - Multi-language voice support
 * - Accessibility: screen reader integration, voice-only mode
 */

import { z } from "zod";

// ============================================================================
// Voice Configuration
// ============================================================================

export const VoicePersonaSchema = z.enum([
  "gentle-guide",     // Calm, patient (for Explorers, age 3-6)
  "enthusiastic",     // Energetic, encouraging (for Builders, age 7-10)
  "conversational",   // Natural, peer-like (for Architects, age 10-14)
  "mentor",           // Mature, respectful (for Navigators, age 14-18)
  "parent-facing",    // Professional, warm (for parent dashboard)
]);
export type VoicePersona = z.infer<typeof VoicePersonaSchema>;

export const VoiceConfigSchema = z.object({
  childId: z.string().optional(),
  persona: VoicePersonaSchema,
  language: z.string().default("en"),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(0.5).max(2.0).default(1.0),
  volume: z.number().min(0).max(1).default(0.8),
  provider: z.enum(["elevenlabs", "openai-tts", "browser-native", "local-piper"]).default("browser-native"),
  voiceId: z.string().optional(),             // Provider-specific voice ID
  autoplay: z.boolean().default(true),
  readAloud: z.boolean().default(true),       // Read all text content aloud
  subtitles: z.boolean().default(true),       // Show text alongside voice
});
export type VoiceConfig = z.infer<typeof VoiceConfigSchema>;

// ============================================================================
// Speech Recognition
// ============================================================================

export const SpeechRecognitionResultSchema = z.object({
  id: z.string(),
  childId: z.string(),
  sessionId: z.string(),
  transcript: z.string(),
  confidence: z.number().min(0).max(1),
  language: z.string(),
  durationMs: z.number(),
  alternatives: z.array(z.object({
    transcript: z.string(),
    confidence: z.number(),
  })).default([]),
  intent: z.enum([
    "answer",           // Answering a question
    "question",         // Asking a question
    "command",          // Navigation/control command
    "narration",        // Describing their work
    "reading-aloud",    // Practicing reading
    "unknown",
  ]).default("unknown"),
  timestamp: z.string(),
});
export type SpeechRecognitionResult = z.infer<typeof SpeechRecognitionResultSchema>;

// ============================================================================
// Voice Commands
// ============================================================================

export const VoiceCommandSchema = z.object({
  id: z.string(),
  trigger: z.array(z.string()),              // Phrases that trigger this command
  action: z.enum([
    "next",              // Go to next step/activity
    "back",              // Go back
    "repeat",            // Repeat the last instruction
    "help",              // Ask for help
    "pause",             // Pause the session
    "resume",            // Resume the session
    "read-aloud",        // Read current content aloud
    "slower",            // Speak slower
    "faster",            // Speak faster
    "show-me",           // Visual demonstration
    "tell-me-more",      // Expand on current topic
    "what-is-this",      // Identify an object (with camera)
    "start-recording",   // Begin voice recording
    "stop-recording",    // End voice recording
  ]),
  description: z.string(),
  ageMinimum: z.number().default(3),
  requiresConfirmation: z.boolean().default(false),
});
export type VoiceCommand = z.infer<typeof VoiceCommandSchema>;

// ============================================================================
// Pronunciation Practice
// ============================================================================

export const PronunciationAssessmentSchema = z.object({
  id: z.string(),
  childId: z.string(),
  word: z.string(),
  language: z.string(),
  expectedPhonemes: z.array(z.string()),
  producedPhonemes: z.array(z.string()),
  accuracyScore: z.number().min(0).max(100),
  fluencyScore: z.number().min(0).max(100),
  completenessScore: z.number().min(0).max(100),
  feedback: z.object({
    praise: z.string(),
    suggestion: z.string().optional(),
    modelAudioUrl: z.string().optional(),    // Correct pronunciation sample
  }),
  timestamp: z.string(),
});
export type PronunciationAssessment = z.infer<typeof PronunciationAssessmentSchema>;

// ============================================================================
// Voice Session Events
// ============================================================================

export const VoiceEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  childId: z.string(),
  type: z.enum([
    "tts-started",       // System began speaking
    "tts-completed",     // System finished speaking
    "stt-started",       // Listening to child
    "stt-completed",     // Got child's input
    "command-recognized", // Voice command matched
    "pronunciation-assessed",
    "voice-error",
    "silence-detected",  // Extended silence (may indicate confusion)
    "interruption",      // Child spoke while system was speaking
  ]),
  data: z.record(z.string(), z.unknown()).default({}),
  timestamp: z.string(),
});
export type VoiceEvent = z.infer<typeof VoiceEventSchema>;

// ============================================================================
// Default Voice Commands
// ============================================================================

export const DEFAULT_VOICE_COMMANDS: VoiceCommand[] = [
  {
    id: "cmd-next", trigger: ["next", "continue", "go on", "what's next", "more"],
    action: "next", description: "Move to the next step or activity", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-back", trigger: ["back", "go back", "before", "previous"],
    action: "back", description: "Go back to the previous step", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-repeat", trigger: ["repeat", "again", "say that again", "what did you say", "huh"],
    action: "repeat", description: "Repeat the last instruction", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-help", trigger: ["help", "help me", "I don't know", "I'm stuck", "I need help"],
    action: "help", description: "Ask for help or a hint", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-pause", trigger: ["pause", "stop", "wait", "hold on"],
    action: "pause", description: "Pause the current session", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-resume", trigger: ["resume", "start", "let's go", "I'm ready", "keep going"],
    action: "resume", description: "Resume a paused session", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-read", trigger: ["read this", "read it", "read aloud", "read to me"],
    action: "read-aloud", description: "Read the current content aloud", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-slower", trigger: ["slower", "slow down", "too fast"],
    action: "slower", description: "Speak more slowly", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-faster", trigger: ["faster", "speed up", "too slow"],
    action: "faster", description: "Speak more quickly", ageMinimum: 5, requiresConfirmation: false,
  },
  {
    id: "cmd-show", trigger: ["show me", "let me see", "demonstrate"],
    action: "show-me", description: "Show a visual demonstration", ageMinimum: 3, requiresConfirmation: false,
  },
  {
    id: "cmd-more", trigger: ["tell me more", "more about that", "what else", "why"],
    action: "tell-me-more", description: "Explore the current topic deeper", ageMinimum: 5, requiresConfirmation: false,
  },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get voice configuration for a child's developmental phase
 */
export function getVoiceConfigForAge(age: number): Partial<VoiceConfig> {
  if (age <= 6) {
    return {
      persona: "gentle-guide",
      speed: 0.85,
      readAloud: true,
      subtitles: false,   // Pre-readers don't need text
      autoplay: true,
    };
  }
  if (age <= 10) {
    return {
      persona: "enthusiastic",
      speed: 1.0,
      readAloud: true,
      subtitles: true,
      autoplay: true,
    };
  }
  if (age <= 14) {
    return {
      persona: "conversational",
      speed: 1.0,
      readAloud: false,    // Can read themselves
      subtitles: true,
      autoplay: false,
    };
  }
  return {
    persona: "mentor",
    speed: 1.0,
    readAloud: false,
    subtitles: true,
    autoplay: false,
  };
}

/**
 * Match a speech transcript to a voice command
 */
export function matchVoiceCommand(
  transcript: string,
  age: number,
  commands?: VoiceCommand[],
): VoiceCommand | null {
  const commandList = commands ?? DEFAULT_VOICE_COMMANDS;
  const normalized = transcript.toLowerCase().trim();

  for (const cmd of commandList) {
    if (age < cmd.ageMinimum) continue;
    for (const trigger of cmd.trigger) {
      if (normalized.includes(trigger.toLowerCase())) {
        return cmd;
      }
    }
  }

  return null;
}

/**
 * Assess pronunciation of a word
 */
export function assessPronunciation(params: {
  childId: string;
  word: string;
  language: string;
  recognizedTranscript: string;
  confidence: number;
}): PronunciationAssessment {
  const { word, recognizedTranscript, confidence } = params;

  // Simple assessment based on transcript match and confidence
  const normalizedWord = word.toLowerCase().trim();
  const normalizedTranscript = recognizedTranscript.toLowerCase().trim();

  const isExactMatch = normalizedWord === normalizedTranscript;
  const accuracyScore = isExactMatch ? Math.round(confidence * 100) :
    Math.round(similarity(normalizedWord, normalizedTranscript) * 100);
  const fluencyScore = Math.round(confidence * 100);
  const completenessScore = normalizedTranscript.length > 0 ? Math.min(100, Math.round(
    (normalizedTranscript.length / Math.max(1, normalizedWord.length)) * 100,
  )) : 0;

  const praise = accuracyScore >= 80
    ? `Great job saying "${word}"! I can hear each sound clearly.`
    : accuracyScore >= 50
    ? `Good try with "${word}"! You're getting closer.`
    : `Nice effort! Let's practice "${word}" together.`;

  const suggestion = accuracyScore < 80
    ? `Try saying "${word}" slowly, one sound at a time.`
    : undefined;

  return {
    id: `pron-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    childId: params.childId,
    word: params.word,
    language: params.language,
    expectedPhonemes: [],   // Would need phoneme dictionary
    producedPhonemes: [],
    accuracyScore,
    fluencyScore,
    completenessScore,
    feedback: { praise, suggestion },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Record a voice event in a session
 */
export function recordVoiceEvent(params: {
  sessionId: string;
  childId: string;
  type: VoiceEvent["type"];
  data?: Record<string, unknown>;
}): VoiceEvent {
  return {
    id: `ve-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId: params.sessionId,
    childId: params.childId,
    type: params.type,
    data: params.data ?? {},
    timestamp: new Date().toISOString(),
  };
}

/**
 * Analyze voice interaction patterns for a session
 */
export function analyzeVoicePatterns(events: VoiceEvent[]): {
  totalSpeakingTimeChild: number;
  totalSpeakingTimeSystem: number;
  interactionCount: number;
  averageResponseLatencyMs: number;
  silenceEvents: number;
  commandsUsed: number;
  interruptionCount: number;
} {
  let totalSpeakingTimeChild = 0;
  let totalSpeakingTimeSystem = 0;
  let interactionCount = 0;
  let commandsUsed = 0;
  let silenceEvents = 0;
  let interruptionCount = 0;

  const responseTimes: number[] = [];
  let lastSystemEnd: number | null = null;

  for (const event of events) {
    const ts = new Date(event.timestamp).getTime();

    switch (event.type) {
      case "tts-completed":
        lastSystemEnd = ts;
        totalSpeakingTimeSystem += (event.data.durationMs as number) ?? 0;
        break;
      case "stt-completed":
        interactionCount++;
        totalSpeakingTimeChild += (event.data.durationMs as number) ?? 0;
        if (lastSystemEnd) {
          responseTimes.push(ts - lastSystemEnd);
        }
        break;
      case "command-recognized":
        commandsUsed++;
        break;
      case "silence-detected":
        silenceEvents++;
        break;
      case "interruption":
        interruptionCount++;
        break;
    }
  }

  const averageResponseLatencyMs = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  return {
    totalSpeakingTimeChild,
    totalSpeakingTimeSystem,
    interactionCount,
    averageResponseLatencyMs,
    silenceEvents,
    commandsUsed,
    interruptionCount,
  };
}

// Simple string similarity for pronunciation matching
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const maxLen = Math.max(a.length, b.length);
  let matches = 0;
  const minLen = Math.min(a.length, b.length);

  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches++;
  }

  return matches / maxLen;
}
