<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50">
    <div class="max-w-md w-full p-6 bg-white rounded-xl shadow-lg border border-stone-200">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-3">
          <img src="@/assets/images/rocket.png" alt="Runeya Logo" class="h-10 w-auto" />
        </div>
        <h1 class="text-2xl font-bold text-neutral-800">
          {{ $t('auth.createAccount') }}
        </h1>
        <p class="mt-2 text-neutral-600">
          {{ $t('auth.signUpDesc') || 'Create your Runeya account to get started' }}
        </p>
      </div>

      <!-- Invitation Warning -->
      <div v-if="showInvitationWarning" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-start">
          <i class="fas fa-exclamation-triangle text-amber-500 mr-3 mt-0.5"></i>
          <div class="text-sm text-amber-800">
            <strong class="font-medium">{{ $t('auth.invitationWarning') || 'Important notice' }}</strong>
            <p class="mt-1">
              {{ $t('auth.invitationWarningMessage') || 'After creating your account, you will need to click again on the invitation link sent by email to join the organization.' }}
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <!-- GitHub Login -->
        <GithubLogin />
        
        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-stone-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-neutral-500">
              {{ $t('auth.orContinueWith') }}
            </span>
          </div>
        </div>
        
        <!-- Sign Up Form -->
        <Form @submit="handleSignUp" :resolver="signUpResolver">
          <template v-slot="$form">
            <div class="space-y-4">
              <!-- Name Field -->
              <div class="p-field">
                <label for="name" class="block text-sm font-medium text-neutral-700 mb-1">
                  {{ $t('auth.name') || 'Full name' }}
                </label>
                <InputText
                  name="name"
                  type="text"
                  class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  :placeholder="$t('auth.namePlaceholder') || 'John Doe'"
                />
                <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                  {{ $form.name.error?.message }}
                </Message>
              </div>
              
              <!-- Email Field -->
              <div class="p-field">
                <label for="email" class="block text-sm font-medium text-neutral-700 mb-1">
                  {{ $t('auth.email') }}
                </label>
                <InputText
                  name="email"
                  type="email"
                  class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  :placeholder="$t('auth.emailPlaceholder')"
                />
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
                  {{ $form.email.error?.message }}
                </Message>
              </div>
              
              <!-- Password Field -->
              <div class="p-field">
                <label for="password" class="block text-sm font-medium text-neutral-700 mb-1">
                  {{ $t('auth.password') }}
                </label>
                <InputText
                  name="password"
                  type="password"
                  class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  :placeholder="$t('auth.passwordPlaceholder')"
                />
                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                  {{ $form.password.error?.message }}
                </Message>
                <p class="mt-1 text-xs text-neutral-500">
                  {{ $t('auth.passwordRequirements') || 'Password must be at least 8 characters' }}
                </p>
              </div>
              
              <!-- Global Error Message -->
              <div v-if="error" class="text-red-600 text-sm">
                {{ error }}
              </div>
              <div class="">

              </div>
              <!-- Submit Button -->
              <Button
                type="submit"
                class="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-colors"
                :loading="isLoading"
                :disabled="isLoading || !$form.valid"
              >
                <span v-if="isLoading">{{ $t('auth.signingUp') || 'Creating account...' }}</span>
                <span v-else>{{ $t('auth.signUp') || 'Create account' }}</span>
              </Button>
            </div>
          </template>
        </Form>
      </div>
      
      <!-- Sign In Link -->
      <div class="mt-6 text-center text-sm">
        <span class="text-neutral-600">{{ $t('auth.haveAccount') || 'Already have an account?' }}</span>
        <router-link :to="'/login' + (router.currentRoute.value.query.returnUrl ? `?returnUrl=${router.currentRoute.value.query.returnUrl}` : '')" class="ml-1 text-emerald-600 hover:text-emerald-700 font-medium">
          {{ $t('auth.signIn') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';
import * as yup from 'yup';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import GithubLogin from '../components/GithubLogin.vue';
import authStore from '../stores/authStore';

const router = useRouter();
const { t } = useI18n();
const error = ref('');
const isLoading = ref(false);

// Check if returnUrl contains accept-invitation
const showInvitationWarning = computed(() => {
  const returnUrl = router.currentRoute.value.query.returnUrl;
  return returnUrl && returnUrl.toString().includes('accept-invitation');
});

const signUpResolver = yupResolver(
  yup.object().shape({
    name: yup
      .string()
      .min(2, t('auth.nameMinLength') || 'Name must be at least 2 characters')
      .required(t('auth.nameRequired') || 'Name is required'),
    email: yup
      .string()
      .email(t('auth.emailInvalid') || 'Invalid email format')
      .required(t('auth.emailRequired') || 'Email is required'),
    password: yup
      .string()
      .min(8, t('auth.passwordMinLength') || 'Password must be at least 8 characters')
      .required(t('auth.passwordRequired') || 'Password is required')
  })
);

/**
 * Handle sign-up using better-auth implementation with PrimeVue Form
 */
const handleSignUp = async (event) => {
  error.value = '';
  isLoading.value = true;
  
  try {
    await authStore.register({
      name: event.values.name,
      email: event.values.email,
      password: event.values.password,
    });
    
    // Success! Redirect to dashboard
    router.push('/app/dashboard');
  } catch (err) {
    console.log(err);
    let errorMessage = t(`auth.${err}`) || 'Something went wrong. Please try again.';
    
    if (err instanceof Error) {
      // Translate specific error messages
      if (err.message.includes('Registration failed') || err.message.includes('already exists')) {
        errorMessage = t('auth.emailExists') || 'An account with this email already exists';
      } else if (err.message.includes('No user data received')) {
        errorMessage = t('auth.registrationFailed') || 'Registration failed. Please try again.';
      } else if (err.message.includes('Password')) {
        errorMessage = t('auth.passwordError') || 'Password does not meet requirements';
      } else {
        errorMessage = err.message;
      }
    }
    
    error.value = errorMessage;
    console.error('Sign up error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.p-field {
  margin-bottom: 16px;
}
</style> 