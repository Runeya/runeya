import {VueElementConstructor} from 'vue'
export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonFunctionPropertyNamesNumber<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
// @ts-ignore
export type PartialPick<T,M> = Partial<Pick<T, M>>
export type FunctionProperties<T> = PartialPick<T, FunctionPropertyNames<T>>;
export type NonFunctionProperties<T> = PartialPick<T, NonFunctionPropertyNames<T>>;


type addPrefix<TKey, TPrefix extends string> = TKey extends string
  ? `${TPrefix}${TKey}`
  : never;

type removePrefix<TPrefixedKey, TPrefix extends string> = TPrefixedKey extends addPrefix<infer TKey, TPrefix>
  ? TKey
  : '';

type prefixedValue<TObject extends object, TPrefixedKey extends string, TPrefix extends string> = TObject extends {[K in removePrefix<TPrefixedKey, TPrefix>]: infer TValue}
  ? TValue
  : never;


export type addPrefixToObject<TObject extends object, TPrefix extends string> = {
  [K in addPrefix<keyof TObject, TPrefix>]: prefixedValue<TObject, K, TPrefix>
} 

export interface FieldDescriptior {
  field: string,
  type: 'string' | 'number' | 'boolean' | 'objectId'
}
type validation = (value: any, path: string) => {
  isValid: boolean,
  message: string
}
type validationFactory = (...args: any) => validation

export type GenericFields<M> = {
// @ts-ignore
  default:  M = M
  validation?: validation
  hasMany?: string
  hasOne?: string,
  doc?: string
}
export type SchemaField = GenericFields<String> | GenericFields<Number>| GenericFields<any>
export type Generic = {
  [key: string]: SchemaField
}

type GeneratedClass<T, D, E> = {
  new(schema: SchemaTransformed<T>): Instance<T,Partial<D>>;
// @ts-ignore
  find: (filter: {filter: SchemaTransformed<T>, limit?: number, skip?: number, sort?: any, lookups?: any}) => Promise<Instance<T>[]>
// @ts-ignore
  findOne: (filter: {filter: SchemaTransformed<T>, limit?: number, skip?: number, sort?: any, lookups?: any}) => Promise<Instance<T>>
// @ts-ignore
  update: (filter: Instance<T>) => Promise<Instance<T>>
  updateMany: (filter: SchemaTransformed<T>, set: SchemaTransformed<T>) => void
  schema: T
  schemaName: string
} & Partial<E> & {[key: string]: any}
type SchemaTransformed<M> = {
// @ts-ignore
  [K in keyof M]?: M[K]['default']
}
type Instance<M, D> = SchemaTransformed<M> &  {
// @ts-ignore
  save: () => Promise<Instance<M>>
} & D
interface Option<C, D, E> {
  mongo?: any,
  description?: string
  extends?: C
  routes?: {
    prefix: string,
    paths: {
      
    } 
  }
  docs?: {
    methods: {
      [key: string]: {
        description?: string,
        params?: {
          label: string,
          type?: any,
          description?: string
        }
      }
    }
  }
  methods?: D,
  staticMethods?: E,
}
type CustomFunctions<M> = {[key: string]: (this: M,...args: any) => any}
export interface Schema {
  createSchema<M extends Generic ,C extends  Generic, D extends CustomFunctions<Instance<M & C,Partial<D>>>, E extends CustomFunctions<F>, F extends GeneratedClass<M & C, D, E>>(name: string, schema: M, option?: Option<C, D, E>): F
}
// @ts-ignore
export type AnyObject<T = string> = Record<T, any>;


import type {
  GlobalScript as _Script,
  ScriptStep as _ScriptStep,
  TrackStep as _TrackStep,
} from '../../../modules/global-scripts/backend/GlobalScripts';

//= ==== Plugins ==========
import type {
  PluginSM as _RuneyaPlugin,
} from '../../../modules/plugins-loader/front/src/views';

//= ==== Leaf ==========
import type {
  Leaf as _Leaf,
} from '../../../modules/documentation/backend/index';

//= ==== Npm ==========
import type {
  Outdated as _Outdated,
} from '../../../modules/npm/backend/index';

//= ==== Npm ==========
import type {
  OpenAiChat as _OpenAiChat,
} from '../../../modules/openai/backend/index.js';

//= ==== Fs ==========
import type {
  Entry as _Entry,
  NpmInfos as _NpmInfos,
} from '../../../servers/server/routes/fs';

export type {
  StackFile,
  StackArray,
  StackObject,
  StackFunction,
  Environment,
  StackWithPlugins as Runeya,
} from '../../../servers/server/models/stack.js';

import type {
  StackWithPlugins as _StackWithPlugins,
} from '../../../servers/server/models/stack.js';

export type {
  SpawnOptions,
  ServiceType as Service,
  LogMessage,
  Parser,
} from '../../../servers/server/models/Service';
export namespace GlobalScripts {
  export type Script = _Script
  export type ScriptStep = _ScriptStep
  export type TrackStep = _TrackStep
}
export namespace Plugins {
  export type RuneyaPlugin<T> = _RuneyaPlugin<T>
}
export namespace Documentation {
  export type Leaf = _Leaf
}
export namespace Npm {
  export type Outdated = _Outdated
}
export namespace OpenAi {
  export type OpenAiChat = _OpenAiChat
}

export namespace FS {
  export type Entry = _Entry
  export type NpmInfos = _NpmInfos
}

export type Plugin = ({runeya}: {runeya: import('../../../servers/server/models/stack.js').StackWithPlugins}) => Promise<any>
export type PluginCallback = (
  param:{
    assetsBasePath: string,
    components: {
      Editor: typeof import('../../../fronts/app/src/components/Editor.vue').default,
      Section: typeof import('../../../fronts/app/src/components/Section.vue').default,
    },
    router: import('../../../fronts/app/src/router/router').default,
    notification: import('../../../fronts/app/src/helpers/notification').default,
    callServer: (path: string, ...args: any[]) => Promise<any>,
    primevueConfig: {
      theme: {
        preset: typeof import('@primevue/themes/aura').default,
        options: {
          darkModeSelector: '.theme-dark',
        },
      },
    },
}
) => {
  placements: {
    location: 'toolbox' | 'sidebar' | 'sidebar-top' | 'dev-ops' | 'service' | 'global',
    component: VueElementConstructor,
    icon?: string,
    text: string,
    iconText?: string,
  }[]
}