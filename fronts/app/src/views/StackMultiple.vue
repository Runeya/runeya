<template>
  <div class="stack-multiple">
    <tabs :tabs="tabs" :showLabels="false" ref="tabRef" height="100%">
      <template #default="{tab}">
          <div class="tab" >
            <draggableVue v-model="services"
              v-bind="{animation: 300}"
              :setData="setData"
              item-key="label"
              class="services">
              <template #item="{element: service}">
                <section-cmp
                  class="service-container"
                  :headerBold="true"
                  :noBodyPadding="true"
                  :header="service.label"
                  :actions="[
                    {click: () => goTo(service.git.home), icon: 'fab fa-github'},
                    {click: () => goTo(service.url), icon: 'fas fa-globe'},
                    // {click: () => openInVsCode(service), icon: 'fas fa-file-code'},
                    {click: () => openFolder(service), icon: 'fas fa-folder'},
                  ]">
                  <Suspense>
                    <template #default>
                      <component :is="dynamicComponents[tab.id] || tab.id" :service="service" :key="service.label" :isInMultiMode="true"  :noStyle="true"></component>
                    </template>
                    <template #fallback>
                      <div class="dynamic-loader">
                        <div class="loader-content">
                          <i class="fas fa-spinner fa-spin loader-icon"></i>
                          <span>Loading component...</span>
                        </div>
                      </div>
                    </template>
                  </Suspense>
                </section-cmp>
              </template>
            </draggableVue>
          </div>
      </template>
    </tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineAsyncComponent, shallowRef } from 'vue'
import Section from '../components/Section.vue'
import stack from '../models/stack'
import Tabs from '../components/Tabs.vue'
import draggableVue from 'vuedraggable'
import PromiseB from 'bluebird'
import axios from '../helpers/axios'
import views from '@runeya/modules-plugins-loader-front/src/views'

/**
 * @typedef {{
 * id: string,
 * hidden: boolean,
 * label: string,
 * icon: string,
 * data?: any
 * }} Tab
 */

// Register dynamic components
const dynamicComponents = shallowRef({})
views.forEach(v => {
  if (v.cmp && typeof v.cmp === 'function') {
    // @ts-ignore
    dynamicComponents.value[v.name] = defineAsyncComponent(() => v.cmp())
  }
})

/** @type {import('vue').Ref<import('../models/service').default[]>} */
const services = ref([])
/** @type {import('vue').Ref<Tab[]>} */
const tabs = ref([])
/** @type {import('vue').Ref<InstanceType<typeof Tabs> | null>} */
const tabRef = ref(null)

onMounted(async () => {
  /** @type {{data: import('@runeya/modules-plugins-loader-front/src/views').PluginSM<null>[]}} */
  const {data: plugins} = await axios.get('/plugins/services')
  tabs.value = plugins
    .sort((a,b) => ((a.order || 0) - (b.order || 0)))
    .map(plugin => /** @type {Tab}*/({label: plugin.name, id: plugin.name, icon: plugin.icon}))
  watch(() => tabRef.value?.currentTab?.id , async ()=> {
    if(!tabRef.value?.currentTab?.id) return 
    services.value = await PromiseB.filter(stack.services.value, async service => {
      if(tabRef?.value?.currentTab?.id) {
        const currentPlugin = tabRef.value.currentTab.id
        if(!service.enabled) return false
        /** @type {{data: import('@runeya/modules-plugins-loader-front/src/views').PluginSM<null>[]}} */
        const {data: plugins} = await axios.get('/plugins/services/'+ service.label)
        const availablePlugins = plugins.map(a => a.name)
        const plugin = availablePlugins.find(plugin => plugin === currentPlugin)
        return !!plugin
      }
      return false
    })
  })
})

function setData(dataTransfer, element) {
  dataTransfer.setDragImage(document.createElement('div'), 100 ,100)
}

/** @param {import('../models/service').default} service */
async function restart(service) {
  await service.restart()
}

/** @param {import('../models/service').default} service */
async function stop(service) {
  await service.stop()
}

/** @param {string} url */
function goTo(url) {
  window.open(url, '_blank')?.focus();
}

/** @param {import('../models/service').default} service */
async function openInVsCode(service) {
  service.openInVsCode()
}

/** @param {import('../models/service').default} service */
async function openFolder(service) {
  service.openFolder()
}
</script>

<script>
export default {
  name: 'StackMultiple',
  components: {
    SectionCmp: Section,
    Tabs,
    draggableVue,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.single-button {
  position: absolute;
  top: 10px;
  left: 10px;

  box-shadow: 2px 2px 5px rgba(0,0,0,0.2),
    -2px -2px 5px rgba(255,255,255,0.2);
  &:hover {
    box-shadow: -2px -2px 5px rgba(0,0,0,0.2),
    2px 2px 5px rgba(255,255,255,0.2);
  }
}
.stack-multiple {
  height: 100%;
  width: 100%;
}
.tab {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  overflow: auto;
  height: calc(100vh - 65px);
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
.services {
  display: grid;
  gap: 20px;
  width: calc(100vw - 90px);
  grid-template-columns: repeat(2, 1fr);
  height: max-content;
  .service-container {
    min-width: 300px;
    height: 500px;
    overflow: auto;
    width: 100%;
  }
}

.dynamic-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  
  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--system-primary600);
    font-weight: 500;
    
    .loader-icon {
      font-size: 24px;
      animation: rotation 1s linear infinite;
    }
    
    span {
      font-size: 14px;
      opacity: 0.8;
    }
  }
}

@keyframes rotation {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
