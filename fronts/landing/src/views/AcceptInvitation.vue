<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50">
    <div class="max-w-md w-full p-6 bg-white rounded-xl shadow-lg border border-stone-200">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-3">
          <img src="@/assets/images/rocket.png" alt="Runeya Logo" class="h-10 w-auto" />
        </div>
        <h1 class="text-2xl font-bold text-neutral-800">
          {{ $t('invitations.title') }}
        </h1>
        <p v-if="loading" class="mt-2 text-neutral-600">
          {{ $t('invitations.loading') }}
        </p>
        <p v-else-if="invitation" class="mt-2 text-neutral-600">
          {{ $t('invitations.description', { organization: invitation.organizationName }) }}
        </p>
        <p v-else-if="error" class="mt-2 text-red-600">
          {{ error }}
        </p>
      </div>

      <div v-if="loading" class="flex justify-center">
        <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="invitation && !processed" class="space-y-4">
        <div class="bg-stone-50 p-4 rounded-lg border border-stone-200">
          <h3 class="font-medium text-lg mb-2">{{ $t('invitations.details') }}</h3>
          <div class="space-y-2">
            <div>
              <span class="text-neutral-500">{{ $t('invitations.organization') }}:</span>
              <span class="font-medium ml-1">{{ invitation.organizationName }}</span>
            </div>
            <div>
              <span class="text-neutral-500">{{ $t('invitations.invitedBy') }}:</span>
              <span class="font-medium ml-1">{{ invitation.inviterEmail }}</span>
            </div>
            <div>
              <span class="text-neutral-500">{{ $t('invitations.role') }}:</span>
              <span class="font-medium ml-1">{{ invitation.role }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button 
            @click="acceptInvitation"
            :disabled="processing"
            class="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-colors disabled:opacity-70"
          >
            <span v-if="processing">{{ $t('invitations.processing') }}</span>
            <span v-else>{{ $t('invitations.accept') }}</span>
          </button>
          <button 
            @click="rejectInvitation"
            :disabled="processing"
            class="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-colors disabled:opacity-70"
          >
            <span v-if="processing">{{ $t('invitations.processing') }}</span>
            <span v-else>{{ $t('invitations.reject') }}</span>
          </button>
        </div>
      </div>
      
      <div v-else-if="processed" class="text-center">
        <div class="mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <span v-if="accepted" class="text-3xl">✓</span>
            <span v-else class="text-3xl">✗</span>
          </div>
          <h2 class="text-xl font-bold">
            {{ accepted ? $t('invitations.acceptedTitle') : $t('invitations.rejectedTitle') }}
          </h2>
          <p class="mt-2 text-neutral-600">
            {{ accepted ? $t('invitations.acceptedMessage') : $t('invitations.rejectedMessage') }}
          </p>
        </div>
        
        <div class="mt-8">
          <button
            @click="goToDashboard"
            class="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-colors"
          >
            {{ $t('invitations.dashboard') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authStore from '../stores/authStore';
import invitationStore from '../stores/invitationStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const invitationId = route.params.id?.toString();

const loading = ref(true);
const processing = ref(false);
const processed = ref(false);
const accepted = ref(false);
const invitation = ref(/** @type {any} */ (null));
const error = ref(/** @type {string|null} */ (null));

// Fetch invitation details
onMounted(async () => {
  if (!invitationId) {
    error.value = 'Invalid invitation';
    loading.value = false;
    return;
  }

  try {
    // Check if user is authenticated
    const session = await authStore.getSession();
    
    if (!session) {
      // Redirect to login page with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(`/accept-invitation/${invitationId}`)}`);
      return;
    }

    // Fetch invitation details
    const data = await invitationStore.getInvitation(invitationId);
    if (!data) {
      error.value = t('ERRORS.INVITATION_NOT_FOUND_OR_EXPIRED');
    } else {
      invitation.value = data;
    }
  } catch (/** @type {any} */ err) {
    error.value = err && typeof err === 'object' && err.code
      ? t(`ERRORS.${err.code || 'UNKNOWN'}`)
      : t('ERRORS.AN_ERROR_OCCURRED_WHILE_LOADING_THE_INVITATION');
    console.error('Error loading invitation:', err);
  } finally {
    loading.value = false;
  }
});

// Accept invitation
const acceptInvitation = async () => {
  if (!invitationId) return;
  
  processing.value = true;
  
  try {
    await invitationStore.acceptInvitation(invitationId);
    
    accepted.value = true;
    processed.value = true;
  } catch (/** @type {any} */ err) {
    console.error('Error accepting invitation:', err);
    error.value = err?.message || 'Failed to accept invitation';
  } finally {
    processing.value = false;
  }
};

// Reject invitation
const rejectInvitation = async () => {
  if (!invitationId) return;
  
  processing.value = true;
  
  try {
    await invitationStore.rejectInvitation(invitationId);
    
    accepted.value = false;
    processed.value = true;
  } catch (/** @type {any} */ err) {
    console.error('Error rejecting invitation:', err);
    error.value = err?.message || 'Failed to reject invitation';
  } finally {
    processing.value = false;
  }
};

// Navigate to dashboard
const goToDashboard = () => {
  router.push('/app/dashboard');
};
</script> 