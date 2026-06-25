export type OpenMeteoCityResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  timezone: string
  country: string
  country_code: string
  elevation: number
}

export type OpenMeteoWeatherResults = {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    snowfall_sum: number[]
    windspeed_10m_max: number[]
  }
}
