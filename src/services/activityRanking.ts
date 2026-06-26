import { ActivityRanking, ActivityType, DailyForecast } from '../types'

type ScoreArgs = [day: DailyForecast, elevation: number]

const calculateSkiingScore = (...args: ScoreArgs): ActivityRanking => {
  const [day, elevation] = args
  let totalScore = 0
  const reasons: string[] = []

  /* --- snowfall score --- */
  // 5cm+ -> heavy snow
  if (day.snow >= 5) {
    totalScore += 2
    reasons.push('Heavy snowfall makes for excellent skiing conditions')
  }
  // 1-5cm -> light snow
  else if (day.snow >= 1) {
    totalScore += 1
    reasons.push('Light snowfall provides some skiing opportunities')
  } else reasons.push('No snowfall makes skiing unlikely')

  /* --- temperature score --- */
  // below 0°C -> freezing
  if (day.maxTemp < 0) {
    totalScore += 2
    reasons.push('Freezing temperatures keep the snow in perfect condition')
  }
  // 0-5°C -> cold
  else if (day.maxTemp <= 5) {
    totalScore += 1
    reasons.push('Cold temperatures are suitable for skiing')
  } else reasons.push('Warm temperatures may cause snow to melt')

  /* --- precipitation score --- */
  // 0-1mm -> dry
  if (day.precipitation < 1) {
    totalScore += 2
    reasons.push('Dry conditions are ideal for skiing')
  }
  // 1-5mm -> light rain
  else if (day.precipitation < 5) {
    totalScore += 1
    reasons.push('Light rain may affect snow quality')
  } else reasons.push('Heavy rain will damage skiing conditions')

  /* --- windspeed score --- */
  // 0-20km/h -> calm
  if (day.windSpeed < 20) {
    totalScore += 2
    reasons.push('Calm winds make for comfortable skiing')
  }
  // 20-40km/h -> moderate
  else if (day.windSpeed <= 40) {
    totalScore += 1
    reasons.push('Moderate winds are acceptable for skiing')
  } else reasons.push('Strong winds make skiing dangerous')

  /* --- elevation score --- */
  // 1000m+ -> alpine
  if (elevation >= 1000) {
    totalScore += 2
    reasons.push('High elevation suggests ski slopes are nearby')
  }
  // 500-1000m -> mid elevation
  else if (elevation >= 500) {
    totalScore += 1
    reasons.push('Moderate elevation may have some ski slopes')
  } else reasons.push('Low elevation makes ski slopes unlikely')

  return {
    activity: ActivityType.SKIING,
    score: (totalScore / 10) * 10,
    reason: reasons.join('. '),
  }
}

const calculateSurfingScore = (...args: ScoreArgs): ActivityRanking => {
  const [day, elevation] = args
  let totalScore = 0
  const reasons: string[] = []

  /* --- temperature score --- */
  // 18-30°C -> ideal
  if (day.maxTemp >= 18 && day.maxTemp <= 30) {
    totalScore += 2
    reasons.push('Warm temperatures are perfect for surfing')
  }
  // 10-18°C -> cool
  else if (day.maxTemp >= 10 && day.maxTemp < 18) {
    totalScore += 1
    reasons.push('Cool but acceptable temperatures for surfing')
  }
  // above 30°C -> too hot
  else if (day.maxTemp > 30)
    reasons.push('Too hot for a comfortable surfing experience')
  else reasons.push('Too cold for a comfortable surfing experience')

  /* --- windspeed score --- */
  // 10-30km/h -> ideal surf wind
  if (day.windSpeed >= 10 && day.windSpeed <= 30) {
    totalScore += 2
    reasons.push('Ideal wind speed for good waves')
  }
  // 30-50km/h -> strong
  else if (day.windSpeed > 30 && day.windSpeed <= 50) {
    totalScore += 1
    reasons.push('Strong winds may create challenging waves')
  } else reasons.push('Wind speed is not suitable for surfing')

  /* --- precipitation score --- */
  // 0-1mm -> dry
  if (day.precipitation < 1) {
    totalScore += 2
    reasons.push('Dry conditions are ideal for surfing')
  }
  // 1-5mm -> light rain
  else if (day.precipitation < 5) {
    totalScore += 1
    reasons.push('Light rain should not affect surfing much')
  } else reasons.push('Heavy rain makes surfing unpleasant')

  /* --- snowfall score --- */
  // 0cm -> no snow
  if (day.snow === 0) {
    totalScore += 2
    reasons.push('No snowfall is ideal for surfing')
  }
  // 0-2cm -> light snow
  else if (day.snow < 2) {
    totalScore += 1
    reasons.push('Light snowfall may affect surfing conditions')
  } else reasons.push('Heavy snowfall makes surfing very unlikely')

  /* --- elevation score --- */
  // 0-100m -> coastal
  if (elevation <= 100) {
    totalScore += 2
    reasons.push('Low elevation suggests a coastal location')
  }
  // 100-500m -> near coast
  else if (elevation <= 500) {
    totalScore += 1
    reasons.push('Moderate elevation, may not be coastal')
  } else reasons.push('High elevation makes a coastal location unlikely')

  return {
    activity: ActivityType.SURFING,
    score: (totalScore / 10) * 10,
    reason: reasons.join('. '),
  }
}

