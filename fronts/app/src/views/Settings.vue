<template>
  <div class="stack-create-root">
    <Splitter style="height: 100%">
        <SplitterPanel :size="1" :style="{minWidth: '160px'}" class="leftPanel"> 
          <Tree
            :value="nodes"
            :selectionKeys="selectedKey"
            @update:selectionKeys="navigate"
            selectionMode="single"
            size="small"
            class="w-full"
          />
        </SplitterPanel>
        <SplitterPanel :size="75" class="rightPanel">
          <div class="splitter-content" :class="{full: selectedKey['parsers']}">
            <Crypto v-if="selectedKey['crypto']"></Crypto>
            <Environments v-else-if="selectedKey['environments']"></Environments>
            <Parsers v-else-if="selectedKey['parsers']"></Parsers>
            <General v-else-if="selectedKey['general']"></General>
            <Notifications v-else-if="selectedKey['notifications']"></Notifications>
            <PluginsManager v-else-if="selectedKey['pluginsManager']"></PluginsManager>
          </div>
        </SplitterPanel>
    </Splitter>
  </div>
</template>

<script setup>
import Environments from './settings/Environments.vue';
import Crypto from './settings/Crypto.vue';
import Notifications from './settings/Notifications.vue';
import General from './settings/General.vue';
import Parsers from './settings/Parsers.vue';
import PluginsManager from './settings/PluginsManager.vue';
import { computed, onMounted, ref, watch } from 'vue';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Tree from 'primevue/tree';
import { useRouter } from 'vue-router';
let selectedKey = ref({})
const router = useRouter()
watch(() => router.currentRoute.value, () => {
  selectedKey.value = {[router.currentRoute.value.params.setting?.toString()]: true}
}, {deep: true})
onMounted(() => {
  const tab = router.currentRoute.value.params.setting
  selectedKey
  if(tab) selectedKey.value = {[tab?.toString()]: true}
  if(!Object.keys(selectedKey.value).length) selectedKey.value = {[nodes.value[0].key]: true}
})

function navigate(res) {
  router.push({name: 'settings', params: {setting: Object.keys(res)[0]}})
}

const nodes = computed(() => ([
   {
    key: 'general',
    label: 'General',
    icon: 'fas fa-home',
  },
  {
    key: 'crypto',
    label: 'Security',
    icon: 'fas fa-shield-halved',
  },
  {
    key: 'environments',
    label: 'Environments',
    icon: 'fas fa-home',
  },
  {
    key: 'parsers',
    label: 'Parsers',
    icon: 'fas fa-scroll',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: 'fas fa-bell',
  },
  {
    key: 'pluginsManager',
    label: 'Plugins',
    icon: 'fas fa-plug',
  },
]));

</script>

<style lang="scss" scoped>
  .stack-create-root {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }
  .rightPanel {
    padding: 10px;
    display: flex;
    justify-content: center;
    overflow: auto;
  }
  .leftPanel {
    background-color: var(--p-content-background);
  }
  :deep(.p-splitter) {
    background-color: transparent;
    border: none;
    .p-tree-node-toggle-button {
      display: none;
    }
    .p-splitterpanel {}
  }
  .splitter-content {
    width: 100%;
    max-width: 800px;
    &.full {
      max-width: inherit
    }
  }
</style>