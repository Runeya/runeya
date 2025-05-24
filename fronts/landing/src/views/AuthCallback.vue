<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50">
    <div class="text-center">
      <img src="@/assets/images/rocket.png" alt="Runeya Logo" class="h-16 w-auto mx-auto mb-6" />
      <h1 class="text-2xl font-bold text-neutral-800 mb-4">
        {{ $t('auth.authenticating') }}
      </h1>
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
      <p v-if="error" class="mt-6 text-red-600">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authStore from '../stores/authStore';

const router = useRouter();
const error = ref('');

onMounted(async () => {
  // The better-auth client will automatically handle the OAuth callback
  // We just need to check for any error parameters in the URL
  
  const params = new URLSearchParams(window.location.search);
  const errorParam = params.get('error');
  
  if (errorParam) {
    error.value = errorParam === 'access_denied' 
      ? 'You declined the authorization request' 
      : 'Authentication failed';
    
    // Redirect to login page after a delay if there's an error
    setTimeout(() => {
      router.push('/login');
    }, 3000);
    return;
  }

  try {
    // Check if we have a session after the callback
    const session = await authStore.getSession();
    
    if (!session) {
      throw new Error('Authentication failed');
    }
    
    // Successful authentication, redirect to dashboard
    router.push('/app/dashboard');
  } catch (err) {
    // Type assertion for the error object
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    error.value = errorMessage;
    console.error('Authentication error:', errorMessage);
    
    // Redirect to login page after a delay if there's an error
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }
});
</script> 