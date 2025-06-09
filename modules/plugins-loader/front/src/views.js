import { ref } from 'vue';
import axios from '../../../../fronts/app/src/helpers/axios';
import PromiseB from 'bluebird';
import sockets from '../../../../fronts/app/src/helpers/Socket';
import Editor from '../../../../fronts/app/src/components/Editor.vue';
import Section from '../../../../fronts/app/src/components/Section.vue';
import router from '../../../../fronts/app/src/router/router';
import notification from '../../../../fronts/app/src/helpers/notification';
import PrimeVueAura from '@primevue/themes/aura';


const toolboxPlugins = [
  { name: 'OpenApi', component: () => import('@runeya/modules-openapi-front/src/Index.vue') },
  { name: 'Finder', component: () => import('@runeya/modules-finder-front/src/Index.vue') },
  { name: 'Git-NotUpToDate', component: () => import('@runeya/modules-git-front/src/NotUpToDate.vue') },
  { name: 'Help', component: () => import('@runeya/modules-help-front/src/Index.vue') },
  { name: 'Workflows', component: () => import('@runeya/modules-workflows-front/src/Index.vue') },
  { name: 'Docker', component: () => import('@runeya/modules-docker-front/src/Index.vue') },
  {
    name: 'Toolbox',
    component: () => import('@runeya/modules-toolbox-front/src/Toolbox.vue'),
    children: [
      {
        path: ':plugin',
        component: () => import('./DynamicComponent.vue'),
        props: {
          context: 'toolbox',
        },
      },
    ],
  },
];

/**
 * @type {{
 *  load?: boolean,
 *  name: string, cmp: import('vue').Component, routes?: import('vue-router').RouteRecordRaw[]
 * }[]}
 * */
const plugins = [
  { name: 'WorkflowsModals', cmp: () => import('@runeya/modules-workflows-front/src/modals/Modals.vue'), load: true },
  { name: 'DynamicComponent', cmp: () => import('./DynamicComponent.vue') },
  ...toolboxPlugins.map(({ name, component, children }) => ({
    name,
    cmp: component,
    routes: [
      {
        path: `/${name}`,
        name,
        component,
        children,
      },
    ],
  })),
  {
    name: 'Dynamic',
    component: () => import('./DynamicComponent.vue'),
    routes: [
      {
        path: `/dynamic/:plugin`,
        name: 'dynamic',
        component: () => import('./DynamicComponent.vue'),
        props: {
          context: 'sidebar',
        }
      },
    ],
  },
  { name: 'Logs', cmp: () => import('@runeya/modules-logs-front/src/Logs.vue') },
  { name: 'Git', cmp: () => import('@runeya/modules-git-front/src/Git.vue') },
  { name: 'Github', cmp: () => import('@runeya/modules-github-front/src/Index.vue') },
  { name: 'Npm', cmp: () => import('@runeya/modules-npm-front/src/Npm.vue') },
  { name: 'Bugs', cmp: () => import('@runeya/modules-bugs-front/src/Bugs.vue') },
  { name: 'Configuration', cmp: () => import('@runeya/modules-configuration-front/src/Configs.vue') },
  { name: 'Documentation', cmp: () => import('@runeya/modules-documentation-front/src/Index.vue') },
];

/**
 * @type {import('vue').Ref<{
 *     "name": string,
 *     "version": string,
 *     "diskPath": string,
 *     "config": {
 *         "name": string,
 *         "version": string,
 *         "repository": string,
 *         "private": boolean,
 *         "runeya": {
 *             "entries": {
 *                 "backend": string,
 *                 "front": {
 *                     "js": string,
 *                     "css": string
 *                 }
 *             }
 *         },
 *         "scripts": {
 *             "build": string,
 *             "test": string
 *         },
 *         "devDependencies": Record<string, string>,
 *         "dependencies": Record<string, string>
 *     },
 *     "remotePath": string
 * }[]>}
 */
export const remotePlugins = ref([]);

globalThis.toolboxPlugins = ref([]);
globalThis.sidebarPlugins = ref([]);

function observe(tagName, callback) {
  const lowerTag = tagName.toLowerCase();

  // Vérifie si l'élément existe déjà dans le DOM
  document.querySelectorAll(lowerTag).forEach((el) => callback(el));

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      // @ts-ignore
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Vérifie si le node lui-même est l'élément recherché
          if (node.tagName.toLowerCase() === lowerTag) {
            callback(node);
          }

          // Cherche dans les descendants
          node.querySelectorAll?.(lowerTag)?.forEach((el) => callback(el));
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer; // Utile si tu veux arrêter l'observation plus tard
}


function movePrimeVueStyles(shadowDOM) {
  // Observe if any new styles are added by PrimeVue
  observeHeadForStyles(shadowDOM)

  const primeStyles = document.querySelectorAll('head > style, head > link[rel="stylesheet"]')

  // Move all styles that aren't for definining variables into the shadow dom
  primeStyles.forEach((styleEl) => {
    const clonedStyleEl = styleEl.cloneNode(true) 
    shadowDOM.prepend(clonedStyleEl)
  })
  // copy all root variables css into the shadow dom
  const rootVariables = document.querySelectorAll('head > style[data-primevue-style-id="variables"]')
  rootVariables.forEach((styleEl) => {
    const clonedStyleEl = styleEl.cloneNode(true) 
    shadowDOM.appendChild(clonedStyleEl)
  })
}

