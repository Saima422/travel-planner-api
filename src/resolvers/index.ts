import { cityResolver } from './city.resolver'
import { weatherResolver } from './weather.resolver'

export const resolvers = {
  Query: {
    ...cityResolver.Query,
    ...weatherResolver.Query,
  },
}
