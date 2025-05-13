<template>
  <SectionCmp header="Encryption">
    Key used to encrypt most of the data
    <div class="line">
      <Password v-model="newKey" :feedback="false" toggleMask style="width: 100%;" fluid
        @blur="saveKey"
        @keypress.enter="saveKey"
      ></Password>
      <Button icon="fas fa-refresh" @click="getNewKey"></Button>
    </div>
  </SectionCmp>

  <SectionCmp v-if="conflicts.length > 0" header="Git Conflicts">
    <p>The following encrypted files have Git conflicts. Please resolve them:</p>
    <div v-for="(conflict, index) in conflicts" :key="index" class="conflict-container">
      <div class="conflict-header">
        <h3>Conflict {{ index + 1 }}</h3>
        <Button icon="fas fa-times" class="p-button-danger p-button-sm" @click="removeConflict(index)" />
      </div>
      
      <Divider />
      
      <div class="conflict-sections">
        <div class="conflict-section">
          <h4>Your Version</h4>
          <Textarea v-model="conflict.ourVersion" rows="10" class="conflict-content" />
        </div>
        
        <div class="conflict-actions">
          <Button icon="fas fa-arrow-left" @click="useOurs(index)" tooltip="Use Your Version" />
          <Button icon="fas fa-arrow-right" @click="useTheirs(index)" tooltip="Use Their Version" />
          <Button icon="fas fa-save" @click="saveResolution(index)" class="p-button-success" tooltip="Save Resolution" />
        </div>
        
        <div class="conflict-section">
          <h4>Their Version</h4>
          <Textarea v-model="conflict.theirVersion" rows="10" class="conflict-content" />
        </div>
      </div>
      
      <div class="resolution-section">
        <h4>Resolution</h4>
        <Textarea v-model="conflict.resolution" rows="10" class="conflict-content" />
      </div>
    </div>
  </SectionCmp>

  <Modal ref="overrideModalRef" cancelString="Cancel" validateString="Ok">
    <template #header>
      Destructive
    </template>
    <template #body>
      Are you sure to replace the encryption key. Data like environments can be lost.
      <br>
      Save your data before.
    </template>
  </Modal>


  <Modal ref="wrongKeyModalRef" :no-cancel="true" validateString="Ok">
    <template #header>
      Wrong key
    </template>
    <template #body>
      It appears that Runeya is already configured with an encryption key.
      <br>
      Please replace the existing key with the correct one to unlock the encrypted files.
    </template>
  </Modal>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import SectionCmp from '../../components/Section.vue';
import axios from '../../helpers/axios';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import Divider from 'primevue/divider';
import notification from '../../helpers/notification';
import Modal from '../../components/Modal.vue';
import { useRouter } from 'vue-router';
import Socket from '../../helpers/Socket';

const router = useRouter()
const key = ref('')
const newKey = ref('')
const overrideModalRef = ref()
const wrongKeyModalRef = ref()

/**
 * @typedef {Object} Conflict
 * @property {string} original - Original conflicted data
 * @property {string} ourVersion - Our version of the conflict
 * @property {string} theirVersion - Their version of the conflict
 * @property {string} resolution - The resolved content
 */

/** @type {import('vue').Ref<Conflict[]>} */
const conflicts = ref([])

onMounted(async() => {
  Socket.on('crypto:conflict', handleConflict)
  reload()
})

onBeforeUnmount(() => {
  Socket.off('crypto:conflict', handleConflict)
})

/**
 * Handle conflict data coming from socket
 * @param {Conflict} conflictData - Conflict data containing versions
 */
function handleConflict(conflictData) {
  const resolution = conflictData.ourVersion
  conflicts.value.push({
    ...conflictData,
    resolution
  })
  notification.next('error', 'Git conflict detected in encrypted file', 'Conflict Detection')
}

/**
 * Choose the "our" version for resolution
 * @param {number} index - Conflict index
 */
function useOurs(index) {
  if (index >= 0 && index < conflicts.value.length) {
    conflicts.value[index].resolution = conflicts.value[index].ourVersion
  }
}

/**
 * Choose the "their" version for resolution
 * @param {number} index - Conflict index
 */
function useTheirs(index) {
  if (index >= 0 && index < conflicts.value.length) {
    conflicts.value[index].resolution = conflicts.value[index].theirVersion
  }
}

/**
 * Safe extraction of error message from any error type
 * @param {unknown} error - The caught error
 * @returns {string} A safe error message
 */
function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  
  // Try to get the response.data.message (axios error format)
  if (typeof error === 'object' && error !== null) {
    // Check for axios error response structure
    if ('response' in error && 
        error.response && 
        typeof error.response === 'object' && 
        'data' in error.response &&
        error.response.data && 
        typeof error.response.data === 'object' &&
        'message' in error.response.data) {
      return String(error.response.data.message);
    }
    
    // Check for standard error message
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  
  // Fallback: stringify the error
  try {
    return String(error);
  } catch {
    return 'Unknown error';
  }
}

/**
 * Save the conflict resolution
 * @param {number} index - Conflict index
 */
async function saveResolution(index) {
  if (index >= 0 && index < conflicts.value.length) {
    try {
      const conflict = conflicts.value[index]
      await axios.post('/crypto/resolve-conflict', {
        original: conflict.original,
        resolution: conflict.resolution
      })
      notification.next('success', 'Conflict resolved successfully')
      removeConflict(index)
    } catch (error) {
      notification.next('error', `Failed to resolve conflict: ${getErrorMessage(error)}`)
    }
  }
}

/**
 * Remove conflict from the list
 * @param {number} index - Conflict index
 */
function removeConflict(index) {
  if (index >= 0 && index < conflicts.value.length) {
    conflicts.value.splice(index, 1)
  }
}

async function reload(noPopupCheckKey) {
  if(router.currentRoute.value.query.wrongKey && !noPopupCheckKey) wrongKeyModalRef.value.open()
  const {data: _key} = await axios.get('/crypto/encryption-key')
  key.value = _key
  newKey.value = _key
}

async function saveKey() {
  if(key.value === newKey.value) return
  const result = await overrideModalRef.value.open().promise
  if(!result) return reload(true)
  await axios.post('/crypto/encryption-key', {key: newKey.value})
      .then(() => notification.next('success', 'Key saved'))
      .catch(() => notification.next('error', 'Key cant be saved'));
  return reload(true)
}

async function getNewKey() {
  const result = await overrideModalRef.value.open().promise
  
  if(!result) return reload(true) 
  const {data: _key} = await axios.get('/crypto/generate-key')
  await axios.post('/crypto/encryption-key', {key: _key})
      .then(() => notification.next('success', 'Key saved'))
      .catch(() => notification.next('error', 'Key cant be saved'));
  return reload(true) 
}
</script>

<style lang="scss" scoped>
.line {
  display: flex;
  align-items: center;
}

.conflict-container {
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: var(--surface-section);
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conflict-sections {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.conflict-section {
  flex: 1;
}

.conflict-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.conflict-content {
  width: 100%;
  font-family: monospace;
}

.resolution-section {
  margin-top: 1rem;
}
</style>