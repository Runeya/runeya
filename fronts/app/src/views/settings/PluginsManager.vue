<template>
  <div class="plugins-container">
    <!-- PrimeVue TabView for navigation -->
    <TabView v-model:activeIndex="activeTabIndex" class="plugins-tabs">
      <!-- Installed Plugins Tab -->
      <TabPanel :header="$t('plugins.myPlugins') || 'Mes Plugins'" value="0">
        <div class="installed-plugins">
          <!-- Plugins Table using PrimeVue DataTable -->
          <DataTable
            :value="pluginManager.plugins.value" 
            :paginator="pluginManager.plugins.value.length > 10"
            :rows="10"
            class="plugins-datatable"
            dataKey="name"
            stripedRows
            :loading="false"
          >
            <!-- Plugin Icon and Name Column -->
            <Column :header="$t('plugins.plugin') || 'Plugin'" style="width: 35%">
              <template #body="slotProps">
                <div class="flex items-center gap-3">
                  <div class="font-medium text-stone-800">
                    {{ slotProps.data?.displayName || slotProps.data?.name || 'Plugin' }}
                  </div>
                </div>
              </template>
            </Column>

            <!-- Description Column -->
            <Column :header="$t('plugins.description') || 'Description'" style="width: 40%">
              <template #body="slotProps">
                <p class="text-stone-600 text-sm">
                  {{ slotProps.data?.description || 'No description available' }}
                </p>
              </template>
            </Column>

            <!-- Version Column -->
            <Column :header="$t('plugins.version') || 'Version'" style="width: 10%">
              <template #body="slotProps">
                <Badge 
                  :value="slotProps.data?.version || '1.0.0'" 
                  severity="info"
                />
              </template>
            </Column>

            <!-- Actions Column -->
            <Column :header="$t('plugins.actions') || 'Actions'" style="width: 15%">
              <template #body="slotProps">
                <div class="flex items-center gap-1">
                <Button
                    v-if="slotProps.data?.version !== 'development'"
                    icon="fas fa-trash" 
                    severity="danger" 
                    text 
                    rounded 
                    size="small"
                    :title="$t('plugins.uninstall') || 'Désinstaller'"
                    @click="openDeleteConfirmation(slotProps.data)"
                    :loading="deletingPlugin === slotProps.data?.name"
                  />
                </div>
              </template>
            </Column>

            <!-- Empty State Template -->
            <template #empty>
              <div class="empty-state text-center py-8">
                <div class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-puzzle-piece text-stone-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-stone-800 mb-2">
                  {{ $t('plugins.noPlugins') || 'Aucun plugin installé' }}
                </h3>
                <p class="text-stone-600 mb-4">
                  {{ $t('plugins.noPluginsDescription') || 'Explorez le store pour découvrir des plugins utiles' }}
                </p>
                <Button 
                  :label="$t('plugins.browseStore') || 'Parcourir le Store'"
                  icon="fas fa-shopping-cart"
                  @click="activeTabIndex = 1"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </TabPanel>

      <!-- Store Tab -->
      <TabPanel :header="$t('plugins.store') || 'Store'" value="1">
        <div class="plugin-store">
          <iframe ref="storeIframe" v-if="config.pluginsUrl && activeTabIndex === 1" class="store-placeholder w-full h-full" :src="`${config.pluginsUrl}`" :style="{height: '90vh'}"></iframe>
        </div>
      </TabPanel>
    </TabView>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="showDeleteDialog" 
      :header="$t('plugins.confirmDelete') || 'Confirmer la suppression'"
      modal 
      :closable="false"
      class="delete-confirmation-dialog"
      :style="{ width: '450px' }"
    >
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
        </div>
        <div class="flex-1">
          <p class="text-stone-800 mb-2">
            {{ $t('plugins.deleteConfirmMessage') || 'Êtes-vous sûr de vouloir supprimer ce plugin ?' }}
          </p>
          <p class="text-stone-600 text-sm">
            <strong>{{ pluginToDelete?.displayName || pluginToDelete?.name }}</strong>
          </p>
          <p class="text-stone-500 text-xs mt-1">
            {{ $t('plugins.deleteWarning') || 'Cette action est irréversible.' }}
          </p>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            :label="$t('plugins.cancel') || 'Annuler'"
            severity="secondary"
            @click="closeDeleteConfirmation"
            :disabled="loadingDelete"
          />
          <Button 
            v-if="pluginToDelete?.version !== 'development'"
            :label="$t('plugins.delete') || 'Supprimer'"
            severity="danger"
            @click="confirmDelete"
            :loading="loadingDelete"
            icon="fas fa-trash"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import pluginManager from '../../models/pluginManager';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

