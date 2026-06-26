# travel-planner-api

A GraphQL API for a travel planning application built with TypeScript and Apollo Server. It allows consumers to search for cities, retrieve 7-day weather forecasts, and get activity rankings based on forecast conditions.

---

## Architecture

### Overview

The API acts as an orchestration layer between the client and Open Meteo — a free, no-auth-required weather and geolocation API. The server runs on `http://localhost:8000` and exposes three GraphQL queries.

```
Client
  ↓  GraphQL query
Apollo Server (TypeScript)
  ↓  HTTP calls
Open Meteo API (external)
```

### Project Structure

```
travel-planner-api/
  src/
    index.ts                ← server entry point
    schema/
      typeDefs.ts         ← GraphQL SDL schema definition
    resolvers/
      index.ts            ← combines all resolvers
      city.resolver.ts    ← citySuggestions resolver
      weather.resolver.ts ← weatherForecast resolver
      activity.resolver.ts← activityRanking resolver
    services/
      openMeteo.ts        ← all Open Meteo API calls
      activityRanking.ts  ← activity scoring logic
    types/
      index.ts            ← shared TypeScript types
  tests/
    services/
      activityRanking.test.ts ← unit tests for activity scoring logic
      openMeteo.test.ts       ← unit tests for Open Meteo service
    resolvers/
      city.resolver.test.ts
      weather.resolver.test.ts
      activity.resolver.test.ts
  package.json
  tsconfig.json
```

### Technical Choices

**GraphQL + Apollo Server** — chosen because the three queries naturally chain together. The output of `citySuggestions` (lat, lon, timezone, elevation) feeds directly into `weatherForecast` and `activityRanking`. GraphQL allows the client to fetch exactly the fields it needs in a single round trip.

**Open Meteo** — chosen because it requires no API key, has a built-in geocoding endpoint, and returns clean daily forecast data. One base URL covers both city search and weather forecast.

**Separation of concerns** — resolvers are intentionally thin. They receive arguments and delegate to services. All Open Meteo HTTP calls live in `openMeteo.ts` and all scoring logic lives in `activityRanking.ts`. This makes each piece independently testable.

**Shared forecast service** — both `weatherForecast` and `activityRanking` need the same Open Meteo forecast data. Rather than duplicating the API call, both resolvers call the same `getDailyWeather` function from `openMeteo.ts`. This avoids duplication and ensures consistency.

---

## The Three Queries

### 1. `citySuggestions(name: String!): [City!]!`

Calls Open Meteo's geocoding API with a partial or complete city name and returns a list of matching cities. Each city includes `id`, `name`, `country`, `lat`, `lon`, `timezone`, and `elevation` — all fields required by the downstream queries.

### 2. `weatherForecast(lat: Float!, lon: Float!, timezone: String!): WeatherForecast`

Calls Open Meteo's daily forecast API and returns 7 days of weather data. Each day includes max/min temperature, precipitation, snowfall, and wind speed. The `timezone` parameter is passed through from the city to ensure the daily breakdown aligns with local time.

### 3. `activityRanking(lat: Float!, lon: Float!, timezone: String!, elevation: Float!): [ActivityDayRanking!]!`

Internally fetches the 7-day forecast, then runs scoring logic across each day for four activities — skiing, surfing, outdoor sightseeing, and indoor sightseeing. Returns a ranked list per day, each with a score out of 10 and a human-readable reason.

---

## Activity Scoring Logic

Each activity is scored per day using a points-based system. Points are awarded based on weather conditions, then normalised to a 0–10 scale.

### Skiing (max 10 points)

