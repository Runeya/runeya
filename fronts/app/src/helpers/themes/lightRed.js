/** @type {() => import('./theme').Theme} */
export default () => ({
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
    'system.accent': {
      'backgroundColor1-secondary': 'rgb(220, 38, 127)',
      'backgroundColor2-secondary': 'rgb(190, 24, 93)',
      'backgroundColor3-secondary': 'rgb(157, 23, 77)',

      'backgroundColor1-tertiary': 'rgb(244, 63, 94)',
      'backgroundColor2-tertiary': 'rgb(225, 29, 72)',
      'backgroundColor3-tertiary': 'rgb(190, 18, 60)',

      backgroundColor1: 'rgb(239, 68, 68)',
      backgroundColor2: 'rgb(220, 38, 127)',
      backgroundColor3: 'rgb(239, 68, 68)',
    },
  },
}); 