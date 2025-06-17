import { NextRequest, NextResponse } from 'next/server'
import {
  predictEnergyConsumption,
  type DailyInput,
} from '@/lib/prediction'
import { fetchWeatherForecast } from '@/lib/weather'

const DEFAULT_LAT = Number(process.env.WEATHER_LATITUDE ?? '37.5665')
const DEFAULT_LON = Number(process.env.WEATHER_LONGITUDE ?? '126.9780')

export async function POST(request: NextRequest) {
  const { inputs, latitude, longitude } = (await request.json()) as {
    inputs: DailyInput[]
    latitude?: number
    longitude?: number
  }

  const lat = latitude ?? DEFAULT_LAT
  const lon = longitude ?? DEFAULT_LON
  const start = inputs[0].date
  const end = inputs[inputs.length - 1].date

  const weather = await fetchWeatherForecast(start, end, lat, lon)
  const results = predictEnergyConsumption(inputs, weather)
  return NextResponse.json(results)
}
