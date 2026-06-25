import axios from 'axios'
import { City, DailyForecast } from '../types'
import {
  OpenMeteoCityResult,
  OpenMeteoWeatherResults,
} from '../types/openMeteo.types'

export const searchCity = async (cityName: string): Promise<City[]> => {
  const geocodingApiEndpoint = 'https://geocoding-api.open-meteo.com'
  const count = 5 // assumption: used for search dropdown
  const language = 'en' // assumption: english language is used

  const res = await axios.get<{ results: OpenMeteoCityResult[] }>(
    `${geocodingApiEndpoint}/v1/search?name=${cityName}&count=${count}&language=${language}`,
  )

  const cityResults = res?.data?.results

  if (!cityResults) return []

  return cityResults?.map((city) => ({
    id: city?.id,
    name: city.name,
    country: city.country,
    lat: city?.latitude,
    lon: city?.longitude,
    timezone: city?.timezone,
    countryCode: city?.country_code,
    elevation: city?.elevation,
  }))
}

export const getDailyWeather = async (
  lat: number,
  lon: number,
  timezone: string,
): Promise<DailyForecast[]> => {
  const weatherforecastApiEndpoint = 'https://api.open-meteo.com/v1/forecast'

  const dailyArgs = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'snowfall_sum',
    'windspeed_10m_max',
  ]

  const forecastDays = 7 // defualt assumption

  const res = await axios.get<OpenMeteoWeatherResults>(
    `${weatherforecastApiEndpoint}?latitude=${lat}&longitude=${lon}&timezone=${timezone}&forecast_days=${forecastDays}&daily=${dailyArgs.join(',')}`,
  )

  const dailyWeather = res?.data?.daily

  if (!dailyWeather) return []

  const daily7DayWeather = dailyWeather?.time?.map(
    (date: string, index: number) => ({
      date: date,
      maxTemp: dailyWeather?.temperature_2m_max?.[index],
      minTemp: dailyWeather?.temperature_2m_min?.[index],
      snow: dailyWeather?.snowfall_sum?.[index],
      precipitation: dailyWeather?.precipitation_sum?.[index],
      windSpeed: dailyWeather?.windspeed_10m_max?.[index],
    }),
  )

  return daily7DayWeather
}
