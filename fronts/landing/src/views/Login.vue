<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50">
    <div class="max-w-md w-full p-6 bg-white rounded-xl shadow-lg border border-stone-200">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-3">
          <img src="@/assets/images/rocket.png" alt="Runeya Logo" class="h-10 w-auto" />
        </div>
        <h1 class="text-2xl font-bold text-neutral-800">
          {{ $t('auth.signIn') }}
        </h1>
        <p class="mt-2 text-neutral-600">
          {{ $t('auth.signInDesc') }}
        </p>
      </div>

      <!-- Invitation Warning -->
      <div v-if="showInvitationWarning" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-start">
          <i class="fas fa-exclamation-triangle text-amber-500 mr-3 mt-0.5"></i>
          <div class="text-sm text-amber-800">
            <strong class="font-medium">{{ $t('auth.loginInvitationWarning') || 'Important notice' }}</strong>
            <p class="mt-1">
              {{ $t('auth.loginInvitationWarningMessage') || 'After signing in to your account, you will need to click again on the invitation link sent by email to join the organization.' }}
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
        
        <!-- Email/Password Login Form -->
        <Form @submit="handleEmailLogin" :resolver="loginResolver">
          <template v-slot="$form">
            <div class="space-y-4">
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
                <div class="flex items-center justify-between mb-1">
                  <label for="password" class="block text-sm font-medium text-neutral-700">
                    {{ $t('auth.password') }}
                  </label>
                  <a href="#" class="text-sm text-emerald-600 hover:text-emerald-700">
                    {{ $t('auth.forgotPassword') }}
                  </a>
                </div>
                <InputText
                  name="password"
                  type="password"
                  class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  :placeholder="$t('auth.passwordPlaceholder')"
                />
                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                  {{ $form.password.error?.message }}
                </Message>
              </div>
              
              <!-- Global Error Message -->
              <div v-if="error" class="text-red-600 text-sm">
                {{ error }}
              </div>
              
              <!-- Success Message -->
              <div v-if="successMessage" class="text-green-600 text-sm">
                {{ successMessage }}
              </div>
              
              <!-- Resend Verification Button -->
              <div v-if="showResendButton" class="text-center">
                <Button
                  type="button"
                  class="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  :loading="isResending"
                  :disabled="isResending"
                  @click="handleResendVerification"
                >
                  <span v-if="isResending">{{ $t('auth.resending') || 'Sending...' }}</span>
                  <span v-else>{{ $t('auth.resendVerification') || 'Resend Verification Email' }}</span>
                </Button>
              </div>
              
              <!-- Submit Button -->
              <Button
                type="submit"
                class="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-colors"
                :loading="isLoading"
                :disabled="isLoading || !$form.valid"
              >
                <span v-if="isLoading">{{ $t('auth.signingIn') }}</span>
                <span v-else>{{ $t('auth.signIn') }}</span>
              </Button>
            </div>
          </template>
        </Form>
      </div>
      
      <!-- Sign Up Link -->
      <div class="mt-6 text-center text-sm">
        <span class="text-neutral-600">{{ $t('auth.noAccount') }}</span>
        <router-link :to="'/signup' + (router.currentRoute.value.query.returnUrl ? `?returnUrl=${router.currentRoute.value.query.returnUrl}` : '')" class="ml-1 text-emerald-600 hover:text-emerald-700 font-medium">
          {{ $t('auth.createAccount') }}
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
import useOrganizationStore from '../stores/organizationStore';

const router = useRouter();
const { t } = useI18n();
const error = ref('');
const isLoading = ref(false);
const showResendButton = ref(false);
const userEmail = ref('');
const isResending = ref(false);
const successMessage = ref('');
const organizationStore = useOrganizationStore();

// Check if returnUrl contains accept-invitation
const showInvitationWarning = computed(() => {
  const returnUrl = router.currentRoute.value.query.returnUrl;
  return returnUrl && returnUrl.toString().includes('accept-invitation');
});

const loginResolver = yupResolver(
  yup.object().shape({
    email: yup
      .string()
      .email(t('auth.emailInvalid') || 'Invalid email format')
      .required(t('auth.emailRequired') || 'Email is required'),
    password: yup
      .string()
      .required(t('auth.passwordRequired') || 'Password is required')
  })
);

/**
 * Handle resending verification email
 */
const handleResendVerification = async () => {
  if (!userEmail.value) return;
  
  isResending.value = true;
  error.value = '';
  successMessage.value = '';
  
  try {
    await authStore.resendVerificationEmail(userEmail.value);
    
    // Show success message
    successMessage.value = t('auth.verificationEmailSent') || 'Verification email sent! Please check your inbox.';
    showResendButton.value = false;
  } catch (err) {
    let errorMessage = t('auth.resendError') || 'Failed to resend verification email. Please try again.';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    error.value = errorMessage;
    console.error('Resend verification error:', err);
  } finally {
    isResending.value = false;
  }
};

/**
 * Handle email/password login using PrimeVue Form
 */
const handleEmailLogin = async (event) => {
  error.value = '';
  successMessage.value = '';
  isLoading.value = true;
  showResendButton.value = false;
  
  try {
    await authStore.login({
      email: event.values.email,
      password: event.values.password,
    });
    
    await organizationStore.fetchOrganizations();
    // Success! Redirect to dashboard with return URL support
    router.push(router.currentRoute.value.query.returnUrl?.toString() || '/app/dashboard');
  } catch (err) {
    let errorMessage = t('auth.genericError') || 'Something went wrong. Please try again.';
    
    if (err?.code) {
      errorMessage = t(`ERRORS.${err.code}`) || err.message;
    } else if (err instanceof Error) {
      // Handle standard Error objects (fallback)
      if (err.message.includes('Authentication failed') || err.message.includes('Invalid credentials')) {
        errorMessage = t('auth.invalidCredentials') || 'Invalid email or password';
      } else if (err.message.includes('No user data received')) {
        errorMessage = t('auth.noUserData') || 'Authentication failed. Please try again.';
      } else {
        errorMessage = err.message;
      }
    } else if (typeof err === 'string') {
      // Handle string errors (fallback)
      errorMessage = t(`auth.${err}`) || err;
    }
    
    error.value = errorMessage;
    console.error('Login error:', err);
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