// PrimeVue components
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import config from '../../config';
import notification from '../../helpers/notification';

const { t } = useI18n();
const activeTabIndex = ref(0);
const showDeleteDialog = ref(false);
const pluginToDelete = ref(null);
const deletingPlugin = ref('');
const loadingDelete = ref(false);

/** @type {import('vue').Ref<HTMLIFrameElement | null>} */
const storeIframe = ref(null);

const openDeleteConfirmation = (plugin) => {
  pluginToDelete.value = plugin;
  showDeleteDialog.value = true;
};

const closeDeleteConfirmation = () => {
  showDeleteDialog.value = false;
  pluginToDelete.value = null;
  deletingPlugin.value = '';
};

const confirmDelete = async () => {
  if (!pluginToDelete.value) return;
  
  deletingPlugin.value = pluginToDelete.value.name || '';
  loadingDelete.value = true;
  try {
    await axios.delete('/plugins/delete', {
      data: { name: pluginToDelete.value.name }
    });
    
    // Refresh plugins list
    await pluginManager.init();
    
    notification.next('success', t('plugins.deleteSuccess') || 'Plugin supprimé avec succès');
    closeDeleteConfirmation();
  } catch (err) {
    console.error('Delete plugin error:', err);
    const error = err;
    const errorMessage = error.response?.data?.message || t('plugins.deleteError') || 'Erreur lors de la suppression du plugin';
    notification.next('error', errorMessage);
    deletingPlugin.value = '';
  } finally {
    loadingDelete.value = false;
  }
};

const handleMessage = (event) => {
  if (event.data.type === 'plugin-loaded') {
    console.log('plugin loaded');
    storeIframe.value?.contentWindow?.postMessage({
      type: 'iframed',
    }, '*');
  }
  if(event.data.type === 'download-plugin') {
    pluginManager.installPlugin(event.data.url)
      .then(() => {
        notification.next('success', t('plugins.installSuccess') || 'Plugin installé avec succès');
      })
      .catch((e) => {
        console.log(e.response.data.code)
        if(e.response.data.code === '400.68746854743512') {
          notification.next('error', 'The plugin is already installed with this version');
        }
      });
  }
};

onMounted(async () => {
  window.addEventListener('message', handleMessage);
});
onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
});
</script>

<style lang="scss" scoped>
.plugins-tabs {
  :deep(.p-tabview-panels) {
    @apply p-0;
  }
}

.plugins-datatable {
  :deep(.p-datatable-table) {
    @apply border-0;
  }
  
  :deep(.p-datatable-thead > tr > th) {
    @apply bg-stone-50 border-b border-stone-200 text-stone-700 font-medium;
  }
  
  :deep(.p-datatable-tbody > tr > td) {
    @apply border-b border-stone-100 py-3;
  }
  
  :deep(.p-datatable-tbody > tr:hover) {
    @apply bg-stone-50;
  }
  
  :deep(.p-paginator) {
    @apply bg-transparent border-0 border-t border-stone-200;
  }
}

.empty-state {
  @apply max-w-md mx-auto;
}

.store-placeholder {
  :deep(.p-card-content) {
    @apply p-0;
  }
}
</style>