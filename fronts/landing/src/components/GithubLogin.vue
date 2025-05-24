<template>
  <button
    @click="handleGithubLogin"
    :disabled="isLoading"
    class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-colors"
  >
    <svg v-if="!isLoading" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" />
    </svg>
    <svg v-else class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {{ isLoading ? (t('auth.signingIn') || 'Signing in...') : (t('auth.loginWithGithub') || 'Continue with GitHub') }}
  </button>

  <!-- Error display -->
  <div v-if="error" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import authStore from '../stores/authStore';

const { t } = useI18n();
const error = ref('');
const isLoading = ref(false);

/**
 * Initiates GitHub OAuth login flow using authStore
 */
const handleGithubLogin = async () => {
  error.value = '';
  isLoading.value = true;
  
  try {
    await authStore.loginWithGithub();
    // This will redirect, so code after won't execute
  } catch (err) {
    // Translate error messages for users
    let errorMessage = t('auth.githubLoginError') || 'GitHub authentication failed. Please try again.';
    
    if (err instanceof Error) {
      if (err.message.includes('cancelled') || err.message.includes('denied')) {
        errorMessage = t('auth.githubCancelled') || 'GitHub authentication was cancelled';
      } else if (err.message.includes('network') || err.message.includes('connection')) {
        errorMessage = t('auth.networkError') || 'Network error. Please check your connection and try again.';
      }
    }
    
    error.value = errorMessage;
    console.error('GitHub authentication error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script> 