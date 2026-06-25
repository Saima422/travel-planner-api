import { cityResolver } from './city.resolver'

export const resolvers = {
  Query: {
    ...cityResolver.Query,
  },
}
