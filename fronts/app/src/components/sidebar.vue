<template>
  <div class="sidebar-root">
    <div class="sidebar">
      <div class="add-container">
        <Button class="add-button" fluid outlined icon="fas fa-plus" label="Add service" @click="openAddServiceModal" />
        <label v-if="addServiceError">{{ addServiceError }}</label>
      </div>
      <div class="header">
        <input type="text" v-model="search" @input="openGroup = 'All'" class="search-input" placeholder="Search service..." @keypress.enter="launchService" >
      </div>
      <div class="services-container">
        <sidebar-group header="All" :open="openGroup === 'All'" @open="openGroup = 'All'">
          <sidebar-item v-for="service of sortedStack" :key="service.label" :service="service"/>
        </sidebar-group>
        <sidebar-group :header="group.label" v-for="(group) of groups" :open="openGroup === group.label" @open="openGroup = group.label" @close="openGroup = 'All'">
          <sidebar-item v-for="service of group.services" :key="service.label" :service="service"/>
        </sidebar-group>
      </div>
      <div class="minimized-container">
        <Button icon="fas fa-chevron-left" outlined @click="$emit('toggle-minimized')" v-if="!isMinimized"></Button>
      </div>
    </div>
    <Dialog v-model:visible="addServiceModalVisible" modal header="Add new service" :style="{ width: '350px' }">
      <div class="p-fluid">
        <div class="p-field">
          <InputText v-model="serviceLabelToAdd" placeholder="Service name" @keypress.enter="addService" autofocus fluid />
          <small v-if="addServiceError" class="p-error">{{ addServiceError }}</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="fas fa-times" @click="cancelAddService" class="p-button-text" />
        <Button label="Add" icon="fas fa-plus" @click="addService" :disabled="!!addServiceError || !serviceLabelToAdd" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import Stack from '../models/stack'
import System from '../models/system'
import { sort } from 'fast-sort'
import sidebarItemVue from './sidebarItem.vue'
import sidebarGroup from './sidebarGroup.vue'
import { computed, onMounted, ref } from 'vue'
import Socket from '../helpers/Socket'
import notification from '../helpers/notification'
import { useRouter } from 'vue-router';
import axios from '../helpers/axios'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

export default {
  components: {
    sidebarItem: sidebarItemVue,
    sidebarGroup,
    Dialog,
    Button,
    InputText
  },
  props: {
    currentService: {default: null},
    isMinimized: {default: false},  
  },
  setup() {
    const router = useRouter(); 
    const search = ref('')
    const openGroup = ref('All');
    const addServiceModalVisible = ref(false);
    onMounted(async () => {
      await Stack.loadServices()
      Socket.on('service:crash', async ({ label, code, signal }) => {
        notification.next('error', `${label} has crashed with code ${code}`)
        await Stack.loadServices()
      });

      Socket.on('service:exit', async ({ label, code, signal }) => {
        await Stack.loadServices()
      });
      Socket.on('service:healthcheck:down', async ({label, code, signal}) => {
        const service = await Stack.getService(label)
        if(!service?.crashed) await Stack.loadServices()
      });
      Socket.on('service:healthcheck:up', async ({label, code, signal}) => {
        const service = await Stack.getService(label)
        if(service?.crashed) await Stack.loadServices()
      });
    })
    const sortedStack = computed(() => sort(Stack.services.value.filter(a => (a.label || '').toUpperCase().includes(search.value.toUpperCase()))).desc((a) => a.enabled))

    const groups = computed(() => {
      const groupObject = sortedStack.value.reduce((agg, service) => {
        if (service.groups?.length) {
          service.groups.forEach((group) => {
            if (!agg[group]) agg[group] = []
            agg[group].push(service)
          })
        }
        return agg
      }, {})
      return Object.keys(groupObject)
        .map(key => ({label: key, services: groupObject[key]}))
        .sort((a,b) => a.label.localeCompare(b.label))
    })
    const serviceLabelToAdd= ref('')
    return {
      groups,
      openGroup,
      search,
      sortedStack,
      System,
      serviceLabelToAdd,
      addServiceModalVisible,
      addServiceError: computed(() => {
        if(Stack.services.value.find(a => a.label === serviceLabelToAdd.value)) return 'A service already exists with this label'
        return ''
      }),
      addService() {
        if(Stack.services.value.find(a => a.label === serviceLabelToAdd.value)) return
        axios.post('/stack/services', {
          label: serviceLabelToAdd.value,
        }).then(() => {
          const label = serviceLabelToAdd.value
          addServiceModalVisible.value = false
          setTimeout(() => {
            router.push({name: 'stack-single', params: {label}, query: {tab: "Configuration"}})
          }, 100);
          serviceLabelToAdd.value = ''
        })
      },
      /** @param {KeyboardEvent} $event */
      launchService($event) {
        const service = sortedStack.value[0]
        if ($event.ctrlKey && service) {
          service?.restart()
          localStorage.setItem('last-service-visisted', service.label || '')
          router.push({name: 'stack-single', params: {label: service.label}})
        }
      },
      openAddServiceModal() {
        addServiceModalVisible.value = true;
      },
      cancelAddService() {
        addServiceModalVisible.value = false;
        serviceLabelToAdd.value = '';
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@mixin card($mainColor, $secondaryColor, $shadow) {
  background: $mainColor;
  background: linear-gradient(93deg, $mainColor 0%, $secondaryColor 100%);
  color: white;
  box-shadow:
    0 0 5px 0 $shadow;
  &::before, &::after {
    box-shadow:
      inset 0 0 50px $mainColor,
      inset -20px 0 300px $mainColor,
      0 0 50px #fff,
      -10px 0 80px $mainColor,
      10px 0 80px $mainColor;
  }
}
.sidebar-root {
  height: 100%;
  display: flex;
}
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 0px 8px;
  i {
    width: 15px;
    height: 15px;
  }
}
.search-input {
  flex-grow: 1;
  box-sizing: border-box;
  margin: 5px auto;
  justify-self: center;
  min-width: 0;
}
.sidebar {
    transform-origin: left;
    transform: scaleX(1);
    opacity: 1;
    transition: 300ms;
    display: flex;
    overflow: auto;
    flex-direction: column;
    box-shadow: 0px 0px 4px 0px black;
    background-color: var(--sidebar-backgroundColor);
    height: 100%;
    flex-shrink: 0;
    z-index: 3;
    width: 100%;
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
    .services-container {
      flex-grow: 1;
      overflow: auto;
    }
    .minimized-container {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 10px;
    }
  }


.progress-container {
  display: flex;
  align-items: center;
  label {
    width: 60px;
  }
}

.system-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  &>button {
    z-index: 1;
    width: 90%;
    margin: auto;
  }
} 
.system .title {
  justify-content: center;
}
.add-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .add-button {
    flex-shrink: 0;
    width: 90%;
    padding: 0;
  }
}
</style>