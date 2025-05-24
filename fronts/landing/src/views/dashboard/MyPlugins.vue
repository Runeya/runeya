<template>
  <DashboardPageLayout :title="$t('dashboard.plugins.title') || 'My Plugins'">
    <DashboardCard
      :title="$t('dashboard.plugins.yourPlugins') || 'Your Plugins'"
      :is-loading="isLoading"
      :loading-text="$t('dashboard.plugins.loading') || 'Loading plugins...'"
      :is-empty="plugins.length === 0"
      empty-icon="fa-puzzle-piece"
      :empty-title="$t('dashboard.plugins.noPlugins') || 'No Plugins'"
      :empty-description="$t('dashboard.plugins.noPluginsDescription') || 'You haven\'t uploaded any plugins yet. Upload your first plugin to get started.'"
    >
      <DataTable 
        :value="plugins" 
        stripedRows 
        responsiveLayout="scroll"
        class="plugins-table"
        dataKey="id"
        :paginator="plugins.length > 10"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :sortMode="'multiple'"
        @row-click="goToPluginDetail"
      >
        <Column field="name" :header="$t('dashboard.plugins.name') || 'Name'" :sortable="true">
          <template #body="slotProps">
            <div class="plugin-name-cell">
              <span class="plugin-name-text">{{ slotProps.data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="versions" :header="$t('dashboard.plugins.version') || 'Version'">
          <template #body="slotProps">
            <div class="version-cell">
              <Tag 
                v-for="(version, index) in slotProps.data.versions.slice(0, nbVersionsToShow)" 
                :key="version.version" 
                :value="version.version" 
                :severity="index === 0 ? 'success' : 'secondary'"
                class="version-tag"
              />
              <span v-if="slotProps.data.versions.length > nbVersionsToShow" class="more-versions">
                +{{ slotProps.data.versions.length - nbVersionsToShow }} more
              </span>
            </div>
          </template>
        </Column>
        <Column field="updatedAt" :header="$t('dashboard.plugins.uploadedAt') || 'Uploaded'" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.updatedAt) }}
          </template>
        </Column>
      </DataTable>
    </DashboardCard>
  </DashboardPageLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import axios from '../../helpers/axios';
import useStoreOrganization from '../../stores/organizationStore';
import DashboardPageLayout from '../../components/common/DashboardPageLayout.vue';
import DashboardCard from '../../components/common/DashboardCard.vue';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const plugins = ref([]);
const isLoading = ref(false);
const error = ref('');
const nbVersionsToShow = 3;
const storeOrganization = useStoreOrganization();
const router = useRouter();

watch(storeOrganization.currentOrganization, (newVal) => {
  loadPlugins();
});

const loadPlugins = async () => {
  error.value = '';
  isLoading.value = true;
  
  try {
    const response = await axios.get('/plugins/list', {
      params: {
        q: {
          namespace: `@${storeOrganization.currentOrganization.value?.slug}`
        }
      }
    });
    plugins.value = response.data.plugins || [];
  } catch (err) {
    const errorMessage = t('dashboard.plugins.loadError') || 'Failed to load plugins';
    error.value = errorMessage;
    console.error('Load plugins error:', err);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const goToPluginDetail = ({data}) => {
  console.log(event, data);
  router.push(`/plugins/${encodeURIComponent(data.name)}`);
};

onMounted(() => {
  loadPlugins();
});
</script>

<style lang="scss" scoped>
.plugin-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.plugin-name-text {
  font-weight: 500;
}

.version-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.version-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.more-versions {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.description-text {
  color: #6b7280;
  font-size: 0.875rem;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plugins-table {
  width: 100%;
  
  :deep(.p-datatable-thead) th {
    font-weight: 600;
    background-color: var(--surface-c);
  }
  
  :deep(.p-datatable-tbody) tr {
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