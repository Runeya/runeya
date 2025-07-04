<template>
  <div 
    @click="emitClick"
    class="log-line-wrapper"
    :class="{
      'simplified': simplifiedMode,
      'stderr': line.source === 'stderr' || (line.cmd && line.cmd.status === 'error'),
      'success': line.cmd && line.cmd.status === 'exited',
      'separator': line.isSeparator != null,
      'json': line.json != null && !simplifiedMode,
      'debug': line.debug != null && !simplifiedMode,
      'cmd': line.cmd != null && !simplifiedMode,
      'prompt': line.prompt && !simplifiedMode,
      'log-with-header': (line.json != null || line.debug != null || line.cmd != null || line.prompt) && !simplifiedMode,
    }"
  >
    <div v-if="simplifiedMode" class="log-simple">
      {{ line.msg }}
    </div>

    <div v-else-if="line.cmd != null" class="log-command">
      <template v-if="line.cmd.cmd.trim()">
        <div class="log-header">
          <div class="log-type">
            <i class="fas fa-terminal"></i>
            <span>Command</span>
        </div>
          <div class="log-status" v-if="line.cmd.status" :class="`status-${line.cmd.status}`">
            <Spinner v-if="line.cmd.status === 'running'" size="16" :no-color="true"></Spinner>
            <i v-else-if="line.cmd.status === 'exited'" class="fas fa-check"></i>
            <i v-else-if="line.cmd.status === 'error'" class="fas fa-times"></i>
            <i v-else class="fas fa-circle"></i>
            <span>{{ getStatusLabel(line.cmd.status) }}</span>
        </div>
        </div>
        <div class="log-content">
          {{ line.msg }}
        </div>
      </template>
    </div>

    <div v-else-if="line.debug != null" class="log-debug" :class="{ 'debugger-log': isDebuggerLog }">
      <div class="log-header">
        <div class="log-type">
          <i class="fas fa-bug"></i>
          <span>{{ isDebuggerLog ? 'Debugger Breakpoint' : 'Debug' }}</span>
        </div>
        <div class="log-actions">
          <button 
            v-if="isDebuggerLog" 
            class="action-btn debug-open-btn" 
            @click.stop="openDebugModal()" 
            v-tooltip="'🐛 Open Debug Modal'"
          >
            <i class="fas fa-external-link-alt"></i>
            <span>Open Debug</span>
          </button>
          <button class="action-btn" @click.stop="copy(JSON.stringify(line.debug))" v-tooltip="'Copy debug data to clipboard'">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
      <div class="log-content">
        <div v-if="isDebuggerLog" class="debugger-preview">
          <div class="debug-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ getDebugLocationText() }}</span>
          </div>
          <div class="debug-hint">
            <i class="fas fa-cursor-pointer"></i>
            <span>Click "Open Debug" or double-click this log to view full debugger details</span>
          </div>
        </div>
        <JsonTreeView 
          v-else
          :maxDepth="1" 
          :json="transformerJSON(line.debug)" 
          :copyable="true" 
          :expand-depth="1" 
          :show-double-quotes="true"
        />
      </div>
    </div>

    <div v-else-if="line.json != null" class="log-json">
      <div class="log-header">
        <div class="log-type">
          <i class="fas fa-code"></i>
          <span>JSON</span>
        </div>
        <div class="log-actions">
          <button class="action-btn" @click.stop="copy(JSON.stringify(line.json))" v-tooltip="'Copy JSON data to clipboard'">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
      <div class="log-content">
        <JsonTreeView 
          :maxDepth="1" 
          :json="transformerJSON(line.json)" 
          :copyable="true" 
          :expand-depth="1" 
          :show-double-quotes="true"
        />
      </div>
    </div>

    <div v-else-if="line.prompt" class="log-prompt">
      <div class="log-header">
        <div class="log-type">
          <i class="fas fa-comment"></i>
          <span>Prompt</span>
        </div>
      </div>
      <div class="log-content" v-html="line.msg.trim() || '<br/>'"></div>
    </div> 

    <div v-else class="log-text" v-html="line.msg"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { JsonTreeView } from 'json-tree-view-vue3';
import 'json-tree-view-vue3/dist/style.css';
import jsonpath from 'jsonpath';
import notification from '../../../../fronts/app/src/helpers/notification';
import Spinner from '../../../../fronts/app/src/components/Spinner.vue';

const props = defineProps({
  line: {
    type: Object,
    required: true
  },
  simplifiedMode: {
    type: Boolean,
    required: true
  },
  jsonPathSearch: {
    type: String,
    required: false
  }
})
const emit = defineEmits(['click', 'debug-open'])

function emitClick() {
  // Si c'est un log de debugger et qu'on double-clique, ouvrir directement la modal
  if (isDebuggerLog.value) {
    openDebugModal();
  } else {
    emit('click', props.line);
  }
}

// Détecte si c'est un log de debugger breakpoint avec debugInfo
const isDebuggerLog = computed(() => {
  return props.line.debug && 
         props.line.debugType === 'node';
});

function openDebugModal() {
  console.log(props.line)
  if (isDebuggerLog.value) {
    emit('debug-open', props.line.debug);
  }
}

function getDebugLocationText() {
  if (isDebuggerLog.value && props.line.debug?.location) {
    const loc = props.line.debug.location;
    return `${loc.functionName || '<global>'} at line ${loc.line}:${loc.column} (${loc.url || 'eval'})`;
  }
  return 'Unknown location';
}

