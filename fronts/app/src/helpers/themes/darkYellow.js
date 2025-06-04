/** @type {() => import('./theme').Theme} */
export default () => ({
  public: true,
  name: 'Dark Yellow',
  group: 'Dark',
  base: 'dark',
  preview: {
    background: { backgroundColor: '#2b2d31' },
    foreground1: { backgroundColor: 'rgb(251, 191, 36)' },
    foreground2: { backgroundColor: 'rgb(245, 158, 11)' },
    foreground3: { backgroundColor: 'rgb(217, 119, 6)' },
    foreground4: { backgroundColor: 'rgb(254, 215, 170)' },
  },
  rules: {
    'system.accent': {
      'backgroundColor1-secondary': 'rgb(245, 158, 11)',
      'backgroundColor2-secondary': 'rgb(217, 119, 6)',
      'backgroundColor3-secondary': 'rgb(180, 83, 9)',

      'backgroundColor1-tertiary': 'rgb(251, 146, 60)',
      'backgroundColor2-tertiary': 'rgb(249, 115, 22)',
      'backgroundColor3-tertiary': 'rgb(234, 88, 12)',

      backgroundColor1: 'rgb(251, 191, 36)',
      backgroundColor2: 'rgb(245, 158, 11)',
      backgroundColor3: 'rgb(251, 191, 36)',
    },
  },
}); 