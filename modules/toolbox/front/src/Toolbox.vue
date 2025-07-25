<template>
  <div class="toolbox">
    <div class="sidebar">
      <ul>
        <input type="text" ref="searchToolRef" placeholder="Search tool..." v-model="searchToolTerm" autofocus="true" @keypress.enter="chooseFirst">
        <li v-for="plugin of buttonsPlugins" :key="plugin?.name" class="sidebar-item"
          @click="plugin?.click?.()"
          :class="{ active: isActive(plugin) }">
          <div class="item">
            <i class="icon" :class="plugin?.icon" v-if="plugin?.icon"></i>
            <span class="icon" v-else-if="plugin?.iconText">{{ plugin?.iconText }}</span>
            {{ plugin?.text }}
          </div>
        </li>
      </ul>
    </div>
    <div class="container">
      <router-view v-if="router.currentRoute.value.fullPath !== '/toolbox'"/>
      <div v-else class="no-tools">
        <div>
          <i class="fas fa-toolbox"></i>
        </div>
        <div>
          Choisissez un outils
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import axios from '../../../../fronts/app/src/helpers/axios';

const router = useRouter();
/** @type {import('vue').Ref<import('../../../plugins-loader/front/src/views').PluginSM<undefined>[]>} */
const plugins = ref([]);
const searchToolTerm = ref('');
const searchToolRef = ref();
onMounted(async () => {
  /** @type {{data: import('../../../plugins-loader/front/src/views').PluginSM<undefined>[]}} */
  const { data: _plugins } = await axios.get('/plugins/toolbox');
  plugins.value = _plugins?.flat() || [];
  searchToolRef.value?.focus();
});

const nativePlugins = computed(() => plugins.value.filter((plugin) => !plugin.version));
const currentElement = ref(null);

const buttonsPlugins = computed(() => ([
  ...globalThis.toolboxPlugins.value.map((plugin) => ({
    ...plugin,
    click: () => {
      currentElement.value = plugin.id;
      router.push({
        // @ts-ignore
        path: `/toolbox/${encodeURIComponent(plugin.id)}`,
      });
    },
  })),
  ...nativePlugins.value.map((plugin) => plugin.placements.map((placement) => {
    if (typeof placement === 'string') return null;
    return {
      ...plugin,
      text: placement.label,
      icon: placement.icon,
      iconText: placement.iconText,
      click: placement.goTo ? () => {
        currentElement.value = null;
        if (typeof placement.goTo === 'string') router.push({ path: placement.goTo });
        else {
          router.push({
            ...placement.goTo,
            // @ts-ignore
            path: `/toolbox${(placement.goTo?.path || placement.goTo)}`,
          });
        }
      } : () => { },
      active: placement.active,
    };
  })).flat().filter((f) => f?.text?.toUpperCase().includes(searchToolTerm.value?.toUpperCase())),
]));

function chooseFirst() {
  buttonsPlugins.value?.[0]?.click();
}
/** @param {import('../../../plugins-loader/front/src/views').PluginSM<undefined> | undefined | null} plugin */
function isActive(plugin) {
  return router.currentRoute.value.params.plugin === (plugin?.name || plugin.id);
}

</script>

<style scoped lang="scss">
input {
  width: 90%;
  box-sizing: border-box;
  margin: 5px auto;
  justify-self: center;
}
.toolbox {
  display: flex;
  min-width: 0;
  width: 100%;
  align-items: center;
}
.sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0px 0px 4px 0px black;
    width: 150px;
    background-color: var(--system-backgroundColor50);
    color: var(--system-color50);
    height: 100%;
    flex-shrink: 0;
    z-index: 3;
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
  }

.progress-container {
  display: flex;
  align-items: center;
  label {
    width: 60px;
  }
}

.sidebar-item {
  cursor: pointer;
  transform: translateZ(0);
  transition: background-color 300ms;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 5px solid transparent;

  .item {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .icon {
    width: 20px;
    transition: 300ms;
    display: flex;
    justify-content: center;

  }
  &:hover {
    background-color: var(--system-backgroundColor300);
    color: var(--system-color300);
    i {
      opacity: 1;
    }
  }
  &.active {
    font-weight: bold;
    border-left: 5px solid var(--system-primary400)
  }
  &.disabled {
    color: #999;
  }
}
.container {
  display: flex;
  flex-grow: 1;
  min-width: 0;
  padding: 5px 10px;
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
}
.no-tools {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 2em;
  color: #999;
}
</style>
