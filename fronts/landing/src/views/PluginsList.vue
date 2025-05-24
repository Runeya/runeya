<template>
  <div class="plugins-public-view">
    <div class="plugins-header">
      <div class="plugins-title">
        <h1>{{ $t('plugins.title') || 'Plugins' }}</h1>
        <p class="plugins-subtitle">{{ $t('plugins.subtitle') || 'Discover and explore available plugins' }}</p>
      </div>
      
      <div class="plugins-search">
        <div class="p-inputgroup">
          <span class="p-inputgroup-addon">
            <i class="fas fa-search"></i>
          </span>
          <InputText 
            v-model="searchQuery" 
            :placeholder="$t('plugins.searchPlaceholder') || 'Search plugins...'"
            class="w-full"
            @input="filterPlugins"
          />
        </div>
      </div>
    </div>

    <div class="plugins-content">
      <div v-if="isLoading" class="loading-state">
        <ProgressSpinner />
        <span>{{ $t('plugins.loading') || 'Loading plugins...' }}</span>
      </div>

      <div v-else-if="error" class="error-state">
        <Message severity="error" :closable="false">
          {{ error }}
        </Message>
      </div>

      <div v-else-if="filteredPlugins.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-puzzle-piece"></i>
        </div>
        <h3>{{ $t('plugins.noPlugins') || 'No Plugins Available' }}</h3>
        <p>{{ $t('plugins.noPluginsDescription') || "No plugins have been published yet. Check back later!" }}</p>
      </div>

      <div v-else class="plugins-grid">
        <div 
          v-for="plugin in filteredPlugins" 
          :key="plugin.name" 
          class="plugin-card"
          @click="navigateToPlugin(plugin.name)"
        >
          <div class="plugin-card-header">
            <div class="plugin-info">
              <div class="plugin-namespace">
                <Tag :value="plugin.namespace" severity="primary" />
              </div>
              <h3 class="plugin-name">{{ plugin.name.replace(`${plugin.namespace}/`, '') }}</h3>
            </div>
          </div>
          
          <div class="plugin-card-body">
            <p class="plugin-description">
              {{ plugin.description || plugin.config?.description || $t('plugins.noDescription') }}
            </p>
            
            <div class="plugin-meta">
              <div class="plugin-version">
                <i class="fas fa-tag"></i>
                <span>{{ plugin.latestVersion || plugin.versions?.[0]?.version }}</span>
              </div>
              <div class="plugin-updated">
                <i class="fas fa-clock"></i>
                <span>{{ formatDate(plugin.updatedAt) }}</span>
              </div>
            </div>
          </div>
          
          <div class="plugin-card-footer">
            <div class="plugin-stats">
              <span class="versions-count">
                {{ plugin.versions?.length || 0 }} {{ $t('plugins.versions') || 'versions' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import axios from '../helpers/axios';

const router = useRouter();
const { t } = useI18n();
const plugins = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref('');

const filteredPlugins = computed(() => {
  if (!searchQuery.value) return plugins.value;
  
  const query = searchQuery.value.toLowerCase();
  return plugins.value.filter(plugin => 
    plugin.name.toLowerCase().includes(query) ||
    plugin.namespace?.toLowerCase().includes(query) ||
    plugin.description?.toLowerCase().includes(query) ||
    plugin.config?.description?.toLowerCase().includes(query)
  );
});

const loadPlugins = async () => {
  error.value = '';
  isLoading.value = true;
  
  try {
    const response = await axios.get('/plugins/list');
    plugins.value = response.data.plugins || [];
  } catch (err) {
    const errorMessage = t('plugins.loadError') || 'Failed to load plugins';
    error.value = errorMessage;
    console.error('Load plugins error:', err);
  } finally {
    isLoading.value = false;
  }
};

const navigateToPlugin = (pluginName) => {
  router.push({ name: 'plugin-detail', params: { pluginName } });
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const filterPlugins = () => {
  // Reactive filtering is handled by computed property
};

onMounted(() => {
  loadPlugins();
});
</script>

<style lang="scss" scoped>
.plugins-public-view {
  min-height: 100vh;
  padding: 2rem;
}

.plugins-header {
  max-width: 1200px;
  margin: 0 auto 3rem auto;
  text-align: center;
  
  .plugins-title {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 3rem;
      font-weight: 700;
      color: var(--text-color);
      margin: 0 0 1rem 0;
    }
    
    .plugins-subtitle {
      font-size: 1.25rem;
      color: var(--text-color-secondary);
      margin: 0;
    }
  }
  
  .plugins-search {
    max-width: 500px;
    margin: 0 auto;
  }
}

.plugins-content {
  max-width: 1200px;
  margin: 0 auto;
  
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 4rem;
    flex-direction: column;
    
    span {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
    }
  }
  
  .error-state {
    margin-bottom: 2rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem;
    
    .empty-icon {
      font-size: 5rem;
      color: var(--text-color-secondary);
      margin-bottom: 2rem;
    }
    
    h3 {
      font-size: 2rem;
      color: var(--text-color);
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
      max-width: 500px;
      margin: 0 auto;
    }
  }
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  .plugin-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--primary-color);
    }
  }
  
  .plugin-card-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .plugin-info {
      flex: 1;
      min-width: 0;
      
      .plugin-name {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        word-break: break-word;
      }
      
      .plugin-namespace {
        .p-tag {
          font-size: 0.75rem;
        }
      }
    }
  }
  
  .plugin-card-body {
    margin-bottom: 1rem;
    
    .plugin-description {
      color: var(--text-color-secondary);
      margin: 0 0 1rem 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .plugin-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      
      .plugin-version, .plugin-updated {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        
        i {
          width: 12px;
          font-size: 0.75rem;
        }
      }
    }
  }
  
  .plugin-card-footer {
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
    
    .plugin-stats {
      .versions-count {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
      }
    }
  }
}

@media (max-width: 768px) {
  .plugins-public-view {
    padding: 1rem;
  }
  
  .plugins-header .plugins-title h1 {
    font-size: 2rem;
  }
  
  .plugins-grid {
    grid-template-columns: 1fr;
  }
}
</style> 