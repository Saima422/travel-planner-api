import { searchCity } from '../services/openMeteo'

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
      const cities = await searchCity(args?.name)
      return cities
    },
  },
}
