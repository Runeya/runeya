import LogsVue from '@runeya/modules-logs-front/src/Logs.vue';
import GitVue from '@runeya/modules-git-front/src/Git.vue';
import NotUpToDate from '@runeya/modules-git-front/src/NotUpToDate.vue';
import NpmVue from '@runeya/modules-npm-front/src/Npm.vue';
import BugsVue from '@runeya/modules-bugs-front/src/Bugs.vue';
import ConfigsVue from '@runeya/modules-configuration-front/src/Configs.vue';
import OpenAI from '@runeya/modules-openai-front/src/OpenAi.vue';
import Toolbox from '@runeya/modules-toolbox-front/src/Toolbox.vue';
import HttpClient from '@runeya/modules-http-client-front/src/HttpClient.vue';
import Base64 from '@runeya/modules-base64-front/src/Base64.vue';
import Mongo from '@runeya/modules-mongo-front/src/Index.vue';
import NodeREPL from '@runeya/modules-node-repl-front/src/Index.vue';
import Regex from '@runeya/modules-regex-front/src/Index.vue';
import Documentation from '@runeya/modules-documentation-front/src/Index.vue';
import DevOps from '@runeya/modules-dev-ops-front/src/Index.vue';
import Github from '@runeya/modules-github-front/src/Index.vue';
import Kanban from '@runeya/modules-kanban-front/src/Index.vue';
import OpenApi from '@runeya/modules-openapi-front/src/Index.vue';
import GlobalScripts from '@runeya/modules-global-scripts-front/src/Index.vue';
import Finder from '@runeya/modules-finder-front/src/Index.vue';
import Help from '@runeya/modules-help-front/src/Index.vue';
import Vscode from '@runeya/modules-vscode-front/src/Index.vue';
import Docker from '@runeya/modules-docker-front/src/Index.vue';
import Workflows from '@runeya/modules-workflows-front/src/Index.vue';
import WorkflowsModals from '@runeya/modules-workflows-front/src/modals/Modals.vue';
import SQLBeautifier from '@runeya/modules-sql-beautifier-front/src/SQLBeautifier.vue';
import DynamicComponent from './DynamicComponent.vue';
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
  { name: 'OpenApi', component: OpenApi },
  { name: 'Finder', component: Finder },
  { name: 'Git-NotUpToDate', component: NotUpToDate },
  { name: 'Regex', component: Regex },
  { name: 'HttpClient', component: HttpClient },
  { name: 'Base64', component: Base64 },
  { name: 'NodeREPL', component: NodeREPL },
  { name: 'Mongo', component: Mongo },
  { name: 'Help', component: Help },
  { name: 'OpenAI', component: OpenAI },
  { name: 'GlobalScripts', component: GlobalScripts },
  { name: 'Workflows', component: Workflows },
  { name: 'Kanban', component: Kanban },
  { name: 'Vscode', component: Vscode },
  { name: 'Docker', component: Docker },
  { name: 'SQLBeautifier', component: SQLBeautifier },
  {
    name: 'Toolbox',
    component: Toolbox,
    children: [
      {
        path: ':plugin',
        component: DynamicComponent,
        props: {
          context: 'toolbox',
        },
      },
    ],
  },
  {
    name: 'DevOps',
    component: DevOps,
    children: [
      {
        path: ':plugin',
        props: true,
        component: DynamicComponent,
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
  { name: 'WorkflowsModals', cmp: WorkflowsModals, load: true },
  { name: 'DynamicComponent', cmp: DynamicComponent },
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
  { name: 'Logs', cmp: LogsVue },
  { name: 'Git', cmp: GitVue },
  { name: 'Github', cmp: Github },
  { name: 'Documentation', cmp: Documentation },
  { name: 'Npm', cmp: NpmVue },
  { name: 'Bugs', cmp: BugsVue },
  { name: 'SQLBeautifier', cmp: SQLBeautifier },
  { name: 'Configuration', cmp: ConfigsVue },
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

  const primeStyles = document.querySelectorAll('head > style[type="text/css"]')

  // Move all styles that aren't for definining variables into the shadow dom
  primeStyles.forEach((styleEl) => {
    const clonedStyleEl = styleEl.cloneNode(true) 
    shadowDOM.prepend(clonedStyleEl)
  })
  // copy all root variables css into the shadow dom
  const rootVariables = document.querySelectorAll('head > style[type="text/css"][data-primevue-style-id="variables"]')
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
        observe(contextPluginName, async (tag) => {
          try {
            movePrimeVueStyles(tag.shadowRoot)
          } catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            movePrimeVueStyles(tag.shadowRoot)
          }
        })
        customElements.define(contextPluginName, component);
        globalThis.toolboxPlugins.value.push({ ...placement, id: pluginName });
      } else if (placement.location === 'sidebar') {
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
  console.log(remotePlugins.value.map((plugin) => plugin.name))
  await PromiseB.map(remotePlugins.value, async (plugin) => {
    if(plugin.config.runeya.entries.front.js) {
      console.log(`🔄 Début chargement plugin: ${plugin.name}`);
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
          primevueConfig: {
            theme: {
              preset: PrimeVueAura,
              options: {
                darkModeSelector: '.theme-dark',
              },
            },
          },
          router,
          notification,
        });
        console.log(`✅ registerPlugin appelé pour: ${pluginName}`);
        registerPluginWithName(pluginName, pluginConfig);
      };

      
      try {
        let url = `/plugins/${encodeURIComponent(plugin.name)}/js`;
        console.log(`📥 Import commence: ${url}`);
        // @ts-ignore
        await import(url)
        console.log(`✅ Import terminé: ${plugin.name}`);
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
 *    placement: 'toolbox' | 'sidebar' | 'dev-ops' | 'service' | 'global',
 *  ) => Promise<boolean> | boolean,
 *  routes?: (runeya: import('../../../../servers/server/models/stack')) => import('express').Router,
 *  export: T,
 *  finder?: (search: string, runeya: typeof import('../../../../servers/server/models/stack')) => import('../../../finder/backend/routes').FinderChoice[] | Promise<import('../../../finder/backend/routes').FinderChoice[]>
 *  placements: ({
 *    label: string,
 *    position?: 'toolbox' | 'sidebar' | 'sidebar-top' | 'dev-ops',
 *    icon?: string,
 *    img?: string,
 *    iconText?: string,
 *    goTo?: import('vue-router').RouteLocationRaw | string,
 *    active: string
 *  } | 'toolbox' | 'sidebar' | 'sidebar-top'  | 'dev-ops' | 'service' | 'global')[]
 * }} PluginSM
 */