const calculateOutdoorScore = (day: DailyForecast): ActivityRanking => {
  let totalScore = 0
  const reasons: string[] = []

  /* --- temperature score --- */
  // 15-30°C -> ideal
  if (day.maxTemp >= 15 && day.maxTemp <= 30) {
    totalScore += 2
    reasons.push('Comfortable temperatures for outdoor sightseeing')
  }
  // 10-15°C -> cool
  else if (day.maxTemp >= 10 && day.maxTemp < 15) {
    totalScore += 1
    reasons.push('Cool but manageable temperatures for being outside')
  }
  // above 30°C -> too hot
  else if (day.maxTemp > 30)
    reasons.push('Too hot for comfortable outdoor sightseeing')
  else reasons.push('Temperatures are not comfortable for outdoor sightseeing')

  /* --- precipitation score --- */
  // 0-1mm -> dry
  if (day.precipitation < 1) {
    totalScore += 2
    reasons.push('Dry conditions are perfect for exploring outdoors')
  }
  // 1-5mm -> light rain
  else if (day.precipitation < 5) {
    totalScore += 1
    reasons.push('Light rain may affect outdoor sightseeing')
  } else reasons.push('Heavy rain makes outdoor sightseeing unpleasant')

  /* --- snowfall score --- */
  // 0cm -> no snow
  if (day.snow === 0) {
    totalScore += 2
    reasons.push('No snowfall makes outdoor exploration easy')
  }
  // 0-2cm -> light snow
  else if (day.snow < 2) {
    totalScore += 1
    reasons.push('Light snowfall may make sightseeing tricky')
  } else reasons.push('Heavy snowfall makes outdoor sightseeing difficult')

  /* --- windspeed score --- */
  // 0-20km/h -> calm
  if (day.windSpeed < 20) {
    totalScore += 2
    reasons.push('Calm winds make for a pleasant outdoor experience')
  }
  // 20-40km/h -> moderate
  else if (day.windSpeed <= 40) {
    totalScore += 1
    reasons.push('Moderate winds are acceptable for sightseeing')
  } else reasons.push('Strong winds make outdoor sightseeing uncomfortable')

  return {
    activity: ActivityType.OUTDOOR_SIGHTSEEING,
    score: (totalScore / 8) * 10,
    reason: reasons.join('. '),
  }
}

const calculateIndoorScore = (day: DailyForecast): ActivityRanking => {
  let totalScore = 3 // baseline
  const reasons: string[] = []

  /* --- temperature score --- */
  // below 10°C or above 30°C -> extreme weather drives indoors
  if (day.maxTemp < 10 || day.maxTemp > 30) {
    totalScore += 2
    reasons.push('Extreme temperatures make indoor activities more appealing')
  } else
    reasons.push(
      'Comfortable temperatures outside but indoor activities are always an option',
    )

  /* --- precipitation score --- */
  // 5mm+ -> heavy rain
  if (day.precipitation >= 5) {
    totalScore += 2
    reasons.push('Heavy rain makes staying indoors a great choice')
  }
  // 1-5mm -> light rain
  else if (day.precipitation >= 1) {
    totalScore += 1
    reasons.push('Light rain is a good reason to explore indoors')
  } else
    reasons.push('No rain but indoor attractions are always worth visiting')

  /* --- snowfall score --- */
  // 2cm+ -> heavy snow
  if (day.snow >= 2) {
    totalScore += 2
    reasons.push('Heavy snowfall makes indoor activities the safer choice')
  }
  // 0-2cm -> light snow
  else if (day.snow > 0) {
    totalScore += 1
    reasons.push('Light snowfall suggests indoor activities are preferable')
  } else reasons.push('No snowfall but indoor sightseeing is always enjoyable')

  /* --- windspeed score --- */
  // 40km/h+ -> strong wind
  if (day.windSpeed > 40) {
    totalScore += 2
    reasons.push('Strong winds make it safer to stay indoors')
  }
  // 20-40km/h -> moderate
  else if (day.windSpeed >= 20) {
    totalScore += 1
    reasons.push('Moderate winds are a good reason to head indoors')
  } else
    reasons.push('Calm winds but indoor attractions are always a great option')

  return {
    activity: ActivityType.INDOOR_SIGHTSEEING,
    score: (totalScore / 11) * 10,
    reason: reasons.join('. '),
  }
}

export const calculateActivityRank = (...args: ScoreArgs) => {
  const [day] = args

  const skiingScore = calculateSkiingScore(...args)
  const surfingScore = calculateSurfingScore(...args)
  const outDoorScore = calculateOutdoorScore(day)
  const indoorScore = calculateIndoorScore(day)

  const scores = [skiingScore, surfingScore, outDoorScore, indoorScore]
  const sortedScores = scores.sort((a, b) => b?.score - a?.score)
  return sortedScores
}
