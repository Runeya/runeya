const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');

// Utility functions for name conversion
const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

const toPascalCase = (str) => {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

const main = async () => {
  const args = await yargs
    .option('name', {
      type: 'string',
      description: 'The name of the plugin',
    })
    .demandOption('name')
    .argv;

  const pluginName = args.name;
  const pluginDir = path.join(process.cwd(), 'plugins', pluginName);
  
  // Generate proper names for JavaScript
  const className = toPascalCase(pluginName);
  const variableName = toCamelCase(pluginName);

  // Check if plugin already exists
  if (await fs.pathExists(pluginDir)) {
    console.error(`❌ Plugin "${pluginName}" already exists!`);
    process.exit(1);
  }

  console.log(`🚀 Creating plugin "${pluginName}"...`);

  // Create plugin directory structure
  const createDirectoryStructure = async () => {
    await fs.ensureDir(pluginDir);
    await fs.ensureDir(path.join(pluginDir, 'backend'));
    await fs.ensureDir(path.join(pluginDir, 'front', 'src', 'components'));
    await fs.ensureDir(path.join(pluginDir, 'front', 'src', 'helpers'));
    await fs.ensureDir(path.join(pluginDir, 'scripts'));
  };

  // Generate package.json
  const generatePackageJson = () => {
    const packageJson = {
      name: `@runeya/plugins-${pluginName}`,
      version: "1.0.0",
      repository: "https://github.com/runeya/runeya",
      private: true,
      runeya: {
        entries: {
          backend: "./backend/index.js",
          front: {
            js: "./front/index.umd.js"
          }
        }
      },
      scripts: {
        build: "node scripts/package.js",
        "plugin:dev": "cd front && vite build --watch",
        test: ""
      },
      devDependencies: {
        "@runeya/common-plugin-packager": "workspace:*",
        "@runeya/common-retrigger-all-build": "workspace:*",
        "primevue": "^4.3.4",
        "vite": "^6.3.5",
        "vite-plugin-css-injected-by-js": "^3.5.2",
        "vue": "^3.5.13"
      },
      dependencies: {
      }
    };

    return JSON.stringify(packageJson, null, 2);
  };

  // Generate backend files
  const generateBackendIndex = () => {
    return `const plugin = require('./${className}');

module.exports = plugin;
`;
  };

  const generateBackendLogic = () => {
    return `/** @param {import('@runeya/common-typings').Runeya} runeya */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ${className} = (runeya) => {
  return {
    process: (params = {}) => {
      // TODO: Implement your plugin logic here
      return {
        message: 'Hello from ${pluginName} plugin!',
        params
      };
    },
  }
};

module.exports = ${className};
`;
  };

  const generateBackendTsupConfig = () => {
    return `import { rmSync } from 'fs';
import { defineConfig } from 'tsup';
import path from 'path'

const distPath = process.env.DIST_PATH
  ? path.resolve(process.env.DIST_PATH)
  : path.resolve(__dirname, "dist")

rmSync(distPath, {recursive: true, force: true})

export default defineConfig({
  entry: ['./index.js'],
  outDir: distPath,
  clean: true,
  bundle: true,
  esbuildPlugins: [],
  noExternal: [
    /@runeya\\/.*/,
  ],
  sourcemap: true,
});
`;
  };

  // Generate frontend files
  const generateFrontendViteConfig = () => {
    return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      cssInjectedByJsPlugin()
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      lib: {
        entry: './element.js',
        name: 'index',
        fileName: 'index',
        formats: ['umd'],
      },
      rollupOptions: {
        external: [
          'vue',
          'vue/compiler-sfc',
        ],
        output: {
          manualChunks: undefined,
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
    define: {
      'process.env': {}
    },
  }
})
`;
  };

  const generateFrontendElement = () => {
    return `import { defineCustomElement } from 'vue'
import PrimeVue from 'primevue/config';
import Toolbox from './src/Toolbox.ce.vue'
import Aura from '@primevue/themes/aura';
import packageJson from '../package.json';
import args from './src/helpers/args'

const MyToolbox = defineCustomElement(Toolbox, {
  configureApp: (app) => {
    app
    .use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.theme-dark',
        },
      },
    })
  }
})

/** @type {import('@runeya/common-typings').PluginCallback} */
const callback = (params) => {
  args.params = params
  return {
    placements: [
      {
        location: 'toolbox',
        component: MyToolbox,
        icon: 'fa-solid fa-puzzle-piece',
        text: '${className}',
      }
    ]
  }
}

globalThis[packageJson.name](callback)
`;
  };

  const generateArgsHelper = () => {
    return `export default {
  /** @type {Parameters<import('@runeya/common-typings').PluginCallback>[0]} */
  params: null
}
`;
  };

  const generateFrontendVue = () => {
    const displayName = className;
    
    return `<template>
  <div class="${pluginName}-root">
    <h1>${displayName}</h1>
    <SectionCmp>
      <div class="section-content">
        <div class="options">
          <div class="option">
            <label for="exampleInput">Example Setting:</label>
            <InputText 
              id="exampleInput"
              v-model="settings.example"
              placeholder="Enter value"
            />
          </div>
        </div>
        
        <div class="actions">
          <Button 
            label="Process"
            icon="fas fa-play"
            @click="handleProcess"
            :loading="isLoading"
            severity="primary"
          />
          <Button 
            label="Clear"
            icon="fas fa-trash"
            severity="secondary"
            @click="handleClear"
            :disabled="isLoading"
          />
        </div>

        <div v-if="result" class="result">
          <h3>Result:</h3>
          <div class="result-item">
            <div class="result-content">
              <pre>{{ JSON.stringify(result, null, 2) }}</pre>
              <div class="copy-buttons">
                <CopyButton :text="JSON.stringify(result, null, 2)">
                  <i class="fas fa-copy"></i>
                </CopyButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="error">
          <p>{{ error }}</p>
        </div>
      </div>
    </SectionCmp>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import CopyButton from './components/CopyButton.vue';
