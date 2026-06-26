import { searchCity } from '../../src/services/openMeteo'
import { cityResolver } from '../../src/resolvers/city.resolver'

jest.mock('../../src/services/openMeteo')
const mockedSearchCity = searchCity as jest.MockedFunction<typeof searchCity>

const callResolver = (name: string) =>
  cityResolver.Query.citySuggestions(undefined, { name }, undefined)

describe('citySuggestions resolver', () => {
  beforeEach(() => mockedSearchCity.mockClear())

  // Verifies the resolver passes the client's search term to the service unchanged
  it('calls searchCity with args.name', async () => {
    mockedSearchCity.mockResolvedValue([])
    await callResolver('London')
    expect(mockedSearchCity).toHaveBeenCalledWith('London')
  })

  // Verifies the resolver returns whatever the service gives — no transformation
  it('returns the array from searchCity', async () => {
    const mockCities = [
      {
        id: 1,
        name: 'London',
        lat: 51.5,
        lon: -0.1,
        timezone: 'Europe/London',
        country: 'UK',
        countryCode: 'GB',
        elevation: 10,
      },
    ]
    mockedSearchCity.mockResolvedValue(mockCities)
    const result = await callResolver('London')
    expect(result).toBe(mockCities)
  })
})
