<template>
  <div class="stack-single" v-if="currentService" :key="$route.params.label.toString()">
    <div class="main">
      <div class="header">
        <div class="left">
          <div class="title">
            <Popover trigger="mouseenter" appendTo="parent" max-width="50vh"  v-if="currentService.container?.enabled">
              <template #trigger>
                <i class="fab fa-docker"></i>
              </template>
              <template #content>
                <ul>
                  <li>Container name: {{ currentService.container.name }}</li>
                </ul>
              </template>
            </Popover>
            {{currentService.label}}
          </div>
          <div class="description">{{currentService.description}}</div>
        </div>
        <div class="right">
          <notification-bell/>
          <div class="icons">
            <a v-if="currentService.git && currentService.git.home" :href="currentService.git.home" target="_blank" title="Open git home"><i class="fab fa-github"  aria-hidden="true"></i></a>
            <a v-if="currentService.url" :href="currentService.url" target="_blank" title="Open service URL"><i class="fas fa-globe"  aria-hidden="true"></i></a>
            <a v-for="url in currentService.urls" :key="url" :href="url" target="_blank" :title="url"><i class="fas fa-globe"  aria-hidden="true"></i></a>
            <CurrentEditor :key="'current-editor-' + currentService.label" :service="currentService" @openEditor="openInVsCode(currentService.rootPath, $event)"></CurrentEditor>
            <i v-if="currentService.rootPath"  class="fas fa-folder" aria-hidden="true" title="Open folder" @click="openFolder(currentService.rootPath)"></i>
          </div>
        </div>
      </div>
      <div class="sections" >
        <div v-if="!currentService.enabled" class="sections">
          <section-cmp header="This service is not started" :actions="[{ label: 'Start', click: () => start(), icon: 'fas fa-play' }]" class="section-not-started">
          </section-cmp>
        </div>
        <div v-else class="system-cards">
          <card class="card to-hide-for-small-screen" :mini="true">
            <i class="fas fa-memory"></i>
            <div class="hovered">Memory</div>
            <progress-cmp :percent="mem"></progress-cmp>
          </card>
          <card class="card to-hide-for-small-screen" color="purple" :mini="true">
            <i class="fas fa-microchip"></i>
            <div class="hovered">CPU</div>
            <progress-cmp :percent="cpu"></progress-cmp>
          </card>
          <card class="card restart-stop-card" color="orange" :mini="true">
            <button class="small" @click="restart()" :disabled="restartInProgress">
              <i class="fas fa-sync" aria-hidden="true" :class="{rotate: restartInProgress}"></i>
              <span>Restart</span>
            </button>
            <button class="small" @click="stop()">
              <i class="fas fa-stop" aria-hidden="true"></i>
              <span>Stop</span>
            </button>
          </card>
        </div>
        <tabs class="tabs" :tabs="tabs" :showLabels="false" direction="left" :contentCss="{height: '100%'}">
          <template #default="{tab}">
            <div class="tab">
              <Suspense>
                <template #default>
                  <component 
                    :is="dynamicComponents[tab.id] || tab.id" 
                    :service="currentService" 
                    :key="currentService.label"
                  ></component>
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
            </div>
          </template>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import Stack from '../models/stack'
import System from '../models/system'
import ProgressCmp from '../components/Progress.vue';
import SectionCmp from '../components/Section.vue'
import { onBeforeUnmount, onMounted, ref, watch, defineAsyncComponent, resolveComponent, shallowRef } from 'vue'
import Tabs from '../components/Tabs.vue';
import Card from '../components/Card.vue';
import NotificationBell from '../components/NotificationBell.vue';
import axios from '../helpers/axios'
import Socket from '../helpers/Socket';
import { useRouter } from 'vue-router';
import Popover from '../../../../fronts/app/src/components/Popover.vue';
import CurrentEditor from '../components/CurrentEditor.vue';
import views from '@runeya/modules-plugins-loader-front/src/views';

// Register dynamic components
const dynamicComponents = shallowRef({})
views.forEach(v => {
  if (v.cmp && typeof v.cmp === 'function') {
    // @ts-ignore
    dynamicComponents.value[v.name] = defineAsyncComponent(() => v.cmp())
  }
})

const router = useRouter(); 
/** @type {import('vue').Ref<import('../models/service').default | undefined>}*/
const currentService = ref()
const cpu = ref(0)
const mem = ref(0)
const restartInProgress = ref(false)

watch(() => router.currentRoute.value.params.label, async () => {
  await reload()
})

const onConfUpdate = (/**@type {string[]}*/data) => {
  if (data.includes(router.currentRoute.value.params.label.toString())) {
    reload()
  }
}

onMounted(() => {
  Socket.on('conf:update', onConfUpdate)
})

onBeforeUnmount(() => {
  Socket.off('conf:update', onConfUpdate)
})

/** @type {number} */
let interval
const tabs = ref([])

