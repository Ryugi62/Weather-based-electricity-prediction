'use client'

// 테마를 전역으로 적용하기 위한 Provider

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // NextThemesProvider에 모든 속성을 전달하여 테마 기능 활성화
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
