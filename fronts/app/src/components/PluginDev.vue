<template>
  <div>
    <Dialog ref="modalBuildingRef" v-model:visible="modalBuildingVisible" :closable="false" :modal="true">
      <h1>Plugin {{ pluginName }} is building...</h1>
    </Dialog>
  </div>
</template>

<script setup>
import sockets from '../helpers/Socket'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'

const modalBuildingRef = ref(null)
const modalBuildingVisible = ref(false)
const pluginName = ref(null)

sockets.on('plugins:front:changed', (plugin) => {
  console.log(`🔄 Plugin ${plugin} changed, reloading page...`);
  modalBuildingVisible.value = false
  pluginName.value = null
  document.location.reload();
});

sockets.on('plugins:front:building', (plugin) => {
  console.log(`🔄 Plugin ${plugin} building...`);
  pluginName.value = plugin
  modalBuildingVisible.value = true
});
</script>

