import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import type { DailyInput } from '@/lib/prediction'

export async function POST(request: NextRequest) {
  const { inputs } = (await request.json()) as {
    inputs: DailyInput[]
    latitude?: number
    longitude?: number
  }

  const python = spawn('python3', ['scripts/predict.py'])
  python.stdin.end(JSON.stringify({ inputs }))

  let output = ''
  for await (const chunk of python.stdout) {
    output += chunk
  }

  const results = JSON.parse(output)
  return NextResponse.json(results)
}
