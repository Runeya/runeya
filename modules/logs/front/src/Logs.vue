<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div v-if="service.enabled" class="logs-container" :class="{ 'fullscreen': isFullscreen }" ref="logsContainer">
    
    <!-- Header with service info and controls -->
    <div class="logs-header">
      <div class="service-info">
        <div class="service-title">
          <i class="fas fa-terminal"></i>
          <h3>{{ service.label }}</h3>
          <div class="service-status" :class="serviceStatusClass">
            <div class="status-dot"></div>
            <span>{{ serviceStatusText }}</span>
          </div>
        </div>
        <div class="current-context" v-if="currentPidView">
          <i class="fas fa-play-circle"></i>
          <span>{{ currentPidView.raw?.substring(0, 40) }}...</span>
        </div>
      </div>
      
              <!-- Process selector -->
        <div class="process-selector" v-if="pids.length > 0">
          <button 
            class="process-btn" 
            :class="{ active: !currentPidView }" 
            @click="currentPidView = null; scroll(true)"
            v-tooltip.top="'View logs from all processes'"
          >
            <i class="fas fa-globe"></i>
            All Processes
          </button>
          <Popover placement="bottom-end" appendTo="parent">
            <template #trigger>
                <button class="process-btn" :class="{ active: currentPidView }" v-tooltip="'Select a specific process to view'">
                  <i class="fas fa-list"></i>
                  Commands ({{ pids.length }})
                  <i class="fas fa-chevron-down"></i>
                </button>
            </template>
          <template #content>
            <div class="process-list">
              <div 
                v-for="pid of pids.slice().reverse().filter(a => a.raw?.trim())" 
                :key="`pid-${pid.pid || 'unknown'}`"
                class="process-item"
                @click="currentPidView = pid; scroll(true)"
                :class="{ active: currentPidView?.pid === pid.pid }"
              >
                <div class="process-cmd">{{ pid.raw }}</div>
                <div class="process-id">PID: {{ pid.pid }}</div>
              </div>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- Main logs content -->
    <div class="logs-content">
      <!-- Filters and controls bar -->
      <div class="controls-bar">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: !mode }"
            @click="mode = ''"
            v-if="countLine > 0"
            v-tooltip.bottom="`All logs (${countLine})`"
          >
            <i class="fas fa-list"></i>
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: mode === 'debug' }"
            @click="mode = 'debug'"
            v-if="countDebug > 0"
            v-tooltip.bottom="`Debug logs (${countDebug})`"
          >
            <i class="fas fa-bug"></i>
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: mode === 'json' }"
            @click="mode = 'json'"
            v-if="countJSON > 0"
            v-tooltip.bottom="`JSON logs (${countJSON})`"
          >
            <i class="fas fa-code"></i>
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: mode === 'errors' }"
            @click="mode = 'errors'"
            v-if="countErrors > 0"
            v-tooltip.bottom="`Error logs (${countErrors})`"
          >
            <i class="fas fa-exclamation-triangle"></i>
          </button>

          <!-- Debug Node.js button in filter tabs for better visibility -->
          <button 
            class="filter-tab debug-launch-btn" :class="{ active: true }"
            @click="launchNodeDebug()"
            v-tooltip.bottom="'🐛 Launch Node.js Debug Mode'"
            style="background: #8b5cf6 !important; border-color: #8b5cf6 !important; color: white !important; margin-left: 10px;"
          >
            <i class="fas fa-bug"></i>
          </button>

          <!-- Next Debug button -->
          <button 
            v-if="isDebuggerConnected"
            class="filter-tab next-debug-btn" 
            @click="nextDebugStep()"
            :disabled="isResumingDebug"
            v-tooltip.bottom="'▶️ Continue to Next debugger; statement'"
            style="background: #10b981 !important; border-color: #10b981 !important; color: white !important; margin-left: 5px;"
          >
            <i class="fas fa-step-forward" :class="{ 'fa-spin': isResumingDebug }"></i>
          </button>

          <!-- Test Modal button -->
          <button 
            class="filter-tab test-modal-btn" 
            @click="testModal()"
            v-tooltip.bottom="'🧪 Test Modal (debug)'"
            style="background: #f59e0b !important; border-color: #f59e0b !important; color: white !important; margin-left: 5px;"
          >
            <i class="fas fa-flask"></i>
          </button>
        </div>

        <div class="controls-actions">
          <!-- Debug Node.js button -->
          <button 
            class="control-btn debug-nodejs-btn" 
            @click="launchNodeDebug()"
            :disabled="isLaunchingDebug"
            v-tooltip.bottom="isLaunchingDebug ? 'Launching debug mode...' : 'Launch Node.js Debug Mode'"
            style="background: #8b5cf6 !important; border-color: #8b5cf6 !important; color: white !important;"
          >
            <i class="fas fa-bug" :class="{ 'fa-spin': isLaunchingDebug }"></i>
            <span v-if="!isLaunchingDebug">🐛</span>
            <span v-if="isLaunchingDebug" class="debug-text">Debug</span>
          </button>

          <Popover appendTo="parent" placement="bottom-end" trigger="click">
            <template #trigger>
              <button class="control-btn" v-tooltip.bottom="'Open filters panel'">
                <i class="fas fa-filter"></i>
              </button>
            </template>
            <template #content>
              <div class="filters-panel">
                <div class="filter-group">
                  <label>Search in logs</label>
                  <div class="search-input">
                      <i class="fas fa-search"></i>
                    <input
                      type="text" 
                      v-model="filterSearch" 
                      :placeholder="isInclude ? 'Include...' : 'Exclude...'"
                    >
                      </div>
                  <div class="radio-group">
                    <label class="radio-item">
                      <input type="radio" :checked="isInclude" @input="isInclude = true">
                      <span>Include</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" :checked="!isInclude" @input="isInclude = false">
                      <span>Exclude</span>
                    </label>
                      </div>
                    </div>

                <div class="filter-group" v-if="countJSON || countDebug">
                  <label>JSON Path</label>
                  <div class="search-input">
                    <i class="fas fa-code"></i>
                    <input type="text" v-model="jsonPathSearch" placeholder="JSON path...">
                  </div>
                </div>

                <div class="filter-group">
                  <label>Display lines</label>
                  <select v-model="numberToDisplay" class="select-input">
                          <option :value="10">10</option>
                          <option :value="50">50</option>
                          <option :value="100">100</option>
                          <option :value="200">200</option>
                          <option :value="500">500</option>
                          <option :value="1000">1000</option>
                        </select>
                      </div>

                <div class="filter-group">
                  <label class="checkbox-item">
                    <input type="checkbox" v-model="simplifiedMode">
                    <span>Simplified mode</span>
                  </label>
                    </div>
                  </div>
            </template>
          </Popover>

          <button class="control-btn" @click="toggleScrollPause()" v-tooltip.bottom="isScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'" :class="{ active: isScrollPaused }">
            <i :class="isScrollPaused ? 'fas fa-play' : 'fas fa-pause'"></i>
          </button>

          <button class="control-btn" @click="scroll(true)" v-tooltip.bottom="'Scroll to the bottom of logs'">
            <i class="fas fa-arrow-down"></i>
          </button>

          <button class="control-btn" @click="exportLogs()" v-tooltip.bottom="'Export logs to file'">
            <i class="fas fa-download"></i>
          </button>

          <button class="control-btn" @click="toggleFullscreen()" v-tooltip.bottom="isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'">
            <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
          
          <button class="control-btn danger" @click="clear()" v-tooltip.bottom="'Clear all logs'">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Logs display area -->
      <div class="logs-display" ref="jsonsRef" @scroll="handleScroll">
        <!-- Indicateur de pause -->
        <div v-if="isScrollPaused" class="scroll-pause-indicator">
          <i class="fas fa-pause"></i>
          <span>Auto-scroll paused</span>
          <div v-if="pausedLogsBuffer.length > 0" class="pending-logs">
            <i class="fas fa-clock"></i>
            <span>{{ pausedLogsBuffer.length }} new log{{ pausedLogsBuffer.length > 1 ? 's' : '' }} pending</span>
          </div>
          <button @click="toggleScrollPause()" class="resume-btn">
            <i class="fas fa-play"></i>
            Resume
          </button>
        </div>
        
        <LogsLine 
          v-for="line of displayedLines" :key="line.id"
          @click="setSelectedLine"
          @debug-open="openDebugModalFromLog"
          :line="line"
          :simplifiedMode="simplifiedMode"
          :jsonPathSearch="jsonPathSearch"
        />
      </div>

            <!-- Command input area -->
      <div class="command-input" v-if="!currentPidView || currentPidView.cmd?.status == 'running'">
        <!-- Shortcuts in a simple horizontal line -->
        <div class="shortcuts-line" v-if="service.shortcuts?.length || scenarios?.length">
          <Tag 
            v-for="shortcut of service.shortcuts" 
            :key="shortcut.label || shortcut.spawnCmd"
            class="shortcut-tag" 
            severity="info" 
            @click="sendShortcut(shortcut)"
          >
            <i class="fas fa-terminal"></i>
            {{ shortcut.label || `${shortcut.spawnCmd} ${(shortcut.spawnArgs?.join(' ') || '')}` }}
              </Tag>
          <Tag 
            v-for="(scenario, index) of scenarios" 
            :key="scenario.id || scenario.name || `scenario-${index}`"
            class="shortcut-tag" 
            severity="warn" 
            @click="sendScenario(scenario)"
          >
            <i class="fas fa-sitemap"></i>
            {{ scenario.name || 'Scenario' }}
              </Tag>
            </div>

        <!-- Loading indicator -->
        <div class="command-loading" v-if="autocompleteInProgress">
          <Spinner size="16"></Spinner>
          <span>Loading suggestions...</span>
            </div>

        <!-- Main command line -->
        <div class="main-command-line">
          <!-- Command history -->
          <div class="command-history" v-if="histories?.length">
                <div
              v-for="(history, i) of histories" 
              :key="`history-${i}`"
              class="history-item" 
              :class="{ active: history.active }"
                  @click="messageToSend = history.cmd; histories = []; textareaRef?.focus()"
            >
              <div class="history-cmd">{{ history.cmd }}</div>
              <div class="history-meta">
                <span>Used: {{ history.timestamps?.length || 0 }}</span>
                <span>{{ history.timestamp ? dayjs(history.timestamp).format('HH:mm:ss') : '???' }}</span>
                  </div>
                  </div>
                </div>
          <!-- Context badges inline with input -->
          <div class="context-badges">
            <div class="path-selector" v-if="!service.container?.enabled && cwds?.length > 1">
              <i class="fas fa-folder"></i>
              <Select
                v-model="cwd"
                :options="cwds"
                :optionLabel="getShortPath"
                :optionValue="(option) => option"
                placeholder="Select path..."
                class="path-select"
              />
                </div>
            <span class="context-badge" v-else-if="!service.container?.enabled">
              <i class="fas fa-folder"></i>
              {{ getShortPath(cwd) }}
            </span>
            <span class="context-badge" v-else>
              <i class="fab fa-docker"></i>
              Docker
            </span>
            <span class="context-badge git-badge" v-if="currentBranch" :class="{ changes: gitChanges?.length }">
              <i class="fas fa-code-branch"></i>
                    {{ currentBranch }}
              <span v-if="Number(gitRemoteDelta) !== 0" class="git-delta">
                <i :class="Number(gitRemoteDelta) > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ Math.abs(Number(gitRemoteDelta)) }}
              </span>
            </span>
            <span class="context-badge pid-badge" v-if="currentPidView?.pid" :class="`status-${currentPidView.cmd?.status || 'unknown'}`">
              <i v-if="currentPidView.cmd?.status === 'running'" class="fas fa-circle status-indicator running"></i>
              <i v-else-if="currentPidView.cmd?.status === 'exited'" class="fas fa-check status-indicator exited"></i>
              <i v-else-if="currentPidView.cmd?.status === 'error'" class="fas fa-times status-indicator error"></i>
              <i v-else-if="currentPidView.cmd?.status === 'killed' || currentPidView.cmd?.status === 'stopped'" class="fas fa-exclamation status-indicator terminated"></i>
              <i v-else class="fas fa-circle status-indicator unknown"></i>
              PID: {{ currentPidView.pid }}
              <span class="status-text">{{ getStatusLabel(currentPidView.cmd?.status || 'unknown') }}</span>
            </span>
                    </div>

          <!-- Command input -->
          <div class="input-row">
            <i class="fas fa-chevron-right prompt-icon"></i>
            <textarea 
              ref="textareaRef"
                  v-model="messageToSend"
                  @keypress.enter="sendEnter"
                  @keyup="keyup"
                  @keydown="keydown"
                  @input="inputTerminal"
              :placeholder="currentPidView ? `Send to PID ${currentPidView.pid}...` : 'Enter command...'"
              class="command-textarea"
                />
            </div>
          </div>
          </div>

      <!-- Terminated process message -->
      <div class="terminated-process" v-else-if="currentPidView">
        <div class="terminated-message">
          <i class="fas fa-exclamation-triangle"></i>
          <span>This process no longer accepts commands</span>
    </div>
        <div class="terminated-actions">
          <button class="action-btn" @click="currentPidView = null" v-tooltip="'Switch back to viewing all processes'">
            <i class="fas fa-globe"></i>
          </button>
          <button class="action-btn danger" @click="sendTerminate(true)" v-tooltip="'Force kill this process'">
            <i class="fas fa-skull"></i>
          </button>
  </div>
      </div>
    </div>

    <!-- Line details drawer -->
    <Sidebar 
      v-model:visible="showLineDetails" 
      position="right"
      :style="{ width: '500px' }"
      appendTo="body"
      class="line-details-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <i class="fas fa-info-circle"></i>
          <h3>Log Details</h3>
        </div>
      </template>

      <div class="drawer-content">
        <div class="detail-section">
          <label>Type</label>
          <div class="detail-value">
            <template v-if="selectedLine?.debug">Debug</template>
            <template v-else-if="selectedLine?.json">JSON</template>
            <template v-else-if="selectedLine?.cmd">Command</template>
            <template v-else>Text</template>
          </div>
        </div>

        <div class="detail-section">
          <label>Raw Message</label>
          <div class="detail-value code">
            <pre>{{ selectedLine?.msg }}</pre>
          </div>
        </div>

        <div class="detail-section" v-if="selectedLine?.pid">
          <label>Process ID</label>
          <div class="detail-value clickable" @click="setPid(selectedLine)">
            {{ selectedLine.pid }}
            <button class="link-btn">
              <i class="fas fa-external-link-alt"></i>
              View Process
            </button>
          </div>
        </div>

        <div class="detail-section">
          <label>Timestamp</label>
          <div class="detail-value">
            {{ selectedLine ? dayjs(selectedLine.timestamp).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </div>
        </div>

        <div class="detail-section" v-if="selectedLine?.cmd">
          <label>Command Options</label>
          <div class="detail-value">
            <JsonTreeView 
              :maxDepth="1" 
              :json="transformerJSON(selectedLine.cmd)" 
              :copyable="true" 
              :expand-depth="1" 
              :show-double-quotes="true"
            />
          </div>
        </div>
      </div>
    </Sidebar>
  </div>

  <!-- Service not enabled state -->
  <div v-else class="service-disabled">
    <div class="disabled-content">
      <i class="fas fa-power-off"></i>
      <h3>Service Not Running</h3>
      <p>Start this service to view logs</p>
      
      <div class="shortcuts" v-if="service.shortcuts?.length || scenarios?.length">
        <Tag 
          v-for="shortcut of service.shortcuts" 
          :key="shortcut.label || shortcut.spawnCmd"
          class="shortcut-tag" 
          severity="info" 
          @click="sendShortcut(shortcut)"
        >
          <i class="fas fa-terminal"></i>
          {{ shortcut.label || `${shortcut.spawnCmd} ${(shortcut.spawnArgs?.join(' ') || '')}` }}
        </Tag>
        <Tag 
          v-for="(scenario, index) of scenarios" 
          :key="scenario.id || scenario.name || `scenario-${index}`"
          class="shortcut-tag" 
          severity="warn" 
          @click="sendScenario(scenario)"
        >
          <i class="fas fa-sitemap"></i>
          {{ scenario.name || 'Scenario' }}
        </Tag>
      </div>
    </div>
  </div>

  <!-- Debug Breakpoint Modal - outside conditional structure -->
  <Dialog 
    v-model:visible="showDebugModal" 
    :closable="true"
    :modal="true"
    header="🐛 Node.js Debugger Paused"
    class="debug-modal"
    style="width: 80vw; max-width: 1200px; height: 80vh;"
  >
    <!-- Quick actions in header -->
    <template #header>
      <div class="debug-modal-header">
        <div class="header-title">
          <i class="fas fa-bug"></i>
          <span>Node.js Debugger Paused</span>
        </div>
        <div class="header-actions">
          <button 
            v-if="isDebuggerConnected"
            class="quick-action-btn continue-btn" 
            @click="nextDebugStep()"
            :disabled="isResumingDebug"
            v-tooltip.bottom="'Continue to next debugger; statement'"
          >
            <i class="fas fa-step-forward" :class="{ 'fa-spin': isResumingDebug }"></i>
            <span>Continue</span>
          </button>
        </div>
      </div>
    </template>
    <div v-if="debugInfo" class="debug-content">
      <!-- Scrollable Content -->
      <div class="debug-scrollable">
        <!-- Location Info -->
        <div class="debug-section">
          <h4><i class="fas fa-map-marker-alt"></i> Current Location</h4>
          <div class="location-info">
            <div class="location-item">
              <label>File:</label>
              <span class="location-value">{{ debugInfo.location?.url || 'Unknown' }}</span>
            </div>
            <div class="location-item">
              <label>Function:</label>
              <span class="location-value">{{ debugInfo.location?.functionName || 'Unknown' }}</span>
            </div>
            <div class="location-item">
              <label>Line:</label>
              <span class="location-value">{{ debugInfo.location?.line || 0 }}:{{ debugInfo.location?.column || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Source Code Context -->
        <div class="debug-section" v-if="debugInfo.sourceContext?.length">
          <h4><i class="fas fa-code"></i> Source Code</h4>
          <div class="source-context">
            <div 
              v-for="line in debugInfo.sourceContext" 
              :key="line.number"
              class="source-line"
              :class="{ current: line.current }"
            >
              <span class="line-number">{{ line.number }}</span>
              <span class="line-content">{{ line.content }}</span>
            </div>
          </div>
        </div>

        <!-- Variables -->
        <div class="debug-section" v-if="debugInfo.variables">
          <h4><i class="fas fa-database"></i> Variables</h4>
          <div class="variables-container">
            <div v-for="(vars, scope) in debugInfo.variables" :key="scope" class="scope-section">
              <h5>{{ String(scope).charAt(0).toUpperCase() + String(scope).slice(1) }} Variables</h5>
              <div class="variables-list">
                <div v-for="variable in vars" :key="variable.name" class="variable-item">
                  <span class="var-name">{{ variable.name }}</span>
                  <span class="var-type" :class="`var-${variable.type}`">{{ variable.type }}</span>
                  <div class="var-value">
                    <JsonTreeView 
                      v-if="variable.type === 'object' && variable.value" 
                      :json="variable.value" 
                      :maxDepth="2"
                      :copyable="true"
                    />
                    <span v-else :class="`var-${variable.type}`">{{ variable.description || variable.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </Dialog>

  </Teleport>
</template>

<script setup>
import jsonpath from 'jsonpath';
import {
  computed, onMounted, ref, nextTick, onBeforeUnmount,
  onUnmounted, Teleport,
} from 'vue';
import dayjs from 'dayjs';
import debounce from 'debounce';
import Socket from '../../../../fronts/app/src/helpers/Socket';
import Service from '../../../../fronts/app/src/models/service';
import notification from '../../../../fronts/app/src/helpers/notification';
import Popover from '../../../../fronts/app/src/components/Popover.vue';
import fs from '../../../../fronts/app/src/models/fs';
import Spinner from '../../../../fronts/app/src/components/Spinner.vue';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import Sidebar from 'primevue/sidebar';
import Dialog from 'primevue/dialog';
import Stack from '../../../../fronts/app/src/models/stack'
import LogsLine from './LogsLine.vue';
import { JsonTreeView } from 'json-tree-view-vue3';
import 'json-tree-view-vue3/dist/style.css';

const props = defineProps({
  service: {
    /** @type {import('../../../../fronts/app/src/models/service').default | null} */
    default: null,
  },
  noStyle: { default: false },
  isInMultiMode: { default: false },
});

/** @type {import('vue').Ref<import('xterm').Terminal | null>} */
const terminal = ref(null);
/** @type {import('vue').Ref<HTMLElement | null>} */
const logsContainer = ref(null);
/** @type {import('vue').Ref<HTMLElement | null>} */
const jsonsRef = ref(null);
const filterSearch = ref('');
const isInclude = ref(false);
/** @type {import('vue').Ref<LogMessage[]>} */
const logs = ref([]);
/** @type {import('vue').Ref<LogMessage | null>} */
const selectedLine = ref(null);
const showLineDetails = ref(false);
const jsonPathSearch = ref('');
const simplifiedMode = ref(false);
const numberToDisplay = ref(200);
const mode = ref('');
/** @type {import('vue').Ref<any[]>} */
const scenarios = ref([]);
/** @type {import('vue').Ref<{active: boolean, cmd: string, args: string, raw: string, timestamp: number,timestamps: number[]}[]>} */
const histories = ref([]);

// Debug state
const isLaunchingDebug = ref(false);
const isResumingDebug = ref(false);
const showDebugModal = ref(false);
const debugInfo = ref({});
const isDebuggerConnected = ref(false);


const countJSON = computed(() => {
  let count = logs.value.reduce((count, line) => (line.json && !line.debug ? count + 1 : count), 0);
  if (count > numberToDisplay.value) count = numberToDisplay.value;
  return count;
});
const countDebug = computed(() => {
  let count = logs.value.reduce((count, line) => (line.debug ? count + 1 : count), 0);
  if (count > numberToDisplay.value) count = numberToDisplay.value;
  return count;
});
const countErrors = computed(() => {
  let count = logs.value.reduce((count, line) => (line.source === 'stderr' || (line.cmd && line.cmd.status === 'error') ? count + 1 : count), 0);
  if (count > numberToDisplay.value) count = numberToDisplay.value;
  return count;
});
const countLine = computed(() => {
  let count = logs.value.length;
  if (count > numberToDisplay.value) count = numberToDisplay.value;
  return count;
});

// Détermine le statut réel du service basé sur les processus
const serviceStatusClass = computed(() => {
  if (!props.service.enabled) return { stopped: true };
  
  const runningProcesses = pids.value.filter(p => p.cmd?.status === 'running');
  const errorProcesses = pids.value.filter(p => p.cmd?.status === 'error');
  
  if (runningProcesses.length > 0) return { running: true };
  if (errorProcesses.length > 0) return { error: true };
  if (pids.value.length > 0) return { idle: true };
  
  return { running: true }; // Service enabled mais pas de processus = running
});

const serviceStatusText = computed(() => {
  if (!props.service.enabled) return 'Stopped';
  
  const runningProcesses = pids.value.filter(p => p.cmd?.status === 'running');
  const errorProcesses = pids.value.filter(p => p.cmd?.status === 'error');
  
  if (runningProcesses.length > 0) {
    return `Running (${runningProcesses.length} active)`;
  }
  if (errorProcesses.length > 0) {
    return `Error (${errorProcesses.length} failed)`;
  }
  if (pids.value.length > 0) {
    return 'Idle';
  }
  
  return 'Running';
});

/** @param {any} json */
function transformerJSON(json) {
  if (jsonPathSearch.value) {
    const search = jsonPathSearch.value.endsWith('.')
      ? jsonPathSearch.value.slice(0, -1)
      : jsonPathSearch.value;
    try {
      const res = jsonpath.query(json, search);
      if (res.length === 1) return JSON.stringify(res['0'] || '{}');
      return JSON.stringify(res || '{}');
    } catch (error) {
      console.error(error);
    }
  }
  return JSON.stringify(json || '{}');
}
const displayedLines = computed(() => {
  /** @type {LogMessage[]} */
  let lines = [];
  if (mode.value === 'debug') {
    lines = logs.value
      .filter((line) => {
        if (line.isSeparator) return isLineIncluded(line);
        if (line.debug && isLineIncluded(line)) return true;
        return false;
      })
      .slice(-numberToDisplay.value);
  } else if (mode.value === 'json') {
    lines = logs.value
      .filter((line) => {
        if (line.isSeparator) return isLineIncluded(line);
        if (line.json && !line.debug && isLineIncluded(line)) return true;
        return false;
      })
      .slice(-numberToDisplay.value);
  } else if (mode.value === 'errors') {
    lines = logs.value
      .filter((line) => {
        if (line.isSeparator) return isLineIncluded(line);
        if ((line.source === 'stderr' || (line.cmd && line.cmd.status === 'error')) && isLineIncluded(line)) return true;
        return false;
      })
      .slice(-numberToDisplay.value);
  } else {
    lines = logs.value
      .filter((line) => {
        if (line.isSeparator) return isLineIncluded(line);
        if (isLineIncluded(line)) return true;
        return false;
      })
      .slice(-numberToDisplay.value);
  }

  return lines.filter((line, i, arr) => {
    if (line.isSeparator) return !arr[i + 1]?.isSeparator;
    return true;
  });
});


/**
 * @param {LogMessage} line
 */
const isLineIncluded = (line) => {
  const message = filterSearch.value;
  if (line.hide) return false;
  if (line.isSeparator) return true;
  if (currentPidView.value?.pid && currentPidView.value?.pid !== line.pid) return false;
  if (!message) return true;
  const filters = message.includes(' | ')
    ? message.split(' | ')
    : [message];
  return isInclude.value
    ? filters.filter((a) => a).some(((filter) => {
      const res = line.msg.toUpperCase().match(new RegExp(escapeRegExp(filter), 'gi'));
      return !!res;
    }))
    : filters.filter((a) => a).every(((filter) => {
      const res = line.msg.toUpperCase().match(new RegExp(escapeRegExp(filter), 'gi'));
      return !res;
    }));
};

onMounted(() => mounted());

const onConfUpdate = () => {
  if (logsContainer.value && !logsContainer.value?.children.length && terminal.value) {
    terminal.value.open(logsContainer.value);
  }
};
onMounted(() => {
  Socket.on('conf:update', onConfUpdate);
  
  // Close history when clicking outside
  const handleClickOutside = (event) => {
    const historyContainer = document.querySelector('.command-history');
    const mainCommandLine = document.querySelector('.main-command-line');
    const textarea = document.querySelector('.command-textarea');
    
    if (histories.value.length > 0 && historyContainer && mainCommandLine) {
      // If click is outside the main command line or not on textarea
      if (!mainCommandLine.contains(event.target) || event.target === textarea) {
        // Only close if not clicking on textarea (to allow typing)
        if (event.target !== textarea) {
          histories.value = [];
        }
      }
    }
  };
  

  
  document.addEventListener('click', handleClickOutside);
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});
onBeforeUnmount(() => {
  Socket.off('conf:update', onConfUpdate);
});
async function mounted() {
  logs.value = await props.service.getLogs();
  scenarios.value = await Stack.scenarios('services', props.service.label)
  scroll(true);
}
const crashEventCB = (/** @type {{label:string, code: number, signal: string, pid?: number}} */data) => {
  if (data.label !== props.service.label) return;
  if (data.pid) {
    if (currentPidView.value?.pid === data.pid) {
      currentPidView.value = null;
      scroll(true);
    }
  }
};
const clearEventCB = (data) => {
  if (data.label !== props.service.label) return;
  logs.value = [];
  terminal.value?.clear();
};
const logsUpdateEventCB = (/** @type {LogMessage[]} */datas) => {
  datas.forEach((data) => {
    if (data.label !== props.service.label) return;
    
    if (isScrollPaused.value) {
      // Si en pause, stocker dans le buffer (limité à 500 lignes)
      pausedLogsBuffer.value.push(data);
      if (pausedLogsBuffer.value.length > 500) {
        pausedLogsBuffer.value.shift(); // Supprimer les plus anciennes
      }
    } else {
      // Si pas en pause, ajouter normalement
      logs.value.push(data);
      if(logs.value.length > 1100) logs.value.splice(0, 100);
      scroll();
    }
  });
};
const logsUpdateLineEventCB = (/** @type {LogMessage[]} */lines) => {
  lines.forEach((line) => {
    if (line.label !== props.service.label) return;
    
    // Mettre à jour dans les logs principaux
    const index = logs.value.findIndex((a) => a.id === line.id);
    if (index >= 0) {
      logs.value.splice(index, 1, line);
    }
    
    // Mettre à jour aussi dans le buffer des logs en pause
    const bufferIndex = pausedLogsBuffer.value.findIndex((a) => a.id === line.id);
    if (bufferIndex >= 0) {
      pausedLogsBuffer.value.splice(bufferIndex, 1, line);
    }
  });
};
const exitEventCB = (/** @type {{label:string, code: number, signal: string, pid?: number}} */data) => {
  if (data.label !== props.service.label) return;
  if (data.pid) {
    if (currentPidView.value?.pid === data.pid) {
      currentPidView.value = null;
      scroll(true);
    }
  }
};
Socket.on('logs:update', logsUpdateEventCB);
Socket.on('logs:update:lines', logsUpdateLineEventCB);
Socket.on('service:exit', exitEventCB);
Socket.on('service:crash', crashEventCB);
Socket.on('logs:clear', clearEventCB);

// Debug event listener
const debugPausedEventCB = (data) => {
  if (data.service !== props.service.label) return;
  
  console.log('🐛 Debug paused event received:', data);
  console.log('🐛 Current showDebugModal value:', showDebugModal.value);
  console.log('🐛 Setting debugInfo to:', data.debugInfo);
  
  debugInfo.value = data.debugInfo;
  showDebugModal.value = true;
  
  console.log('🐛 showDebugModal set to:', showDebugModal.value);
  console.log('🐛 debugInfo is now:', debugInfo.value);
  
  notification.next('success', `🐛 Script paused at ${data.debugInfo.location.functionName || 'line'} (${data.debugInfo.location.line})`);
};

// Debug connected event callback
const debugConnectedEventCB = (data) => {
  if (data.service === props.service.label) {
    isDebuggerConnected.value = true;
    console.log('[DEBUG] Debugger connected for service:', data.service);
  }
};

// Debug disconnected event callback
const debugDisconnectedEventCB = (data) => {
  if (data.service === props.service.label) {
    isDebuggerConnected.value = false;
    showDebugModal.value = false;
    console.log('[DEBUG] Debugger disconnected for service:', data.service, 'Reason:', data.reason);
    
    // Show notification to user about disconnection
    if (data.reason && data.reason.includes('ECONNREFUSED')) {
      notification.next('error', '🐛 Debugger connection lost - process may have ended');
    } else if (data.reason && data.reason.includes('cannot connect')) {
      notification.next('error', '🐛 Cannot connect to debugger - check if Node.js process is running');
    } else if (data.reason) {
      notification.next('success', `🐛 Debugger disconnected: ${data.reason}`);
    }
  }
};

// Debug resumed event callback
const debugResumedEventCB = (data) => {
  if (data.service === props.service.label) {
    isResumingDebug.value = false;
    console.log('[DEBUG] Debugger resumed for service:', data.service);
  }
};

Socket.on('debug:paused', debugPausedEventCB);
Socket.on('debug:connected', debugConnectedEventCB);
Socket.on('debug:disconnected', debugDisconnectedEventCB);
Socket.on('debug:resumed', debugResumedEventCB);
onUnmounted(() => {
  Socket.socket.off('logs:update', logsUpdateEventCB);
  Socket.socket.off('logs:update:lines', logsUpdateLineEventCB);
  Socket.socket.off('service:exit', exitEventCB);
  Socket.socket.off('service:crash', crashEventCB);
  Socket.socket.off('logs:clear', clearEventCB);
  Socket.socket.off('debug:paused', debugPausedEventCB);
  Socket.socket.off('debug:connected', debugConnectedEventCB);
  Socket.socket.off('debug:disconnected', debugDisconnectedEventCB);
  Socket.socket.off('debug:resumed', debugResumedEventCB);
});

async function clear() {
  props.service.clear();
  logs.value = [];
}

/** @param {string} text */
function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
/**
 *
 * @param {boolean} force
 * @param {HTMLElement | null} customElement
 */
async function scroll(force = false, customElement = null) {
  const container = customElement || jsonsRef.value;
  if (!container) return;
  
  const shouldScroll = container.scrollTop + container.clientHeight === container.scrollHeight;
  await nextTick();
  
  // Si c'est un scroll forcé ou si on devrait scroller naturellement et qu'on n'est pas en pause
  if (force || (shouldScroll && !isScrollPaused.value)) {
    container.scrollTop = container.scrollHeight;
    
    // Pour les scrolls forcés, s'assurer qu'on arrive vraiment en bas
    if (force) {
      await nextTick();
      container.scrollTop = container.scrollHeight;
    }
  }
}

function toggleScrollPause() {
  isScrollPaused.value = !isScrollPaused.value;
  
  // Si on reprend le scroll, ajouter toutes les lignes en attente et aller en bas
  if (!isScrollPaused.value) {
    resumeScrollAndFlush();
  }
}

async function resumeScrollAndFlush() {
  isScrollingProgrammatically = true;
  
  // Désactiver la pause
  isScrollPaused.value = false;
  
  // Ajouter les logs en attente
  flushPausedLogs();
  
  // Attendre le prochain tick pour que le DOM soit mis à jour
  await nextTick();
  
  // Forcer le scroll vers le bas
  await scroll(true);
  
  // Attendre un peu avant de réactiver la détection
  setTimeout(() => {
    isScrollingProgrammatically = false;
  }, 100);
}

function flushPausedLogs() {
  // Ajouter toutes les lignes du buffer
  if (pausedLogsBuffer.value.length > 0) {
    logs.value.push(...pausedLogsBuffer.value);
    
    // Nettoyer les logs trop anciens
    if(logs.value.length > 1100) {
      const toRemove = logs.value.length - 1000; // Garder 1000 lignes
      logs.value.splice(0, toRemove);
    }
    
    // Vider le buffer
    pausedLogsBuffer.value = [];
  }
}

// Flag pour éviter les détections de scroll pendant les opérations automatiques
let isScrollingProgrammatically = false;

// Détecte si l'utilisateur fait défiler manuellement vers le haut
function handleScroll(event) {
  // Ignorer les scrolls automatiques
  if (isScrollingProgrammatically) return;
  
  const container = event.target;
  const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
  
  // Si l'utilisateur n'est pas en bas et que le scroll n'est pas déjà en pause, 
  // activer automatiquement la pause
  if (!isAtBottom && !isScrollPaused.value) {
    isScrollPaused.value = true;
  }
  // Si l'utilisateur revient en bas et que le scroll est en pause,
  // reprendre automatiquement le scroll et vider le buffer
  else if (isAtBottom && isScrollPaused.value) {
    resumeScrollAndFlush();
  }
}

const messageToSend = ref('');
/** @param {Event | undefined} ev */
async function send(command, ev = undefined) {
  ev?.preventDefault?.();
  const pid = await props.service.sendTerminalPrompt({
    command,
    pid: currentPidView.value?.pid || undefined,
  });
  setTimeout(() => {
    const lineFound = logs.value.find((log) => log.pid === pid.pid);
    if (lineFound?.cmd?.status === 'running') {
      currentPidView.value = lineFound;
    }
  }, 100);
  messageToSend.value = '';
  if (ev?.target) {
    await nextTick();
    rerenderTextarea();
  }
  scroll(true);
  reloadBarInfos(true);
}

const textareaRef = ref();
function rerenderTextarea() {
  textareaRef.value.style.height = 'calc(15px)';
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
}
/** @param {KeyboardEvent} ev */
async function sendEnter(ev) {
  const active = histories.value.find((a) => a.active);
  if (active) {
    setTimeout(async () => {
      messageToSend.value = active.cmd?.trim();
      await nextTick();
      rerenderTextarea();
      setTimeout(() => {
        histories.value = [];
      }, 100);
    });
    return;
  }
  if (!ev.shiftKey) await send({
    spawnCmd: messageToSend.value.trim(),
    spawnOptions: {
      cwd: cwd.value
    }
  }, ev);
  else messageToSend.value += '\n';
}
/** @param {Event} ev */
async function inputTerminal(ev) {
  histories.value = [];
  if (ev.target) {
    if (/** @type {HTMLElement} */(ev.target).scrollHeight < 300) {
      rerenderTextarea();
    }
  }
}

/** @param {boolean} forceKill */
async function sendTerminate(forceKill = false) {
  await props.service.sendTerminalTerminate({ pid: currentPidView.value?.pid || undefined, forceKill });
}
const autocompleteInProgress = ref(false);

/** @param {KeyboardEvent} $event */
async function keydown($event) {
  if ($event.code === 'Tab') $event.preventDefault();
}
/** @param {KeyboardEvent} $event */
async function keyup($event) {
  if ($event.code === 'Escape') {
    histories.value = [];
    return null;
  }
  if ($event.code === 'Enter') {
    histories.value = [];
    return null;
  }
  if ($event.ctrlKey && $event.code === 'KeyC') {
    sendTerminate();
    return null;
  }
  if ($event.code !== 'ArrowUp' && $event.code !== 'ArrowDown' && !messageToSend.value) {
    histories.value = [];
    return null;
  }
  if ($event.code === 'ArrowUp' && histories.value.length) {
    changeActive($event, 1);
    return null;
  }
  if ($event.code === 'ArrowDown' && histories.value.length) {
    changeActive($event, -1);
    return null;
  }
  if (['ArrowUp', 'ArrowDown'].includes($event.code)) {
    histories.value = await props.service.autocomplete(messageToSend.value, { force: true });
    return null;
  }
  autocompleteInProgress.value = true;
  await autocomplete();
  if (!messageToSend.value) changeActive($event, 1);
  return null;
}
const autocomplete = debounce(async (force = false) => {
  try {
    autocompleteInProgress.value = true;
    const _histories = await props.service.autocomplete(messageToSend.value, { force });
    if (!messageToSend.value && !force) return;
    histories.value = _histories;
  } finally {
    autocompleteInProgress.value = false;
  }
}, 200);

/**
 * @param {KeyboardEvent} $event
 * @param {number} offset
 */
async function changeActive($event, offset) {
  const activeIndex = histories.value.findIndex((a) => a.active);
  if (activeIndex === -1) {
    const last = offset > 0 ? histories.value[histories.value.length - 1] : histories.value[0];
    if (last) last.active = true;
  } else {
    const current = histories.value[activeIndex];
    const next = histories.value[activeIndex - offset];
    current.active = false;
    if (next) next.active = true;
    else changeActive($event, offset);
  }
  
  // Scroll to active item
  await nextTick();
  const historyContainer = document.querySelector('.command-history');
  const activeItem = document.querySelector('.history-item.active');
  if (historyContainer && activeItem) {
    activeItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }
}
/** @type {import('vue').Ref<LogMessage | null | undefined>} */
const currentPidView = ref(null);
const pids = computed(() => logs.value.reduce((aggr, log) => {
  if (log.pid && !aggr?.find((_log) => _log.pid === log.pid)) aggr.push(log);
  return aggr;
}, /** @type {LogMessage[]} */([])));

const currentBranch = ref('');
const gitChanges = ref('');
const homedir = ref('');
const gitRemoteDelta = ref('');

// Optimized intervals to prevent unnecessary re-renders
let interval = null;
let longInterval = null;

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  if (longInterval) clearInterval(longInterval);
});

onMounted(async () => {
  homedir.value = await fs.homeDir();
  await reloadBarInfos(true);
  
  // Only start intervals if git is configured
  if (props.service.git?.remote) {
    interval = setInterval(() => {
      reloadBarInfos();
    }, 1000); // Reduced frequency from 1s to 5s
    
    longInterval = setInterval(() => {
      reloadBarInfos(true);
    }, 20000); // Reduced frequency from 20s to 60s
  }
});

const reloadBarInfos = debounce(async (reloadCostingInfos = false) => {
  if (!props.service.git?.remote) return;
  
  try {
    // Get new values first
    const newGitChanges = await props.service.getStatus();
    const newCurrentBranch = await props.service.getCurrentBranch();
    
    // Only update refs if values actually changed to prevent unnecessary re-renders
    if (JSON.stringify(newGitChanges) !== JSON.stringify(gitChanges.value)) {
      gitChanges.value = newGitChanges;
    }
    
    if (newCurrentBranch !== currentBranch.value) {
      currentBranch.value = newCurrentBranch;
    }
    
    if (reloadCostingInfos) {
      const newGitRemoteDelta = await props.service.gitRemoteDelta(currentBranch.value);
      if (newGitRemoteDelta !== gitRemoteDelta.value) {
        gitRemoteDelta.value = newGitRemoteDelta;
      }
    }
  } catch (error) {
    console.error('Error reloading git info:', error);
  }
}, 300); // Increased debounce from 100ms to 300ms
const cwds = ref(
  [
    props.service?.rootPath,
    ...(props.service?.commands?.map(a => a.spawnOptions.cwd) || []).filter(a => a && !!a.trim() && a !== '.')
  ]
);

const cwd = ref(cwds.value[0] || '.');
/**
 *
 * @param {string | undefined} path
 */
function getShortPath(path) {
  return path
    ?.replace(homedir.value, '~') || '';
}

/**
 * @param {LogMessage | undefined | null} line
 */
function setPid(line) {
  const command = logs.value.find((l) => l.cmd && l.pid === line?.pid);
  currentPidView.value = command || null;
  selectedLine.value = null;
  showLineDetails.value = false;
}

/**
 *
 * @param {*} line
 */
function setSelectedLine(line) {
  if (window.getSelection()?.toString()) return;
  selectedLine.value = line;
  showLineDetails.value = true;
}
async function sendShortcut(shortcut) {
  return send(shortcut)
}
async function sendScenario(scenario) {
  Socket.emit(scenario.id, scenario, props.service.label)
}

// Debug Node.js function - simplified approach using restart with debug flag
async function launchNodeDebug() {
  if (isLaunchingDebug.value) return;
  
  isLaunchingDebug.value = true;
  
  try {
    console.log('🐛 Launching Node.js debug mode for service:', props.service.label);
    
    // Use the simplified approach: restart with debug flag
    await props.service.restart({ debug: 'node' });
    
    notification.next('success', 'Node.js debug mode launched! 🐛 Add debugger; statements in your code, then use Next button');
    
  } catch (error) {
    console.error('Failed to launch debug mode:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    notification.next('error', `Failed to launch debug mode: ${errorMessage}`);
  } finally {
    isLaunchingDebug.value = false;
  }
}

// Continue to next breakpoint/debugger statement - using backend to avoid CORS
async function nextDebugStep() {
  if (isResumingDebug.value) return;
  
  isResumingDebug.value = true;
  
  try {
    console.log('▶️ Continuing to next breakpoint via backend...');
    
    // Call backend route to continue debug (avoiding CORS issues)
    const result = await props.service.resumeDebug(9229);
    
    console.log('✅ Debug continue result:', result);
    
    if (result.success) {
      notification.next('success', `Continued to next debugger; statement! ▶️ (${result.target || 'script continuing'})`);
    } else {
      notification.next('error', result.error || 'Failed to continue debug session - make sure you have debugger; statements in your code');
    }
    
  } catch (error) {
    console.error('Failed to continue debug:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    notification.next('error', `Failed to continue debug: ${errorMessage}`);
  } finally {
    isResumingDebug.value = false;
  }
}

// Test function to manually open modal
function testModal() {
  console.log('🧪 Testing modal with fake data...');
  
  debugInfo.value = {
    reason: 'debugCommand',
    hitBreakpoints: [],
    location: {
      scriptId: '123',
      line: 42,
      column: 10,
      functionName: 'testFunction',
      url: 'file:///test.js'
    },
    sourceContext: [
      { number: 40, content: 'console.log("test");', current: false },
      { number: 41, content: 'const x = 123;', current: false },
      { number: 42, content: 'debugger;', current: true },
      { number: 43, content: 'console.log(x);', current: false }
    ],
    variables: {
      local: [
        { name: 'x', type: 'number', value: 123, description: '123' },
        { name: 'message', type: 'string', value: 'hello', description: '"hello"' }
      ]
    }
  };
  
  showDebugModal.value = true;
  console.log('🧪 Modal should be visible now:', showDebugModal.value);
}

// Function to handle debug-open event from LogsLine
function openDebugModalFromLog(debugInfoData) {
  console.log('🐛 Opening debug modal from log click:', debugInfoData);
  debugInfo.value = debugInfoData;
  showDebugModal.value = true;
  
  notification.next('success', `🐛 Debug modal opened from log`);
}

// New features functions
const isFullscreen = ref(false);
const isScrollPaused = ref(false);
/** @type {import('vue').Ref<LogMessage[]>} */
const pausedLogsBuffer = ref([]);



function exportLogs() {
  const logsData = displayedLines.value
    .map(line => `[${dayjs(line.timestamp).format('YYYY-MM-DD HH:mm:ss')}] ${line.msg}`)
    .join('\n');
  
  const blob = new Blob([logsData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.service.label}-logs-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  notification.next('success', 'Logs exported successfully');
}

function toggleFullscreen() {
  // Save current scroll position before toggling
  const logsDisplay = document.querySelector('.logs-display');
  const currentScrollTop = logsDisplay?.scrollTop || 0;
  
  isFullscreen.value = !isFullscreen.value;
  
  // Restore scroll position after DOM update
  nextTick(() => {
    const newLogsDisplay = document.querySelector('.logs-display');
    if (newLogsDisplay) {
      newLogsDisplay.scrollTop = currentScrollTop;
    }
  });
}

/** @param {string} status */
function getStatusLabel(status) {
  switch (status) {
    case 'running': return 'Running';
    case 'exited': return 'Completed';
    case 'error': return 'Failed';
    case 'killed': return 'Terminated';
    case 'stopped': return 'Stopped';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * @typedef {import('../../../../servers/server/models/Service').LogMessage} LogMessage
 */
</script>

<style scoped lang="scss">

// Modern Logs Component Styling
.logs-container {
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  background: var(--system-backgroundColor0);
  color: var(--system-color0);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  border-radius: 10px;

  &.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    min-height: unset !important;
    z-index: 9999 !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
}

// Header Section
.logs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--system-backgroundColor50);
  border-bottom: 1px solid var(--system-backgroundColor300);
  flex-shrink: 0;
  z-index: 2;

  .service-info {
  display: flex;
  flex-direction: column;
    gap: 0.5rem;

    .service-title {
      display: flex;
  align-items: center;
      gap: 0.75rem;

      i {
        color: var(--system-primary500);
      }

      h3 {
  margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--system-color0);
      }

      .service-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        background: var(--system-backgroundColor200);
        font-size: 0.75rem;
        font-weight: 500;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--system-backgroundColor500);
        }

        &.running .status-dot {
          background: #10b981;
          animation: pulse 2s infinite;
        }

        &.error .status-dot {
          background: #ef4444;
        }

        &.idle .status-dot {
          background: #f59e0b;
        }

        &.stopped .status-dot {
          background: var(--system-backgroundColor500);
        }
      }
    }

    .current-context {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--system-color400);

      i {
        color: var(--system-primary500);
      }
    }
  }

  .process-selector {
    display: flex;
    gap: 0.5rem;

    .process-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--system-backgroundColor100);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      color: var(--system-color200);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--system-backgroundColor200);
        border-color: var(--system-primary500);
      }

      &.active {
        background: var(--system-primary500);
        border-color: var(--system-primary500);
        color: white;
      }

      i {
        font-size: 0.75rem;
      }
    }
  }
}

