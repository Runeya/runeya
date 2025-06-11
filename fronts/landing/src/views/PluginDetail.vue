<template>
  <div class="plugin-detail-view">
    <div v-if="isLoading" class="loading-state">
      <ProgressSpinner />
      <span>{{ $t('plugins.loading') || 'Loading plugin...' }}</span>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>{{ $t('plugins.pluginNotFound') || 'Plugin not found' }}</h2>
        <p>{{ $t('plugins.pluginNotFoundDescription') || "The plugin you're looking for doesn't exist or has been removed." }}</p>
        <Button 
          :label="$t('plugins.backToPlugins') || '← Back to Plugins'"
          class="p-button-outlined"
          @click="$router.push({ name: 'plugins-list' })"
        />
      </div>
    </div>

    <div v-else-if="plugin" class="plugin-detail-content">
      <!-- Navigation -->
      <div class="plugin-navigation">
        <Button 
          :label="$t('plugins.backToPlugins') || '← Back to Plugins'"
          class="p-button-text"
          @click="$router.push({ name: 'plugins-list' })"
        />
      </div>

      <!-- Plugin Header -->
      <div class="plugin-header">
        <div class="plugin-header-content">
          <div class="plugin-title-info">
            <div class="plugin-namespace">
              <Tag :value="plugin.namespace" severity="secondary" />
            </div>
            <h1 class="plugin-title">{{ plugin.name.split(plugin.namespace+'/')[1] }}</h1>
          </div>
        </div>
        <div class="plugin-actions">
          <div class="plugin-status" v-if="getPluginInstallationStatus()">
            <Badge 
              :value="getPluginInstallationStatusLabel()" 
              :severity="getPluginInstallationStatus().severity"
              class="status-badge"
            />
          </div>
          <Button 
            :label="getActionButtonLabel()"
            :icon="getActionButtonIcon()"
            :severity="getActionButtonSeverity()"
            @click="downloadPlugin"
          />
        </div>
      </div>

      <!-- Plugin Info Grid -->
      <div class="plugin-info-grid">
        <!-- Description -->
        <Card class="plugin-description-card">
          <template #title>
            <i class="fas fa-info-circle"></i>
            {{ $t('plugins.description') || 'Description' }}
          </template>
          <template #content>
            <p v-if="plugin.description || plugin.config?.description">
              {{ plugin.description || plugin.config?.description }}
            </p>
            <p v-else class="no-content">
              {{ $t('plugins.noDescription') || 'No description available' }}
            </p>
          </template>
        </Card>

        <!-- Metadata -->
        <Card class="plugin-metadata-card">
          <template #title>
            <i class="fas fa-tags"></i>
            {{ $t('plugins.versions') || 'Versions' }}
          </template>
          <template #content>
            <div class="metadata-info">
              <div class="metadata-item">
                <label>{{ $t('plugins.latestVersion') || 'Latest Version' }}:</label>
                <Tag :value="plugin.versions?.[0]?.version || 'N/A'" severity="info" />
              </div>
              <div class="metadata-item">
                <label>{{ $t('plugins.lastUpdated') || 'Last Updated' }}:</label>
                <span>{{ formatDate(plugin.updatedAt) }}</span>
              </div>
              <div class="metadata-item">
                <label>{{ $t('plugins.namespace') || 'Namespace' }}:</label>
                <span>{{ plugin.namespace }}</span>
              </div>
            </div>
            
            <!-- All Versions -->
            <div v-if="plugin.versions && plugin.versions.length > 1" class="all-versions">
              <h4>All Versions:</h4>
              <div class="versions-list">
                <Tag 
                  v-for="version in plugin.versions" 
                  :key="version.version || version"
                  :value="version.version || version" 
                  severity="info"
                  class="version-tag"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>


      <Card class="plugin-readme-card" v-if="plugin.readme">
        <template #title>
          <i class="fas fa-scroll"></i>
          {{ $t('plugins.readme') || 'README' }}
        </template>
        <template #content>
          <iframe :srcdoc="markdown" width="100%" height="max-content" onload="this.style.height = (this.contentWindow.document.body.scrollHeight + 20) + 'px'"></iframe>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import { useToast } from 'primevue/usetoast';
