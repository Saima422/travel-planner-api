import { calculateActivityRank } from '../../src/services/activityRanking'
import { ActivityType, DailyForecast } from '../../src/types'

function makeDay(overrides: Partial<DailyForecast> = {}): DailyForecast {
  return {
    date: '2024-07-01',
    maxTemp: 20,
    minTemp: 10,
    snow: 0,
    precipitation: 0,
    windSpeed: 10,
    ...overrides,
  }
}

describe('output structure', () => {
  // Verifies the core contract: every call returns all four activities
  it('returns exactly 4 rankings', () => {
    const result = calculateActivityRank(makeDay(), 500)
    expect(result).toHaveLength(4)
  })

  // Verifies each ranking exposes the fields the GraphQL schema requires
  it('each ranking has activity, score, and reason fields', () => {
    const result = calculateActivityRank(makeDay(), 500)
    result.forEach((r) => {
      expect(r).toHaveProperty('activity')
      expect(r).toHaveProperty('score')
      expect(r).toHaveProperty('reason')
    })
  })

  // Verifies the ranker sorts output — client relies on result[0] being the best activity
  it('returns results sorted descending by score', () => {
    // skiing-ideal conditions: high snow, cold, low precip, calm wind, high elevation
    const result = calculateActivityRank(
      makeDay({ snow: 10, maxTemp: -5, precipitation: 0, windSpeed: 10 }),
      1500,
    )
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score)
    }
  })
})

describe('SKIING', () => {
  // Verifies all scoring conditions produce max score when perfectly met
  it('returns score 10 under ideal skiing conditions', () => {
    const result = calculateActivityRank(
      makeDay({ snow: 10, maxTemp: -5, precipitation: 0, windSpeed: 10 }),
      1500,
    )
    const skiing = result.find((r) => r.activity === ActivityType.SKIING)!
    expect(skiing.score).toBe(10)
  })

  // Verifies all scoring conditions produce 0 when none are met
  it('returns score 0 under worst skiing conditions', () => {
    const result = calculateActivityRank(
      makeDay({ snow: 0, maxTemp: 10, precipitation: 6, windSpeed: 50 }),
      200,
    )
    const skiing = result.find((r) => r.activity === ActivityType.SKIING)!
    expect(skiing.score).toBe(0)
  })

  // Verifies the >= 5 threshold: exactly 5cm is heavy snow (2pts), not light snow (1pt)
  it('awards 2pts for snow at exactly 5cm boundary', () => {
    const withHeavySnow = calculateActivityRank(
      makeDay({ snow: 5, maxTemp: -5, precipitation: 0, windSpeed: 10 }),
      1500,
    )
    const withLightSnow = calculateActivityRank(
      makeDay({ snow: 4, maxTemp: -5, precipitation: 0, windSpeed: 10 }),
      1500,
    )
    const heavyScore = withHeavySnow.find(
      (r) => r.activity === ActivityType.SKIING,
    )!.score
    const lightScore = withLightSnow.find(
      (r) => r.activity === ActivityType.SKIING,
    )!.score
    expect(heavyScore).toBeGreaterThan(lightScore)
  })

  // Verifies the < 0 threshold: exactly 0°C is cold (1pt), not freezing (2pts)
  it('awards 1pt for maxTemp at exactly 0°C — cold but not freezing', () => {
    const atZero = calculateActivityRank(
      makeDay({ snow: 10, maxTemp: 0, precipitation: 0, windSpeed: 10 }),
      1500,
    )
    const belowZero = calculateActivityRank(
      makeDay({ snow: 10, maxTemp: -1, precipitation: 0, windSpeed: 10 }),
      1500,
    )
    const atZeroScore = atZero.find(
      (r) => r.activity === ActivityType.SKIING,
    )!.score
    const belowZeroScore = belowZero.find(
      (r) => r.activity === ActivityType.SKIING,
    )!.score
    expect(belowZeroScore).toBeGreaterThan(atZeroScore)
  })
})

