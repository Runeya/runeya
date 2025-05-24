<template>
  <div class="new-org-view flex flex-col items-center justify-center py-16">
    <h1 class="text-2xl font-bold mb-4">{{ $t('dashboard.createOrg.title') }}</h1>
    <div class="w-full max-w-md bg-white rounded-lg shadow p-8">
      <OrganizationForm
        :loading="isSubmitting"
        :submitLabel="$t('dashboard.createOrg.createButton')"
        :cancelLabel="$t('dashboard.createOrg.cancelButton')"
        :onSubmit="handleCreate"
        :onCancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useOrganizationStore from '../../stores/organizationStore.js';
import OrganizationForm from './OrganizationForm.vue';
import { useToast } from 'primevue/usetoast';

const { t } = useI18n();
const router = useRouter();
const organizationStore = useOrganizationStore();
const isSubmitting = ref(false);
const toast = useToast();

const handleCreate = async (event) => {
  if (event.valid) {
    isSubmitting.value = true;
    try {
      await organizationStore.createOrganization(event.values);
      // Redirige vers la nouvelle organisation (la dernière de la liste)
      const orgs = organizationStore.organizations.value;
      if (orgs && orgs.length > 0) {
        const last = orgs[orgs.length - 1];
        router.push(`/app/dashboard/${last.id}/organizations`);
      }
    } catch (err) {
      const error = err;
      if (error?.response?.data?.code === 'YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS') {
        toast.add({
          severity: 'error',
          summary: t('dashboard.createOrg.maxReached'),
          life: 5000
        });
      } else {
        toast.add({
          severity: 'error',
          summary: t('dashboard.createOrg.createError'),
          detail: error?.message,
          life: 4000
        });
      }
    } finally {
      isSubmitting.value = false;
    }
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.new-org-view {
  min-height: 60vh;
}
</style> 