function observeHeadForStyles(shadowDOM) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLStyleElement ) {
          const clonedStyleEl = node.cloneNode(true) 
          shadowDOM.appendChild(clonedStyleEl)
        }
      })
    })
  })

  // Observe changes to the <head> element
  observer.observe(document.head, { childList: true, subtree: false })
}

const loadPlugin = (contextPluginName, component) => {
  observe(contextPluginName, async (tag) => {
    try {
      movePrimeVueStyles(tag.shadowRoot)
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      movePrimeVueStyles(tag.shadowRoot)
    }
  }) 
  customElements.define(contextPluginName, component);
}

/**
 * Crée une fonction registerPlugin spécifique pour un plugin donné
 * @param {string} pluginName 
 * @returns {function}
 */
const createRegisterPluginForName = (pluginName) => {
  return (plugin) => {
    plugin.placements.forEach((placement) => {
      const component = placement.component;
      if (placement.location === 'toolbox') {
        const contextPluginName = pluginName + '-toolbox';
        loadPlugin(contextPluginName, component)
        globalThis.toolboxPlugins.value.push({ ...placement, id: pluginName });
      } else if (placement.location === 'sidebar') {
        const contextPluginName = pluginName + '-sidebar';
        loadPlugin(contextPluginName, component)
        globalThis.sidebarPlugins.value.push({ ...placement, id: pluginName });
      }
      
    });
  };
};

/**
 * Enregistre un plugin avec un nom spécifique
 * @param {string} pluginName 
 * @param {object} plugin 
 */
const registerPluginWithName = (pluginName, plugin) => {
  const registerFn = createRegisterPluginForName(pluginName.replaceAll('@', '').replaceAll('/', '-'));
  registerFn(plugin);
};

axios.get('/plugins').then(async (res) => {
  remotePlugins.value = res.data.sort((a, b) => b.name.localeCompare(a.name));
  console.log("load plugins...", remotePlugins.value.map((plugin) => plugin.name))
  await PromiseB.map(remotePlugins.value, async (plugin) => {
    if(plugin.config.runeya.entries?.front?.js) {
      const pluginName = plugin.name;
      /** @param {import('@runeya/common-typings').PluginCallback} callback */
      globalThis[pluginName] = (callback) => {
        const pluginConfig = callback({
          assetsBasePath: `/plugins/${encodeURIComponent(pluginName)}/assets`,
          components: {
            Editor,
            Section,
          },
          callServer: (method, ...args) => {
            return axios.post(`/plugins/${encodeURIComponent(pluginName)}/call/${encodeURIComponent(method)}`, {args});
          },
          customCallServer: (options) => {
            return (method, ...args) => axios.post(`/plugins/${encodeURIComponent(pluginName)}/call/${encodeURIComponent(method)}`, { args }, options);
          },
          socket: {
            emit: (event, ...args) => {
              sockets.emit(encodeURIComponent(pluginName) + '-' + event, ...args);
            },
            on: (event, callback) => {
              sockets.on(encodeURIComponent(pluginName) + '-' + event, callback);
            },
            off: (event, callback) => {
              sockets.off(encodeURIComponent(pluginName) + '-' + event, callback);
            },
          },
          primevueConfig: {
            theme: {
              preset: PrimeVueAura,
              options: {
              },
            },
          },
          router,
          notification,
        });
        registerPluginWithName(pluginName, pluginConfig);
      };

      
      try {
        let url = `/plugins/${encodeURIComponent(plugin.name)}/js`;
        // @ts-ignore
        await import(url)
      } catch (error) {
        console.error(`❌ Erreur lors du chargement du plugin ${plugin.name}:`, error);
      }
      
    }
  });
});


export default plugins;

/**
 * @template T
 * @typedef {{
 *  enabled: boolean,
 *  name: string,
 *  displayName: string,
*   description?: string,
 *  icon?: string,
 *  order?: number,
 *  hidden?: (
 *    service: import('../../../../servers/server/models/Service') | null,
 *    stack: typeof import('../../../../servers/server/models/stack'),
 *    placement: 'toolbox' | 'sidebar' | 'service' | 'global',
 *  ) => Promise<boolean> | boolean,
 *  routes?: (runeya: import('../../../../servers/server/models/stack')) => import('express').Router,
 *  export: T,
 *  finder?: (search: string, runeya: typeof import('../../../../servers/server/models/stack')) => import('../../../finder/backend/routes').FinderChoice[] | Promise<import('../../../finder/backend/routes').FinderChoice[]>
 *  placements: ({
 *    label: string,
 *    position?: 'toolbox' | 'sidebar' | 'sidebar-top',
 *    icon?: string,
 *    img?: string,
 *    iconText?: string,
 *    goTo?: import('vue-router').RouteLocationRaw | string,
 *    active: string
 *  } | 'toolbox' | 'sidebar' | 'sidebar-top' | 'service' | 'global')[]
 * }} PluginSM
 */
