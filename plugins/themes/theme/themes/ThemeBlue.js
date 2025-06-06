/** @type {import('@runeya/common-typings').Theme[]} */
module.exports = [{
  public: true,
  name: 'Dark Blue',
  group: 'Dark',
  base: 'dark',
  preview: {
    background: { backgroundColor: '#2b2d31' },
    foreground1: { backgroundColor: 'rgb(47, 161, 182)' },
    foreground2: { backgroundColor: 'rgb(10 ,206 ,213)' },
    foreground3: { backgroundColor: 'rgb(211, 22, 229)' },
    foreground4: { backgroundColor: 'rgb(229, 139, 22)' },
  },
  rules: {
    system: {
      // Primary - Blue theme
      primary50: '#ecfeff',
      primary100: '#cffafe',
      primary200: '#a5f3fc',
      primary300: '#67e8f9',
      primary400: '#22d3ee',
      primary500: 'rgb(10, 206, 213)', // Main blue
      primary600: 'rgb(47, 161, 182)', // Darker blue
      primary700: '#0e7490',
      primary800: '#155e75',
      primary900: '#164e63',
      primary950: '#083344',

      // Secondary - Purple/Pink theme  
      secondary50: '#fdf4ff',
      secondary100: '#fae8ff',
      secondary200: '#f5d0fe',
      secondary300: '#f0abfc',
      secondary400: '#e879f9',
      secondary500: 'rgb(211, 22, 229)', // Main purple
      secondary600: 'rgb(157, 27, 209)', // Darker purple
      secondary700: 'rgb(217, 111, 226)', // Lighter purple
      secondary800: '#a21caf',
      secondary900: '#86198f',
      secondary950: '#4a044e',

      // Tertiary - Orange theme
      tertiary50: '#fff7ed',
      tertiary100: '#ffedd5',
      tertiary200: '#fed7aa',
      tertiary300: '#fdba74',
      tertiary400: '#fb923c',
      tertiary500: 'rgb(229, 139, 22)', // Main orange
      tertiary600: 'rgb(229, 156, 45)', // Variant orange
      tertiary700: 'rgb(255, 123, 0)', // Bright orange
      tertiary800: '#c2410c',
      tertiary900: '#9a3412',
      tertiary950: '#431407',
    },
  },
},{
  public: true,
  name: 'Light Blue',
  group: 'Light',
  base: 'light',
  preview: {
    background: { backgroundColor: '#f2f4f7' },
    foreground1: { backgroundColor: 'rgb(47, 161, 182)' },
    foreground2: { backgroundColor: 'rgb(10 ,206 ,213)' },
    foreground3: { backgroundColor: 'rgb(211, 22, 229)' },
    foreground4: { backgroundColor: 'rgb(229, 139, 22)' },
  },
  rules: {
    system: {
      // Primary - Blue theme
      primary50: '#ecfeff',
      primary100: '#cffafe',
      primary200: '#a5f3fc',
      primary300: '#67e8f9',
      primary400: '#22d3ee',
      primary500: 'rgb(10, 206, 213)', // Main blue
      primary600: 'rgb(47, 161, 182)', // Darker blue
      primary700: '#0e7490',
      primary800: '#155e75',
      primary900: '#164e63',
      primary950: '#083344',

      // Secondary - Purple/Pink theme  
      secondary50: '#fdf4ff',
      secondary100: '#fae8ff',
      secondary200: '#f5d0fe',
      secondary300: '#f0abfc',
      secondary400: '#e879f9',
      secondary500: 'rgb(211, 22, 229)', // Main purple
      secondary600: 'rgb(157, 27, 209)', // Darker purple
      secondary700: 'rgb(217, 111, 226)', // Lighter purple
      secondary800: '#a21caf',
      secondary900: '#86198f',
      secondary950: '#4a044e',

      // Tertiary - Orange theme
      tertiary50: '#fff7ed',
      tertiary100: '#ffedd5',
      tertiary200: '#fed7aa',
      tertiary300: '#fdba74',
      tertiary400: '#fb923c',
      tertiary500: 'rgb(229, 139, 22)', // Main orange
      tertiary600: 'rgb(229, 156, 45)', // Variant orange
      tertiary700: 'rgb(255, 123, 0)', // Bright orange
      tertiary800: '#c2410c',
      tertiary900: '#9a3412',
      tertiary950: '#431407',
    },
  },
} ]