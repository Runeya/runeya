<template>
  <DashboardPageLayout :title="$t('dashboard.organizationsPage.title')">
    <DashboardCard
      :title="$t('dashboard.organizationsPage.yourOrganizations')"
      :is-loading="isLoading"
      :loading-text="$t('dashboard.organizationsPage.loading')"
      :is-empty="organizations.length === 0"
      empty-icon="fa-building"
      :empty-title="$t('dashboard.organizationsPage.noOrganizations')"
      :empty-description="$t('dashboard.organizationsPage.noOrganizationsDescription')"
    >
      <template #actions>
        <Button 
          :label="$t('dashboard.organizationsPage.createOrganization')" 
          icon="fas fa-plus" 
          @click="openCreateDialog"
        />
      </template>
      
      <template #empty-actions>
        <Button 
          :label="$t('dashboard.organizationsPage.createOrganization')" 
          icon="fas fa-plus" 
          @click="openCreateDialog"
        />
      </template>
      
      <DataTable 
        :value="organizations" 
        stripedRows 
        responsiveLayout="scroll"
        class="organizations-table"
        dataKey="id"
        :paginator="organizations.length > 10"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :sortMode="'multiple'"
      >
        <Column field="name" :header="$t('dashboard.organizationsPage.table.name')" :sortable="true">
          <template #body="slotProps">
            <div class="org-name-cell">
              <Tag :value="slotProps.data.name?.substring(0, 1)" severity="primary" class="mr-2" />
              <span class="org-name-text">{{ slotProps.data.name }}</span>
              <Tag v-if="slotProps.data.id === currentOrganization?.id" :value="$t('dashboard.current')" severity="contrast" class="ml-2" />
            </div>
          </template>
        </Column>
        <Column field="slug" :header="$t('dashboard.organizationsPage.table.slug')" :sortable="true" />
        <Column :header="$t('dashboard.organizationsPage.table.actions')" style="width: 100px" :exportable="false">
          <template #body="slotProps">
            <div class="action-buttons">
              <Button 
                icon="fas fa-cog" 
                class="p-button-sm p-button-text" 
                @click="goToSettings(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </DashboardCard>
    
    <!-- Create Organization Dialog -->
    <Dialog 
      v-model:visible="createDialogVisible" 
      modal 
      :header="$t('dashboard.organizationsPage.createNewOrganization')"
      :style="{ width: '450px' }"
    >
      <OrganizationForm
        :loading="isSubmitting"
        :submitLabel="$t('dashboard.createOrg.createButton')"
        :cancelLabel="$t('dashboard.createOrg.cancelButton')"
        :onSubmit="createOrganization"
        :onCancel="cancelCreate"
      />
    </Dialog>
    
    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>
  </DashboardPageLayout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watchEffect } from 'vue';
import useOrganizationStore from '../../stores/organizationStore.js';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { useRoute, useRouter } from 'vue-router';
import OrganizationForm from './OrganizationForm.vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { Tag } from 'primevue';
import DashboardPageLayout from '../../components/common/DashboardPageLayout.vue';
import DashboardCard from '../../components/common/DashboardCard.vue';

export default defineComponent({
  name: 'Organizations',
  components: {
    Button,
    Dialog,
    ConfirmDialog,
    OrganizationForm,
    DataTable,
    Column,
    Tag,
    DashboardPageLayout,
    DashboardCard
  },
  setup() {
    const organizationStore = useOrganizationStore();
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    const { t } = useI18n();
    
    const isLoading = computed(() => {
      return organizationStore.isLoading.value
    });
    const organizations = computed(() => organizationStore.organizations.value);
    const currentOrganization = computed(() => organizationStore.currentOrganization.value);
    
    // Create organization
    const createDialogVisible = ref(false);
    const isSubmitting = ref(false);
    
    // Helper functions
    const getOrganizationInitials = (name) => {
      if (!name) return '';
      return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };
    
    // Dialog functions
    const openCreateDialog = () => {
      createDialogVisible.value = true;
    };
    
    const cancelCreate = () => {
      createDialogVisible.value = false;
    };
    
    const createOrganization = async (event) => {
      if (event.valid) {
        isSubmitting.value = true;
        try {
          await organizationStore.createOrganization(event.values);
          createDialogVisible.value = false;
          console.log(event)
        } catch (err) {
          const error = err;
          console.log(error)
          if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'data' in error.response &&
            error.response.data &&
            typeof error.response.data === 'object' &&
            'code' in error.response.data &&
            error.response.data.code === 'YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS'
          ) {
            toast.add({
              severity: 'error',
              summary: t('dashboard.createOrg.maxReached'),
              life: 5000
            });
          } else {
            toast.add({
              severity: 'error',
              summary: t('dashboard.createOrg.createError'),
              detail: (typeof error === 'object' && error !== null && 'message' in error) ? error.message : '',
              life: 4000
            });
          }
        } finally {
          isSubmitting.value = false;
        }
      }
    };
    
    const goToSettings = (org) => {
      router.push(`/app/dashboard/${org.id}/organization/settings`);
    };
    
    // Synchronise l'organisation courante avec l'URL
    watchEffect(async () => {
      const orgId = route.params.orgId;
      if (orgId && organizations.value.length > 0) {
        const found = organizations.value.find(org => org.id === orgId);
        if (found && (!currentOrganization.value || currentOrganization.value.id !== orgId)) {
          await organizationStore.setCurrentOrganization(found);
        } else if (!found) {
          // Redirige vers la première org si l'id n'est pas trouvé
          const first = organizations.value[0];
          if (first) {
            router.replace(`/app/dashboard/${first.id}/organizations`);
          }
        }
      }
    });
    
    return {
      isLoading,
      organizations,
      currentOrganization,
      createDialogVisible,
      isSubmitting,
      getOrganizationInitials,
      openCreateDialog,
      cancelCreate,
      createOrganization,
      goToSettings
    };
  }
});
</script>

<style lang="scss" scoped>
.org-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.org-name-text {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.organizations-table {
  width: 100%;
  
  :deep(.p-datatable-thead) th {
    font-weight: 600;
    background-color: var(--surface-c);
  }
  
  :deep(.p-datatable-tbody) tr {
    cursor: pointer;
    
    &:hover {
      background-color: var(--surface-hover);
    }
    
    td {
      padding: 0.75rem 1rem;
    }
  }
  
  :deep(.p-paginator) {
    padding: 0.5rem;
  }
}
</style> 