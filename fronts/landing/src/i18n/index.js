import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import en from './locales/en.json';

// Détection de la langue du navigateur
const getBrowserLocale = () => {
  const navigatorLocale = navigator.language;
  const localeWithoutRegionCode = navigatorLocale.toLowerCase().split('-')[0];
  
  return localeWithoutRegionCode;
};

// Langue par défaut - vérifier d'abord le localStorage, puis le navigateur, sinon utiliser 'en'
const getDefaultLocale = () => {
  const storedLocale = localStorage.getItem('runeya-locale');
  if (storedLocale) {
    return storedLocale;
  }
  
  const browserLocale = getBrowserLocale();
  if (browserLocale === 'fr') {
    return 'fr';
  }
  
  return 'en'; // Fallback sur l'anglais
};

// Configuration du i18n
export const i18n = createI18n({
  legacy: false, // Vous devez définir `false` pour utiliser Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    fr,
    en
  },
  globalInjection: true
});

// Utilitaire pour changer de langue
export const setLocale = (locale) => {
  i18n.global.locale.value = locale;
  localStorage.setItem('runeya-locale', locale);
  const htmlElement = document.querySelector('html');
  if (htmlElement) {
    htmlElement.setAttribute('lang', locale);
  }
}; 