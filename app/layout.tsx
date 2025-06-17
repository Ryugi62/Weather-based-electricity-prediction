import type { Metadata } from 'next'
import './globals.css'

// 모든 페이지에 공통으로 적용되는 레이아웃

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

// 기본 SEO 메타데이터 정의

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // html 및 body 태그 래핑
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