// Process List Popover
.process-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem 0;

  .process-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--system-backgroundColor100);
    }

    &.active {
      background: var(--system-primary50);
      color: var(--system-primary700);
    }

    .process-cmd {
      font-weight: 500;
      font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
      text-overflow: ellipsis;
      max-width: 250px;
    }

    .process-id {
      font-size: 0.75rem;
      color: var(--system-color400);
    }
  }
}

// Main Content Area
.logs-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
}

// Controls Bar
.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--system-backgroundColor0);
  border-bottom: 1px solid var(--system-backgroundColor300);
  gap: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
  z-index: 1;

  // Responsive adjustments for mobile
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    
    .filter-tabs {
      gap: 0.125rem;
      
      .filter-tab {
        padding: 0.375rem;
        min-width: 2rem;
        height: 2rem;
        
        i {
          font-size: 0.75rem;
        }
      }
    }
    
    .controls-actions {
      gap: 0.25rem;
    }
  }

  .filter-tabs {
    display: flex;
    gap: 0.25rem;

    .filter-tab {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background: var(--system-backgroundColor100);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      color: var(--system-color300);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 2.5rem;
      height: 2.5rem;

      &:hover {
        background: var(--system-backgroundColor200);
        transform: translateY(-1px);
      }

      &.active {
        background: var(--system-primary500);
        border-color: var(--system-primary500);
        color: white;
        transform: none;
      }

      i {
        font-size: 0.875rem;
      }
    }
  }

  .controls-actions {
    display: flex;
    gap: 0.5rem;

    .control-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background: var(--system-backgroundColor100);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      color: var(--system-color200);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 2.5rem;
      height: 2.5rem;

      &:hover {
        background: var(--system-backgroundColor200);
        border-color: var(--system-primary400);
        transform: translateY(-1px);
      }

      &.danger {
        color: #ef4444;
        border-color: #fee2e2;

        &:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }
      }

      &.active {
        background: var(--system-primary500);
        border-color: var(--system-primary500);
        color: white;
        transform: none;

        &:hover {
          background: var(--system-primary600);
          border-color: var(--system-primary600);
        }
      }

      i {
        font-size: 0.875rem;
      }
    }

    .debug-nodejs-btn {
      background: #8b5cf6;
      border-color: #8b5cf6;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 2.5rem;

      &:hover:not(:disabled) {
        background: #7c3aed;
        border-color: #7c3aed;
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .fa-spin {
        animation: spin 1s linear infinite;
      }

      .debug-text {
        font-size: 0.75rem;
        white-space: nowrap;
        animation: pulse 1.5s ease-in-out infinite;
      }
    }
  }
}
// Filters Panel
.filters-panel {
  padding: 1rem;
  background: var(--system-backgroundColor0);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 280px;

  .filter-group {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--system-color200);
      margin-bottom: 0.5rem;
    }

    .search-input {
  position: relative;
      display: flex;
      align-items: center;

      i {
    position: absolute;
        left: 0.75rem;
        color: var(--system-color400);
        font-size: 0.875rem;
      }

      input {
    width: 100%;
        padding: 0.5rem 0.75rem 0.5rem 2.25rem;
        border: 1px solid var(--system-backgroundColor300);
        border-radius: 0.375rem;
        background: var(--system-backgroundColor50);
        color: var(--system-color0);
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: var(--system-primary500);
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
        }
      }
    }

    .select-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.375rem;
      background: var(--system-backgroundColor50);
      color: var(--system-color0);
      font-size: 0.875rem;

      &:focus {
        outline: none;
        border-color: var(--system-primary500);
      }
    }

    .radio-group {
      display: flex;
      gap: 1rem;

      .radio-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;

        input[type="radio"] {
          margin: 0;
        }

        span {
          font-size: 0.875rem;
          color: var(--system-color200);
        }
      }
    }

    .checkbox-item {
  display: flex;
  align-items: center;
      gap: 0.5rem;
      cursor: pointer;

      input[type="checkbox"] {
        margin: 0;
      }

      span {
        font-size: 0.875rem;
        color: var(--system-color200);
      }
    }
  }
}

