import { NextRequest, NextResponse } from 'next/server'
import { generateWeatherData, predictEnergyConsumption, type DailyInput } from '@/lib/prediction'

export async function POST(request: NextRequest) {
  const { inputs } = (await request.json()) as { inputs: DailyInput[] }
  const weather = generateWeatherData(inputs)
  const results = predictEnergyConsumption(inputs, weather)
  return NextResponse.json(results)
}
