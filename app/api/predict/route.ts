import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import type { DailyInput } from '@/lib/prediction'
import { generateWeatherData } from '@/lib/prediction'

export async function POST(request: NextRequest) {
  const { inputs } = (await request.json()) as {
    inputs: DailyInput[]
    latitude?: number
    longitude?: number
  }

  // Generate dummy weather data and build feature vectors in the order
  // [production, temperature, wind speed, humidity, precipitation].
  const weather = generateWeatherData(inputs)
  const features = inputs.map((input, idx) => [
    Number(input.targetGeneration),
    weather[idx].temperature,
    weather[idx].windSpeed,
    weather[idx].humidity,
    weather[idx].cloudCover,
  ])

  const python = spawn('python3', ['scripts/predict.py'])
  python.stdin.end(JSON.stringify({ inputs: features }))

  let output = ''
  for await (const chunk of python.stdout) {
    output += chunk
  }

  const { predictions } = JSON.parse(output) as { predictions: number[] }

  const results = inputs.map((input, idx) => {
    const predicted = predictions[idx]
    const generation = Number(input.targetGeneration)
    const efficiency = Math.round((generation / predicted) * 100)
    return {
      date: input.date,
      day: input.day,
      targetGeneration: generation,
      predictedConsumption: predicted,
      weather: weather[idx],
      efficiency,
    }
  })

  return NextResponse.json(results)
}