// Logs Display Area
.logs-display {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem;
  background: var(--system-backgroundColor50);
  height: 0;
  position: relative;

  .scroll-pause-indicator {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background: var(--system-warning500);
    color: var(--system-backgroundColor900);
    padding: 0.75rem 1rem;
    margin: -0.75rem -1rem 1rem -1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 10;
    backdrop-filter: blur(8px);
    border-bottom: 2px solid var(--system-warning600);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    i {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    span {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .pending-logs {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: var(--system-backgroundColor0);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--system-color0);
      opacity: 0.9;

      i {
        font-size: 0.625rem;
        opacity: 0.8;
      }
    }

    .resume-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: var(--system-backgroundColor0);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      color: var(--system-primary600);
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--system-backgroundColor100);
        border-color: var(--system-primary400);
        transform: translateY(-1px);
      }

      i {
        font-size: 0.625rem;
      }
    }
  }
}

// Command Input Area
.command-input {
  padding: 1rem;
  background: var(--system-backgroundColor50);
  flex-shrink: 0;
  max-height: 20vh;
  overflow-y: visible;
  display: flex;
  flex-direction: column;
  align-items: center;

  .shortcuts-line {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 0.5rem;
    width: 100%;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;

    .shortcut-tag {
          cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.75rem !important;
      border-radius: 1rem !important;
      border: 1px solid transparent !important;
      
      &[severity="info"] {
        background: #3b82f6 !important;
        color: white !important;
        
        &:hover {
          background: #1d4ed8 !important;
          transform: translateY(-1px);
        }
      }

      &[severity="warn"] {
        background: #f59e0b !important;
        color: white !important;
        
        &:hover {
          background: #d97706 !important;
          transform: translateY(-1px);
        }
      }

      i {
        margin-right: 0.375rem;
        font-size: 0.625rem;
      }
    }
  }

  .command-history {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    width: 100%;
    background: var(--system-backgroundColor0);
    border: 1px solid var(--system-backgroundColor300);
    border-radius: 1rem 1rem 0 0;
    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
    max-height: 150px;
    overflow-y: auto;
    z-index: 1000;
    margin: 0;

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--system-backgroundColor200);
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background: var(--system-backgroundColor100);
      }

      &.active {
        background: var(--system-primary50);
        color: var(--system-primary700);
      }

      &:last-child {
        border-bottom: none;
      }

      .history-cmd {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 0.875rem;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 1rem;
      }

      .history-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.125rem;
        font-size: 0.75rem;
        color: var(--system-color400);
      }
    }
  }

    .command-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem;
    color: var(--system-color400);
    font-size: 0.75rem;
  }

  .main-command-line {
  display: flex;
  flex-direction: column;
    gap: 0.75rem;
    background: var(--system-backgroundColor0);
    border: 1px solid var(--system-backgroundColor300);
    border-radius: 1rem;
    padding: 1rem;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(8px);
    border-color: var(--system-backgroundColor200);
    position: relative;

    .context-badges {
    display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

              .context-badge {
          display: inline-flex;
    align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          background: var(--system-primary100);
          border: 1px solid var(--system-primary200);
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--system-primary700);

          i {
            font-size: 0.625rem;
            color: var(--system-primary600);
          }
        }

        .path-selector {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.5rem;
          background: var(--system-backgroundColor300);
          border: 1px solid var(--system-backgroundColor400);
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--system-color100);

          :deep(.p-select svg) {
            color: var(--system-color200);
          }

          i {
            font-size: 0.625rem;
            color: var(--system-color200);
          }

          .path-select {
            max-width: 200px;

            :deep(.p-select) {
              background: transparent;
              border: none;
              padding: 0;
              font-size: 0.75rem;
              font-weight: 500;
              color: var(--system-color100);
              min-height: auto;
              height: auto;

              .p-select-label {
                padding: 0 0.25rem;
                font-size: inherit;
                font-weight: inherit;
                color: inherit;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .p-select-dropdown {
                width: 1rem;
                height: 1rem;
                color: var(--system-color200) !important;
              }
            }

            :deep(.p-select-overlay) {
              .p-select-option {
                font-size: 0.75rem;
                padding: 0.5rem 0.75rem;
                
                &:hover {
                  background: var(--system-backgroundColor100);
                }
              }
            }
          }

        &.git-badge {
          background: #dcfce7;
          color: #166534;
          border-color: #bbf7d0;

          &.changes {
            background: #fef3c7;
            color: #92400e;
            border-color: #fde68a;
          }

          .git-delta {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            margin-left: 0.25rem;
            font-size: 0.625rem;
          }
        }

        &.pid-badge {
          background: #e0e7ff;
          color: #3730a3;
          border-color: #c7d2fe;
          
          .status-indicator {
            margin-right: 0.25rem;
            font-size: 0.5rem;
            animation: none;
            
            &.running {
              color: #10b981;
              animation: pulse 2s infinite;
            }
            
            &.exited {
              color: #10b981;
            }
            
            &.error {
              color: #ef4444;
            }
            
            &.terminated {
              color: #f59e0b;
            }
            
            &.unknown {
              color: #6b7280;
            }
          }
          
          .status-text {
            margin-left: 0.25rem;
            font-size: 0.625rem;
            opacity: 0.8;
          }
          
          &.status-running {
            background: #d1fae5;
            color: #065f46;
            border-color: #a7f3d0;
          }
          
          &.status-exited {
            background: #d1fae5;
            color: #065f46;
            border-color: #a7f3d0;
          }
          
          &.status-error {
            background: #fee2e2;
            color: #991b1b;
            border-color: #fecaca;
          }
          
          &.status-killed,
          &.status-stopped {
            background: #fef3c7;
            color: #92400e;
            border-color: #fde68a;
          }
        }
      }
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .prompt-icon {
        color: var(--system-primary500);
        font-size: 0.875rem;
        margin-top: 0.125rem;
        flex-shrink: 0;
      }

      .command-textarea {
        flex: 1;
        background: var(--system-backgroundColor0);
        border: 1px solid var(--system-backgroundColor300);
        border-radius: 0.375rem;
        padding: 0.5rem 0.75rem;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 0.875rem;
        line-height: 1.4;
        color: var(--system-color0);
        resize: none;
        min-height: 2.5rem;
        max-height: 80px;
        overflow-y: auto;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--system-primary500);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        &::placeholder {
          color: var(--system-color400);
          font-style: italic;
        }
      }
    }
  }
}

