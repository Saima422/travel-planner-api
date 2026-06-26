import { cityResolver } from './city.resolver'
import { weatherResolver } from './weather.resolver'
import { activityResolver } from './activity.resolver'

export const resolvers = {
  Query: {
    ...cityResolver.Query,
    ...weatherResolver.Query,
    ...activityResolver.Query,
  },
}
