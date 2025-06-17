import { NextRequest, NextResponse } from "next/server";
import { type DailyInput, type PredictionResult } from "@/lib/prediction";
import { fetchWeatherForecast } from "@/lib/weather";
import { spawn } from "child_process";
import path from "path";

const DEFAULT_LAT = Number(process.env.WEATHER_LATITUDE ?? "37.5665");
const DEFAULT_LON = Number(process.env.WEATHER_LONGITUDE ?? "126.9780");

export async function POST(request: NextRequest) {
  const { inputs, latitude, longitude } = (await request.json()) as {
    inputs: DailyInput[];
    latitude?: number;
    longitude?: number;
  };

  const lat = latitude ?? DEFAULT_LAT;
  const lon = longitude ?? DEFAULT_LON;
  const start = inputs[0].date;
  const end = inputs[inputs.length - 1].date;

  const weather = await fetchWeatherForecast(start, end, lat, lon);

  const rows = inputs.map((input, idx) => {
    const w = weather[idx];
    return [

      w.temperature,
      w.windSpeed,
      w.humidity,
      w.cloudCover,
      Number(input.targetProduction),
    ];
  });

  const scriptPath = path.join(process.cwd(), "scripts", "predict.py");
  const py = spawn("python3", [scriptPath], { cwd: process.cwd() });

  const payload = JSON.stringify({ inputs: rows });
  py.stdin.write(payload);
  py.stdin.end();

  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    py.stdout.on("data", (data) => stdout.push(data));
    py.stderr.on("data", (data) => stderr.push(data));
    py.on("error", reject);
    py.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString() || `exit code ${code}`));
      } else {
        resolve();
      }
    });
  });

  const { predictions } = JSON.parse(Buffer.concat(stdout).toString()) as {
    predictions: number[];
  };

  const results: PredictionResult[] = inputs.map((input, idx) => {
    const w = weather[idx];
    const predicted = Math.round(predictions[idx]);
    const target = Number(input.targetProduction);
    const efficiency = Number((predicted / Math.max(target, 1)).toFixed(2));

    return {
      date: input.date,
      day: input.day,
      targetProduction: target,
      predictedConsumption: predicted,
      weather: w,
      efficiency,
    };
  });

  return NextResponse.json(results);
}