// Terminated Process
.terminated-process {
  padding: 1.5rem;
  background: var(--system-backgroundColor100);
  border-top: 1px solid var(--system-backgroundColor300);
  text-align: center;
  flex-shrink: 0;

  .terminated-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: var(--system-color300);
    font-size: 0.875rem;

    i {
      color: #f59e0b;
      font-size: 1rem;
    }
  }

  .terminated-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background: var(--system-backgroundColor0);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      color: var(--system-color200);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 2.5rem;
      height: 2.5rem;

      &:hover {
        background: var(--system-backgroundColor200);
        border-color: var(--system-primary400);
        transform: translateY(-1px);
      }

      &.danger {
        color: #ef4444;
        border-color: #fee2e2;

        &:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }
      }

      i {
        font-size: 0.875rem;
      }
    }
  }
}

// Service Disabled State
.service-disabled {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  background: var(--system-backgroundColor50);

  .disabled-content {
    text-align: center;
    max-width: 400px;

    i {
      font-size: 4rem;
      color: var(--system-color400);
      margin-bottom: 1rem;
    }

    h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--system-color200);
    }

    p {
      margin: 0 0 2rem 0;
      color: var(--system-color400);
      font-size: 1rem;
    }

    .shortcuts {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;

      .shortcut-tag {
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.75rem;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        i {
          margin-right: 0.25rem;
          font-size: 0.625rem;
        }
      }
    }
  }
}