| Condition         | Range      | Points |
| ----------------- | ---------- | ------ |
| Snowfall          | 0cm        | 0      |
|                   | 1–5cm      | 1      |
|                   | 5cm+       | 2      |
| Temperature (max) | Above 5°C  | 0      |
|                   | 0–5°C      | 1      |
|                   | Below 0°C  | 2      |
| Precipitation     | 5mm+       | 0      |
|                   | 1–5mm      | 1      |
|                   | 0–1mm      | 2      |
| Wind speed        | 40km/h+    | 0      |
|                   | 20–40 km/h | 1      |
|                   | 0–20 km/h  | 2      |
| Elevation         | 0–500m     | 0      |
|                   | 500–1000m  | 1      |
|                   | 1000m+     | 2      |

`score = (totalPoints / 10) × 10`

### Surfing (max 10 points)

| Condition         | Range                    | Points |
| ----------------- | ------------------------ | ------ |
| Temperature (max) | Below 10°C or above 30°C | 0      |
|                   | 10–18°C                  | 1      |
|                   | 18–30°C                  | 2      |
| Wind speed        | 0–10 km/h or 50km/h+     | 0      |
|                   | 30–50 km/h               | 1      |
|                   | 10–30 km/h               | 2      |
| Precipitation     | 5mm+                     | 0      |
|                   | 1–5mm                    | 1      |
|                   | 0–1mm                    | 2      |
| Snowfall          | 2cm+                     | 0      |
|                   | 0–2cm                    | 1      |
|                   | 0cm                      | 2      |
| Elevation         | 500m+                    | 0      |
|                   | 100–500m                 | 1      |
|                   | 0–100m                   | 2      |

`score = (totalPoints / 10) × 10`

### Outdoor Sightseeing (max 8 points)

| Condition         | Range                    | Points |
| ----------------- | ------------------------ | ------ |
| Temperature (max) | Below 10°C or above 30°C | 0      |
|                   | 10–15°C                  | 1      |
|                   | 15–30°C                  | 2      |
| Precipitation     | 5mm+                     | 0      |
|                   | 1–5mm                    | 1      |
|                   | 0–1mm                    | 2      |
| Snowfall          | 2cm+                     | 0      |
|                   | 0–2cm                    | 1      |
|                   | 0cm                      | 2      |
| Wind speed        | 40km/h+                  | 0      |
|                   | 20–40 km/h               | 1      |
|                   | 0–20 km/h                | 2      |

`score = (totalPoints / 8) × 10`

### Indoor Sightseeing (baseline 3, max 11 points)

Indoor sightseeing always receives a baseline score of 3 to reflect that it is always a viable option regardless of weather.

| Condition         | Range                    | Points |
| ----------------- | ------------------------ | ------ |
| Baseline          | Always                   | 3      |
| Temperature (max) | 10–30°C                  | 0      |
|                   | Below 10°C or above 30°C | 2      |
| Precipitation     | 0–1mm                    | 0      |
|                   | 1–5mm                    | 1      |
|                   | 5mm+                     | 2      |
| Snowfall          | 0cm                      | 0      |
|                   | 0–2cm                    | 1      |
|                   | 2cm+                     | 2      |
| Wind speed        | 0–20 km/h                | 0      |
|                   | 20–40 km/h               | 1      |
|                   | 40km/h+                  | 2      |

`score = (totalPoints / 11) × 10`

---

## Assumptions

### General

- The API is consumed by a frontend travel planning application. The three queries are designed to chain — city suggestions feed lat, lon, timezone, and elevation into the downstream queries.
- All four activities are always returned in the ranking even if conditions are poor. The score reflects suitability, not availability.

### citySuggestions

1. City suggestions are consumed as a search bar dropdown, so a fixed count of 5 results is sufficient.
2. Users search by city name only. Searching by country name or region is not supported.
3. Results are in English only.
4. The client will always use city suggestions as the entry point before calling the other two queries.

> **Design decision, not an assumption:** The `City` type returns `lat`, `lon`, `timezone`, and `elevation` alongside the name because these fields are required inputs for the downstream queries. This avoids the client needing to make an extra call just to fetch coordinates.

**Potential improvements:**

1. Make `count` configurable — let the client pass in how many results they want instead of hardcoding 5.
2. Add pagination — if the use case extends to a global search page rather than a dropdown.
3. Extend search — allow searching by country name, country code, or region, not just city name.

