/** @type {() => import('./theme').Theme} */
export default () => ({
  public: true,
  name: 'Dark Green',
  group: 'Dark',
  base: 'dark',
  preview: {
    background: { backgroundColor: '#2b2d31' },
    foreground1: { backgroundColor: 'rgb(16, 185, 129)' },
    foreground2: { backgroundColor: 'rgb(34, 197, 94)' },
    foreground3: { backgroundColor: 'rgb(20, 184, 166)' },
    foreground4: { backgroundColor: 'rgb(132, 204, 22)' },
  },
  rules: {
    'system.accent': {
      'backgroundColor1-secondary': 'rgb(34, 197, 94)',
      'backgroundColor2-secondary': 'rgb(22, 163, 74)',
      'backgroundColor3-secondary': 'rgb(21, 128, 61)',

      'backgroundColor1-tertiary': 'rgb(20, 184, 166)',
      'backgroundColor2-tertiary': 'rgb(13, 148, 136)',
      'backgroundColor3-tertiary': 'rgb(15, 118, 110)',

      backgroundColor1: 'rgb(16, 185, 129)',
      backgroundColor2: 'rgb(34, 197, 94)',
      backgroundColor3: 'rgb(16, 185, 129)',
    },
  },
}); 