<template>
  <div class="dashboard min-h-screen bg-stone-50">
    <!-- Header with user info -->
    <header class="bg-white border-b border-stone-200 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-neutral-800">
            <span class="text-emerald-600">{{ $t('dashboard.title') }}</span>
          </h1>
          <div class="flex items-center gap-4">
            <Avatar 
              v-if="session?.user?.image" 
              :image="session.user.image" 
              size="large" 
              shape="circle" 
              class="mr-2"
            />
            <Avatar 
              v-else 
              icon="pi pi-user" 
              size="large" 
              shape="circle" 
              class="mr-2"
            />
            <div class="flex flex-col">
              <span class="font-medium">{{ session?.user?.name || $t('dashboard.userFallback') }}</span>
              <span class="text-sm text-neutral-500">{{ session?.user?.email }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content with Sidebar -->
    <div class="container mx-auto px-4 py-8">
      <template v-if="organizations.length === 0">
        <div class="no-org flex flex-col items-center justify-center py-24">
          <div class="text-5xl mb-4">🏢</div>
          <h2 class="text-2xl font-bold mb-2">{{ $t('dashboard.noOrgTitle') }}</h2>
          <p class="text-neutral-500 mb-6">{{ $t('dashboard.noOrgDescription') }}</p>
          <router-link to="/app/dashboard/new-organization">
            <Button :label="$t('dashboard.createOrg.createButton')" icon="fas fa-plus" />
          </router-link>
        </div>
      </template>
      <template v-else>
        <Splitter style="height: 70vh; min-height: 400px;">
          <SplitterPanel :size="20" :minSize="10" :style="{ minWidth: '280px', maxWidth: '460px' }">
            <DashboardSidebar />
          </SplitterPanel>
          <SplitterPanel :size="80" :minSize="30">
            <router-view />
          </SplitterPanel>
        </Splitter>
      </template>
    </div>
    
    <!-- Toast for notifications -->
    <Toast position="bottom-right" />
    
    <!-- Confirmation Dialog for sensitive actions -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import authStore from '../stores/authStore';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.vue';
import useOrganizationStore from '../stores/organizationStore.js';
// PrimeVue components
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useToast } from 'primevue/usetoast';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';

const router = useRouter();
const session = ref(/** @type {any} */ (null));
const loading = ref(true);

const organizationStore = useOrganizationStore();
const organizations = computed(() => organizationStore.organizations.value);

watch(() => organizationStore.currentOrganization.value?.id, async (newVal) => {
  if (newVal) {
    await organizationStore.setCurrentOrganization(organizationStore.currentOrganization.value);
  }
});

// Get session on component mount
onMounted(async () => {
  try {
    console.log(organizationStore.currentOrganization.value?.id)
    const sessionData = await authStore.getSession();
    
    if (!sessionData) {
      throw new Error('Not authenticated');
    }
    
    session.value = {
      user: sessionData.user,
      session: sessionData.session
    };
    
    loading.value = false;
  } catch (err) {
    console.error('Authentication error:', err);
    router.push('/login');
  }
});
</script> 