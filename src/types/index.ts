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
