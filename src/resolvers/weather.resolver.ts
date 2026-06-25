import { getDailyWeather } from '../services/openMeteo'

type DailyWeatherArgs = {
  lat: number
  lon: number
  timezone: string
}

export const weatherResolver = {
  Query: {
    weatherForecast: async (
      parent: unknown,
      args: DailyWeatherArgs,
      context: unknown,
    ) => {
      const dailyWeather = await getDailyWeather(
        args?.lat,
        args?.lon,
        args?.timezone,
      )
      return {
        timezone: args?.timezone,
        daily: dailyWeather,
      }
    },
  },
}
