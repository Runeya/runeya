import {VueElementConstructor} from 'vue'
import { AxiosRequestConfig } from 'axios';
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
    customCallServer: (options: AxiosRequestConfig) => (method: string, ...args: any[]) => Promise<any>,
    socket: {
      emit: (event: string, ...args: any[]) => void,
      on: (event: string, callback: (...args: any[]) => void) => void,
      off: (event: string, callback: (...args: any[]) => void) => void,
    }
    primevueConfig: {
      theme: {
        preset: typeof import('@primevue/themes/aura').default,
        options: {
          darkModeSelector: '.theme-dark-bak',
        },
      },
    },
}
) => {
  placements: {
    location: 'toolbox' | 'sidebar' | 'sidebar-top'  | 'service' | 'global',
    component: VueElementConstructor,
    icon?: string,
    text: string,
    img?: string,
    iconText?: string,
  }[]
}

export interface Theme {
  public?: boolean,
  name?: string,
  group?: string,
  base?: string,
  preview?: {
    background: Partial<{ backgroundColor: string }>,
    foreground1: Partial<{ backgroundColor: string }>,
    foreground2: Partial<{ backgroundColor: string }>,
    foreground3: Partial<{ backgroundColor: string }>,
    foreground4: Partial<{ backgroundColor: string }>,
  },
  rules: Partial<{
    system: Partial<{
      backgroundColor0: string,
      backgroundColor50: string,
      backgroundColor100: string,
      backgroundColor200: string,
      backgroundColor300: string,
      backgroundColor400: string,
      backgroundColor500: string,
      backgroundColor600: string,
      backgroundColor700: string,
      backgroundColor800: string,
      backgroundColor900: string,
      backgroundColor950: string,
      color0: string,
      color50: string,
      color100: string,
      color200: string,
      color300: string,
      color400: string,
      color500: string,
      color600: string,
      color700: string,
      color800: string,
      color900: string,
      color950: string,
      primary50: string;
      primary100: string;
      primary200: string;
      primary300: string;
      primary400: string;
      primary500: string;
      primary600: string;
      primary700: string;
      primary800: string;
      primary900: string;
      primary950: string;

      secondary50: string;
      secondary100: string;
      secondary200: string;
      secondary300: string;
      secondary400: string;
      secondary500: string;
      secondary600: string;
      secondary700: string;
      secondary800: string;
      secondary900: string;
      secondary950: string;

      tertiary50: string;
      tertiary100: string;
      tertiary200: string;
      tertiary300: string;
      tertiary400: string;
      tertiary500: string;
      tertiary600: string;  
      tertiary700: string;
      tertiary800: string;
      tertiary900: string;
      tertiary950: string;

      terminalContrastRatio: number;
    }>,
    sidebarMain: Partial<{ color: string, backgroundColor: string }>,
    sidebar: Partial<{ color: string, backgroundColor: string }>,
    background: Partial<{ color: string, backgroundColor: string }>,
  }>
}
