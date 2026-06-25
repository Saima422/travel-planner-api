import { calculateActivityRank } from '../services/activityRanking'
import { getDailyWeather } from '../services/openMeteo'
import { DailyForecast } from '../types'

type ActivityRankingArgs = {
  lat: number
  lon: number
  timezone: string
}

export const activityResolver = {
  Query: {
    activityRanking: async (
      parent: unknown,
      args: ActivityRankingArgs,
      context: unknown,
    ) => {
      const dailyWeather = await getDailyWeather(
        args?.lat,
        args?.lon,
        args?.timezone,
      )

      const ranking = dailyWeather?.map((day: DailyForecast) =>
        calculateActivityRank(day),
      )
      return ranking
    },
  },
}
