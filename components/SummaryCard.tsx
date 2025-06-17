import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryCardProps {
  title: string
  value: React.ReactNode
  subtitle?: string
  className?: string
}

export function SummaryCard({ title, value, subtitle, className }: SummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {value}
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