import axios from '../helpers/axios';
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai.min.css'
import markdownIt from 'markdown-it'
import githubMarkdown from '../helpers/github-markdown-css'
import iframe from '../helpers/iframe';
import pluginsInstalled from '../stores/pluginsInstalled';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const plugin = ref(null);
const isLoading = ref(false);
const error = ref('');

const loadPlugin = async () => {
  error.value = '';
  isLoading.value = true;
  
  try {
    const pluginName = route.params.pluginName;
    const response = await axios.get(`/plugins/${encodeURIComponent(pluginName)}`);
    plugin.value = response.data.plugin;
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'PLUGIN_NOT_FOUND';
    } else {
      error.value = t('plugins.loadError') || 'Failed to load plugin';
    }
    console.error('Load plugin error:', err);
  } finally {
    isLoading.value = false;
  }
};
const md = markdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs">' +
              hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
              '</code></pre>';
      } catch (__) {}
    }
    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
})

const markdown = computed(() => ` 
<style>
  ${githubMarkdown}
</style>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="github-markdown.css">
<style>
	.markdown-body {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
	}

	@media (max-width: 767px) {
		.markdown-body {
			padding: 15px;
		}
	}
</style>
<div class="markdown-body">
  <div class="markdown">
    ${md.render(plugin.value.readme || '')}
  </div>
</div>
`)

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const getDownloadUrl = () => {
  if (!plugin.value) return '';
  return `${process.env.VUE_APP_API_URL}/api/plugins/download/${encodeURIComponent(plugin.value.name)}/latest`;
};

const downloadPlugin = () => {
  if(iframe.isIframed) {
    window.top?.postMessage({
      type: 'download-plugin',
      url: getDownloadUrl(),
    }, '*');
  } else {
    window.open(getDownloadUrl(), '_blank');
  }
};

const getPluginInstallationStatus = () => {
  if (!plugin.value || !plugin.value.name || !pluginsInstalled.plugins.value) {
    return null;
  }
  
  const installedPlugin = pluginsInstalled.plugins.value.find(installed => 
    installed && installed.name && (
      installed.name === plugin.value.name || 
      installed.name === plugin.value.name.replace(`${plugin.value.namespace || ''}/`, '')
    )
  );
  
  if (!installedPlugin) {
    return null;
  }
  
  const latestVersion = plugin.value.versions?.[0]?.version;
  const installedVersion = installedPlugin.version;
  
  if (!installedVersion) {
    return null;
  }
  
  // Compare versions to determine if update is available
  const isUpToDate = installedVersion === latestVersion;
  
  return {
    label: isUpToDate ? (t('plugins.installed') || 'Installed') : (t('plugins.updateAvailable') || 'Update Available'),
    severity: isUpToDate ? 'success' : 'warning',
    installedVersion: installedVersion,
    latestVersion: latestVersion,
    isUpToDate: isUpToDate
  };
};

const getPluginInstallationStatusLabel = () => {
  const status = getPluginInstallationStatus();
  if (!status) return '';
  
  const baseLabel = status.isUpToDate 
    ? (t('plugins.installed') || 'Installed')
    : (t('plugins.updateAvailable') || 'Update Available');
    
  return `${baseLabel} v${status.installedVersion}`;
};

const getActionButtonLabel = () => {
  const status = getPluginInstallationStatus();
  
  if (!status) {
    return t('plugins.downloadLatest') || 'Download Latest';
  }
  
  if (status.isUpToDate) {
    return t('plugins.reinstall') || 'Reinstall';
  }
  
  return t('plugins.updateToLatest') || 'Update to Latest';
};

const getActionButtonIcon = () => {
  const status = getPluginInstallationStatus();
  
  if (!status) {
    return 'fas fa-download';
  }
  
  if (status.isUpToDate) {
    return 'fas fa-sync-alt';
  }
  
  return 'fas fa-arrow-up';
};