.terminal {
  display: flex;
  flex-direction: column;
  line-break: anywhere;
  overflow: auto;
  flex-grow: 1;


// AI Result Modal
.ai-result {
  background: var(--system-backgroundColor100);
  border: 1px solid var(--system-backgroundColor300);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
    color: var(--system-color0);
  }
}

  .line {
    border-left: 2px solid #ccc;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    padding-left: 10px;
    margin: 0px 0;
    will-change: background-color;
    transition: 300ms;
    white-space: pre-wrap;
    width: 100%;
    box-sizing: border-box;
    .section-actions {
      button {
        width: max-content;
        a {
          color: white;
          text-decoration: none;
        }
      }
    }
    .section-header {
      margin: 0;
      width: max-content;
      padding: 0 10px;
      background-color: #000000;
      color: white;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      transition: 300ms;
      h2 {
        margin: 0;
      }
    }
    .section-content {
      border-left: 4px solid #000000;
      border-bottom-left-radius: 4px;
      padding: 0 10px;
      box-sizing: border-box;
    }
    .section-actions {
      max-width: 0;
      overflow: hidden;
      transition: 300ms;
      display: flex;
      margin-left: 0;
      button {
        white-space: nowrap;
      }
    }
    &:hover {
      background-color: rgba(0,0,0,0.05);
      .section-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        max-width: 1000px;
        margin-left: 20px;
      }
      .section-content {
        position: relative;
      }
    }


  }
}

