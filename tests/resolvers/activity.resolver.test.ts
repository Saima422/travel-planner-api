import { getDailyWeather } from '../../src/services/openMeteo'
import { calculateActivityRank } from '../../src/services/activityRanking'
import { activityResolver } from '../../src/resolvers/activity.resolver'
import { DailyForecast } from '../../src/types'

jest.mock('../../src/services/openMeteo')
jest.mock('../../src/services/activityRanking')

const mockedGetDailyWeather = getDailyWeather as jest.MockedFunction<
  typeof getDailyWeather
>
const mockedCalculateActivityRank =
  calculateActivityRank as jest.MockedFunction<typeof calculateActivityRank>

const args = { lat: 48.85, lon: 2.35, timezone: 'Europe/Paris', elevation: 35 }
const callResolver = () =>
  activityResolver.Query.activityRanking(undefined, args, undefined)

const makeDay = (date: string): DailyForecast => ({
  date,
  maxTemp: 20,
  minTemp: 10,
  snow: 0,
  precipitation: 0,
  windSpeed: 10,
})

describe('activityRanking resolver', () => {
  beforeEach(() => {
    mockedGetDailyWeather.mockClear()
    mockedCalculateActivityRank.mockClear()
  })

  // Verifies elevation is passed from args to the scorer — not from the weather service
  // elevation is a city property (from citySuggestions), not part of the daily forecast
  it('passes each day and elevation from args to calculateActivityRank', async () => {
    const day1 = makeDay('2024-07-01')
    mockedGetDailyWeather.mockResolvedValue([day1])
    mockedCalculateActivityRank.mockReturnValue([])

    await callResolver()

    expect(mockedCalculateActivityRank).toHaveBeenCalledWith(day1, 35)
  })

  // Verifies the resolver builds the ActivityDayRanking shape: { date, ranks } per day
  it('returns one entry per day with correct date and ranks fields', async () => {
    const day1 = makeDay('2024-07-01')
    const day2 = makeDay('2024-07-02')
    const mockRanks = [{ activity: 'SKIING', score: 8, reason: '' }] as any
    mockedGetDailyWeather.mockResolvedValue([day1, day2])
    mockedCalculateActivityRank.mockReturnValue(mockRanks)

    const result = await callResolver()

    expect(result).toHaveLength(2)
    expect(result![0]).toEqual({ date: '2024-07-01', ranks: mockRanks })
    expect(result![1]).toEqual({ date: '2024-07-02', ranks: mockRanks })
  })

  // Verifies the resolver handles an empty forecast gracefully without calling the scorer
  it('returns [] and does not call calculateActivityRank when weather is empty', async () => {
    mockedGetDailyWeather.mockResolvedValue([])

    const result = await callResolver()

    expect(result).toEqual([])
    expect(mockedCalculateActivityRank).not.toHaveBeenCalled()
  })
})