async function reload() {
  await Stack.loadServices()
  currentService.value = await Stack.getService(router.currentRoute.value.params.label?.toString())
  if(currentService.value) {
    const {data: plugins} = await axios.get('/plugins/services/' + currentService.value.label)
    tabs.value = plugins
      .sort((
        /** @type {any} */ a,
        /** @type {any} */ b
      ) => a.order - b.order)
      .map((/** @type {{ name: any; icon: any; hidden: any; }} */ plugin) => {
        const tab = {
          label: plugin.name,
          id: plugin.name,
          icon:plugin.icon,
          hidden: plugin.hidden,
          warning: 0
        }
        if(plugin.name === "Configuration") {
          const overrideEnvs = Object.keys(currentService.value?.spawnOptions?.overrideEnvs || {})
          const envs = Object.keys(currentService.value?.spawnOptions?.env || {})
          if(envs.some((key => overrideEnvs.includes(key)))) {
            tab.warning = 1   
          }
        }
        return tab
      })
  }
}

onMounted(async () => {
  await reload()
  // @ts-ignore
  interval = setInterval(async () => {
    if(!currentService.value?.label) return
    const {cpu: _cpu, mem: _mem} = await System.getInfos(currentService.value.label.toString())
    cpu.value = _cpu
    mem.value = _mem
  }, 1000);
})

onBeforeUnmount(()=> {
  if(interval) clearInterval(interval)
})

const loadComponent = ref(false)

async function openInVsCode(path, editor) {
  currentService.value?.openInVsCode(path, editor)
}

async function openFolder(path) {
  currentService.value?.openFolder(path)
}

async function restart() {
  restartInProgress.value = true
  await currentService.value?.restart()
    .finally(() => restartInProgress.value = false)
}

async function stop() {
  await currentService.value?.stop()
}

async function start() {
  await currentService.value?.start()
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.section-not-started {
  box-shadow: 10px 10px 20px rgba(0,0,0,0.1);
}
.stack-single {
  display: flex;
  width: 100%;
  overflow: hidden;
  .main {
    flex-grow: 1;
    height: 100%;
    margin: auto;
    overflow: auto;
    scroll-behavior: smooth;
    margin-bottom: 20px;
    .header {
      width: 100%;
      height: 85px;
      display: flex;
      justify-content: space-between;
      padding: 10px calc(5% + 10px);
      font-weight: 700;
      position: relative;
      color: white;
      text-align: left;
      box-sizing: border-box;
      .left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .title {
          font-size: 2em;
          display: flex;
          gap: 10px;
        }
        .description {
          color: #97d8ff;
          font-weight: 500;
        }
      }
      .right {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-end;
        flex-shrink: 0;
        img {
          width: 18px;
          height: 18px;
          filter: invert(1);
          &.filter-dark {
            filter:  grayscale(1) opacity(0.7)
          }
        }
        .icons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        i {
          color: white;
          font-size: 18px;
        }
        i,img {
          cursor: pointer;
          transition: 300ms;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
      &::before {
        content: '';
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        border-bottom: 3px solid #214f6b;
        border-bottom-left-radius: 20px;
        border-bottom-right-radius: 20px;
        background: linear-gradient(93deg, var(--system-primary400) 0%, var(--system-primary700) 100%);
        width: 100%;
        height: calc(100% + 30px);
      }
    }
    .sections {
      margin: auto;
      overflow: auto;
      padding: 0 20px;
      box-sizing: border-box;
    }
  }
}

.system-cards{
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  @media (max-width: 1300px) {
    .to-hide-for-small-screen {
      display: none;
    }
  }
  .card {
    i {
      font-size: 20px;
      padding: 0 10px;
      box-sizing: border-box;
    }
    &:hover {
      .hovered {
        max-width: 100px;
      }
    }
    button {
      box-shadow: none;
    }
    .hovered {
      position: absolute;
      top: 0;
      left: 0;
      transition: 300ms;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: 100%;
      height: 100%;
      backdrop-filter: blur(10px) brightness(0.5);
      z-index: 1;
      font-weight: bold;
      max-width: 0;
      overflow: hidden;

    }
  }
  .restart-stop-card {
    button {
      border-radius: 1000px;
      background: #0000003d;
      width: 100%;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        span {
          visibility: visible;
          max-width: 100px;
        
        }
      }
      span {
        visibility: hidden;
        max-width: 0;
        overflow: hidden;
        transition: 300ms;
      }
      &:hover {
        box-shadow: 2px 2px 0px rgba(0,0,0,0.3);
      }
    }
  }
}

.progress-container {
  display: flex;
  align-items: center;
  label {
    width: 60px;
  }
}
.tabs {
  margin-top: 20px;
  .tab {
    padding-left: 20px;
    box-sizing: border-box;
    transform: translateZ(0);
    height: 100%;
  }
}

.rotate {
  animation: rotation 2s infinite;
}
@keyframes rotation {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(360deg);
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
</style>
