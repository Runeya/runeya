/** @type {() => import('./theme').Theme} */
export default () => ({
  public: true,
  name: 'Light Pink',
  group: 'Light',
  base: 'light',
  preview: {
    background: { backgroundColor: '#f2f4f7' },
    foreground1: { backgroundColor: 'rgb(236, 72, 153)' },
    foreground2: { backgroundColor: 'rgb(217, 70, 239)' },
    foreground3: { backgroundColor: 'rgb(192, 38, 211)' },
    foreground4: { backgroundColor: 'rgb(249, 168, 212)' },
  },
  rules: {
    'system.accent': {
      'backgroundColor1-secondary': 'rgb(217, 70, 239)',
      'backgroundColor2-secondary': 'rgb(192, 38, 211)',
      'backgroundColor3-secondary': 'rgb(162, 28, 175)',

      'backgroundColor1-tertiary': 'rgb(168, 85, 247)',
      'backgroundColor2-tertiary': 'rgb(147, 51, 234)',
      'backgroundColor3-tertiary': 'rgb(126, 34, 206)',

      backgroundColor1: 'rgb(236, 72, 153)',
      backgroundColor2: 'rgb(217, 70, 239)',
      backgroundColor3: 'rgb(236, 72, 153)',
    },
  },
}); 