.input-container-terminal {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.2);
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: var(--system-backgroundColor200);
  border: 1px solid var(--system-backgroundColor300 );
  color: var(--system-color200);
  width: calc(100% - 10px);
  margin: auto;
  margin-bottom: 5px;
  margin-top: 20px;
  .bar-terminal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .left,.right {
      display: flex;
      flex-wrap: wrap;
      gap: 1px;
      &.right{
        justify-content: flex-end;
      }
      &> div {
        padding: 2px 5px;
        margin-right: 12px;
        box-sizing: border-box;
        position: relative;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        white-space: nowrap;
        label {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        &.red {
          background-color: #da0606;
          &::before {background-color: #da0606;}
          &::after {border-color: #da0606;}
        }
        &.white {
          background-color: lightgrey;
          color: black;
          &::before {background-color: lightgrey;}
          &::after {border-color: lightgrey;}
        }
        &.yellow {
          background-color: #bca900;
          &::before {background-color: #bca900;}
          &::after {border-color: #bca900;}
        }
        &.blue {
          background-color: #0076bc;
          &::before {background-color: #0076bc;}
          &::after {border-color: #0076bc;}
        }
        &.green {
          background-color: #00bc55;
          &::before {background-color: #00bc55;}
          &::after {border-color: #00bc55;}
        }
        &::after {
          content: '';
          border: 13px solid transparent;
          border-top-color: transparent !important;
          border-bottom-color: transparent !important;
          border-right-color: transparent !important;
          border-right: none;
          width: 0px;
          height: 100%;
          box-sizing: border-box;
          position: absolute;
          left: 100%;
          z-index: 1;
          top: 0;
        }
        &::before {
          content: '';
          width: 12px;
          height: 100%;
          box-sizing: border-box;
          position: absolute;
          right: 100%;
          background-color: attr(color);
          top: 0;
        }
      }
    }
  }
  .input-content-terminal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 10px;
  }
  textarea {
    background-color: var(--system-backgroundColor200);
    color: var(--system-color200);
    outline: none;
    height: max-content;
    height: calc(19px);
    margin-top: 5px;
    flex-grow: 1;
    border: none;
  }
}

.more-info-container {
  display: flex;
  flex-direction: column;
  border-left: 2px solid #0076bc;
  padding-left: 10px;
  box-sizing: border-box;
  margin-bottom: 20px;
  border-radius: 5px;
  pre {
    margin: 0;
  }
  .more-info-label {
    font-weight: bold;
  }
  .more-info-content {
    background-color: var(--system-backgroundColor50);
    color: var(--system-color);
    border: 1px solid var(--system-backgroundColor300);
    border-radius: 5px;
    padding: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    button {
      width: max-content;
    }
  }
}

:deep(.p-select-dropdown) {
  color: white;
}
:deep(.p-select), :deep(.p-select-sm .p-select-label) {
  background: transparent;
  border: none;
  color: white;
  padding: 0;
}

// Animation pour l'indicateur running
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<style lang="scss">
@import '~xterm/css/xterm.css';
.xterm-decoration-top {
  background-color: orange;
  color: white;
}

// PrimeVue Sidebar customization for line details
.line-details-drawer {
  :deep(.p-sidebar-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }

  :deep(.p-sidebar-header) {
    padding: 1.5rem;
    border-bottom: 1px solid var(--system-backgroundColor300);
    background: var(--system-backgroundColor50);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    i {
      color: var(--system-primary600);
      font-size: 1.25rem;
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--system-color0);
    }
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .detail-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--system-backgroundColor50);
    border-radius: 0.75rem;
    border: 1px solid var(--system-backgroundColor300);

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--system-primary600);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .detail-value {
      background: var(--system-backgroundColor0);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      padding: 0.75rem;
      font-size: 0.875rem;
      color: var(--system-color0);
      line-height: 1.5;

      &.code {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        background: var(--system-backgroundColor100);

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }

      &.clickable {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--system-primary50);
          border-color: var(--system-primary300);
        }

        .link-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--system-primary600);
          font-size: 0.75rem;
          font-weight: 500;
          background: var(--system-primary100);
          border: none;
          padding: 0.375rem 0.75rem;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: var(--system-primary200);
          }

          i {
            font-size: 0.625rem;
          }
        }
      }
    }
  }
}

