<template>
  <div class="organization-settings-view">
    <h1 class="text-2xl font-bold mb-4">{{ $t('dashboard.orgSettings.title') }}</h1>
    
    <div class="mb-4 page-actions">
      <router-link :to="{ name: 'organization-members' }">
        <Button :label="$t('dashboard.orgSettings.manageMembers')" icon="fas fa-users" class="p-button-secondary" />
      </router-link>
    </div>
    
    <div class="settings-card">
      <OrganizationForm
        v-if="currentOrganization"
        :key="currentOrganization?.id"
        :initialValues="{...currentOrganization}"
        :loading="isSubmitting"
        :submitLabel="$t('dashboard.orgSettings.saveButton')"
        :cancelLabel="$t('dashboard.orgSettings.cancelButton')"
        :onSubmit="updateOrganization"
        :onCancel="resetForm"
        :isEdit="true"
      />
      <div class="danger-zone">
        <h3>Danger Zone</h3>
        <p>{{ $t('dashboard.orgSettings.deleteConfirmMessage') }}</p>
        <Button
          :label="$t('dashboard.orgSettings.deleteButton')"
          icon="fas fa-trash"
          class="p-button-danger"
          type="button"
          @click="confirmDelete"
        />
      </div>
      <Dialog v-model:visible="deleteDialogVisible" modal :closable="false" :style="{ width: '400px' }" :header="$t('dashboard.orgSettings.deleteConfirmTitle')">
        <div class="mb-4">{{ $t('dashboard.orgSettings.deleteConfirmMessage') }}</div>
        <template #footer>
          <Button :label="$t('dashboard.orgSettings.cancelButton')" class="p-button-text" @click="deleteDialogVisible = false" />
          <Button :label="$t('dashboard.orgSettings.deleteButton')" icon="fas fa-trash" class="p-button-danger" :loading="isSubmitting" @click="handleDelete" />
        </template>
      </Dialog>
      <Toast position="bottom-right" />
    </div>
  </div>
</template>

<script setup>
// @ts-nocheck - Disabling TypeScript checks for this file as it's using JavaScript

import { ref, computed, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import useOrganizationStore from '../../stores/organizationStore.js';
import Button from 'primevue/button';
import OrganizationForm from './OrganizationForm.vue';
import Dialog from 'primevue/dialog';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { Toast } from 'primevue';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const currentOrganization = computed(() => organizationStore.currentOrganization.value);
const isSubmitting = ref(false);
const deleteDialogVisible = ref(false);

// Synchronise l'organisation courante avec l'URL
watchEffect(async () => {
  const orgId = route.params.orgId;
  if (orgId && organizationStore.organizations.value.length > 0) {
    const found = organizationStore.organizations.value.find(org => org.id === orgId);
    if (found && (!currentOrganization.value || currentOrganization.value.id !== orgId)) {
      await organizationStore.setCurrentOrganization(found);
    } else if (!found) {
      // Redirige vers la première org si l'id n'est pas trouvé
      const first = organizationStore.organizations.value[0];
      if (first) {
        router.replace(`/app/dashboard/${first.id}/organization/settings`);
      }
    }
  }
});

const updateOrganization = async (event) => {
    if (event.valid && currentOrganization.value) {
    isSubmitting.value = true;
    try {
      await organizationStore.updateOrganization(currentOrganization.value.id, event.values);
      toast.add({
        severity: 'success',
        summary: t('dashboard.orgSettings.updateSuccess'),
        life: 3000
      });
    } catch (err) {
      toast.add({
        severity: 'error',
        summary: t('dashboard.orgSettings.updateError'),
        detail: err?.message,
        life: 4000
      });
    } finally {
      isSubmitting.value = false;
    }
  }
};

const confirmDelete = () => {
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (currentOrganization.value) {
    isSubmitting.value = true;
    try {
      await organizationStore.deleteOrganization(currentOrganization.value.id);
      toast.add({
        severity: 'success',
        summary: t('dashboard.orgSettings.deleteSuccess'),
        life: 3000
      });
      // Redirige vers la première org restante ou dashboard
      const orgs = organizationStore.organizations.value;
      if (orgs.length > 0) {
        router.push(`/app/dashboard/${orgs[0].id}/organization/settings`);
      } else {
        router.push('/app/dashboard');
      }
    } finally {
      isSubmitting.value = false;
      deleteDialogVisible.value = false;
    }
  }
};

const resetForm = () => {
  // On reload la page pour reset le formulaire (simple)
  window.location.reload();
};
</script>

<style scoped lang="scss">
.organization-settings-view {
  padding: 20px;
}
.settings-card {
  background-color: var(--surface-a);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--surface-d);
  margin-top: 20px;
  padding: 30px 24px;
  max-width: 500px;
}
.p-field {
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
}
.danger-zone {
  margin-top: 30px;
  padding: 15px;
  border: 1px dashed #ff5757;
  border-radius: 6px;
  h3 {
    color: #ff5757;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 600;
  }
  p {
    margin-bottom: 15px;
    font-size: 14px;
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>