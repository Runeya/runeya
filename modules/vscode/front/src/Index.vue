<template>
  <div class="vscode-root">
    <template v-if="view === 'default'">
      <div class="vscode-container">
        <div class="vscode-header">
          <i class="fas fa-code icon-vscode"></i>
          <h1>Visual Studio Code Integration</h1>
        </div>
        
        <div class="card-container">
          <div class="card main-card">
            <h2>Extension Installation</h2>
            <p>Install or update our extension to improve your development experience with Visual Studio Code.</p>
            
            <div class="button-group">
              <button class="primary-button" @click="udpate">
                <i class="fas fa-download"></i>
                Install / Update
              </button>
              
              <button class="danger-button" @click="uninstall">
                <i class="fas fa-trash"></i>
                Uninstall
              </button>
            </div>
          </div>
          
          <div class="card download-card">
            <h2>Manual Installation</h2>
            <p>Download the extension file for manual installation or to integrate with Cursor.</p>
            
            <button class="secondary-button" @click="downloadVSIX">
              <i class="fas fa-file-download"></i>
              Download .vsix file
            </button>
            
            <div class="installation-steps">
              <h3>Installation Steps:</h3>
              <ol>
                <li>Download the .vsix file using the button above</li>
                <li>Open Visual Studio Code or Cursor</li>
                <li>Go to the Extensions view (Ctrl+Shift+X)</li>
                <li>Click on "..." menu at the top of the Extensions view</li>
                <li>Select "Install from VSIX..." and choose the downloaded file</li>
                <li>Restart the application to activate the extension</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <template v-else-if="view === 'reload'">
      <div class="vscode-container success-container">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h1>Success!</h1>
        <p>Open the command palette (Ctrl + Shift + P) and execute the command:</p>
        <div class="command-box">> Reload Window</div>
        
        <button class="secondary-button" @click="view = 'default'">
          <i class="fas fa-chevron-left"></i>
          Back
        </button>
      </div>
    </template>
    
    <template v-else-if="view === 'error'">
      <div class="vscode-container error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h1>An error occurred</h1>
        <div class="error-message">{{ error }}</div>
        
        <button class="secondary-button" @click="view = 'default'">
          <i class="fas fa-chevron-left"></i>
          Back
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from '../../../../fronts/app/src/helpers/axios';

const view = ref('default');
const error = ref('');

async function udpate() {
  await axios.post('/vscode/install')
    .then(() => {
      view.value = 'reload';
    })
    .catch((err) => {
      error.value = err?.message || err;
      view.value = 'error';
    });
}
async function uninstall() {
  await axios.delete('/vscode/uninstall')
    .then(() => {
      view.value = 'reload';
    })
    .catch((err) => {
      error.value = err?.response?.data?.message || err?.message || err;
      view.value = 'error';
    });
}

async function downloadVSIX() {
  window.location.href = window.location.origin + '/vscode/download';
}
</script>

<style lang="scss" scoped>
.vscode-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-grow: 1;
  padding: 2rem;
  background-color: var(--p-content-background);
  min-height: 100%;
}

.vscode-container {
  max-width: 900px;
  width: 100%;
}

.vscode-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  h1 {
    margin: 0.5rem 0;
    color: var(--system-accent-backgroundColor2);
  }
}

.icon-vscode {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(93deg, var(--system-accent-backgroundColor1) 0%, var(--system-accent-backgroundColor2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  h2 {
    margin-top: 0;
    color: var(--system-accent-backgroundColor2);
    font-size: 1.5rem;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  i {
    margin-right: 0.5rem;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
}

.primary-button {
  background: var(--p-button-primary-background);
  color: var(--p-button-primary-color);
  
  &:hover {
    background: var(--p-button-primary-hover-background);
    color: var(--p-button-primary-hover-color);
  }
}

.secondary-button {
  background: #f0f0f0;
  color: #333;
  
  &:hover {
    background: #e0e0e0;
  }
}

.danger-button {
  background: linear-gradient(93deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  
  &:hover {
    background: linear-gradient(93deg, #c0392b 0%, #e74c3c 100%);
  }
}

.installation-steps {
  text-align: left;
  margin-top: 1.5rem;
  
  h3 {
    margin-bottom: 0.75rem;
    font-size: 1.2rem;
    color: #444;
  }
  
  ol {
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      color: #555;
    }
  }
}

.success-container, .error-container {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon i {
  font-size: 5rem;
  color: #2ecc71;
  margin-bottom: 1.5rem;
}

.error-icon i {
  font-size: 5rem;
  color: #e74c3c;
  margin-bottom: 1.5rem;
}

.command-box {
  background: #f5f5f5;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: monospace;
  margin: 1rem 0 2rem;
  color: var(--system-accent-backgroundColor2);
  font-weight: bold;
}

.error-message {
  background: #fff0f0;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0 2rem;
  color: #c0392b;
  max-width: 100%;
  overflow-wrap: break-word;
}

@media (max-width: 768px) {
  .card-container {
    flex-direction: column;
    align-items: center;
  }
  
  .card {
    max-width: 100%;
  }
}
</style>