### weatherForecast

1. Daily forecast granularity is sufficient for travel planning. Hourly data is not needed.
2. 7 days is the right forecast window. This is hardcoded via `forecast_days=7`.
3. The client already has lat, lon, and timezone from the city query before calling this endpoint.
4. One forecast per location — no comparison between multiple cities.

### activityRanking

1. The four activities cover all use cases — no custom activities are supported.
2. Rankings are returned per day across the full 7-day forecast. The client decides which day to display — no server-side date filtering is applied.
3. A date range filter is not currently supported. The API always returns rankings for the next 7 days from today.
4. Elevation is used as a proxy for ski slopes and coastal proximity — it does not confirm terrain or coastline exists.
5. All four activities are always returned even if conditions are poor. The score reflects suitability, not availability.
6. Weather is the only factor considered. Local infrastructure (e.g. whether a ski resort actually exists), cost, crowd levels, and opening hours are not factored in.

---

## Omissions & Tradeoffs

### Skiing — no terrain data

**Current approach:** `elevation` from Open Meteo's geocoding API is used as a proxy. High elevation is treated as an indicator that ski slopes may exist nearby.

**Limitation:** Elevation alone does not confirm the presence of ski resorts. A high-altitude city without slopes (e.g. Lhasa, Tibet) would score well for skiing terrain despite having no accessible slopes.

**Ideal solution:** A points-of-interest or terrain API (e.g. Google Places, OpenStreetMap Overpass) that confirms ski resorts exist within a given radius of the coordinates.

### Surfing — no coastal detection

**Current approach:** Low `elevation` is used as a proxy for coastal proximity. Cities near sea level are assumed more likely to be coastal.

**Limitation:** Many low-elevation inland cities (e.g. Amsterdam, Berlin) would falsely score well for surfing despite having no ocean access. Paris at 46m elevation is a concrete example — it scores well on elevation but has no coastline.

**Ideal solution:** A marine or geography API that confirms whether a city is on a coastline, and ideally returns wave height data for more accurate surfing conditions.

### No wave height data

Open Meteo does not provide wave or ocean data. Wind speed is used as a proxy for wave conditions since wind is the primary driver of wave formation. This is a known simplification.

### No error handling for Open Meteo failures

The current implementation does not handle cases where Open Meteo is unavailable or returns unexpected data. Production-ready error handling with retries and fallback responses would be needed.

### No caching

Every query makes a live HTTP call to Open Meteo. For a production system, forecast data should be cached (e.g. Redis or in-memory) since it changes infrequently and the same coordinates are likely queried repeatedly.

### No pagination for city suggestions

The count of results is hardcoded to 5, which is appropriate for a dropdown. If the use case extended to a full search results page, pagination would be required.

---

## Improvements to the Project

- **Make result count configurable** — expose a `count` argument on `citySuggestions` so the client controls how many results it receives.
- **Add error handling** — graceful errors when Open Meteo is unavailable, with meaningful GraphQL error messages returned to the client.
- **Add caching** — cache forecast responses by coordinates for a reasonable TTL (e.g. 1 hour) to reduce external API calls.
- **Expand search** — allow `citySuggestions` to accept country names or country codes in addition to city names.
- **Add date range filtering** — allow `weatherForecast` and `activityRanking` to accept optional `startDate` and `endDate` arguments so the client can query a specific date range rather than always receiving the next 7 days.
- **Refine scoring with additional Open Meteo fields** — `precipitation_probability_mean` (chance of rain rather than total rainfall) and `visibility_mean` (low visibility is bad for skiing and outdoor sightseeing) would make scores more accurate.
- **Terrain and coastal detection** — integrate a points-of-interest API to confirm whether ski resorts or beaches exist near the queried coordinates, replacing the elevation proxy.
- **Multi-city comparison** — allow the client to compare activity rankings across multiple cities in a single query.
