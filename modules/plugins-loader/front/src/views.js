import LogsVue from '@runeya/modules-logs-front/src/Logs.vue';
import GitVue from '@runeya/modules-git-front/src/Git.vue';
import NotUpToDate from '@runeya/modules-git-front/src/NotUpToDate.vue';
import NpmVue from '@runeya/modules-npm-front/src/Npm.vue';
import BugsVue from '@runeya/modules-bugs-front/src/Bugs.vue';
import ConfigsVue from '@runeya/modules-configuration-front/src/Configs.vue';
import OpenAI from '@runeya/modules-openai-front/src/OpenAi.vue';
import Toolbox from '@runeya/modules-toolbox-front/src/Toolbox.vue';
import UUID from '@runeya/modules-uuid-front/src/UUID.vue';
import HttpClient from '@runeya/modules-http-client-front/src/HttpClient.vue';
import Base64 from '@runeya/modules-base64-front/src/Base64.vue';
import JWT from '@runeya/modules-jwt-front/src/Index.vue';
import Mongo from '@runeya/modules-mongo-front/src/Index.vue';
import NodeREPL from '@runeya/modules-node-repl-front/src/Index.vue';
import Diff from '@runeya/modules-diff-front/src/Index.vue';
import Regex from '@runeya/modules-regex-front/src/Index.vue';
import JSONFormatter from '@runeya/modules-json-formatter-front/src/Index.vue';
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

const toolboxPlugins = [
  { name: 'JWT', component: JWT },
  { name: 'OpenApi', component: OpenApi },
  { name: 'Finder', component: Finder },
  { name: 'Git-NotUpToDate', component: NotUpToDate },
  { name: 'Regex', component: Regex },
  { name: 'UUID', component: UUID },
  { name: 'HttpClient', component: HttpClient },
  { name: 'Base64', component: Base64 },
  { name: 'JSONFormatter', component: JSONFormatter },
  { name: 'Diff', component: Diff },
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
        props: true,
        component: DynamicComponent,
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
