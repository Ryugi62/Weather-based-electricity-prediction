"use client";

/**
 * 제품 생산 전력 예측 대시보드 메인 페이지
 * 다양한 입력 방법을 제공하고 예측 결과를 시각화합니다.
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Zap,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  Copy,
  Plus,
  Minus,
  Crown,
} from "lucide-react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type DailyInput, type PredictionResult } from "@/lib/prediction";
import { type WeatherData } from "@/lib/weather";
import { fetchPredictions } from "@/lib/api";
import { createInitialInputs, applyInputPattern } from "@/lib/input-utils";
import { WeatherCard } from "@/components/WeatherCard";
import { SummaryCard } from "@/components/SummaryCard";
const chartConfig = {
  targetProduction: { label: "목표 생산량", color: "hsl(var(--chart-1))" },
  predictedConsumption: { label: "예측 사용량", color: "hsl(var(--chart-2))" },
  efficiency: { label: "제품당 사용량(kWh)", color: "hsl(var(--chart-3))" },
};

const REGIONS = {
  서울: { lat: 37.5665, lon: 126.978 },
  경기: { lat: 37.436, lon: 127.55 },
  인천: { lat: 37.4563, lon: 126.7052 },
  강원: { lat: 37.8228, lon: 128.1555 },
  충청: { lat: 36.5184, lon: 127.119 },
  전라: { lat: 35.7175, lon: 127.153 },
  경상: { lat: 36.4919, lon: 128.8889 },
  제주: { lat: 33.489, lon: 126.4983 },
} as const;

type RegionKey = keyof typeof REGIONS;

export default function EnergyPredictionDashboard() {
  const [dailyInputs, setDailyInputs] =
    useState<DailyInput[]>(createInitialInputs);

  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [bulkValue, setBulkValue] = useState("");
  const [region, setRegion] = useState<RegionKey>("서울");

  // 입력값 업데이트
  const updateDailyInput = (index: number, value: string) => {
    setDailyInputs((inputs) =>
      inputs.map((item, idx) =>
        idx === index ? { ...item, targetProduction: value } : item
      )
    );
  };

  // 일괄 적용
  const applyBulkValue = () => {
    if (!bulkValue) return;
    setDailyInputs((inputs) =>
      inputs.map((input) => ({ ...input, targetProduction: bulkValue }))
    );
  };

  // 패턴 적용
  const applyPattern = (
    pattern: "weekday-weekend" | "increasing" | "decreasing"
  ) => {
    setDailyInputs(applyInputPattern(dailyInputs, pattern));
  };

  // 값 복사
  const copyValue = (fromIndex: number, toIndex: number) => {
    setDailyInputs((inputs) =>
      inputs.map((item, idx) =>
        idx === toIndex
          ? { ...item, targetProduction: inputs[fromIndex].targetProduction }
          : item
      )
    );
  };

  // 값 조정 (+ / -)
  const adjustValue = (index: number, delta: number) => {
    setDailyInputs((inputs) =>
      inputs.map((item, idx) => {
        if (idx !== index) return item;
        const currentValue = Number(item.targetProduction) || 0;
        const newValue = Math.max(0, currentValue + delta);
        return { ...item, targetProduction: newValue.toString() };
      })
    );
  };

  const handlePredict = async () => {
    const hasAllInputs = dailyInputs.every(
      (input) => input.targetProduction.trim() !== ""
    );
    if (!hasAllInputs) return;

    setLoading(true);

    try {
      const { lat, lon } = REGIONS[region];
      const results = await fetchPredictions(dailyInputs, lat, lon);
      setPredictions(results);
      setWeatherData(results.map((r) => r.weather));
    } catch (error) {
      console.error("Failed to fetch predictions", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = dailyInputs.every(
    (input) => input.targetProduction.trim() !== ""
  );
  const totalTarget = predictions.reduce(
    (sum, p) => sum + p.targetProduction,
    0
  );
  const totalPredicted = predictions.reduce(
    (sum, p) => sum + p.predictedConsumption,
    0
  );
  const averageEfficiency = predictions.length
    ? Number(
        (
          predictions.reduce((sum, p) => sum + p.efficiency, 0) /
          predictions.length
        ).toFixed(2)
      )
    : 0;
  const diff = predictions.reduce(
    (sum, p) => sum + (p.targetProduction - p.predictedConsumption),
    0
  );
  const bestDay = predictions.reduce<PredictionResult | null>((best, p) => {
    if (!best) return p;
    return p.efficiency < best.efficiency ? p : best;
  }, null);
  const bestIndex = bestDay ? predictions.indexOf(bestDay) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            7일간 제품 생산 전력 예측 시스템
          </h1>
          <p className="text-gray-600">
            각 날짜별 목표 제품 생산량과 기상 데이터를 기반으로 내일부터 7일간
            전력 사용량을 예측합니다
          </p>
        </div>

        {/* 개선된 입력 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              7일간 목표 제품 생산량 입력
            </CardTitle>
            <CardDescription>
              빠르고 쉬운 입력을 위한 다양한 방법을 제공합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="region">지역 선택</Label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionKey)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                {Object.keys(REGIONS).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <Tabs defaultValue="quick" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="quick">빠른 입력</TabsTrigger>
                <TabsTrigger value="pattern">패턴 적용</TabsTrigger>
                <TabsTrigger value="manual">개별 입력</TabsTrigger>
              </TabsList>

              {/* 빠른 입력 탭 */}
              <TabsContent value="quick" className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="bulk-input">
                      모든 날짜에 동일한 값 적용
                    </Label>
                    <Input
                      id="bulk-input"
                      type="number"
                      placeholder="예: 1000"
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                    />
                  </div>
                  <Button onClick={applyBulkValue} disabled={!bulkValue}>
                    전체 적용
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => applyPattern("weekday-weekend")}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium">평일/주말 패턴</div>
                    <div className="text-sm text-gray-500">
                      평일 1200개, 주말 800개
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => applyPattern("increasing")}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium">점진적 증가</div>
                    <div className="text-sm text-gray-500">1000 → 1600개</div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => applyPattern("decreasing")}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium">점진적 감소</div>
                    <div className="text-sm text-gray-500">1600 → 1000개</div>
                  </Button>
                </div>
              </TabsContent>

              {/* 패턴 적용 탭 */}
              <TabsContent value="pattern" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">사전 정의된 패턴</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const pattern = [
                            1200, 1100, 1300, 1000, 1400, 900, 800,
                          ];
                          const newInputs = [...dailyInputs];
                          pattern.forEach((value, index) => {
                            if (newInputs[index]) {
                              newInputs[index].targetProduction =
                                value.toString();
                            }
                          });
                          setDailyInputs(newInputs);
                        }}
                        className="w-full justify-start"
                      >
                        일반적인 주간 패턴
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const pattern = [
                            1500, 1600, 1700, 1800, 1900, 1200, 1000,
                          ];
                          const newInputs = [...dailyInputs];
                          pattern.forEach((value, index) => {
                            if (newInputs[index]) {
                              newInputs[index].targetProduction =
                                value.toString();
                            }
                          });
                          setDailyInputs(newInputs);
                        }}
                        className="w-full justify-start"
                      >
                        고효율 생산 패턴
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">현재 입력값 미리보기</h4>
                    <div className="space-y-1 text-sm">
                      {dailyInputs.map((input) => (
                        <div key={input.date} className="flex justify-between">
                          <span>{input.day}</span>
                          <span className="font-mono">
                            {input.targetProduction || "0"}개
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* 개별 입력 탭 */}
              <TabsContent value="manual" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {dailyInputs.map((input, index) => (
                    <div key={input.date} className="space-y-2">
                      <Label
                        htmlFor={`day-${index}`}
                        className="text-sm font-medium"
                      >
                        {input.day}
                      </Label>
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(input.date).toLocaleDateString("ko-KR")}
                      </div>

                      <div className="flex gap-1">
                        <Input
                          id={`day-${index}`}
                          type="number"
                          placeholder="1000"
                          value={input.targetProduction}
                          onChange={(e) =>
                            updateDailyInput(index, e.target.value)
                          }
                          className="flex-1"
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustValue(index, 100)}
                            className="h-5 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustValue(index, -100)}
                            className="h-5 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyValue(index - 1, index)}
                            className="flex-1 h-6 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            이전값
                          </Button>
                        )}
                        {index < dailyInputs.length - 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyValue(index, index + 1)}
                            className="flex-1 h-6 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            다음에
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handlePredict}
                disabled={!isFormValid || loading}
                className="px-8 py-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    예측 분석 중...
                  </>
                ) : (
                  "7일간 사용량 예측하기"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 기상 데이터 미리보기 */}
        {weatherData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>7일간 기상 예보</CardTitle>
              <CardDescription>예측에 사용될 기상 조건들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {weatherData.map((weather) => (
                  <WeatherCard key={weather.date} weather={weather} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 예측 결과 차트들 */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>생산량 vs 예측 사용량</CardTitle>
                <CardDescription>
                  7일간 목표 생산량과 예측 사용량 비교
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="targetProduction"
                        fill="var(--color-targetProduction)"
                        name="목표 생산량"
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedConsumption"
                        stroke="var(--color-predictedConsumption)"
                        strokeWidth={3}
                        name="예측 사용량"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>일별 제품당 사용량</CardTitle>
                <CardDescription>
                  낮을수록 효율이 좋은 값 (kWh/개)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="efficiency"
                        fill="var(--color-efficiency)"
                        name="제품당 사용량"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 상세 예측 결과 테이블 */}
        {predictions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>상세 예측 결과</CardTitle>
              <CardDescription>날짜별 상세 분석 결과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">날짜</th>
                      <th className="text-left p-3">일차</th>
                      <th className="text-left p-3">목표 생산량</th>
                      <th className="text-left p-3">예측 사용량</th>
                      <th className="text-left p-3">제품당 사용량</th>
                      <th className="text-left p-3">온도</th>
                      <th className="text-left p-3">습도</th>
                      <th className="text-left p-3">풍속</th>
                      <th className="text-left p-3">구름량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((prediction, index) => (
                      <tr
                        key={prediction.date}
                        className={`border-b hover:bg-gray-50 ${
                          index === bestIndex ? "bg-yellow-50" : ""
                        }`}
                      >
                        <td className="p-3 text-sm">
                          {new Date(prediction.date).toLocaleDateString(
                            "ko-KR"
                          )}
                        </td>
                        <td className="p-3 font-medium">{prediction.day}</td>
                        <td className="p-3 text-blue-600 font-semibold">
                          {prediction.targetProduction.toLocaleString()}개
                        </td>
                        <td className="p-3 text-green-600 font-semibold">
                          {prediction.predictedConsumption.toLocaleString()} kWh
                        </td>
                        <td className="p-3">
                          <span className="font-bold flex items-center gap-1">
                            {prediction.efficiency.toFixed(2)} kWh/개
                            {index === bestIndex && (
                              <Crown className="h-4 w-4 text-orange-500" />
                            )}
                          </span>
                        </td>
                        <td className="p-3">
                          {prediction.weather.temperature}°C
                        </td>
                        <td className="p-3">{prediction.weather.humidity}%</td>
                        <td className="p-3">
                          {prediction.weather.windSpeed}m/s
                        </td>
                        <td className="p-3">
                          {prediction.weather.cloudCover}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 요약 통계 */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard
              title="총 목표 생산량"
              value={
                <div className="text-2xl font-bold text-blue-600">
                  {totalTarget.toLocaleString()}개
                </div>
              }
              subtitle="7일 총합"
            />
            <SummaryCard
              title="총 예상 사용량"
              value={
                <div className="text-2xl font-bold text-green-600">
                  {totalPredicted.toLocaleString()} kWh
                </div>
              }
              subtitle="7일 총합"
            />
            <SummaryCard
              title="평균 제품당 사용량"
              value={
                <div className="text-2xl font-bold text-purple-600">
                  {averageEfficiency.toFixed(2)} kWh/개
                </div>
              }
              subtitle="7일 평균"
            />
            {bestDay && (
              <SummaryCard
                title="최고 효율일"
                value={
                  <div className="text-2xl font-bold text-orange-600">
                    {bestDay.day}
                  </div>
                }
                subtitle={`${bestDay.efficiency.toFixed(2)} kWh/개`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
