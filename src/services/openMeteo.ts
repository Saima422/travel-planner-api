import axios from 'axios'
import { City } from '../types'
import { OpenMeteoCityResult } from '../types/openMeteo.types'

export const citySearch = async (cityName: string): Promise<City[]> => {
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
  }))
}
