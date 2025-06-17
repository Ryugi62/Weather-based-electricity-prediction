export interface WeatherData {
  date: string
  day: string
  temperature: number
  humidity: number
  windSpeed: number
  cloudCover: number
}

export async function fetchWeatherForecast(
  start: string,
  end: string,
  latitude: number,
  longitude: number,
): Promise<WeatherData[]> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,cloud_cover',
    start_date: start,
    end_date: end,
    timezone: 'Asia/Seoul',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }
  const data = await response.json()

  const result: Record<string, { t: number[]; h: number[]; w: number[]; c: number[] }> = {}
  const times: string[] = data.hourly.time
  for (let i = 0; i < times.length; i++) {
    const date = times[i].split('T')[0]
    if (!result[date]) {
      result[date] = { t: [], h: [], w: [], c: [] }
    }
    result[date].t.push(data.hourly.temperature_2m[i])
    result[date].h.push(data.hourly.relative_humidity_2m[i])
    result[date].w.push(data.hourly.wind_speed_10m[i])
    result[date].c.push(data.hourly.cloud_cover[i])
  }
  return Object.keys(result).map((date, index) => {
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const val = result[date]
    return {
      date,
      day: `+${index + 1}일차`,
      temperature: Math.round(avg(val.t)),
      humidity: Math.round(avg(val.h)),
      windSpeed: Math.round(avg(val.w)),
      cloudCover: Math.round(avg(val.c)),
    }
  })
}
