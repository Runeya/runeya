<template>
  <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="relative max-w-lg w-full bg-white rounded-xl shadow-2xl border border-stone-200">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-stone-200">
          <h3 class="text-lg font-semibold text-neutral-800">
            {{ $t('invitations.title') || 'Organization Invitations' }}
          </h3>
          <button 
            @click="closeModal"
            class="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <p class="text-sm text-neutral-600 mb-4">
            {{ $t('invitations.description') || 'You have pending organization invitations:' }}
          </p>

          <!-- Invitations List -->
          <div class="space-y-4">
            <div 
              v-for="invitation in invitations" 
              :key="invitation._id"
              class="border border-stone-200 rounded-lg p-4 bg-stone-50"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-neutral-800 mb-1">
                    {{ $t('invitations.organizationInvite') || 'Organization Invitation' }}
                  </h4>
                  <p class="text-sm text-neutral-600 mb-2">
                    {{ $t('invitations.invitedTo') || 'You are invited to join organization:' }}
                  </p>
                  <p class="text-sm font-medium text-emerald-600">
                    {{ invitation.organization.name || invitation.organization._id }}
                  </p>
                  <p class="text-xs text-neutral-500 mt-1">
                    {{ $t('invitations.receivedAt') || 'Received:' }} {{ formatDate(getDateFromObjectId(invitation._id)) }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 mt-4">
                <button
                  @click="acceptInvitation(invitation._id)"
                  :disabled="isLoading"
                  class="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {{ isLoading ? ($t('invitations.accepting') || 'Accepting...') : ($t('invitations.accept') || 'Accept') }}
                </button>
                <button
                  @click="declineInvitation(invitation._id)"
                  :disabled="isLoading"
                  class="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {{ isLoading ? ($t('invitations.declining') || 'Declining...') : ($t('invitations.decline') || 'Decline') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end p-6 border-t border-stone-200">
          <button
            @click="closeModal"
            class="py-2 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors text-sm"
          >
            {{ $t('invitations.close') || 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted  } from 'vue';
import { useI18n } from 'vue-i18n';
import invitationStore from '../stores/invitationStore';
import useOrganizationStore from '../stores/organizationStore';
import authStore from '../stores/authStore';

const organizationStore = useOrganizationStore();

const { t } = useI18n();

const invitations = ref([]);
const showModal = ref(false);

// Emits
const emit = defineEmits(['close', 'invitation-handled']);

// State
const isLoading = ref(false);
const error = ref('');

// Methods
const closeModal = () => {
  showModal.value = false;
};

onMounted(async () => {
  await authStore.getSession()
    .then(async () => {
      const _invitations = await organizationStore.myInvitations();
      if(_invitations.length > 0) {
        invitations.value = _invitations;
        showModal.value = true;
      }
    });
});

const acceptInvitation = async (invitationId) => {
  error.value = '';
  isLoading.value = true;
  
  try {
    await invitationStore.acceptInvitation(invitationId);
    await organizationStore.fetchOrganizations();
    showModal.value = false;
    emit('invitation-handled');
  } catch (err) {
    const errorMessage = t('invitations.acceptError') || 'Failed to accept invitation. Please try again.';
    error.value = errorMessage;
    console.error('Accept invitation error:', err);
  } finally {
    isLoading.value = false;
  }
};

const declineInvitation = async (invitationId) => {
  error.value = '';
  isLoading.value = true;
  
  try {
    await invitationStore.rejectInvitation(invitationId);
    await organizationStore.fetchOrganizations();
    emit('invitation-handled');
    showModal.value = false;
  } catch (err) {
    const errorMessage = t('invitations.declineError') || 'Failed to decline invitation. Please try again.';
    error.value = errorMessage;
    console.error('Decline invitation error:', err);
  } finally {
    isLoading.value = false;
  }
};


function getDateFromObjectId(objectId) {
  if (!objectId || typeof objectId !== 'string' || objectId.length < 8) {
    throw new Error('Invalid ObjectId');
  }
  const timestampHex = objectId.substring(0, 8);
  const timestamp = parseInt(timestampHex, 16);
  return new Date(timestamp * 1000);
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};
</script> 