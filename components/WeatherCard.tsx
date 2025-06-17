import { Thermometer, Droplets, Wind, Cloud } from "lucide-react"
import { type WeatherData } from "@/lib/weather"

interface WeatherCardProps {
  weather: WeatherData
}

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <div className="bg-white p-3 rounded-lg border">
      <div className="text-sm font-medium mb-2">{weather.day}</div>
      <div className="text-xs text-gray-500 mb-2">
        {new Date(weather.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3 text-red-500" />
          <span className="text-xs">{weather.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-blue-500" />
          <span className="text-xs">{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3 text-gray-500" />
          <span className="text-xs">{weather.windSpeed}m/s</span>
        </div>
        <div className="flex items-center gap-1">
          <Cloud className="h-3 w-3 text-gray-400" />
          <span className="text-xs">{weather.cloudCover}%</span>
        </div>
      </div>
    </div>
  )
}