.json-view-item {
  &.root-item {
    padding: 10px 0;
  }
  button {
    background: none;
    box-shadow: none;
    background-color: transparent !important;
    margin: 0;
    padding: 0;
    width: max-content;
    &:hover {
      background-color: rgba(0,0,0,0.1) !important;
    }
  }
  div.value-key {
    white-space: normal;
    padding: 0;
    display: flex;
    .value-key {
      color: var(--system-color) !important;
      padding: 0;
      &+span {
        overflow: hidden;
        white-space: normal;
        width: max-content;
        display: inline-block;
        overflow: auto;
        width: 100%;
      }
    }
  }
  .data-key {
    &:hover {
      background: transparent;
      box-shadow: none;
    }
    color: var(--system-color);
    .chevron-arrow {
      margin-right: 8px;
    }

  }
}

.histories {
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: var(--system-backgroundColor50);
  color: var(--system-color);
  width: 100%;
  left: 0;
  bottom: calc(100% + 10px);
  z-index: 111;
  box-shadow: 0 0 12px 6px rgba(0,0,0,0.2);
  border-radius: 10px;
  .history {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 10px;
    border-bottom: 1px solid lightgrey;
    &:hover {
      background-color: rgba(0,0,0,0.05);
      cursor: pointer;
    }
    .right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
    }
    &.active {
      background-color: rgba(0,0,0,0.1);
    }
  }
}
.badge {
  border-radius: 1000px;
  background-color: grey;
  color: white;
  padding: 0 10px;
  box-shadow: 0 0 10px 0px rgba(0,0,0,0.4);
}

