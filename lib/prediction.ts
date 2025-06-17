/**
 * 예측 로직과 관련된 타입과 함수 모음
 * 모든 주석은 협업을 위해 한글로 작성되었습니다.
 */

import { type WeatherData } from "./weather";

// 사용자가 입력한 하루치 목표 생산량 정보
export interface DailyInput {
  date: string;
  day: string;
  targetProduction: string;
}

// 예측 결과 구조
export interface PredictionResult {
  date: string;
  day: string;
  targetProduction: number;
  predictedConsumption: number;
  weather: WeatherData;
  efficiency: number;
}

/**
 * 임의의 기상 데이터를 생성
 * 실제 서비스에서는 외부 API를 호출하도록 교체 가능
 */
export function generateWeatherData(inputs: DailyInput[]): WeatherData[] {
  return inputs.map((input, index) => ({
    date: input.date,
    day: `+${index + 1}일차`,
    temperature: Math.round(15 + Math.random() * 15),
    humidity: Math.round(40 + Math.random() * 40),
    windSpeed: Math.round(5 + Math.random() * 15),
    cloudCover: Math.round(Math.random() * 100),
  }));
}

// 온도에 따른 소비량 조정
function applyTemperatureFactor(
  consumption: number,
  temperature: number
): number {
  if (temperature < 18 || temperature > 25) return consumption * 1.2;
  if (temperature >= 20 && temperature <= 23) return consumption * 0.95;
  return consumption;
}

// 습도에 따른 소비량 조정
function applyHumidityFactor(consumption: number, humidity: number): number {
  if (humidity > 70) return consumption * 1.15;
  if (humidity < 50) return consumption * 0.98;
  return consumption;
}

// 풍속에 따른 소비량 조정
function applyWindFactor(consumption: number, windSpeed: number): number {
  if (windSpeed > 12) return consumption * 0.92;
  if (windSpeed < 5) return consumption * 1.03;
  return consumption;
}

// 구름량에 따른 소비량 조정
function applyCloudFactor(consumption: number, cloudCover: number): number {
  if (cloudCover > 70) return consumption * 1.08;
  if (cloudCover < 30) return consumption * 0.95;
  return consumption;
}

// 요일에 따른 가중치 계산
function getWeekdayMultiplier(date: string): number {
  const day = new Date(date).getDay();
  if (day === 0 || day === 6) return 0.75;
  if (day === 1 || day === 5) return 1.1;
  return 1.0;
}

/**
 * 목표 생산량과 기상 데이터를 이용하여 전력 사용량을 예측
 */
export function predictEnergyConsumption(
  inputs: DailyInput[],
  weather: WeatherData[]
): PredictionResult[] {
  return inputs.map((input, index) => {
    const w = weather[index];
    const generation = Number(input.targetProduction);
    let consumption = generation * 0.85;
    consumption = applyTemperatureFactor(consumption, w.temperature);
    consumption = applyHumidityFactor(consumption, w.humidity);
    consumption = applyWindFactor(consumption, w.windSpeed);
    consumption = applyCloudFactor(consumption, w.cloudCover);

    const multiplier = getWeekdayMultiplier(input.date);
    const predictedConsumption = Math.round(
      consumption * multiplier * (0.9 + Math.random() * 0.2)
    );

    const efficiency = Math.round((generation / predictedConsumption) * 100);

    return {
      date: input.date,
      day: input.day,
      targetProduction: generation,
      predictedConsumption,
      weather: w,
      efficiency,
    };
  });
}