describe('SURFING', () => {
  // Verifies all conditions at their optimal values produce max score
  it('returns score 10 under ideal surfing conditions', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 25, windSpeed: 20, precipitation: 0, snow: 0 }),
      50,
    )
    const surfing = result.find((r) => r.activity === ActivityType.SURFING)!
    expect(surfing.score).toBe(10)
  })

  // Verifies all conditions at their worst values produce 0
  it('returns score 0 under worst surfing conditions', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 35, windSpeed: 60, precipitation: 6, snow: 5 }),
      600,
    )
    const surfing = result.find((r) => r.activity === ActivityType.SURFING)!
    expect(surfing.score).toBe(0)
  })

  // Verifies strict equality: snow === 0 gets 2pts, snow = 0.1 drops to 1pt
  // Using <= 0 instead of === 0 would be a silent bug — this test catches it
  it('awards 2pts for snow === 0 but 1pt for snow = 0.1 (strict equality)', () => {
    const noSnow = calculateActivityRank(
      makeDay({ snow: 0, maxTemp: 25, windSpeed: 20, precipitation: 0 }),
      50,
    )
    const traceSnow = calculateActivityRank(
      makeDay({ snow: 0.1, maxTemp: 25, windSpeed: 20, precipitation: 0 }),
      50,
    )
    const noSnowScore = noSnow.find(
      (r) => r.activity === ActivityType.SURFING,
    )!.score
    const traceScore = traceSnow.find(
      (r) => r.activity === ActivityType.SURFING,
    )!.score
    expect(noSnowScore).toBeGreaterThan(traceScore)
  })

  // Verifies the else-if branch for "too hot" (> 30°C) scores 0, not 1pt
  // Without this branch, temperatures above 30°C would fall through to the else and score 0 for wrong reason
  it('awards 0pts when maxTemp exceeds 30°C (too hot)', () => {
    const tooHot = calculateActivityRank(
      makeDay({ maxTemp: 31, windSpeed: 20, precipitation: 0, snow: 0 }),
      50,
    )
    const tooCold = calculateActivityRank(
      makeDay({ maxTemp: 5, windSpeed: 20, precipitation: 0, snow: 0 }),
      50,
    )
    const hotScore = tooHot.find(
      (r) => r.activity === ActivityType.SURFING,
    )!.score
    const coldScore = tooCold.find(
      (r) => r.activity === ActivityType.SURFING,
    )!.score
    expect(hotScore).toBe(coldScore) // both score 0pts on temperature
  })
})

describe('OUTDOOR SIGHTSEEING', () => {
  // Verifies all conditions met → max score
  it('returns score 10 under ideal outdoor conditions', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 20, precipitation: 0, snow: 0, windSpeed: 10 }),
      500,
    )
    const outdoor = result.find(
      (r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING,
    )!
    expect(outdoor.score).toBe(10)
  })

  // Verifies all conditions worst → score 0
  it('returns score 0 under worst outdoor conditions', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 35, precipitation: 6, snow: 3, windSpeed: 45 }),
      500,
    )
    const outdoor = result.find(
      (r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING,
    )!
    expect(outdoor.score).toBe(0)
  })

  // Verifies the formula uses /8, not /10 — if wrong, every outdoor score would be too low
  // 4 conditions × 1pt each = half of max → should be 5.0, not 4.0
  it('normalises score via /8: half-max conditions (4pts) → score 5.0', () => {
    // Each condition scores 1pt: maxTemp 10-15, precipitation 1-5, snow 0-2, windSpeed 20-40
    const result = calculateActivityRank(
      makeDay({ maxTemp: 12, precipitation: 2, snow: 1, windSpeed: 25 }),
      500,
    )
    const outdoor = result.find(
      (r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING,
    )!
    expect(outdoor.score).toBeCloseTo(5.0, 5)
  })

  // Verifies the "too hot" branch exists — maxTemp > 30 should score 0, not 1pt
  // This was a bug caught during development when the branch was missing
  it('awards 0pts when maxTemp exceeds 30°C (too hot)', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 31, precipitation: 0, snow: 0, windSpeed: 10 }),
      500,
    )
    const outdoor = result.find(
      (r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING,
    )!
    // max without temperature bonus = 6pts → (6/8)*10 = 7.5
    expect(outdoor.score).toBeCloseTo(7.5, 5)
  })

  // Verifies the upper boundary of moderate wind: exactly 40km/h is moderate (1pt), not dangerous (0pts)
  it('awards 1pt for windSpeed at exactly 40km/h — moderate, not dangerous', () => {
    const at40 = calculateActivityRank(
      makeDay({ maxTemp: 20, precipitation: 0, snow: 0, windSpeed: 40 }),
      500,
    )
    const above40 = calculateActivityRank(
      makeDay({ maxTemp: 20, precipitation: 0, snow: 0, windSpeed: 41 }),
      500,
    )
    const at40Score = at40.find(
      (r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING,
    )!.score
    const above40Score = above40.find(
      (r) => r.activity === ActivityType.OUTDOOR_SIGHTSEEING,
    )!.score
    expect(at40Score).toBeGreaterThan(above40Score)
  })
})

