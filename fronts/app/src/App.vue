<template>
  <div id="app-container" v-if="connected">
    <div id="app">
      <sidebar-view-mode v-if="!['stack-chooser', 'import-create'].includes($route.name?.toString() || '')"/>
      <Splitter v-if="['stack-single', 'stack-single-no-view'].includes($route.name?.toString() || '')" class="splitter" :pt="{
        gutter: {
          style: {
            width: isMinimized ? '0px' : '5px',
          }
        }
      }">
        <SplitterPanel
          ref="sidebarPanelRef"
          :style="{minWidth: '160px', maxWidth: '660px'}"
          :size="20"
          @mouseenter="debouncedMouseInAnchor(true)"
          @mouseleave="debouncedMouseInAnchor(false)">
          <sidebar @toggle-minimized="toggleMinimized" :is-minimized="isMinimized" />
        </SplitterPanel>
        <SplitterPanel ref="mainPanelRef" class="main-panel" :size="80">
          <Button
            class="maximize"
            :class="{'mouse-in-anchor': mouseInAnchor}"
            :style="{display: isMinimized ? 'flex' : 'none'}"
            :pt="{
              root: {
                style: {
                  margin: '0',
                  borderRadius: '0',
                }
              }
            }"
            @mouseenter="debouncedMouseInAnchor(true)"
            @mouseleave="debouncedMouseInAnchor(false)"
            @click.stop="toggleMinimized">
            <template v-if="isMinimized">
              <i class="fas fa-thumbtack" v-if="mouseInAnchor"></i>
              <i class="fas fa-chevron-right" v-else></i>
            </template>
          </Button>
          <div class="main">
            <router-view/>
          </div>
        </SplitterPanel>
      </Splitter>
      <div class="main" v-else>
        <router-view/>
      </div>
    </div>
    <EnvironmentsChooser/>
    <PluginDev/>
  </div>
  <div class="not-connected" v-else>
    Server is not connected or has crashed <br>
    Try to restart it or fill an issue: <br><br>
    <a :href="githubIssue" target="_blank">Click here</a>
  </div>

  <template v-for="cmp of componentsToLoad">
    <component :is="cmp"></component>
  </template>
  <Finder/>
  <notif-history/>
  <notifications/>
  <GitConflictModal ref="gitConflictModalRef" />

</template>

<script>
import Stack from './models/stack'
import sidebarVue from './components/sidebar.vue'
import Socket from './helpers/Socket'
import githubIssue from './helpers/githubIssue'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import system from './models/system'
import notif from './helpers/notification'
import Notifications from "./components/Notifications.vue"
import './helpers/ServiceError'
import NotifHistory from './components/NotifHistory.vue'
import SidebarViewMode from './components/SidebarViewMode.vue'
import EnvironmentsChooser from './components/EnvironmentsChooser.vue'
import GitConflictModal from './components/GitConflictModal.vue'
import { useRouter } from 'vue-router';
import Theme from './helpers/Theme'
import plugins from '@runeya/modules-plugins-loader-front/src/views';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel'; 
import debounce from 'debounce'
import Button from 'primevue/button'
import PluginDev from './components/PluginDev.vue'

