<template>
  <div class="organizations-view">
    <h1 class="text-2xl font-bold mb-4">Organizations</h1>
    
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Your Organizations</h2>
        <Button 
          label="Create Organization" 
          icon="fas fa-plus" 
          @click="openCreateDialog"
        />
      </div>
      
      <div class="card-content">
        <div v-if="isLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading organizations...</span>
        </div>
        <div v-else-if="organizations.length === 0" class="empty-state">
          <i class="fas fa-building empty-icon"></i>
          <h3>No Organizations</h3>
          <p>You haven't created any organizations yet. Create your first organization to get started.</p>
          <Button 
            label="Create Organization" 
            icon="fas fa-plus" 
            @click="openCreateDialog"
          />
        </div>
        
        <div v-else>
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
            <Column field="name" header="Name" :sortable="true">
              <template #body="slotProps">
                <div class="org-name-cell">
                  <div class="org-avatar">
                    {{ getOrganizationInitials(slotProps.data.name) }}
                  </div>
                  <span class="org-name-text">{{ slotProps.data.name }}</span>
                  <span v-if="slotProps.data.id === currentOrganization?.id" class="current-tag">Current</span>
                </div>
              </template>
            </Column>
            <Column field="slug" header="Slug" :sortable="true" />
            <Column header="Actions" style="width: 100px" :exportable="false">
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
        </div>
      </div>
    </div>
    
    <!-- Create Organization Dialog -->
    <Dialog 
      v-model:visible="createDialogVisible" 
      modal 
      header="Create New Organization"
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
  </div>
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

export default defineComponent({
  name: 'Organizations',
  components: {
    Button,
    Dialog,
    ConfirmDialog,
    OrganizationForm,
    DataTable,
    Column
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
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            error.response &&
            'data' in error.response &&
            error.response.data &&
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
.organizations-view {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.card {
  background-color: var(--surface-a);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--surface-d);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--surface-d);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.card-content {
  padding: 20px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-color-secondary);
}

.loading-state i,
.empty-state .empty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.empty-state h3 {
  margin: 10px 0;
  font-weight: 600;
}

.empty-state p {
  margin-bottom: 20px;
  max-width: 400px;
}

.org-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.org-avatar {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  margin-right: 15px;
  flex-shrink: 0;
}

.org-name-text {
  font-weight: 500;
}

.org-info {
  flex: 1;
  min-width: 0;
}

.org-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-details {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.current-tag {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
}

.org-actions {
  display: flex;
  gap: 4px;
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