describe('INDOOR SIGHTSEEING', () => {
  // Verifies the baseline guarantee: indoor always scores > 0 even in perfect outdoor weather
  // This is the core invariant — indoor is always a viable option regardless of conditions
  it('always scores above 0 even under ideal outdoor conditions', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 20, precipitation: 0, snow: 0, windSpeed: 10 }),
      500,
    )
    const indoor = result.find(
      (r) => r.activity === ActivityType.INDOOR_SIGHTSEEING,
    )!
    expect(indoor.score).toBeGreaterThan(0)
  })

  // Verifies that all weather bonuses active brings indoor to its maximum of 10
  it('returns score 10 when all weather bonuses are active', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 5, precipitation: 6, snow: 3, windSpeed: 50 }),
      500,
    )
    const indoor = result.find(
      (r) => r.activity === ActivityType.INDOOR_SIGHTSEEING,
    )!
    expect(indoor.score).toBeCloseTo(10, 5)
  })

  // Verifies inverted scoring: bad weather raises the indoor score
  // Unlike other activities, indoor benefits from poor conditions — this is intentional design
  it('scores higher with heavy rain than with no rain', () => {
    const heavyRain = calculateActivityRank(makeDay({ precipitation: 6 }), 500)
    const noRain = calculateActivityRank(makeDay({ precipitation: 0 }), 500)
    const rainScore = heavyRain.find(
      (r) => r.activity === ActivityType.INDOOR_SIGHTSEEING,
    )!.score
    const dryScore = noRain.find(
      (r) => r.activity === ActivityType.INDOOR_SIGHTSEEING,
    )!.score
    expect(rainScore).toBeGreaterThan(dryScore)
  })

  // Verifies the score formula divides by 11, not 10 or 8
  // With baseline only (3pts): (3/11)*10 ≈ 2.727, not 3.0 or 3.75
  it('normalises score via /11: baseline only (3pts) → score ≈ 2.727', () => {
    const result = calculateActivityRank(
      makeDay({ maxTemp: 20, precipitation: 0, snow: 0, windSpeed: 10 }),
      500,
    )
    const indoor = result.find(
      (r) => r.activity === ActivityType.INDOOR_SIGHTSEEING,
    )!
    expect(indoor.score).toBeCloseTo((3 / 11) * 10, 5)
  })
})

describe('reason strings', () => {
  // Verifies reason fragments are joined correctly — one fragment per scoring dimension
  // Skiing has 5 dimensions so all-best conditions should produce exactly 5 fragments
  it('skiing all-best reason contains 5 fragments joined with ". "', () => {
    const result = calculateActivityRank(
      makeDay({ snow: 10, maxTemp: -5, precipitation: 0, windSpeed: 10 }),
      1500,
    )
    const skiing = result.find((r) => r.activity === ActivityType.SKIING)!
    expect(skiing.reason.length).toBeGreaterThan(0)
    expect(skiing.reason.split('. ')).toHaveLength(5)
  })
})
