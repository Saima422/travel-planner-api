import { getDailyWeather } from '../../src/services/openMeteo'
import { weatherResolver } from '../../src/resolvers/weather.resolver'

jest.mock('../../src/services/openMeteo')
const mockedGetDailyWeather = getDailyWeather as jest.MockedFunction<
  typeof getDailyWeather
>

const args = { lat: 48.85, lon: 2.35, timezone: 'Europe/Paris' }
const callResolver = () =>
  weatherResolver.Query.weatherForecast(undefined, args, undefined)

describe('weatherForecast resolver', () => {
  beforeEach(() => mockedGetDailyWeather.mockClear())

  // Verifies the resolver passes coordinates and timezone to the weather service
  it('calls getDailyWeather with lat, lon, and timezone', async () => {
    mockedGetDailyWeather.mockResolvedValue([])
    await callResolver()
    expect(mockedGetDailyWeather).toHaveBeenCalledWith(
      48.85,
      2.35,
      'Europe/Paris',
    )
  })

  // Verifies the resolver wraps the forecast in the WeatherForecast shape the schema requires
  // timezone comes from args (not the service) and daily is the service result
  it('returns { timezone, daily } with timezone from args and daily from service', async () => {
    const mockForecast = [
      {
        date: '2024-07-01',
        maxTemp: 25,
        minTemp: 15,
        snow: 0,
        precipitation: 0,
        windSpeed: 12,
      },
    ]
    mockedGetDailyWeather.mockResolvedValue(mockForecast)

    const result = await callResolver()

    expect(result).toEqual({ timezone: 'Europe/Paris', daily: mockForecast })
  })
})