const getActionButtonSeverity = () => {
  const status = getPluginInstallationStatus();
  
  if (!status) {
    return 'primary';
  }
  
  if (status.isUpToDate) {
    return 'secondary';
  }
  
  return 'warning';
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Command copied to clipboard',
      life: 3000
    });
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

onMounted(() => {
  loadPlugin();
});
</script>

<style lang="scss" scoped>
.plugin-detail-view {
  min-height: 100vh;
  padding: 2rem;
  
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 4rem;
    flex-direction: column;
    min-height: 60vh;
    
    span {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
    }
  }
  
  .error-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    
    .error-container {
      text-align: center;
      max-width: 500px;
      
      .error-icon {
        font-size: 4rem;
        color: var(--red-500);
        margin-bottom: 1rem;
      }
      
      h2 {
        color: var(--text-color);
        margin-bottom: 1rem;
      }
      
      p {
        color: var(--text-color-secondary);
        margin-bottom: 2rem;
        line-height: 1.6;
      }
    }
  }
}

.plugin-detail-content {
  max-width: 1000px;
  margin: 0 auto;
  
  .plugin-navigation {
    margin-bottom: 2rem;
  }
  
  .plugin-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 2rem;
    background: var(--surface-card);
    border-radius: 12px;
    border: 1px solid var(--surface-border);
    margin-bottom: 2rem;
    
    .plugin-header-content {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      
      .plugin-title-info {
        .plugin-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-color);
          word-break: break-word;
        }
        
        .plugin-namespace {
          .p-tag {
            font-size: 0.875rem;
          }
        }
      }
    }
    
    .plugin-actions {
      flex-shrink: 0;
      height: 100%;
      align-self: flex-end;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 1rem;
      
      .plugin-status {
        .status-badge {
          font-size: 0.875rem;
          font-weight: 500;
        }
      }
    }
  }
  
  .plugin-info-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
    
    .plugin-description-card,
    .plugin-metadata-card {
      :deep(.p-card-title) {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        color: var(--text-color);
        
        i {
          color: var(--primary-color);
        }
      }
      
      .no-content {
        color: var(--text-color-secondary);
        font-style: italic;
      }
    }
    
    .metadata-info {
      .metadata-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
        
        label {
          font-weight: 600;
          color: var(--text-color);
          min-width: 120px;
        }
        
        span {
          color: var(--text-color-secondary);
        }
      }
    }
    
    .all-versions {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);
      
      h4 {
        margin: 0 0 1rem 0;
        color: var(--text-color);
      }
      
      .versions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        
        .version-tag {
          font-size: 0.75rem;
        }
      }
    }
  }
  
  .plugin-documentation-card,
  .plugin-install-card,
  .plugin-readme-card {
    margin-bottom: 2rem;
    
    :deep(.p-card-title) {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      color: var(--text-color);
      
      i {
        color: var(--primary-color);
      }
    }
    
    .documentation-content {
      line-height: 1.6;
      color: var(--text-color-secondary);
      
      :deep(h1), :deep(h2), :deep(h3) {
        color: var(--text-color);
        margin: 1.5rem 0 1rem 0;
      }
      
      :deep(code) {
        background: var(--surface-b);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
      }
      
      :deep(li) {
        margin-bottom: 0.5rem;
      }
    }
    
    .install-commands {
      .command-block {
        margin-bottom: 1.5rem;
        
        label {
          display: block;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }
        
        .command-line {
          display: flex;
          align-items: center;
          background: var(--surface-b);
          border: 1px solid var(--surface-border);
          border-radius: 6px;
          padding: 1rem;
          
          code {
            flex: 1;
            font-family: 'Courier New', monospace;
            color: var(--text-color);
            background: none;
            padding: 0;
          }
          
          .copy-btn {
            margin-left: 1rem;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .plugin-detail-view {
    padding: 1rem;
  }
  
  .plugin-detail-content {
    .plugin-header {
      flex-direction: column;
      gap: 1.5rem;
      
      .plugin-header-content {
        .plugin-title-info .plugin-title {
          font-size: 2rem;
        }
      }
      
      .plugin-actions {
        align-self: stretch;
      }
    }
    
    .plugin-info-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style> 