const componentsToLoad = plugins.filter(p => p.load).reduce((agg, {cmp, name}) => {
  agg[name] = cmp
  return agg
}, {})
export default {
  components: {
    sidebar: sidebarVue,
    Notifications,
    NotifHistory,
    SidebarViewMode,
    EnvironmentsChooser,
    GitConflictModal,
    Splitter,
    SplitterPanel,
    Button,
    PluginDev,
    ...componentsToLoad
  },
  setup() {
    (async () => {
      const additionalThemes = await Stack.getAdditionalThemes()
        .catch(err => {
          console.error(err)
          return {}
        })
      Theme.load(additionalThemes)
    })()
    const router = useRouter(); 
    const connected = ref(true)
    const sidebarPanelRef = ref(null)
    /**
     * @typedef {Object} GitConflictMethods
     * @property {(conflict: any) => void} addConflict - Add a conflict to the queue
     * @property {() => Promise<void>} fetchPendingConflicts - Fetch pending conflicts from the server
     */
    /** @type {import('vue').Ref<GitConflictMethods | null>} */
    const gitConflictModalRef = ref(null)
    
    /**
     * @type {import('vue').Ref<Array<Object>>}
     * Un stockage temporaire pour les conflits détectés avant que le composant ne soit prêt
     */
    const pendingGitConflicts = ref([]);
    
    const redirect = async () => {
      connected.value = Socket.socket.connected
      if(!connected.value) Stack.services.value = []
      if(
        router.currentRoute.value.fullPath.startsWith('/stack-single') ||
        router.currentRoute.value.fullPath.startsWith('/stack-multiple')
      ) {
        router.push({name:'stack-chooser'})
      }
      const shouldSetup = await Stack.shouldSetup()
      if(shouldSetup) router.push({name: 'settings', params: {setting: 'crypto'}, query: { wrongKey: 'true' }})
    }
    const reload = () => {
      console.log('reload')
      window.location.reload()
    }
    const wrongKey = () => router.push({name: 'settings', params: {setting: 'crypto'}, query: { wrongKey: 'true' }})

    onMounted(async () => {
      Socket.on('connect', redirect);
      Socket.on('disconnect', redirect);
      Socket.on('forceReload', reload);
      Socket.on('system:wrongKey', wrongKey)
      Socket.on('plugins:installed', reload)
      Socket.on('plugins:uninstalled', reload)
      Socket.on('crypto:conflict', handleGitConflict);
      await redirect()
      setTimeout(() => {
        if (gitConflictModalRef.value && typeof gitConflictModalRef.value.fetchPendingConflicts === 'function') {
          gitConflictModalRef.value.fetchPendingConflicts();
          if (pendingGitConflicts.value.length > 0) {
            console.log(`Traitement de ${pendingGitConflicts.value.length} conflits en attente...`);
            pendingGitConflicts.value.forEach(conflict => {
              if (gitConflictModalRef.value && typeof gitConflictModalRef.value.addConflict === 'function') {
                gitConflictModalRef.value.addConflict(conflict);
              }
            });
            pendingGitConflicts.value = [];
          }
        } else {
          console.warn('GitConflictModal n\'est pas correctement initialisé, impossible de récupérer les conflits en attente.');
        }
      }, 500);
    })
    
    onBeforeUnmount(() => {
      Socket.off('crypto:conflict', handleGitConflict);
      Socket.off('plugins:installed', reload)
      Socket.off('plugins:uninstalled', reload)
      Socket.off('forceReload', reload)
      Socket.off('system:wrongKey', wrongKey)
    })
    
    /**
     * Handle git conflict data from socket
     * @param {Object} conflictData - The conflict data
     */
    function handleGitConflict(conflictData) {
      // Tentative immédiate
      if (gitConflictModalRef.value && typeof gitConflictModalRef.value.addConflict === 'function') {
        gitConflictModalRef.value.addConflict(conflictData);
        notif.next('error', 'Conflit Git détecté dans un fichier chiffré', 'Conflit Git');
        return;
      }

      // Si la référence n'est pas prête, réessayer après un court délai
      console.log('GitConflictModal n\'est pas encore prêt, nouvelle tentative dans 500ms...');
      setTimeout(() => {
        if (gitConflictModalRef.value && typeof gitConflictModalRef.value.addConflict === 'function') {
          gitConflictModalRef.value.addConflict(conflictData);
          notif.next('error', 'Conflit Git détecté dans un fichier chiffré', 'Conflit Git');
        } else {
          console.error('Impossible d\'ajouter le conflit Git: le composant GitConflictModal n\'est pas correctement initialisé.');
          // Sauvegarder le conflit temporairement pour permettre un traitement ultérieur
          pendingGitConflicts.value.push(conflictData);
          notif.next('error', 'Conflit Git détecté mais l\'interface n\'est pas prête. Rechargez la page pour le résoudre.', 'Conflit Git');
        }
      }, 500);
    }

    // Check versions
    /** @type {import('vue').Ref<{local: string,remote: string,hasUpdate: boolean} | null>} */
    let versions = ref({ local: '', remote: '', hasUpdate: false })
    onMounted(async () => {
      versions.value = await system.hasUpdate()
      if (versions.value?.hasUpdate) {
        notif.next('error', `Update available: ${versions.value.local} => ${versions.value.remote}`)
      }
    })
    const size = ref(40)
    const isMinimized = ref(false)
    /** @type {import('vue').Ref<HTMLDivElement | null>} */
    const mainPanelRef = ref(null)
    const mouseInAnchor = ref(false)
    watch(mouseInAnchor, () => {
      if(isMinimized.value) {
        if(mouseInAnchor.value) {
          controlSidebarSize(size.value)
        } else {
          controlSidebarSize(0)
        }
      }
    })
    const controlSidebarSize = (size) => {
      const sidebarEl = sidebarPanelRef.value?.$el
        // @ts-ignore
        const mainEl = mainPanelRef.value?.$el
        if(!sidebarEl || !mainEl) return
        sidebarEl.style['flex-basis'] = `calc(${size}%)`
        sidebarEl.style['transition'] = `100ms`
        sidebarEl.style['will-change'] = `flex-basis`
        mainEl.style['flex-basis'] = `calc(${100 - size}%)`
        mainEl.style['transition'] = `100ms`
        mainEl.style['will-change'] = `flex-basis`

        if(size === 0) {
          sidebarEl.style['min-width'] = '0px'
        } else {
          sidebarEl.style['min-width'] = '160px'
        }
        setTimeout(() => {
          sidebarEl.style['transition'] = `0ms`
          mainEl.style['transition'] = `0ms`
        }, 300);
    }
    return {
      componentsToLoad: ref(Object.keys(componentsToLoad)),
      redirect,
      connected,
      githubIssue,
      versions,
      gitConflictModalRef,
      sidebarPanelRef,
      mainPanelRef,
      isMinimized,
      mouseInAnchor,
      toggleMinimized: () => {
        isMinimized.value = !isMinimized.value
        const effectiveSize = isMinimized.value ? 0 : size.value
        controlSidebarSize(effectiveSize)
      },
      debouncedMouseInAnchor: debounce((value) => {
        mouseInAnchor.value = value
      }, 75),
    }
  }
}
</script>

<style lang="scss" scoped> 
.main {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  min-height: 100%;
}
#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;

  #app {
    width: 100vw;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    
    :deep(.p-splitter) {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    :deep(.p-splitter-panel) {
      overflow: auto;
    }
    
    :deep(.p-splitter-gutter) {
      background: var(--surface-border);
      
      &:hover {
        background: var(--primary-color);
      }
    }
  }
}
.not-connected {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  text-align: center;
}
.splitter {
  background-color: transparent;
  flex-grow: 1;
  width: 0 !important;
}
:deep(.p-splitter-gutter) {
  background-color: var(--system-backgroundColor-darker) !important;
}

.maximize {
  width: 25px;
  height: 100%;
  transition: width 300ms;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  i {
    font-size: 1.5rem;
  }
  &.mouse-in-anchor {
    width: 50px;
  }
}
.main-panel {
  display: flex;
}
</style>