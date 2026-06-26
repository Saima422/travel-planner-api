export type City = {
  id: number
  name: string
  country: string
  lat: number
  lon: number
  timezone: string
  countryCode: string
  elevation: number
}

export type DailyForecast = {
  date: string
  maxTemp: number
  minTemp: number
  snow: number
  precipitation: number
  windSpeed: number
}

export enum ActivityType {
  SKIING = 'SKIING',
  SURFING = 'SURFING',
  INDOOR_SIGHTSEEING = 'INDOOR_SIGHTSEEING',
  OUTDOOR_SIGHTSEEING = 'OUTDOOR_SIGHTSEEING',
}

export type ActivityRanking = {
  activity: ActivityType
  score: number
  reason: string
}
