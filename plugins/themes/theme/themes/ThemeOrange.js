/** @type {import('@runeya/common-typings').Theme[]} */
module.exports = [{
  public: true,
  name: 'Dark Orange',
  group: 'Dark',
  base: 'dark',
  preview: {
    background: { backgroundColor: '#2b2d31' },
    foreground1: { backgroundColor: 'rgb(251, 146, 60)' },
    foreground2: { backgroundColor: 'rgb(251, 113, 133)' },
    foreground3: { backgroundColor: 'rgb(34, 197, 94)' },
    foreground4: { backgroundColor: 'rgb(59, 130, 246)' },
  },
  rules: {
    system: {
      // Primary - Orange theme
      primary50: '#fff7ed',
      primary100: '#ffedd5',
      primary200: '#fed7aa',
      primary300: '#fdba74',
      primary400: '#fb923c',
      primary500: 'rgb(251, 146, 60)', // Main orange
      primary600: '#ea580c',
      primary700: '#c2410c',
      primary800: '#9a3412',
      primary900: '#7c2d12',
      primary950: '#431407',

      // Secondary - Pink theme  
      secondary50: '#fff1f2',
      secondary100: '#ffe4e6',
      secondary200: '#fecdd3',
      secondary300: '#fda4af',
      secondary400: '#fb7185',
      secondary500: 'rgb(251, 113, 133)', // Main pink
      secondary600: '#e11d48',
      secondary700: '#be123c',
      secondary800: '#9f1239',
      secondary900: '#881337',
      secondary950: '#4c0519',

      // Tertiary - Green theme
      tertiary50: '#f0fdf4',
      tertiary100: '#dcfce7',
      tertiary200: '#bbf7d0',
      tertiary300: '#86efac',
      tertiary400: '#4ade80',
      tertiary500: 'rgb(34, 197, 94)', // Main green
      tertiary600: '#16a34a',
      tertiary700: '#15803d',
      tertiary800: '#166534',
      tertiary900: '#14532d',
      tertiary950: '#052e16',
    },
  },
}, {
  public: true,
  name: 'Light Orange',
  group: 'Light',
  base: 'light',
  preview: {
    background: { backgroundColor: '#f2f4f7' },
    foreground1: { backgroundColor: 'rgb(251, 146, 60)' },
    foreground2: { backgroundColor: 'rgb(251, 113, 133)' },
    foreground3: { backgroundColor: 'rgb(34, 197, 94)' },
    foreground4: { backgroundColor: 'rgb(59, 130, 246)' },
  },
  rules: {
    system: {
      // Primary - Orange theme
      primary50: '#fff7ed',
      primary100: '#ffedd5',
      primary200: '#fed7aa',
      primary300: '#fdba74',
      primary400: '#fb923c',
      primary500: 'rgb(251, 146, 60)', // Main orange
      primary600: '#ea580c',
      primary700: '#c2410c',
      primary800: '#9a3412',
      primary900: '#7c2d12',
      primary950: '#431407',

      // Secondary - Pink theme  
      secondary50: '#fff1f2',
      secondary100: '#ffe4e6',
      secondary200: '#fecdd3',
      secondary300: '#fda4af',
      secondary400: '#fb7185',
      secondary500: 'rgb(251, 113, 133)', // Main pink
      secondary600: '#e11d48',
      secondary700: '#be123c',
      secondary800: '#9f1239',
      secondary900: '#881337',
      secondary950: '#4c0519',

      // Tertiary - Green theme
      tertiary50: '#f0fdf4',
      tertiary100: '#dcfce7',
      tertiary200: '#bbf7d0',
      tertiary300: '#86efac',
      tertiary400: '#4ade80',
      tertiary500: 'rgb(34, 197, 94)', // Main green
      tertiary600: '#16a34a',
      tertiary700: '#15803d',
      tertiary800: '#166534',
      tertiary900: '#14532d',
      tertiary950: '#052e16',
    },
  },
}
]
