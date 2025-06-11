<template>
  <!-- PRIMEVUE MODAL OPENED ON ERROR IN SOCKET -->
  <Dialog :visible="true" :modal="true" v-for="error in errors" :key="error.id" @update:visible="closeError(error)">
    <template #header>
      <h2 class="error-header"><i class="fas fa-exclamation-triangle"></i> {{ error.header }}</h2>
    </template>
    <p>{{ error.message }}</p>
    <pre>{{ error.error }}</pre>
  </Dialog>

  <Dialog :visible="!!installationState.step" :modal="true"  @update:visible="closeInfo()">
    <template #header>
      <h2>{{ installationState.plugin }}</h2>
    </template>
    <p>{{ t(installationState.step) }}</p>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Dialog from 'primevue/dialog';
import sockets from '../helpers/Socket';


/** @type {import('vue').Ref<{id: string, pluginName?: string, error: string, message: string, header: string}[]>} */
const errors = ref([]);

const installationState = ref({
  plugin: null,
  step: null,
});

function t(message) {
  return {
    INSTALL_BACKEND_START: 'Installing backend',
    LOAD_BACKEND_START: 'Loading backend',
    CLEAR_CACHE: 'Clearing cache',
    REQUIRE_BACKEND: 'Requiring backend',
    INSTALL_START: 'Installing plugin',
  }[message] || message;
}

const closeError = (error) => {
  console.log('closeError', error);
  errors.value.splice(errors.value.indexOf(error), 1);
};

const closeInfo = () => {
  installationState.value = {
    plugin: null,
    step: null,
  };
};

const handleInfo = (res) => {
  const {plugin, step} = res;
  installationState.value = {
    plugin,
    step,
  };
};
const handleError = (_pluginName, _error) => {
  errors.value.push({
    id: crypto.randomUUID(),
    pluginName: _pluginName,
    error: _error,
    message: `An error occurred while installing the plugin ${_pluginName}`,
    header: 'Error while installing plugin',
  });
};
const handleCriticalError = (_error) => {
  errors.value.push({
    id: crypto.randomUUID(),
    error: _error,
    message: 'A critical error occurred',
    header: 'Critical Error',
  });
};

onMounted(() => {
  sockets.on('plugins:install:error', handleError);
  sockets.on('plugins:loading:error', handleError);
  sockets.on('critical:error', handleCriticalError);
  sockets.on('plugins:loading:progress', handleInfo);
});

onBeforeUnmount(() => {
  sockets.off('plugins:install:error', handleError);
  sockets.off('plugins:loading:error', handleError);
  sockets.off('critical:error', handleCriticalError);
  sockets.off('plugins:loading:progress', handleInfo);
});
</script>

<style scoped lang="scss">
.error-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: red;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-all;
  background-color: var(--system-backgroundColor100);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--system-borderColor100);
  color: var(--system-textColor100);
  font-size: 0.8rem;
  font-family: var(--system-fontFamily100);
}
</style>