import args from './helpers/args'

const callServer = args.params.callServer;

const isLoading = ref(false);
const error = ref('');
const result = ref(null);
const settings = ref({
  example: ''
});

const handleProcess = async () => {
  error.value = '';
  result.value = null;
  isLoading.value = true;

  try {
    const { data } = await callServer('process', settings.value);
    result.value = data;
  } catch (err) {
    error.value = 'Something went wrong';
    console.error('${className} error:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleClear = () => {
  settings.value = {
    example: ''
  };
  result.value = null;
  error.value = '';
};
</script>

<style scoped lang="scss">
.${pluginName}-root, .section-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.section-content {
  align-items: center;
  gap: 1rem;
}

.options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    cursor: pointer;
    user-select: none;
  }
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
}

.result-item {
  padding: 0.5rem;
  background: var(--system-secondary-backgroundColor);
  border-radius: 4px;
}

.result-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.result-content pre {
  margin: 0;
  color: var(--system-color);
  font-size: 0.9rem;
  white-space: pre-wrap;
  flex: 1;
}

.copy-buttons {
  display: flex;
  gap: 0.25rem;
}

.copy-buttons :deep(.p-button) {
  padding: 0.25rem 0.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
}

.error {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--p-red-50);
  border: 1px solid var(--p-red-200);
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
}

.error p {
  margin: 0;
  color: var(--p-red-700);
}
</style>
`;
  };

  const generateCopyButtonComponent = () => {
    return `<template>
  <Button 
    severity="primary"
    outlined 
    @click="handleCopy"
  >
    <template v-if="copied">
      <i class="fas fa-check mr-2"></i>
      Copied!
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </Button>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  text: {
    type: String,
    required: true
  }
});

const copied = ref(false);

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}
</script>

<style scoped>
:deep(.p-button) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>
`;
  };

  // Generate scripts
  const generatePackageScript = () => {
    return `const buildAndPackage = require('@runeya/common-plugin-packager');

buildAndPackage().catch(err => {
  console.error('❌ Packaging failed:', err);
  process.exit(1);
});
`;
  };

  // Generate README
  const generateReadme = () => {
    const displayName = className;
    return `# ${displayName} Plugin

## Description
${displayName} plugin for Runeya platform.

## Features
- TODO: Add plugin features

## Usage
- TODO: Add usage instructions
`;
  };

  // Generate .npmrc
  const generateNpmrc = () => {
    return `@runeya:registry=https://npm.pkg.github.com
`;
  };

  // Main creation function
  const createPlugin = async () => {
    try {
      await createDirectoryStructure();

      // Write all files
      await fs.outputFile(path.join(pluginDir, 'package.json'), generatePackageJson());
      await fs.outputFile(path.join(pluginDir, 'README.md'), generateReadme());
      await fs.outputFile(path.join(pluginDir, '.npmrc'), generateNpmrc());

      // Backend files
      await fs.outputFile(path.join(pluginDir, 'backend', 'index.js'), generateBackendIndex());
      await fs.outputFile(path.join(pluginDir, 'backend', `${className}.js`), generateBackendLogic());
      await fs.outputFile(path.join(pluginDir, 'backend', 'tsup.config.ts'), generateBackendTsupConfig());

      // Frontend files
      await fs.outputFile(path.join(pluginDir, 'front', 'vite.config.js'), generateFrontendViteConfig());
      await fs.outputFile(path.join(pluginDir, 'front', 'element.js'), generateFrontendElement());
      await fs.outputFile(path.join(pluginDir, 'front', 'src', 'Toolbox.ce.vue'), generateFrontendVue());
      await fs.outputFile(path.join(pluginDir, 'front', 'src', 'components', 'CopyButton.vue'), generateCopyButtonComponent());
      await fs.outputFile(path.join(pluginDir, 'front', 'src', 'helpers', 'args.js'), generateArgsHelper());

      // Scripts
      await fs.outputFile(path.join(pluginDir, 'scripts', 'package.js'), generatePackageScript());

      console.log(`✅ Plugin "${pluginName}" created successfully!`);
      console.log(`📁 Location: ${pluginDir}`);
      console.log(`\n🚀 Next steps:`);
      console.log(`1. cd plugins/${pluginName}`);
      console.log(`2. yarn install`);
      console.log(`3. yarn build`);
      console.log(`4. Customize your plugin logic in backend/${className}.js`);
      console.log(`5. Customize your plugin UI in front/src/Toolbox.ce.vue`);

    } catch (error) {
      console.error(`❌ Error creating plugin "${pluginName}":`, error);
      process.exit(1);
    }
  };

  await createPlugin();
};

main().catch(console.error);