.slide-fade-enter-active{
  transition: all 0.2s ease-out;
  &>* {
    transition: all 0.2s ease-out;
  }
}

.slide-fade-leave-active{
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  &>* {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  overflow: hidden;
  .terminal-panel-content {
    transform: translateX(100%);
  }
  .terminal-panel-bg {
    opacity: 0;
  }
}
.pid-box {
  cursor: pointer;
  &:hover {
    button {
      transform: scale(1.1)
    }
  }
}
button.config {
  width: max-content !important;
  i {
    margin: 0 !important;
  }
}
.shortcuts {
  width: 100%;
  margin-bottom: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px
}
.shortcut {
  cursor: pointer;
}

// Debug Modal Styles
.debug-modal {
  .debug-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    
    .debug-section {
      margin-bottom: 1.5rem;
      
      h4 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--system-primary600);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        i {
          color: var(--system-primary500);
        }
      }
      
      h5 {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--system-color0);
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }
    }
    
    .location-info {
      background: var(--system-backgroundColor100);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      padding: 1rem;
      
      .location-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        label {
          font-weight: 600;
          color: var(--system-color600);
          min-width: 80px;
        }
        
        .location-value {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          background: var(--system-backgroundColor0);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px solid var(--system-backgroundColor300);
          color: var(--system-color0);
        }
      }
    }
    
    .source-context {
      background: var(--system-backgroundColor200);
      border: 1px solid var(--system-backgroundColor300);
      border-radius: 0.5rem;
      overflow: hidden;
      
      .source-line {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 0.875rem;
        border-bottom: 1px solid var(--system-backgroundColor300);
        
        &:last-child {
          border-bottom: none;
        }
        
        &.current {
          background: var(--system-primary100);
          border-color: var(--system-primary300);
          
          .line-number {
            background: var(--system-primary600);
            color: white;
          }
          
          .line-content {
            font-weight: 600;
            color: var(--system-primary700);
          }
        }
        
        .line-number {
          min-width: 3rem;
          text-align: right;
          margin-right: 1rem;
          padding: 0.25rem 0.5rem;
          background: var(--system-backgroundColor400);
          color: var(--system-color600);
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        
        .line-content {
          flex: 1;
          color: var(--system-color0);
          white-space: pre;
        }
      }
    }
    
    .variables-container {
      .scope-section {
        margin-bottom: 1rem;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .variables-list {
          background: var(--system-backgroundColor100);
          border: 1px solid var(--system-backgroundColor300);
          border-radius: 0.5rem;
          overflow: hidden;
          
          .variable-item {
            display: grid;
            grid-template-columns: 200px 80px 1fr;
            align-items: start;
            gap: 1rem;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--system-backgroundColor300);
            
            &:last-child {
              border-bottom: none;
            }
            
            .var-name {
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              font-weight: 600;
              color: var(--system-primary600);
              word-break: break-all;
            }
            
            .var-type {
              font-size: 0.75rem;
              padding: 0.25rem 0.5rem;
              border-radius: 1rem;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.025em;
              font-weight: 600;
              
              &.var-string {
                background: var(--system-success100);
                color: var(--system-success700);
              }
              
              &.var-number {
                background: var(--system-warning100);
                color: var(--system-warning700);
              }
              
              &.var-boolean {
                background: var(--system-info100);
                color: var(--system-info700);
              }
              
              &.var-object {
                background: var(--system-primary100);
                color: var(--system-primary700);
              }
              
              &.var-undefined {
                background: var(--system-color200);
                color: var(--system-color600);
              }
            }
            
            .var-value {
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              font-size: 0.875rem;
              word-break: break-all;
              
              .var-string {
                color: var(--system-success600);
                &::before,
                &::after {
                  content: '"';
                  opacity: 0.6;
                }
              }
              
              .var-number {
                color: var(--system-warning600);
              }
              
              .var-boolean {
                color: var(--system-info600);
                font-weight: 600;
              }
              
              .var-undefined {
                color: var(--system-color400);
                font-style: italic;
              }
            }
          }
        }
      }
    }
    
    /* Custom Header */
    .debug-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      color: #dc2626;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #059669;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .quick-action-btn:hover:not(:disabled) {
      background: #047857;
      transform: translateY(-1px);
    }

    .quick-action-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .quick-action-btn i.fa-spin {
      animation: spin 1s linear infinite;
    }

    /* Scrollable Content */
    .debug-scrollable {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      margin-bottom: 80px; /* Space for sticky footer */
    }
  }
}
</style>
