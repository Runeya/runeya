<template>
  <div class="font-inter min-h-screen bg-stone-50 text-neutral-800 antialiased">
    <!-- Subtle organic background shapes -->
    <div class="fixed inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
      <div class="absolute top-0 -left-1/4 w-96 h-96 bg-emerald-200 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 -right-1/4 w-96 h-96 bg-sky-200 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center space-x-2">
            <router-link to="/" class="flex items-center space-x-2">
              <img src="@/assets/images/rocket.png" alt="Runeya Logo" class="h-8 w-auto" />
              <h1 class="text-2xl font-semibold tracking-tight">
                <span class="text-emerald-600">run</span><span class="text-neutral-700">eya</span>
              </h1>
            </router-link>
          </div>
          
          <!-- Desktop navigation -->
          <nav class="hidden md:flex items-center justify-end space-x-8 w-full mr-3">
            <template v-if="isHomePage">
              <a href="#features" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.features') }}</a>
              <a href="#benefits" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.benefits') }}</a>
              <a href="#about" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.about') }}</a>
              <a href="https://github.com/runeya/runeya" target="_blank" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.github') }}</a>
            </template>
            <router-link to="/plugins" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.plugins') }}</router-link>
          </nav>
          
          <!-- Right side -->
          <div class="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <template v-if="authStore.isAuthenticated.value">
              <router-link to="/app/dashboard" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                {{ $t('header.dashboard') }}
              </router-link>
              <button @click="handleLogout" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                {{ $t('header.logout') }}
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                {{ $t('header.login') }}
              </router-link>
            </template>
          </div>
          
          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button @click="toggleMobileMenu" type="button" class="text-neutral-700 hover:text-emerald-600 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-b border-stone-200 shadow-lg">
        <nav class="px-4 pt-2 pb-4 space-y-3">
          <template v-if="isHomePage">
            <a href="#features" @click="closeMobileMenu" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.features') }}</a>
            <a href="#benefits" @click="closeMobileMenu" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.benefits') }}</a>
            <a href="#about" @click="closeMobileMenu" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.about') }}</a>
            <a href="https://github.com/runeya/runeya" @click="closeMobileMenu" target="_blank" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.github') }}</a>
          </template>
          <template v-else>
            <a href="https://github.com/runeya/runeya" @click="closeMobileMenu" target="_blank" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.github') }}</a>
          </template>
          <router-link to="/plugins" @click="closeMobileMenu" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.plugins') }}</router-link>
          <div class="pt-3">
            <LanguageSelector @language-changed="closeMobileMenu" />
          </div>
          <a :href="docsUrl" target="_blank" class="mt-2 block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg text-base font-medium transition-colors shadow-sm hover:shadow-md">
            {{ $t('header.launch') }}
          </a>
          <template v-if="authStore.isAuthenticated.value">
            <router-link to="/app/dashboard" @click="closeMobileMenu" class="mt-2 block w-full text-center bg-neutral-800 hover:bg-neutral-900 text-white px-5 py-3 rounded-lg text-base font-medium transition-colors shadow-sm hover:shadow-md">
              {{ $t('header.dashboard') }}
            </router-link>
            <button @click="handleLogout" class="mt-2 block w-full text-center bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg text-base font-medium transition-colors shadow-sm hover:shadow-md">
              {{ $t('header.logout') }}
            </button>
          </template>
          <template v-else>
            <router-link to="/login" @click="closeMobileMenu" class="mt-2 block w-full text-center bg-neutral-800 hover:bg-neutral-900 text-white px-5 py-3 rounded-lg text-base font-medium transition-colors shadow-sm hover:shadow-md">
              {{ $t('header.login') }}
            </router-link>
          </template>
        </nav>
      </div>
    </header>

    <!-- Main content - Use router-view for dynamic page rendering -->
    <div :style="{ position: 'relative'}">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>

    <!-- Invitation Modal -->
    <InvitationModal/>

    <!-- Footer -->
    <footer class="bg-stone-100 border-t border-stone-200 text-neutral-600">
      <div class="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-8 md:mb-0 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <img src="@/assets/images/rocket.png" alt="Runeya Logo" class="h-8 w-auto" />
              <h2 class="text-xl font-semibold text-neutral-700">
                <span class="text-emerald-600">run</span>eya
              </h2> 
            </div>
            <p class="text-sm">{{ $t('footer.description') }}</p>
          </div>
          <div class="flex space-x-5">
            <a href="https://github.com/runeya/runeya" target="_blank" class="text-neutral-500 hover:text-emerald-600 transition-colors">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <title>GitHub</title>
                <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" />
              </svg>
            </a>
            <a href="https://www.npmjs.com/~runeya" target="_blank" class="text-neutral-500 hover:text-emerald-600 transition-colors">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <title>NPM</title>
                <path d="M0 0v24h24V0H0zm19.2 19.2h-2.4V9.6h-4.8v9.6H4.8V4.8h14.4v14.4z"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-stone-300 text-center text-sm text-neutral-500">
          <p>{{ $t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LanguageSelector from './components/LanguageSelector.vue';
import InvitationModal from './components/InvitationModal.vue';
import { useRouter, useRoute } from 'vue-router';
import authStore from './stores/authStore';
const router = useRouter();
const route = useRoute();
const docsUrl = process.env.VUE_APP_DOCS_URL;
const isMobileMenuOpen = ref(false);

authStore.getSession()
  
// Vérifier si l'utilisateur est sur la page d'accueil
const isHomePage = computed(() => {
  return route.path === '/';
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Fonction de déconnexion
const handleLogout = async () => {
  try {
    await authStore.signOut();
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style>
html {
  scroll-behavior: smooth;
}
/* Suppression des anciens styles futuristes spécifiques */
</style> 