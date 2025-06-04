/** @type {() => import('./theme').Theme} */
export default () => ({
  public: true,
  name: 'Dark Cyan',
  group: 'Dark',
  base: 'dark',
  preview: {
    background: { backgroundColor: '#2b2d31' },
    foreground1: { backgroundColor: 'rgb(6, 182, 212)' },
    foreground2: { backgroundColor: 'rgb(8, 145, 178)' },
    foreground3: { backgroundColor: 'rgb(14, 116, 144)' },
    foreground4: { backgroundColor: 'rgb(165, 243, 252)' },
  },
  rules: {
    'system.accent': {
      'backgroundColor1-secondary': 'rgb(8, 145, 178)',
      'backgroundColor2-secondary': 'rgb(14, 116, 144)',
      'backgroundColor3-secondary': 'rgb(21, 94, 117)',

      'backgroundColor1-tertiary': 'rgb(6, 148, 162)',
      'backgroundColor2-tertiary': 'rgb(17, 94, 89)',
      'backgroundColor3-tertiary': 'rgb(19, 78, 74)',

      backgroundColor1: 'rgb(6, 182, 212)',
      backgroundColor2: 'rgb(8, 145, 178)',
      backgroundColor3: 'rgb(6, 182, 212)',
    },
  },
}); 