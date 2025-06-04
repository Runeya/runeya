/** @type {() => import('./theme').Theme} */
export default () => ({
  public: true,
  name: 'Light Indigo',
  group: 'Light',
  base: 'light',
  preview: {
    background: { backgroundColor: '#f2f4f7' },
    foreground1: { backgroundColor: 'rgb(99, 102, 241)' },
    foreground2: { backgroundColor: 'rgb(79, 70, 229)' },
    foreground3: { backgroundColor: 'rgb(67, 56, 202)' },
    foreground4: { backgroundColor: 'rgb(196, 181, 253)' },
  },
  rules: {
    'system.accent': {
      'backgroundColor1-secondary': 'rgb(79, 70, 229)',
      'backgroundColor2-secondary': 'rgb(67, 56, 202)',
      'backgroundColor3-secondary': 'rgb(55, 48, 163)',

      'backgroundColor1-tertiary': 'rgb(124, 58, 237)',
      'backgroundColor2-tertiary': 'rgb(109, 40, 217)',
      'backgroundColor3-tertiary': 'rgb(91, 33, 182)',

      backgroundColor1: 'rgb(99, 102, 241)',
      backgroundColor2: 'rgb(79, 70, 229)',
      backgroundColor3: 'rgb(99, 102, 241)',
    },
  },
}); 