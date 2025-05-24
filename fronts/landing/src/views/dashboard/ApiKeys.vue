<template>
  <DashboardPageLayout :title="$t('dashboard.apiKeys.title') || 'API Keys'">
    <DashboardCard
      :title="$t('dashboard.apiKeys.yourKeys') || 'Your API Keys'"
      :is-loading="isLoading"
      :loading-text="$t('dashboard.apiKeys.loading') || 'Loading API keys...'"
      :is-empty="apiKeys.length === 0"
      empty-icon="fa-key"
      :empty-title="$t('dashboard.apiKeys.noKeys') || 'No API Keys'"
      :empty-description="$t('dashboard.apiKeys.noKeysDescription') || 'You haven\'t created any API keys yet. Create your first API key to get started.'"
    >
      <template #actions>
        <Button 
          :label="$t('dashboard.apiKeys.createKey') || 'Create API Key'" 
          icon="fas fa-plus" 
          @click="openCreateDialog"
        />
      </template>
      
      <template #empty-actions>
        <Button 
          :label="$t('dashboard.apiKeys.createKey') || 'Create API Key'" 
          icon="fas fa-plus" 
          @click="openCreateDialog"
        />
      </template>
      
      <DataTable 
        :value="apiKeys" 
        stripedRows 
        responsiveLayout="scroll"
        class="api-keys-table"
        dataKey="id"
        :paginator="apiKeys.length > 10"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :sortMode="'multiple'"
      >
        <Column field="name" :header="$t('dashboard.apiKeys.name') || 'Name'" :sortable="true">
          <template #body="slotProps">
            <div class="key-name-cell">
              <div class="key-icon">
                <i class="fas fa-key"></i>
              </div>
              <span class="key-name-text">{{ slotProps.data.name || 'Unnamed Key' }}</span>
              <span v-if="!slotProps.data.enabled" class="disabled-tag">{{ $t('dashboard.apiKeys.disabled') || 'Disabled' }}</span>
            </div>
          </template>
        </Column>
        <Column field="start" :header="$t('dashboard.apiKeys.keyPreview') || 'Key Preview'" :sortable="false">
          <template #body="slotProps">
            <code class="key-preview">{{ slotProps.data.start }}***</code>
          </template>
        </Column>
        <Column field="createdAt" :header="$t('dashboard.apiKeys.created') || 'Created'" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column field="expiresAt" :header="$t('dashboard.apiKeys.expires') || 'Expires'" :sortable="true">
          <template #body="slotProps">
            <span v-if="slotProps.data.expiresAt">{{ formatDate(slotProps.data.expiresAt) }}</span>
            <span v-else class="never-expires">{{ $t('dashboard.apiKeys.neverExpires') || 'Never' }}</span>
          </template>
        </Column>
        <Column :header="$t('dashboard.apiKeys.actions') || 'Actions'" style="width: 120px" :exportable="false">
          <template #body="slotProps">
            <div class="action-buttons">
              <Button 
                icon="fas fa-edit" 
                class="p-button-sm p-button-text" 
                @click="editKey(slotProps.data)"
                :title="$t('dashboard.apiKeys.edit') || 'Edit'"
              />
              <Button 
                icon="fas fa-trash" 
                class="p-button-sm p-button-text p-button-danger" 
                @click="confirmDelete(slotProps.data)"
                :title="$t('dashboard.apiKeys.delete') || 'Delete'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </DashboardCard>
    
    <!-- Create API Key Dialog -->
    <Dialog 
      v-model:visible="createDialogVisible" 
      modal 
      :header="$t('dashboard.apiKeys.createNewKey') || 'Create New API Key'"
      :style="{ width: '500px' }"
      class="api-key-dialog"
    >
      <Form @submit="createKey" :resolver="createKeyResolver" :key="createFormKey">
        <template v-slot="$form">
          <div class="p-fluid">
            <div class="p-field">
              <label for="createKeyName">{{ $t('dashboard.apiKeys.nameLabel') || 'Name' }} *</label>
              <InputText 
                name="name"
                :placeholder="$t('dashboard.apiKeys.namePlaceholder') || 'Enter a name for your API key'"
                class="w-full"
              />
              <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.name.error?.message }}
              </Message>
            </div>
            
            <div class="p-field">
              <label for="createKeyExpires">{{ $t('dashboard.apiKeys.expirationLabel') || 'Expiration' }}</label>
              <Select 
                name="expiresIn"
                :options="expirationOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('dashboard.apiKeys.selectExpiration') || 'Select expiration'"
                class="w-full"
              />
            </div>
          </div>
          
          <div class="dialog-footer">
            <Button 
              :label="$t('dashboard.apiKeys.cancel') || 'Cancel'" 
              icon="fas fa-times" 
              class="p-button-text" 
              type="button"
              @click="cancelCreate"
            />
            <Button 
              :label="$t('dashboard.apiKeys.create') || 'Create'" 
              icon="fas fa-plus" 
              type="submit"
              :loading="isSubmitting"
            />
          </div>
        </template>
      </Form>
    </Dialog>
    
    <!-- Edit API Key Dialog -->
    <Dialog 
      v-model:visible="editDialogVisible" 
      modal 
      :header="$t('dashboard.apiKeys.editKey') || 'Edit API Key'"
      :style="{ width: '500px' }"
      class="api-key-dialog"
    >
      <Form @submit="saveKey" :resolver="editKeyResolver" :initialValues="editFormInitialValues" :key="editFormKey">
        <template v-slot="$form">
          <div class="p-fluid">
            <div class="p-field">
              <label for="editKeyName">{{ $t('dashboard.apiKeys.nameLabel') || 'Name' }} *</label>
              <InputText 
                name="name"
                :placeholder="$t('dashboard.apiKeys.namePlaceholder') || 'Enter a name for your API key'"
                class="w-full"
              />
              <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.name.error?.message }}
              </Message>
            </div>
            
            <div class="p-field">
              <div class="field-checkbox">
                <Checkbox 
                  name="enabled"
                  :binary="true"
                />
                <label for="enabled">{{ $t('dashboard.apiKeys.enabledLabel') || 'Enabled' }}</label>
              </div>
            </div>
          </div>
          
          <div class="dialog-footer">
            <Button 
              :label="$t('dashboard.apiKeys.cancel') || 'Cancel'" 
              icon="fas fa-times" 
              class="p-button-text" 
              type="button"
              @click="cancelEdit"
            />
            <Button 
              :label="$t('dashboard.apiKeys.save') || 'Save'" 
              icon="fas fa-save" 
              type="submit"
              :loading="isSubmitting"
            />
          </div>
        </template>
      </Form>
    </Dialog>
    
    <!-- API Key Created Success Dialog -->
    <Dialog 
      v-model:visible="keyCreatedDialogVisible" 
      modal 
      :header="$t('dashboard.apiKeys.keyCreated') || 'API Key Created'"
      :style="{ width: '600px' }"
      class="api-key-success-dialog"
      :closable="false"
    >
      <div class="key-created-content">
        <Message severity="success" :closable="false">
          {{ $t('dashboard.apiKeys.keyCreatedMessage') || 'Your API key has been created successfully. Please copy it now as you won\'t be able to see it again.' }}
        </Message>
        
        <div class="p-field">
          <label>{{ $t('dashboard.apiKeys.yourNewKey') || 'Your New API Key:' }}</label>
          <div class="key-display">
            <InputText 
              :value="createdKey" 
              readonly 
              class="key-input"
            />
            <Button 
              icon="fas fa-copy" 
              :title="$t('dashboard.apiKeys.copyKey') || 'Copy to clipboard'"
              @click="copyToClipboard(createdKey)"
            />
          </div>
        </div>
        
        <div class="dialog-footer">
          <Button 
            :label="$t('dashboard.apiKeys.iHaveCopied') || 'I have copied the key'" 
            icon="fas fa-check" 
            @click="closeKeyCreatedDialog"
          />
        </div>
      </div>
    </Dialog>
    
    <!-- Confirm Dialog -->
    <ConfirmDialog></ConfirmDialog>
    
    <!-- Toast -->
    <Toast position="bottom-right" />
  </DashboardPageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import * as yup from 'yup';