/** @param {any} json */
function transformerJSON(json) {
  if (props.jsonPathSearch) {
    const search = props.jsonPathSearch.endsWith('.')
      ? props.jsonPathSearch.slice(0, -1)
      : props.jsonPathSearch;
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

/** @param {string} data */
function copy(data) {
  navigator.clipboard.writeText(data)
    .then(() => notification.next('success', 'Data copied to clipboard'));
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
</script>

<style scoped lang="scss">
.log-line-wrapper {
  margin-bottom: 0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--system-backgroundColor100);
  }

  // Common spacing for logs with headers (JSON, Debug, CMD, Prompt)
  &.log-with-header {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    border-top-left-radius: 10px;
  }

  // Command logs
  &.cmd {
    background: var(--system-backgroundColor0);
    border-left: 2px solid #3b82f6;

    .log-header {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      padding: 0.375rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0 0.25rem 0.25rem 0;

      .log-type {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        
        i {
          font-size: 0.75rem;
        }
      }

      .log-status {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        opacity: 0.9;
        transition: all 0.2s ease;

        &.status-running {
          opacity: 1;
        }

        &.status-exited {
          color: #10b981;
          opacity: 1;
        }

        &.status-error {
          color: #ef4444;
          opacity: 1;
        }

        &.status-killed,
        &.status-stopped {
          color: #f59e0b;
          opacity: 1;
        }

        i {
          font-size: 0.625rem;
        }
      }
    }

    .log-content {
      padding: 0.625rem 0.75rem;
      font-size: 0.8125rem;
      line-height: 1.5;
      white-space: pre-wrap;
      background: var(--system-backgroundColor0);
      color: var(--system-color100);
    }
  }

  // JSON logs
  &.json {
    background: var(--system-backgroundColor0);
    border-left: 3px solid #10b981;

    .log-header {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 0.375rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0.25rem 0.25rem 0 0;

      .log-type {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        
        i {
          font-size: 0.75rem;
        }
      }

      .log-actions {
        display: flex;
        gap: 0.375rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
    }

    &:hover .log-header .log-actions {
      opacity: 1;
    }

    .log-content {
      padding: 0.625rem 0.75rem;
      background: var(--system-backgroundColor0);
    }
  }

  // Error logs
  &.stderr {
    border-left-color: #ef4444 !important;
    .log-text {
      border-left-color: #ef4444;
      
      &:hover {
        border-left-color: #dc2626;
      }
    }
    
    .log-header {
      background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    }
  }

  // Success logs
  &.success {
    border-left-color: #10b981 !important;
    
    .log-text {
      border-left-color: #10b981;
      
      &:hover {
        border-left-color: #059669;
      }
    }
    
    .log-header {
      background: linear-gradient(135deg, #10b981, #059669) !important;
    }
  }

  // Debug logs (must come after stderr/success to override their colors)
  &.debug {
    border-left-color: #a855f7 !important;
    background: var(--system-backgroundColor0);

    .log-header {
      background: linear-gradient(135deg, #a855f7, #9333ea) !important;
      color: white;
      padding: 0.375rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0.25rem 0.25rem 0 0;

      .log-type {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        
        i {
          font-size: 0.75rem;
        }
      }

      .log-actions {
        display: flex;
        gap: 0.375rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
    }

    &:hover .log-header .log-actions {
      opacity: 1;
    }

    .log-content {
      padding: 0.625rem 0.75rem;
      background: var(--system-backgroundColor0);
    }

    // Special styling for debugger breakpoint logs
    &.debugger-log {
      border-left: 3px solid #ef4444 !important;
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      cursor: pointer;
      position: relative;

      &:hover {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
      }

      .log-header {
        background: linear-gradient(135deg, #ef4444, #dc2626) !important;
        
        .debug-open-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
          }
        }
      }

      .debugger-preview {
        padding: 0.75rem;
        background: white;
        border-radius: 0.5rem;
        margin: 0.5rem;

        .debug-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 0.875rem;
          color: #374151;

          i {
            color: #ef4444;
          }
        }

        .debug-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;

          i {
            color: #8b5cf6;
          }
        }
      }

      // Pulse animation pour attirer l'attention
      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -3px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        animation: debugPulse 2s infinite;
      }
    }
  }

  // Prompt logs
  &.prompt {
    background: var(--system-backgroundColor0);
    border-left: 3px solid #8b5cf6;

    .log-header {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      padding: 0.375rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0.25rem 0.25rem 0 0;
      
      i {
        font-size: 0.75rem;
      }
    }

    .log-content {
      padding: 0.625rem 0.75rem;
      background: var(--system-backgroundColor0);
    }
  }

  // Separator
  &.separator {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0.5rem;
    font-weight: 500;
    color: var(--system-color400);
    background: transparent;
    border: none;
    font-size: 0.75rem;
    .log-text {
      border-left: none;
    }
  }

  // Regular text
  .log-text {
    padding: 0 0.75rem;
    background: transparent;
    border-left: 2px solid var(--system-backgroundColor400);
    font-size: 0.8125rem;
    line-height: 1.5;
    white-space: pre-wrap;
    color: var(--system-color200);
  }

  // Simplified mode
  .log-simple {
    padding: 0 0.75rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    white-space: pre-wrap;
    color: var(--system-color200);
  }
}

// Action buttons in logs
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 0.375rem;
  color: white;
  font-size: 0.6875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  min-width: 1.75rem;
  height: 1.75rem;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }

  i {
    font-size: 0.75rem;
    opacity: 0.9;
  }
}

// Animation for debugger log pulse
@keyframes debugPulse {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    opacity: 0;
  }
}

// Action button styles
.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: currentColor;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
}
</style> 