<p align="center">
  <h1 align="center">MAMA Montessori</h1>
  <h3 align="center"><em>A-class education for every child on earth. Open-source. Free forever.<br>Because privatizing education is the problem, not the solution.</em></h3>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/cost-Free_Forever-green" alt="Free">
  <img src="https://img.shields.io/badge/status-Active-brightgreen" alt="Active">
  <img src="https://img.shields.io/badge/modules-15-f59e0b" alt="15 Modules">
  <img src="https://img.shields.io/badge/tests-45_passing-10b981" alt="45 Tests">
  <a href="https://mama.oliwoods.ai"><img src="https://img.shields.io/badge/Built_with-MAMA-8b5cf6" alt="Built with MAMA"></a>
  <a href="https://mama.oliwoods.ai/foundation"><img src="https://img.shields.io/badge/OliWoods-Foundation-10b981" alt="OliWoods Foundation"></a>
</p>

---

> **A Montessori education costs $15,000-$30,000/year.** The methodology is proven -- students outperform traditional education on every metric: academic achievement, social development, creativity, executive function, love of learning. But access is limited to families who can afford private school tuition. **We're open-sourcing the algorithms.** Let the private schools try to compete with free.

---

## What This Is

A **TypeScript algorithm library** implementing core Montessori education principles as composable, pure functions with Zod schemas. It provides the building blocks -- adaptive difficulty engines, curriculum mapping, handwriting analysis, work cycle analytics -- that any education app can integrate.

This is **not** a full application. There's no server, no database, no UI. It's a library of algorithms and data models designed to be imported into your own education platform.

```
npm install mama-montessori
```

```typescript
import {
  processPerformanceSignal,   // Adaptive difficulty with ZPD tracking
  analyzeWorkCurves,           // Montessori work cycle analytics
  analyzeTracing,              // Handwriting stroke analysis
  findMentorshipMatches,       // Mixed-age peer mentoring
  getLearningPath,             // Prerequisite-based curriculum paths
} from "mama-montessori";
```

## The 15 Modules

| # | Module | What it does |
|---|--------|-------------|
| 1 | **adaptive-difficulty** | Zone of Proximal Development tracking, mastery-based progression, frustration detection |
| 2 | **work-curves** | Concentration pattern analysis, flow state detection, false fatigue recognition |
| 3 | **curriculum-map** | 5-domain curriculum with prerequisite graphs, learning paths, progress tracking |
| 4 | **handwriting** | Stroke analysis, pressure/smoothness metrics, Montessori phonetic letter order |
| 5 | **voice-interaction** | Voice commands, pronunciation assessment (Levenshtein-based), age-appropriate configs |
| 6 | **collaborative** | Mixed-age mentorship matching (age-gap rules), group projects, social skill profiles |
| 7 | **gamification** | Non-competitive badges, streak system with grace days, personal challenges |
| 8 | **manipulatives** | Physical material tracking (NFC/QR/camera), usage patterns, mastery estimation |
| 9 | **ar-learning** | AR scene types, virtual manipulatives, spatial reasoning assessment |
| 10 | **i18n** | 25 language configs, RTL support, fallback chains, Montessori glossary |
| 11 | **iot-classroom** | Environmental monitoring (CO2, noise, light), optimal ranges, layout recommendations |
| 12 | **portfolio** | Student work curation, growth snapshots, school transition portfolios |
| 13 | **teacher-tools** | Three-period lesson planning, observation templates, progress report generation |
| 14 | **parent-community** | Community forums, local group finder (haversine), event management |
| 15 | **offline** | Content pack management, storage estimation, offline readiness validation |

## Key Algorithms

### Adaptive Difficulty Engine

The `processPerformanceSignal` function implements real-time difficulty adjustment based on Montessori's Zone of Proximal Development:

- Rolling weighted success rate (30% recent, 70% historical)
- Four ZPD zones: mastered, independent, zpd, frustration
- Bidirectional difficulty progression: concrete -> pictorial -> abstract-guided -> abstract -> extension
- Scaffolding levels: modeled -> guided-practice -> verbal-prompt -> visual-cue -> environmental -> none
- Voluntary repetition recognized as positive normalization signal

### Work Curve Analytics

Tracks Montessori's famous concentration curve across work cycles:

- False fatigue detection (3-sample sliding window)
- Normalization progress scoring
- Optimal time-of-day analysis
- Concentration trend tracking (first-half vs second-half comparison)

### Handwriting Analysis

Stroke-by-stroke analysis with real metrics:

- Pressure consistency (variance-based)
- Smoothness scoring (angle-change jitter detection)
- Size consistency (coefficient of variation)
- Baseline alignment (standard deviation of endpoints)
- Montessori phonetic letter order (not alphabetical)

## Architecture

Every module follows the same pattern:

```
Zod Schemas (types) -> Constants (default data) -> Pure Functions (algorithms)
```

- No classes, no side effects, no global state
- Immutable data patterns (functions return new objects)
- All types derived from Zod schemas with `z.infer`
- Privacy-first design (no tracking IDs leak across modules)

## Running

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm test             # Run 45 tests
npm run dev          # Watch mode
```

## Montessori Principles in Code

This library encodes actual Montessori pedagogy, not surface-level vocabulary:

- **Sensitive Periods**: Curriculum respects developmental readiness windows
- **Three-Period Lessons**: Teacher tools generate naming/recognition/recall sequences
- **Normalization**: Work curves track the development of sustained concentration
- **Control of Error**: Materials designed for self-correction without adult intervention
- **Mixed-Age Grouping**: Mentorship matching enforces age-gap rules and skill complementarity
- **Intrinsic Motivation**: Gamification uses no competition, no leaderboards, no comparison

> *"The greatest sign of success for a teacher is to be able to say, 'The children are now working as if I did not exist.'"*
> -- Maria Montessori

## Contributing

We need help with:

- **Expanding the curriculum**: Currently 8 sample lessons across 3 domains. The schema supports full 5-domain coverage.
- **Test coverage**: 45 tests cover the core algorithms. More edge cases welcome.
- **Translations**: i18n supports 25 languages but glossary has only 5 terms.
- **Integration examples**: Show how to use this library in React, React Native, or Node.js apps.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Related Projects

| Project | Description |
|---------|-------------|
| [mama-access-to-justice](https://github.com/OliWoods-Org/mama-access-to-justice) | Legal aid navigation |
| [mama-mental-health](https://github.com/OliWoods-Org/mama-mental-health) | Crisis detection with 988 handoff |
| [mama-ai-clinic](https://github.com/OliWoods-Org/mama-ai-clinic) | $170 offline AI health assistant |
| [foundation-neuro-learn](https://github.com/OliWoods-Org/foundation-neuro-learn) | Neurodivergent learning support |

## License

GPL-3.0. Free forever. An [OliWoods Foundation](https://github.com/OliWoods-Org) project.