import useApiKeyStore from '../../stores/apiKeyStore.js';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import DashboardPageLayout from '../../components/common/DashboardPageLayout.vue';
import DashboardCard from '../../components/common/DashboardCard.vue';

const apiKeyStore = useApiKeyStore();
const confirm = useConfirm();
const toast = useToast();
const { t } = useI18n();

const isLoading = computed(() => apiKeyStore.isLoading.value);
const apiKeys = computed(() => apiKeyStore.apiKeys.value);

// Create key
const createDialogVisible = ref(false);
const isSubmitting = ref(false);
const createFormKey = ref(0);

// Edit key
const editDialogVisible = ref(false);
const editFormKey = ref(0);
const editingKey = ref(null);

// Key created
const keyCreatedDialogVisible = ref(false);
const createdKey = ref('');

// Expiration options
const expirationOptions = computed(() => [
  { label: t('dashboard.apiKeys.neverExpires') || 'Never expires', value: null },
  { label: t('dashboard.apiKeys.oneWeek') || '1 week', value: 7 * 24 * 60 * 60 },
  { label: t('dashboard.apiKeys.oneMonth') || '1 month', value: 30 * 24 * 60 * 60 },
  { label: t('dashboard.apiKeys.threeMonths') || '3 months', value: 90 * 24 * 60 * 60 },
  { label: t('dashboard.apiKeys.oneYear') || '1 year', value: 365 * 24 * 60 * 60 }
]);

