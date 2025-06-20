import { DailyInput, PredictionResult } from './prediction'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export async function fetchPredictions(
  inputs: DailyInput[],
  latitude?: number,
  longitude?: number,
): Promise<PredictionResult[]> {
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs, latitude, longitude }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch predictions')
  }

  return response.json()
}
