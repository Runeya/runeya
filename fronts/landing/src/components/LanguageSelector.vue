<template>
  <div class="relative" ref="languageSelectorRoot">
    <button @click="toggleDropdown" class="flex items-center space-x-1 focus:outline-none">
      <span>{{ currentLanguage === 'fr' ? $t('language.fr') : $t('language.en') }}</span>
      <i class="fas fa-chevron-down text-xs"></i>
    </button>
    
    <div v-if="isOpen" class="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
      <div class="py-1" role="menu" aria-orientation="vertical">
        <a 
          href="#" 
          @click.prevent="changeLanguage('fr')" 
          class="block px-4 py-2 text-sm hover:bg-gray-100" 
          :class="{'bg-gray-100': currentLanguage === 'fr'}"
          role="menuitem"
        >
          {{ $t('language.fr') }}
        </a>
        <a 
          href="#" 
          @click.prevent="changeLanguage('en')" 
          class="block px-4 py-2 text-sm hover:bg-gray-100" 
          :class="{'bg-gray-100': currentLanguage === 'en'}"
          role="menuitem"
        >
          {{ $t('language.en') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale } from '../i18n';

const { locale } = useI18n();
const isOpen = ref(false);
const currentLanguage = computed(() => locale.value);
const languageSelectorRoot = ref(null); // Référence pour l'élément racine

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const changeLanguage = (lang) => {
  setLocale(lang);
  isOpen.value = false;
};

// Fermer le dropdown si on clique ailleurs sur la page
const closeOnClickOutside = (e) => {
  if (languageSelectorRoot.value && languageSelectorRoot.value instanceof HTMLElement && !languageSelectorRoot.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside);
});
</script> 