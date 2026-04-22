/**
 * IoT Classroom Sensors Module
 *
 * Competitor: Wildflower Labs (MIT partnership, environmental sensors)
 * Our advantage: Open-source sensor protocol, multi-vendor support,
 *   privacy-first design, works with cheap commodity hardware
 *
 * Features:
 * - Ambient noise level monitoring for concentration correlation
 * - Movement pattern tracking (anonymized, opt-in) for engagement
 * - Temperature/humidity for comfort optimization
 * - Light level monitoring for reading/visual work
 * - Engagement scoring from environmental data
 * - Classroom layout optimization recommendations
 * - Works with Raspberry Pi, ESP32, Arduino sensor kits
 */

import { z } from "zod";

// ============================================================================
// Sensor Types
// ============================================================================

export const SensorTypeSchema = z.enum([
  "noise-level",       // Ambient sound decibel meter
  "temperature",       // Room temperature
  "humidity",          // Relative humidity
  "light-level",       // Lux measurement
  "co2",               // CO2 concentration (affects cognition)
  "movement",          // PIR or radar movement detection
  "occupancy",         // People count (anonymized)
  "air-quality",       // PM2.5 / VOC
]);
export type SensorType = z.infer<typeof SensorTypeSchema>;

export const SensorStatusSchema = z.enum([
  "online",
  "offline",
  "error",
  "calibrating",
  "low-battery",
]);
export type SensorStatus = z.infer<typeof SensorStatusSchema>;

export const SensorDeviceSchema = z.object({
  id: z.string(),
  type: SensorTypeSchema,
  name: z.string(),
  classroomId: z.string(),
  zone: z.string(),                         // e.g., "reading-corner", "math-shelf", "art-area"
  hardware: z.enum(["raspberry-pi", "esp32", "arduino", "commercial", "other"]),
  status: SensorStatusSchema,
  batteryPercent: z.number().min(0).max(100).nullable(),
  lastReadingAt: z.string().nullable(),
  calibratedAt: z.string().nullable(),
  installLocation: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    height: z.number().optional(),           // meters from floor
    description: z.string(),
  }),
});
export type SensorDevice = z.infer<typeof SensorDeviceSchema>;

// ============================================================================
// Sensor Readings
// ============================================================================

export const SensorReadingSchema = z.object({
  id: z.string(),
  sensorId: z.string(),
  sensorType: SensorTypeSchema,
  classroomId: z.string(),
  zone: z.string(),
  value: z.number(),
  unit: z.string(),                         // e.g., "dB", "C", "%", "lux", "ppm"
  quality: z.enum(["good", "acceptable", "poor", "critical"]),
  timestamp: z.string(),
});
export type SensorReading = z.infer<typeof SensorReadingSchema>;

// ============================================================================
// Environment Quality Assessment
// ============================================================================

export const EnvironmentQualitySchema = z.object({
  classroomId: z.string(),
  timestamp: z.string(),
  overallScore: z.number().min(0).max(100),
  factors: z.object({
    noise: z.object({
      value: z.number(),
      unit: z.literal("dB"),
      quality: z.enum(["good", "acceptable", "poor", "critical"]),
      recommendation: z.string().optional(),
    }),
    temperature: z.object({
      value: z.number(),
      unit: z.literal("C"),
      quality: z.enum(["good", "acceptable", "poor", "critical"]),
      recommendation: z.string().optional(),
    }),
    humidity: z.object({
      value: z.number(),
      unit: z.literal("%"),
      quality: z.enum(["good", "acceptable", "poor", "critical"]),
      recommendation: z.string().optional(),
    }),
    light: z.object({
      value: z.number(),
      unit: z.literal("lux"),
      quality: z.enum(["good", "acceptable", "poor", "critical"]),
      recommendation: z.string().optional(),
    }),
    co2: z.object({
      value: z.number(),
      unit: z.literal("ppm"),
      quality: z.enum(["good", "acceptable", "poor", "critical"]),
      recommendation: z.string().optional(),
    }).optional(),
    airQuality: z.object({
      value: z.number(),
      unit: z.literal("AQI"),
      quality: z.enum(["good", "acceptable", "poor", "critical"]),
      recommendation: z.string().optional(),
    }).optional(),
  }),
  occupancy: z.number().optional(),
  engagementEstimate: z.number().min(0).max(100),
});
export type EnvironmentQuality = z.infer<typeof EnvironmentQualitySchema>;

