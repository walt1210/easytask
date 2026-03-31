'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

const ACCENT_COLORS = [
  { value: "orange", light: "oklch(0.65 0.18 45)"  },
  { value: "blue",   light: "oklch(0.55 0.2 240)"  },
  { value: "green",  light: "oklch(0.55 0.18 145)" },
  { value: "purple", light: "oklch(0.55 0.2 290)"  },
  { value: "rose",   light: "oklch(0.6 0.22 10)"   },
  { value: "cyan",   light: "oklch(0.6 0.15 200)"  },
]

const accentScript = `
(function() {
  try {
    var saved = localStorage.getItem('accent-color');
    var colors = ${JSON.stringify(ACCENT_COLORS)};
    if (saved) {
      var color = colors.find(function(c) { return c.value === saved; });
      if (color) {
        document.documentElement.style.setProperty('--primary', color.light);
        document.documentElement.style.setProperty('--ring', color.light);
      }
    }
  } catch(e) {}
})();
`

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: accentScript }} />
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </>
  )
}