/** @type {import('@runeya/common-typings').Theme[]} */
module.exports = [{
  public: true,
  name: 'Dark Yellow',
  group: 'Dark',
  base: 'dark',
  preview: {
    background: { backgroundColor: '#2b2d31' },
    foreground1: { backgroundColor: 'rgb(250, 204, 21)' },
    foreground2: { backgroundColor: 'rgb(248, 113, 113)' },
    foreground3: { backgroundColor: 'rgb(34, 197, 94)' },
    foreground4: { backgroundColor: 'rgb(59, 130, 246)' },
  },
  rules: {
    system: {
      // Primary - Yellow theme
      primary50: '#fefce8',
      primary100: '#fef9c3',
      primary200: '#fef08a',
      primary300: '#fde047',
      primary400: '#facc15',
      primary500: 'rgb(250, 204, 21)', // Main yellow
      primary600: '#ca8a04',
      primary700: '#a16207',
      primary800: '#854d0e',
      primary900: '#713f12',
      primary950: '#422006',

      // Secondary - Red theme  
      secondary50: '#fef2f2',
      secondary100: '#fee2e2',
      secondary200: '#fecaca',
      secondary300: '#fca5a5',
      secondary400: '#f87171',
      secondary500: 'rgb(248, 113, 113)', // Main red
      secondary600: '#ef4444',
      secondary700: '#dc2626',
      secondary800: '#b91c1c',
      secondary900: '#991b1b',
      secondary950: '#450a0a',

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
  name: 'Light Yellow',
  group: 'Light',
  base: 'light',
  preview: {
    background: { backgroundColor: '#f2f4f7' },
    foreground1: { backgroundColor: 'rgb(250, 204, 21)' },
    foreground2: { backgroundColor: 'rgb(248, 113, 113)' },
    foreground3: { backgroundColor: 'rgb(34, 197, 94)' },
    foreground4: { backgroundColor: 'rgb(59, 130, 246)' },
  },
  rules: {
    system: {
      // Primary - Yellow theme
      primary50: '#fefce8',
      primary100: '#fef9c3',
      primary200: '#fef08a',
      primary300: '#fde047',
      primary400: '#facc15',
      primary500: 'rgb(250, 204, 21)', // Main yellow
      primary600: '#ca8a04',
      primary700: '#a16207',
      primary800: '#854d0e',
      primary900: '#713f12',
      primary950: '#422006',

      // Secondary - Red theme  
      secondary50: '#fef2f2',
      secondary100: '#fee2e2',
      secondary200: '#fecaca',
      secondary300: '#fca5a5',
      secondary400: '#f87171',
      secondary500: 'rgb(248, 113, 113)', // Main red
      secondary600: '#ef4444',
      secondary700: '#dc2626',
      secondary800: '#b91c1c',
      secondary900: '#991b1b',
      secondary950: '#450a0a',

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
} ]