// ============================================================================
// Zone Analytics
// ============================================================================

export const ClassroomZoneSchema = z.object({
  id: z.string(),
  classroomId: z.string(),
  name: z.string(),
  domain: z.enum(["practical-life", "sensorial", "language", "mathematics", "cultural", "art", "outdoor", "group", "quiet"]),
  sensors: z.array(z.string()),              // Sensor device IDs
  averageOccupancyMinutes: z.number(),
  peakUsageTime: z.string(),
  averageNoiseLevel: z.number(),
  usageFrequency: z.enum(["high", "moderate", "low", "underused"]),
});
export type ClassroomZone = z.infer<typeof ClassroomZoneSchema>;

// ============================================================================
// Optimal Ranges (Montessori-specific)
// ============================================================================

export const OPTIMAL_RANGES = {
  noise: {
    ideal: { min: 30, max: 45 },             // "Productive hum" — not silent, not loud
    acceptable: { min: 25, max: 55 },
    unit: "dB" as const,
    notes: "Montessori classrooms have a productive hum; absolute silence is not the goal",
  },
  temperature: {
    ideal: { min: 20, max: 23 },
    acceptable: { min: 18, max: 26 },
    unit: "C" as const,
    notes: "Comfortable for active movement and seated work",
  },
  humidity: {
    ideal: { min: 40, max: 60 },
    acceptable: { min: 30, max: 70 },
    unit: "%" as const,
    notes: "Prevents material warping and static; comfortable for breathing",
  },
  light: {
    ideal: { min: 300, max: 500 },
    acceptable: { min: 200, max: 750 },
    unit: "lux" as const,
    notes: "Natural light preferred; supplement as needed for detail work",
  },
  co2: {
    ideal: { min: 400, max: 800 },
    acceptable: { min: 400, max: 1200 },
    unit: "ppm" as const,
    notes: "Above 1000ppm significantly impacts cognitive performance",
  },
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Assess the quality of a single sensor reading against optimal ranges
 */
export function assessReadingQuality(
  type: SensorType,
  value: number,
): "good" | "acceptable" | "poor" | "critical" {
  const ranges = OPTIMAL_RANGES[type as keyof typeof OPTIMAL_RANGES];
  if (!ranges) return "acceptable";

  if (value >= ranges.ideal.min && value <= ranges.ideal.max) return "good";
  if (value >= ranges.acceptable.min && value <= ranges.acceptable.max) return "acceptable";
  // Far outside acceptable range
  const deviation = Math.max(
    ranges.acceptable.min - value,
    value - ranges.acceptable.max,
    0,
  );
  return deviation > (ranges.acceptable.max - ranges.acceptable.min) * 0.5 ? "critical" : "poor";
}

/**
 * Process a batch of sensor readings into an environment quality assessment
 */
export function assessEnvironmentQuality(
  classroomId: string,
  readings: SensorReading[],
): EnvironmentQuality {
  const latest: Record<string, SensorReading> = {};
  for (const reading of readings) {
    const key = reading.sensorType;
    if (!latest[key] || new Date(reading.timestamp) > new Date(latest[key].timestamp)) {
      latest[key] = reading;
    }
  }

  const noise = latest["noise-level"];
  const temp = latest["temperature"];
  const humidity = latest["humidity"];
  const light = latest["light-level"];
  const co2 = latest["co2"];

  const qualityScore = (quality: string): number => {
    return quality === "good" ? 100 : quality === "acceptable" ? 70 : quality === "poor" ? 35 : 10;
  };

  const factors: EnvironmentQuality["factors"] = {
    noise: {
      value: noise?.value ?? 40,
      unit: "dB",
      quality: noise ? assessReadingQuality("noise-level", noise.value) : "acceptable",
      recommendation: noise && noise.value > 55 ? "Consider soft background music or address noise sources" : undefined,
    },
    temperature: {
      value: temp?.value ?? 21,
      unit: "C",
      quality: temp ? assessReadingQuality("temperature", temp.value) : "acceptable",
      recommendation: temp && temp.value > 25 ? "Room may be too warm — open windows or adjust HVAC" : undefined,
    },
    humidity: {
      value: humidity?.value ?? 50,
      unit: "%",
      quality: humidity ? assessReadingQuality("humidity", humidity.value) : "acceptable",
    },
    light: {
      value: light?.value ?? 400,
      unit: "lux",
      quality: light ? assessReadingQuality("light-level", light.value) : "acceptable",
      recommendation: light && light.value < 200 ? "Supplement with task lighting for detail work areas" : undefined,
    },
  };

  if (co2) {
    factors.co2 = {
      value: co2.value,
      unit: "ppm",
      quality: assessReadingQuality("co2", co2.value),
      recommendation: co2.value > 1000 ? "CO2 is high — open windows for fresh air to improve cognitive performance" : undefined,
    };
  }

  const scores = [
    qualityScore(factors.noise.quality),
    qualityScore(factors.temperature.quality),
    qualityScore(factors.humidity.quality),
    qualityScore(factors.light.quality),
  ];
  if (factors.co2) scores.push(qualityScore(factors.co2.quality));

  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Engagement estimate: good environment = higher engagement
  const engagementEstimate = Math.min(100, Math.round(
    overallScore * 0.6 +
    (factors.noise.quality === "good" ? 25 : 10) +
    (factors.light.quality === "good" ? 15 : 5)
  ));

  return {
    classroomId,
    timestamp: new Date().toISOString(),
    overallScore,
    factors,
    engagementEstimate,
  };
}

/**
 * Generate classroom layout optimization recommendations
 */
export function getLayoutRecommendations(
  zones: ClassroomZone[],
  readings: SensorReading[],
): Array<{ zone: string; recommendation: string; priority: "high" | "medium" | "low" }> {
  const recommendations: Array<{ zone: string; recommendation: string; priority: "high" | "medium" | "low" }> = [];

  for (const zone of zones) {
    const zoneReadings = readings.filter((r) => r.zone === zone.name);

    // Noise in quiet zones
    if (zone.domain === "quiet" || zone.domain === "language") {
      const noiseReadings = zoneReadings.filter((r) => r.sensorType === "noise-level");
      const avgNoise = noiseReadings.length > 0
        ? noiseReadings.reduce((s, r) => s + r.value, 0) / noiseReadings.length : 0;
      if (avgNoise > 50) {
        recommendations.push({
          zone: zone.name,
          recommendation: "Consider adding sound-absorbing materials (rugs, curtains) or relocating away from high-activity areas",
          priority: "high",
        });
      }
    }

    // Light in reading/detail areas
    if (zone.domain === "language" || zone.domain === "art") {
      const lightReadings = zoneReadings.filter((r) => r.sensorType === "light-level");
      const avgLight = lightReadings.length > 0
        ? lightReadings.reduce((s, r) => s + r.value, 0) / lightReadings.length : 0;
      if (avgLight < 300 && avgLight > 0) {
        recommendations.push({
          zone: zone.name,
          recommendation: "Add supplemental task lighting — detail work requires 300-500 lux",
          priority: "medium",
        });
      }
    }

    // Underused zones
    if (zone.usageFrequency === "underused") {
      recommendations.push({
        zone: zone.name,
        recommendation: "Zone is underused — consider refreshing materials or making it more inviting with plants and soft furnishings",
        priority: "low",
      });
    }
  }

  return recommendations.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
}

/**
 * Register a new sensor device
 */
export function registerSensor(params: {
  type: SensorType;
  name: string;
  classroomId: string;
  zone: string;
  hardware: SensorDevice["hardware"];
  locationDescription: string;
}): SensorDevice {
  return {
    id: `sensor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: params.type,
    name: params.name,
    classroomId: params.classroomId,
    zone: params.zone,
    hardware: params.hardware,
    status: "calibrating",
    batteryPercent: null,
    lastReadingAt: null,
    calibratedAt: null,
    installLocation: {
      description: params.locationDescription,
    },
  };
}
