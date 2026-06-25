import { citySearch } from '../services/openMeteo'

type CitySuggestionsArgs = {
  name: string
}

export const cityResolver = {
  Query: {
    citySuggestions: async (
      parent: unknown,
      args: CitySuggestionsArgs,
      context: unknown,
    ) => {
      const cities = await citySearch(args?.name)
      return cities
    },
  },
}
