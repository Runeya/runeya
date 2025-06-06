/** @type {import('@runeya/common-typings').Theme[]} */
module.exports = [{
  public: true,
  name: 'Dark Red',
  group: 'Dark',
  base: 'dark',
  preview: {
    background: { backgroundColor: '#2b2d31' },
    foreground1: { backgroundColor: 'rgb(239, 68, 68)' },
    foreground2: { backgroundColor: 'rgb(220, 38, 127)' },
    foreground3: { backgroundColor: 'rgb(244, 63, 94)' },
    foreground4: { backgroundColor: 'rgb(251, 113, 133)' },
  },
  rules: {
    system: {
      // Primary - Red theme
      primary50: '#fef2f2',
      primary100: '#fee2e2',
      primary200: '#fecaca',
      primary300: '#fca5a5',
      primary400: '#f87171',
      primary500: 'rgb(239, 68, 68)', // Main red
      primary600: '#dc2626',
      primary700: '#b91c1c',
      primary800: '#991b1b',
      primary900: '#7f1d1d',
      primary950: '#450a0a',

      // Secondary - Pink theme  
      secondary50: '#fdf2f8',
      secondary100: '#fce7f3',
      secondary200: '#fbcfe8',
      secondary300: '#f9a8d4',
      secondary400: '#f472b6',
      secondary500: 'rgb(220, 38, 127)', // Main pink
      secondary600: 'rgb(190, 24, 93)', // Darker pink
      secondary700: 'rgb(157, 23, 77)', // Darkest pink
      secondary800: '#9d174d',
      secondary900: '#831843',
      secondary950: '#500724',

      // Tertiary - Rose theme
      tertiary50: '#fff1f2',
      tertiary100: '#ffe4e6',
      tertiary200: '#fecdd3',
      tertiary300: '#fda4af',
      tertiary400: '#fb7185',
      tertiary500: 'rgb(244, 63, 94)', // Main rose
      tertiary600: 'rgb(225, 29, 72)', // Darker rose
      tertiary700: 'rgb(190, 18, 60)', // Darkest rose
      tertiary800: '#be123c',
      tertiary900: '#9f1239',
      tertiary950: '#4c0519',
    },
  },
}, {
  public: true,
  name: 'Light Red',
  group: 'Light',
  base: 'light',
  preview: {
    background: { backgroundColor: '#f2f4f7' },
    foreground1: { backgroundColor: 'rgb(239, 68, 68)' },
    foreground2: { backgroundColor: 'rgb(220, 38, 127)' },
    foreground3: { backgroundColor: 'rgb(244, 63, 94)' },
    foreground4: { backgroundColor: 'rgb(251, 113, 133)' },
  },
  rules: {
    system: {
      // Primary - Red theme
      primary50: '#fef2f2',
      primary100: '#fee2e2',
      primary200: '#fecaca',
      primary300: '#fca5a5',
      primary400: '#f87171',
      primary500: 'rgb(239, 68, 68)', // Main red
      primary600: '#dc2626',
      primary700: '#b91c1c',
      primary800: '#991b1b',
      primary900: '#7f1d1d',
      primary950: '#450a0a',

      // Secondary - Pink theme  
      secondary50: '#fdf2f8',
      secondary100: '#fce7f3',
      secondary200: '#fbcfe8',
      secondary300: '#f9a8d4',
      secondary400: '#f472b6',
      secondary500: 'rgb(220, 38, 127)', // Main pink
      secondary600: 'rgb(190, 24, 93)', // Darker pink
      secondary700: 'rgb(157, 23, 77)', // Darkest pink
      secondary800: '#9d174d',
      secondary900: '#831843',
      secondary950: '#500724',

      // Tertiary - Rose theme
      tertiary50: '#fff1f2',
      tertiary100: '#ffe4e6',
      tertiary200: '#fecdd3',
      tertiary300: '#fda4af',
      tertiary400: '#fb7185',
      tertiary500: 'rgb(244, 63, 94)', // Main rose
      tertiary600: 'rgb(225, 29, 72)', // Darker rose
      tertiary700: 'rgb(190, 18, 60)', // Darkest rose
      tertiary800: '#be123c',
      tertiary900: '#9f1239',
      tertiary950: '#4c0519',
    },
  },
} ]