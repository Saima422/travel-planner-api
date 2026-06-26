import axios from 'axios'
import { searchCity, getDailyWeather } from '../../src/services/openMeteo'

jest.mock('axios')
const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>

beforeEach(() => mockedAxiosGet.mockClear())

describe('searchCity', () => {
  // Verifies that Open-Meteo field names are correctly mapped to the City type
  // latitude/longitude/country_code are renamed — a mismatch here causes silent undefined fields
  it('maps API field names to City type correctly', async () => {
    mockedAxiosGet.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            name: 'Paris',
            latitude: 48.85,
            longitude: 2.35,
            timezone: 'Europe/Paris',
            country: 'France',
            country_code: 'FR',
            elevation: 35,
          },
        ],
      },
    })

    const result = await searchCity('Paris')

    expect(result[0]).toEqual({
      id: 1,
      name: 'Paris',
      lat: 48.85,
      lon: 2.35,
      timezone: 'Europe/Paris',
      country: 'France',
      countryCode: 'FR',
      elevation: 35,
    })
  })

  // Verifies graceful handling when Open-Meteo returns no results (e.g. obscure city name)
  it('returns [] when results key is missing from response', async () => {
    mockedAxiosGet.mockResolvedValue({ data: {} })
    const result = await searchCity('unknowncity')
    expect(result).toEqual([])
  })

  // Verifies the full result set is returned, not just the first item
  it('returns all results from the API response', async () => {
    mockedAxiosGet.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            name: 'London',
            latitude: 51.5,
            longitude: -0.1,
            timezone: 'Europe/London',
            country: 'UK',
            country_code: 'GB',
            elevation: 10,
          },
          {
            id: 2,
            name: 'London',
            latitude: 42.9,
            longitude: -81.2,
            timezone: 'America/Toronto',
            country: 'Canada',
            country_code: 'CA',
            elevation: 278,
          },
        ],
      },
    })

    const result = await searchCity('London')
    expect(result).toHaveLength(2)
  })
})

describe('getDailyWeather', () => {
  const mockWeatherResponse = {
    data: {
      daily: {
        time: ['2024-07-01', '2024-07-02'],
        temperature_2m_max: [25.0, 28.0],
        temperature_2m_min: [15.0, 17.0],
        precipitation_sum: [0.0, 1.5],
        snowfall_sum: [0.0, 0.0],
        windspeed_10m_max: [12.0, 18.0],
      },
    },
  }

  // Verifies Open-Meteo field names are mapped to DailyForecast correctly
  // windspeed_10m_max → windSpeed, snowfall_sum → snow, precipitation_sum → precipitation
  it('maps parallel array fields to DailyForecast type correctly', async () => {
    mockedAxiosGet.mockResolvedValue(mockWeatherResponse)

    const result = await getDailyWeather(48.85, 2.35, 'Europe/Paris')

    expect(result[0]).toEqual({
      date: '2024-07-01',
      maxTemp: 25.0,
      minTemp: 15.0,
      snow: 0.0,
      precipitation: 0.0,
      windSpeed: 12.0,
    })
  })

  // Verifies graceful handling when the daily block is absent from the API response
  it('returns [] when daily data is missing from response', async () => {
    mockedAxiosGet.mockResolvedValue({ data: {} })
    const result = await getDailyWeather(48.85, 2.35, 'Europe/Paris')
    expect(result).toEqual([])
  })

  // Verifies index alignment: time[1] must map to result[1], not shuffled
  // Parallel arrays only make sense if indexes are kept in sync
  it('aligns indexes correctly across parallel arrays', async () => {
    mockedAxiosGet.mockResolvedValue(mockWeatherResponse)

    const result = await getDailyWeather(48.85, 2.35, 'Europe/Paris')

    expect(result[1].date).toBe('2024-07-02')
    expect(result[1].maxTemp).toBe(28.0)
    expect(result[1].windSpeed).toBe(18.0)
  })
})