// Form validation schemas
const createKeyResolver = yupResolver(
  yup.object().shape({
    name: yup
      .string()
      .min(3, t('dashboard.apiKeys.nameMinLength') || 'Name must be at least 3 characters')
      .required(t('dashboard.apiKeys.nameRequired') || 'Name is required'),
    expiresIn: yup.number().nullable()
  })
);

const editKeyResolver = yupResolver(
  yup.object().shape({
    name: yup
      .string()
      .min(3, t('dashboard.apiKeys.nameMinLength') || 'Name must be at least 3 characters')
      .required(t('dashboard.apiKeys.nameRequired') || 'Name is required'),
    enabled: yup.boolean()
  })
);

const editFormInitialValues = computed(() => ({
  name: editingKey.value?.name || '',
  enabled: editingKey.value?.enabled ?? true
}));

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

// Dialog functions
const openCreateDialog = () => {
  createFormKey.value++;
  createDialogVisible.value = true;
};

const cancelCreate = () => {
  createDialogVisible.value = false;
};

const createKey = async (event) => {
  if (!event.valid) return;
  
  isSubmitting.value = true;
  try {
    const keyData = {
      name: event.values.name,
      ...(event.values.expiresIn ? { expiresIn: event.values.expiresIn } : {})
    };
    
    const result = await apiKeyStore.createApiKey(keyData);
    createdKey.value = result.key;
    createDialogVisible.value = false;
    keyCreatedDialogVisible.value = true;
    
    toast.add({
      severity: 'success',
      summary: t('dashboard.apiKeys.success') || 'Success',
      detail: t('dashboard.apiKeys.keyCreatedToast') || 'API key created successfully',
      life: 3000
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.add({
      severity: 'error',
      summary: t('dashboard.apiKeys.error') || 'Error',
      detail: errorMessage || t('dashboard.apiKeys.createError') || 'Failed to create API key',
      life: 4000
    });
  } finally {
    isSubmitting.value = false;
  }
};

const editKey = (key) => {
  editingKey.value = key;
  editFormKey.value++;
  editDialogVisible.value = true;
};

const cancelEdit = () => {
  editDialogVisible.value = false;
  editingKey.value = null;
};

const saveKey = async (event) => {
  if (!event.valid || !editingKey.value) return;
  
  isSubmitting.value = true;
  try {
    await apiKeyStore.updateApiKey(editingKey.value.id, {
      name: event.values.name,
      prefix: 'rya',
      enabled: event.values.enabled
    });
    
    editDialogVisible.value = false;
    editingKey.value = null;
    
    toast.add({
      severity: 'success',
      summary: t('dashboard.apiKeys.success') || 'Success',
      detail: t('dashboard.apiKeys.keyUpdatedToast') || 'API key updated successfully',
      life: 3000
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.add({
      severity: 'error',
      summary: t('dashboard.apiKeys.error') || 'Error',
      detail: errorMessage || t('dashboard.apiKeys.updateError') || 'Failed to update API key',
      life: 4000
    });
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (key) => {
  confirm.require({
    message: t('dashboard.apiKeys.deleteConfirmMessage') || `Are you sure you want to delete the API key "${key.name || 'Unnamed Key'}"? This action cannot be undone.`,
    header: t('dashboard.apiKeys.deleteConfirmTitle') || 'Delete API Key',
    icon: 'fas fa-exclamation-triangle',
    accept: () => deleteKey(key.id)
  });
};

const deleteKey = async (keyId) => {
  try {
    await apiKeyStore.deleteApiKey(keyId);
    
    toast.add({
      severity: 'success',
      summary: t('dashboard.apiKeys.success') || 'Success',
      detail: t('dashboard.apiKeys.keyDeletedToast') || 'API key deleted successfully',
      life: 3000
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.add({
      severity: 'error',
      summary: t('dashboard.apiKeys.error') || 'Error',
      detail: errorMessage || t('dashboard.apiKeys.deleteError') || 'Failed to delete API key',
      life: 4000
    });
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({
      severity: 'success',
      summary: t('dashboard.apiKeys.copied') || 'Copied',
      detail: t('dashboard.apiKeys.copiedToast') || 'API key copied to clipboard',
      life: 2000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('dashboard.apiKeys.error') || 'Error',
      detail: t('dashboard.apiKeys.copyError') || 'Failed to copy API key',
      life: 3000
    });
  }
};

const closeKeyCreatedDialog = () => {
  keyCreatedDialogVisible.value = false;
  createdKey.value = '';
};

// Load API keys on mount
onMounted(async () => {
  try {
    await apiKeyStore.fetchApiKeys();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.add({
      severity: 'error',
      summary: t('dashboard.apiKeys.error') || 'Error',
      detail: errorMessage || t('dashboard.apiKeys.loadError') || 'Failed to load API keys',
      life: 4000
    });
  }
});
</script>

<style lang="scss" scoped>
.api-keys-view {
  padding: 20px;
  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 12px 12px 0 0;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: #374151;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .loading-state,
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
  }
  
  .empty-icon {
    font-size: 3rem;
    color: #9ca3af;
    margin-bottom: 1rem;
  }
  
  .key-name-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .key-icon {
    color: #6b7280;
  }
  
  .key-name-text {
    font-weight: 500;
  }
  
  .disabled-tag {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .key-preview {
    background: #f3f4f6;
    padding: 0.5rem;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    border: 1px solid #e5e7eb;
  }
  
  .never-expires {
    color: #6b7280;
    font-style: italic;
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }
}

:deep(.api-key-dialog) {
  .p-dialog-content {
    padding: 0;
  }
  
  .p-dialog-header {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .p-fluid {
    padding: 1.5rem;
  }
}

:deep(.api-key-success-dialog) {
  .p-dialog-content {
    padding: 0;
  }
  
  .p-dialog-header {
    background: #f0f9ff;
    border-bottom: 1px solid #e0f2fe;
  }
}

.p-field {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    margin-bottom: 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 12px 12px;
}

.key-created-content {
  padding: 1.5rem;
  
  .p-field {
    margin-top: 1.5rem;
  }
  
  .key-display {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .key-input {
    flex: 1;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }
}
</style> 