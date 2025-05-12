<template>
  <Dialog
    v-model:visible="isVisible"
    :modal="true"
    :closable="true"
    :style="{ width: '95vw' }"
    :maximizable="true"
    :header="'Git Conflict Resolution'"
    class="conflict-dialog"
  >
    <div v-if="currentConflict && currentConflict.id" class="conflict-container">
      <div class="conflict-header">
        <div class="file-info" v-if="currentConflict.filename">
          <i class="pi pi-file"></i>
          <span>{{ currentConflict.filename }}</span>
        </div>
        <div class="version-actions">
          <Button 
            label="Keep all your versions" 
            icon="pi pi-user" 
            class="p-button-outlined p-button-success"
            @click="selectAllOurs"
          />
          <Button 
            label="Keep all their versions" 
            icon="pi pi-users" 
            class="p-button-outlined p-button-info"
            @click="selectAllTheirs"
          />
        </div>
      </div>

      <!-- Affichage spécifique pour les conflits JSON -->
      <div v-if="currentConflict.isJson && currentConflict.jsonConflicts && currentConflict.jsonConflicts.length > 0" class="json-conflicts">
        <h3>Conflicts detected in JSON</h3>
        
        <div class="json-conflicts-list">
          <div 
            v-for="(conflict, index) in currentConflict.jsonConflicts" 
            :key="conflict.path || index" 
            class="json-conflict-item"
          >
            <div class="json-header">
              <div class="json-path">
                <i class="pi pi-key"></i>
                <span>{{ conflict.path || 'Unknown path' }}</span>
              </div>
              <div class="manual-edit-actions">
                <Button 
                  label="Use your version" 
                  size="small"
                  class="p-button-sm p-button-text"
                  @click="useVersionInManualEdit(index, 'ours')"
                />
                <Button 
                  label="Use remote version" 
                  size="small"
                  class="p-button-sm p-button-text"
                  @click="useVersionInManualEdit(index, 'theirs')"
                />
              </div>
            </div>
            
            <div class="conflict-section">
              <div class="conflict-versions">
                <div 
                  class="json-value our-value" 
                  :class="{ selected: conflict.selectedVersion === 'ours' }"
                  @click="selectJsonVersion(index, 'ours')"
                  data-version="ours"
                  :data-index="index"
                >
                  <div class="json-value-header">
                    <span class="legend-color your-version"></span>
                    <span>Your version</span>
                  </div>
                  <pre class="json-content">{{ formatJsonValue(conflict.ourValue) }}</pre>
                  <div class="select-overlay">Click to select your version</div>
                </div>
                
                <div 
                  class="json-value their-value"
                  :class="{ selected: conflict.selectedVersion === 'theirs' }"
                  @click="selectJsonVersion(index, 'theirs')"
                  data-version="theirs"
                  :data-index="index"
                >
                  <div class="json-value-header">
                    <span class="legend-color their-version"></span>
                    <span>Remote version</span>
                  </div>
                  <pre class="json-content">{{ formatJsonValue(conflict.theirValue) }}</pre>
                  <div class="select-overlay">Click to select remote version</div>
                </div>
              </div>
              
              <div class="manual-edit-container">
                <div class="manual-edit-header">
                  <h4>Manual editing (final)</h4>
                  <span class="manual-edit-info">This value will be used with priority for resolution</span>
                </div>
                <Textarea 
                  v-model="conflict.manualEdit" 
                  class="manual-edit-area"
                  @input="updateManualEditForConflict(index)"
                  :autoResize="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Affichage standard pour les conflits non JSON -->
      <div v-else class="conflicts-container">
        <div class="conflict-columns">
          <div class="conflict-column">
            <div class="column-header">
              <h4>Differences</h4>
            </div>
            <div class="interactive-conflict">
              <div class="interactive-editor" v-if="currentConflict.mergedDisplay" v-html="currentConflict.mergedDisplay"></div>
            </div>
          </div>
          
          <div class="conflict-column">
            <div class="column-header">
              <h4>Manual editing</h4>
            </div>
            <div class="manual-edit-container">
              <div class="manual-edit-header">
                <h4>Manual editing (final)</h4>
                <span class="manual-edit-info">This value will be used with priority for resolution</span>
              </div>
              <Textarea 
                v-model="currentConflict.resolution" 
                class="manual-edit-area"
                @input="updateResolutionFromManualEdit"
                :autoResize="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isVisible" class="no-conflict-message">
      <p>No conflict to display or incomplete data.</p>
    </div>

    <template #footer>
      <div class="flex justify-content-end">
        <div class="flex gap-2">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            @click="closeModal" 
            class="p-button-text" 
          />
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            @click="refreshConflicts"
            class="p-button-outlined"
          />
          <Button 
            label="Resolve and save" 
            icon="pi pi-check" 
            @click="resolveConflict" 
            :disabled="!currentConflict || !currentConflict.resolution || !currentConflict.original"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted, nextTick } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import axios from '../helpers/axios';
import notification from '../helpers/notification';
import Socket from '../helpers/Socket';
import { diffWords } from 'diff';
import stack from '../models/stack';
import _ from 'lodash';

// À ajouter après les importations et avant les définitions de variables
const emit = defineEmits(['conflict-resolved']);

/**
 * @typedef {Object} ConflictChunk
 * @property {string} id - Unique identifier for this chunk
 * @property {string} ourVersion - Our version text
 * @property {string} theirVersion - Their version text
 * @property {string} selectedVersion - Currently selected version ('ours' or 'theirs')
 */

/**
 * @typedef {Object} JsonConflict
 * @property {string} path - JSONPath to the conflicting property
 * @property {any} ourValue - Our value of the property
 * @property {any} theirValue - Their value of the property
 * @property {string} selectedVersion - Currently selected version ('ours' or 'theirs')
 * @property {string} [manualEdit] - Manual edit content for this conflict
 */

/**
 * @typedef {Object} Conflict
 * @property {string} id - Unique identifier for the conflict
 * @property {string} original - Original conflicted data
 * @property {string} ourVersion - Our version of the conflict
 * @property {string} theirVersion - Their version of the conflict
 * @property {string} resolution - The resolved content
 * @property {string} [filename] - Optional filename for the conflict
 * @property {Array<ConflictChunk>} [chunks] - Parsed difference chunks
 * @property {string} [mergedDisplay] - HTML representation for display
 * @property {boolean} [isJson] - Whether the conflict is in JSON format
 * @property {Array<JsonConflict>} [jsonConflicts] - JSON conflicts if in JSON format
 */

/** @type {import('vue').Ref<boolean>} */
const isVisible = ref(false);
/** @type {import('vue').Ref<Conflict | null>} */
const currentConflict = ref(null);
/** @type {import('vue').Ref<Conflict[]>} */
const conflictQueue = ref([]);

/**
 * Parse differences between two versions and create interactive HTML
 * @param {string} ourVersion - Our version of the text
 * @param {string} theirVersion - Their version of the text
 * @returns {[Array<ConflictChunk>, string]} Array of chunks and HTML display
 */
function parseConflict(ourVersion, theirVersion) {
  const differences = diffWords(ourVersion, theirVersion);
  const chunks = [];
  let mergedDisplay = '';
  let chunkId = 0;
  
  differences.forEach(part => {
    if (part.added || part.removed) {
      // This is a difference, create a chunk
      const id = `chunk-${chunkId++}`;
      
      if (part.added) {
        // This is in their version but not ours
        chunks.push({
          id,
          ourVersion: '',
          theirVersion: part.value,
          selectedVersion: 'ours' // Default to our version (which means excluding this)
        });
        
        // Add to display as a clickable "their" part (initially not selected)
        mergedDisplay += `<span class="diff-chunk their-version not-selected" data-chunk-id="${id}">${part.value}</span>`;
      } else if (part.removed) {
        // This is in our version but not theirs
        chunks.push({
          id,
          ourVersion: part.value,
          theirVersion: '',
          selectedVersion: 'ours' // Default to our version
        });
        
        // Add to display as a clickable "our" part (initially selected)
        mergedDisplay += `<span class="diff-chunk our-version selected" data-chunk-id="${id}">${part.value}</span>`;
      }
    } else {
      // Common text, just add it directly
      mergedDisplay += `<span class="common-text">${part.value}</span>`;
    }
  });
  
  return [chunks, mergedDisplay];
}

/**
 * Sélectionne toutes les versions "nous"
 */
function selectAllOurs() {
  if (!currentConflict.value) return;
  
  if (currentConflict.value.isJson && currentConflict.value.jsonConflicts) {
    // Pour les conflits JSON
    currentConflict.value.jsonConflicts.forEach(conflict => {
      conflict.selectedVersion = 'ours';
    });
    updateJsonResolution();
  } else if (currentConflict.value.chunks) {
    // Pour les conflits texte standard
    currentConflict.value.chunks.forEach(chunk => {
      chunk.selectedVersion = 'ours';
      
      // Mettre à jour l'affichage visuel
      const chunkElement = document.querySelector(`.diff-chunk[data-chunk-id="${chunk.id}"]`);
      if (chunkElement) {
        if (chunkElement.classList.contains('our-version')) {
          chunkElement.classList.add('selected');
          chunkElement.classList.remove('not-selected');
        } else {
          chunkElement.classList.remove('selected');
          chunkElement.classList.add('not-selected');
        }
      }
    });
    updateResolution();
  }
}

/**
 * Sélectionne toutes les versions "eux"
 */
function selectAllTheirs() {
  if (!currentConflict.value) return;
  
  if (currentConflict.value.isJson && currentConflict.value.jsonConflicts) {
    // Pour les conflits JSON
    currentConflict.value.jsonConflicts.forEach(conflict => {
      conflict.selectedVersion = 'theirs';
    });
    updateJsonResolution();
  } else if (currentConflict.value.chunks) {
    // Pour les conflits texte standard
    currentConflict.value.chunks.forEach(chunk => {
      chunk.selectedVersion = 'theirs';
      
      // Mettre à jour l'affichage visuel
      const chunkElement = document.querySelector(`.diff-chunk[data-chunk-id="${chunk.id}"]`);
      if (chunkElement) {
        if (chunkElement.classList.contains('their-version')) {
          chunkElement.classList.add('selected');
          chunkElement.classList.remove('not-selected');
        } else {
          chunkElement.classList.remove('selected');
          chunkElement.classList.add('not-selected');
        }
      }
    });
    updateResolution();
  }
}

/**
 * Toggle selection of a chunk and update resolution
 * @param {string} chunkId - ID of the chunk to toggle
 */
function toggleChunkSelection(chunkId) {
  if (!currentConflict.value || !currentConflict.value.chunks) return;
  
  const chunk = currentConflict.value.chunks.find(c => c.id === chunkId);
  if (!chunk) return;
  
  // Toggle selection
  chunk.selectedVersion = chunk.selectedVersion === 'ours' ? 'theirs' : 'ours';
  
  // Update display
  const chunkElement = document.querySelector(`.diff-chunk[data-chunk-id="${chunkId}"]`);
  if (chunkElement) {
    chunkElement.classList.toggle('selected');
    chunkElement.classList.toggle('not-selected');
    
    if (chunkElement.classList.contains('our-version')) {
      // Our version chunk
      if (chunk.selectedVersion === 'ours') {
        chunkElement.classList.add('selected');
        chunkElement.classList.remove('not-selected');
      } else {
        chunkElement.classList.remove('selected');
        chunkElement.classList.add('not-selected');
      }
    } else {
      // Their version chunk
      if (chunk.selectedVersion === 'theirs') {
        chunkElement.classList.add('selected');
        chunkElement.classList.remove('not-selected');
      } else {
        chunkElement.classList.remove('selected');
        chunkElement.classList.add('not-selected');
      }
    }
  }
  
  // Rebuild resolution
  updateResolution();
}

/**
 * Update the resolution based on selected chunks
 */
function updateResolution() {
  if (!currentConflict.value || !currentConflict.value.chunks) {
    console.warn("updateResolution appelée alors que currentConflict ou ses chunks sont null");
    return;
  }
  
  try {
    // Pour une approche plus simple et fiable, reconstruisons le texte à partir de nos données source
    let resolution = '';
    
    const differences = diffWords(currentConflict.value.ourVersion, currentConflict.value.theirVersion);
    const chunks = currentConflict.value.chunks;
    
    differences.forEach(part => {
      try {
        if (part.added) {
          // Cette partie est dans leur version mais pas la nôtre
          // Vérifions si ce chunk est sélectionné
          const chunk = chunks.find(c => 
            c.theirVersion === part.value && c.ourVersion === '');
          
          if (chunk && chunk.selectedVersion === 'theirs') {
            resolution += part.value;
          }
        } else if (part.removed) {
          // Cette partie est dans notre version mais pas la leur
          // Vérifions si ce chunk est sélectionné
          const chunk = chunks.find(c => 
            c.ourVersion === part.value && c.theirVersion === '');
          
          if (!chunk || chunk.selectedVersion === 'ours') {
            resolution += part.value;
          }
        } else {
          // Texte commun, toujours inclus
          resolution += part.value;
        }
      } catch (partError) {
        console.error("Erreur lors du traitement d'une partie:", partError);
      }
    });
    
    // Mettre à jour la résolution de manière sécurisée
    if (currentConflict.value) {
      currentConflict.value.resolution = resolution;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la résolution:", error);
  }
}

/**
 * Setup event listeners for interactive chunks
 */
function setupChunkListeners() {
  if (!currentConflict.value) {
    console.warn("setupChunkListeners appelé alors que currentConflict.value est null");
    // Retry after a short delay to handle possible timing issues
    setTimeout(() => {
      if (currentConflict.value) setupChunkListeners();
    }, 50);
    return;
  }

  console.log("Mise en place des écouteurs d'événements sur les chunks");
  
  try {
    // Also set up JSON selection click handlers explicitly (as a backup to template handlers)
    const setupJsonClickHandlers = () => {
      const jsonValues = document.querySelectorAll('.json-value');
      console.log(`Found ${jsonValues.length} JSON value elements`);
      
      jsonValues.forEach(element => {
        if (element instanceof HTMLElement) {
          const version = element.getAttribute('data-version');
          const indexStr = element.getAttribute('data-index');
          
          if (version && indexStr && (version === 'ours' || version === 'theirs')) {
            try {
              const index = parseInt(indexStr, 10);
              
              // Add an explicit click handler
              element.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`Clic sur JSON value: index=${index}, version=${version}`);
                // Ensure version is valid
                if (version === 'ours' || version === 'theirs') {
                  selectJsonVersion(index, version);
                }
              });
              
              // Make sure it's visibly clickable
              element.style.cursor = 'pointer';
            } catch (e) {
              console.error("Error parsing index:", e);
            }
          }
        }
      });
    };

    // Set up standard diff chunk listeners
    nextTick(() => {
      setTimeout(() => {
        if (!currentConflict.value) {
          console.warn("setupChunkListeners: currentConflict.value est devenu null pendant le délai");
          return;
        }
        
        // Handle standard diff chunks
        const chunks = document.querySelectorAll('.diff-chunk');
        console.log(`${chunks.length} chunks trouvés pour le conflit`);
        
        if (chunks.length === 0) {
          console.warn("Aucun chunk trouvé, tentative avec un délai plus long");
          setTimeout(setupChunkListeners, 200);
          return;
        }
        
        chunks.forEach(chunk => {
          try {
            const chunkId = chunk.getAttribute('data-chunk-id');
            if (chunkId) {
              // Remove any existing click handlers first
              chunk.replaceWith(chunk.cloneNode(true));
              
              // Get the fresh element
              const freshChunk = document.querySelector(`.diff-chunk[data-chunk-id="${chunkId}"]`);
              if (freshChunk) {
                // Add the new click handler
                freshChunk.addEventListener('click', (event) => {
                  event.stopPropagation();
                  try {
                    console.log(`Clic sur le chunk ${chunkId}`);
                    toggleChunkSelection(chunkId);
                  } catch (clickError) {
                    console.error(`Erreur sur le clic du chunk ${chunkId}:`, clickError);
                  }
                });
                
                // Make sure it looks clickable
                if (freshChunk instanceof HTMLElement) {
                  freshChunk.style.cursor = 'pointer';
                  freshChunk.style.userSelect = 'none';
                }
              }
            }
          } catch (chunkError) {
            console.error("Erreur lors de la configuration d'un chunk:", chunkError);
          }
        });
        
        // Also set up JSON handlers
        setupJsonClickHandlers();
        
        console.log("Écouteurs d'événements ajoutés avec succès");
      }, 150);
    });
  } catch (error) {
    console.error("Erreur générale dans setupChunkListeners:", error);
  }
}

/**
 * Tente de parser le contenu comme du JSON et identifie les conflits par jsonPath
 * @param {string} ourVersion - Notre version du contenu
 * @param {string} theirVersion - Leur version du contenu
 * @returns {Array<JsonConflict>} Les conflits par jsonPath
 */
function extractJsonConflicts(ourVersion, theirVersion) {
  try {
    // Essaie de parser les deux versions comme du JSON
    const ourJson = JSON.parse(ourVersion);
    const theirJson = JSON.parse(theirVersion);
    
    // Trouve les différences entre les deux objets JSON
    return findJsonDifferences(ourJson, theirJson);
  } catch (e) {
    // Si ce n'est pas du JSON valide, retourne un tableau vide
    return [];
  }
}

/**
 * Recherche récursivement les différences entre deux objets JSON
 * @param {object} ours - Notre objet
 * @param {object} theirs - Leur objet
 * @param {string} [basePath=''] - Chemin de base pour le jsonPath
 * @returns {Array<JsonConflict>} Les différences trouvées
 */
function findJsonDifferences(ours, theirs, basePath = '') {
  /** @type {Array<JsonConflict>} */
  const differences = [];
  
  // Propriétés dans notre objet
  for (const key in ours) {
    const currentPath = basePath ? `${basePath}.${key}` : key;
    
    // Si la clé n'existe pas dans leur objet, c'est une différence
    if (!(key in theirs)) {
      /** @type {JsonConflict} */
      const diff = {
        path: currentPath,
        ourValue: ours[key],
        theirValue: undefined,
        selectedVersion: 'ours', // Par défaut notre version
        manualEdit: JSON.stringify(ours[key], null, 2) // Initialisation avec notre version
      };
      differences.push(diff);
      continue;
    }
    
    // Si les valeurs sont des objets, recherche récursivement
    if (
      typeof ours[key] === 'object' && 
      ours[key] !== null &&
      typeof theirs[key] === 'object' && 
      theirs[key] !== null &&
      !Array.isArray(ours[key]) &&
      !Array.isArray(theirs[key])
    ) {
      differences.push(...findJsonDifferences(ours[key], theirs[key], currentPath));
      continue;
    }
    
    // Compare les valeurs (pour les tableaux ou les valeurs primitives)
    if (JSON.stringify(ours[key]) !== JSON.stringify(theirs[key])) {
      /** @type {JsonConflict} */
      const diff = {
        path: currentPath,
        ourValue: ours[key],
        theirValue: theirs[key],
        selectedVersion: 'ours', // Par défaut notre version
        manualEdit: JSON.stringify(ours[key], null, 2) // Initialisation avec notre version
      };
      differences.push(diff);
    }
  }
  
  // Propriétés dans leur objet mais pas dans le nôtre
  for (const key in theirs) {
    if (!(key in ours)) {
      const currentPath = basePath ? `${basePath}.${key}` : key;
      /** @type {JsonConflict} */
      const diff = {
        path: currentPath,
        ourValue: undefined,
        theirValue: theirs[key],
        selectedVersion: 'ours', // Par défaut notre version (donc ne pas inclure)
        manualEdit: 'undefined' // Initialisation sans valeur
      };
      differences.push(diff);
    }
  }
  
  return differences;
}

/**
 * Formate une valeur JSON pour l'affichage
 * @param {any} value - Valeur à formater
 * @returns {string} Valeur formatée
 */
function formatJsonValue(value) {
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
}

/**
 * Sélectionne une version pour un conflit JSON
 * @param {number} index - Index du conflit
 * @param {'ours' | 'theirs'} version - Version à sélectionner
 */
function selectJsonVersion(index, version) {
  console.log(`Tentative de sélection JSON : index=${index}, version=${version}`);
  
  if (!currentConflict.value || !currentConflict.value.jsonConflicts) {
    console.error("selectJsonVersion: currentConflict ou jsonConflicts est null");
    return;
  }
  
  const conflict = currentConflict.value.jsonConflicts[index];
  if (conflict) {
    console.log(`Avant changement: selectedVersion=${conflict.selectedVersion}`);
    
    // Mettre à jour la version sélectionnée
    conflict.selectedVersion = version;
    
    // Mettre également à jour l'édition manuelle avec la valeur sélectionnée
    const valueToUse = version === 'ours' ? conflict.ourValue : conflict.theirValue;
    conflict.manualEdit = formatJsonValue(valueToUse);
    
    console.log(`Après changement: selectedVersion=${conflict.selectedVersion}, manualEdit mis à jour`);
    
    // Reconstruire la résolution complète
    updateJsonResolution();
  } else {
    console.error(`Aucun conflit JSON trouvé à l'index ${index}`);
  }
}

/**
 * Met à jour la résolution JSON basée sur les versions sélectionnées
 */
function updateJsonResolution() {
  if (!currentConflict.value || !currentConflict.value.jsonConflicts) {
    console.warn("updateJsonResolution appelée alors que currentConflict ou ses jsonConflicts sont null");
    return;
  }
  
  try {
    console.log("Mise à jour de la résolution JSON à partir des éditions manuelles");
    
    // Parse notre version comme base
    const baseJson = JSON.parse(currentConflict.value.ourVersion);
    const result = JSON.parse(JSON.stringify(baseJson)); // Clone profond
    
    // Applique les choix pour chaque conflit
    currentConflict.value.jsonConflicts.forEach((conflict, idx) => {
      try {
        if (!conflict || !conflict.path) {
          console.warn(`Conflit JSON invalide ou sans chemin à l'index ${idx}`);
          return;
        }
        
        const pathParts = conflict.path.split('.');
        let current = result;
        
        // Navigue à travers l'objet jusqu'à l'avant-dernier niveau
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!(part in current)) {
            // Crée la structure intermédiaire si nécessaire
            current[part] = {};
          }
          current = current[part];
        }
        
        const lastPart = pathParts[pathParts.length - 1];
        
        // PRIORITÉ À L'ÉDITION MANUELLE: Toujours vérifier d'abord si une édition manuelle est disponible
        if (conflict.manualEdit && conflict.manualEdit.trim() !== '' && conflict.manualEdit !== 'undefined') {
          try {
            console.log(`Utilisation de l'édition manuelle pour ${conflict.path}:`, conflict.manualEdit);
            
            // Essayer de parser l'édition manuelle comme du JSON
            const manualValue = JSON.parse(conflict.manualEdit);
            current[lastPart] = manualValue;
            console.log(`Édition manuelle appliquée avec succès pour ${conflict.path}`);
          } catch (e) {
            console.warn(`Échec du parsing de l'édition manuelle pour ${conflict.path}:`, e);
            console.log("Contenu de l'édition manuelle:", conflict.manualEdit);
            
            // En cas d'échec du parsing, utiliser la version sélectionnée comme fallback
            if (conflict.selectedVersion === 'ours') {
              if (conflict.ourValue !== undefined) {
                console.log(`Fallback à notre version pour ${conflict.path}`);
                current[lastPart] = conflict.ourValue;
              } else {
                console.log(`Suppression de ${conflict.path} car notre version est undefined`);
                delete current[lastPart];
              }
            } else {
              if (conflict.theirValue !== undefined) {
                console.log(`Fallback à leur version pour ${conflict.path}`);
                current[lastPart] = conflict.theirValue;
              } else {
                console.log(`Suppression de ${conflict.path} car leur version est undefined`);
                delete current[lastPart];
              }
            }
          }
        } else {
          // Si pas d'édition manuelle, utiliser la version sélectionnée
          console.log(`Pas d'édition manuelle pour ${conflict.path}, utilisation de la version ${conflict.selectedVersion}`);
          
          if (conflict.selectedVersion === 'ours') {
            if (conflict.ourValue !== undefined) {
              current[lastPart] = conflict.ourValue;
              console.log(`Utilisé notre version pour ${conflict.path}`);
            } else {
              delete current[lastPart];
              console.log(`Supprimé ${conflict.path} car notre version est undefined`);
            }
          } else {
            if (conflict.theirValue !== undefined) {
              current[lastPart] = conflict.theirValue;
              console.log(`Utilisé leur version pour ${conflict.path}`);
            } else {
              delete current[lastPart];
              console.log(`Supprimé ${conflict.path} car leur version est undefined`);
            }
          }
        }
      } catch (conflictError) {
        console.error(`Erreur lors du traitement du conflit JSON à l'index ${idx}:`, conflictError);
      }
    });
    
    // Met à jour la résolution de manière sécurisée
    if (currentConflict.value) {
      const finalJson = JSON.stringify(result, null, 2);
      currentConflict.value.resolution = finalJson;
      console.log("Résolution JSON finale mise à jour:", finalJson.substring(0, 100) + "...");
    }
  } catch (e) {
    console.error('Erreur lors de la mise à jour de la résolution JSON:', e);
  }
}

/**
 * L'objet JSON résolu basé sur les sélections
 */
const resolvedJson = computed(() => {
  if (!currentConflict.value || !currentConflict.value.resolution) return {};
  
  try {
    return JSON.parse(currentConflict.value.resolution);
  } catch (e) {
    return {};
  }
});

/**
 * Show the conflict in the modal
 * @param {Conflict} conflict - The conflict to show
 * @returns {Promise<boolean>} - True if the conflict was resolved, false otherwise
 */
async function showConflict(conflict) {
  if (!conflict) return false;
  
  try {
    // Log important details of the conflict
    console.log('Affichage du conflit:', {
      id: conflict.id,
      filename: conflict.filename,
      hasOriginal: !!conflict.original,
      originalLength: conflict.original ? conflict.original.length : 0,
      hasOurVersion: !!conflict.ourVersion,
      hasTheirVersion: !!conflict.theirVersion
    });
    
    // Vérifier que le conflit a les champs requis
    if (!conflict.original) {
      console.error('Impossible d\'afficher le conflit: champ "original" manquant');
      notification.next('error', 'Impossible d\'afficher ce conflit: données originales manquantes');
      return false;
    }
    
    // Vérifier si le contenu est du JSON et extraire les conflits par jsonPath
    const jsonConflicts = extractJsonConflicts(conflict.ourVersion, conflict.theirVersion);
    const isJson = jsonConflicts.length > 0;
    
    // Parse les différences et crée le HTML interactif
    const [chunks, mergedDisplay] = parseConflict(conflict.ourVersion, conflict.theirVersion);
    
    // Initialiser le conflit actuel en préservant TOUS les champs du conflit original
    // et en ajoutant nos champs calculés
    currentConflict.value = {
      ...conflict, // Préserver tous les champs originaux
      chunks,
      mergedDisplay,
      resolution: conflict.resolution || conflict.ourVersion,
      jsonConflicts: isJson ? jsonConflicts : undefined,
      isJson
    };
    
    // Afficher la modal
    isVisible.value = true;
    
    // Setup event listeners for interactive chunks after a longer delay
    // to ensure the DOM is fully rendered
    setTimeout(() => {
      setupChunkListeners();
      
      // Pour les conflits JSON, s'assurer que les sélecteurs de version sont correctement configurés
      if (isJson && currentConflict.value?.jsonConflicts) {
        console.log("Configuration de l'interface pour les conflits JSON");
      }
    }, 300);
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'affichage du conflit:", error);
    notification.next('error', `Échec de l'affichage du conflit: ${getErrorMessage(error)}`);
    return false;
  }
}

/**
 * Prepare conflict data for resolution and return a stable copy
 * @returns {Object|null} Conflict data or null if invalid
 */
function prepareConflictForResolution() {
  // Safety check before doing anything
  if (!currentConflict.value) {
    console.error('prepareConflictForResolution: currentConflict.value est null');
    return null;
  }

  // Check required fields
  if (!currentConflict.value.resolution) {
    console.error('prepareConflictForResolution: resolution manquante');
    return null;
  }

  if (!currentConflict.value.original) {
    console.error('prepareConflictForResolution: original manquant');
    return null;
  }

  if (!currentConflict.value.id) {
    console.error('prepareConflictForResolution: id manquant');
    return null;
  }

  // Create a complete independent copy
  const conflictData = {
    conflictId: currentConflict.value.id,
    resolution: currentConflict.value.resolution,
    original: currentConflict.value.original,
    // Include additional useful fields for processing
    isJson: currentConflict.value.isJson || false,
    filename: currentConflict.value.filename || null
  };

  console.log('Données du conflit préparées pour résolution:', {
    id: conflictData.conflictId,
    hasResolution: !!conflictData.resolution,
    hasOriginal: !!conflictData.original,
    isJson: conflictData.isJson
  });

  return conflictData;
}

/**
 * Ferme la modal de résolution de conflit
 */
function closeModal() {
  try {
    // Sauvegarder l'ID du conflit pour le logging avant de réinitialiser
    const conflictId = currentConflict.value?.id;
    console.log(`Fermeture de la modal pour le conflit ${conflictId || 'inconnu'}`);
    
    // Nettoyer les états de manière sécurisée
    isVisible.value = false;
    currentConflict.value = null;
  } catch (error) {
    console.error('Erreur lors de la fermeture de la modal:', error);
  }
}

/**
 * Rafraîchit la liste des conflits depuis le serveur
 */
async function refreshConflicts() {
  try {
    await fetchPendingConflicts();
    notification.next('success', 'Liste des conflits rafraîchie');
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des conflits:', error);
    notification.next('error', 'Erreur lors du rafraîchissement des conflits');
  }
}

/**
 * Redémarre l'application après résolution de conflit
 */
async function restartApplication() {
  try {
    notification.next('success', 'Redémarrage de l\'application en cours...', 'Veuillez patienter');
    await stack.restartApplication();
  } catch (/** @type {unknown} */ error) {
    console.error('Erreur lors du redémarrage de l\'application:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    notification.next('error', `Erreur lors du redémarrage: ${errorMessage}`);
  }
}

/**
 * Resolve the current conflict
 */
async function resolveConflict() {
  console.log("Début de la résolution du conflit");
  
  // Désactiver le bouton de résolution pendant la préparation
  const resolveButton = document.querySelector('button[label="Resolve and save"]');
  if (resolveButton) {
    resolveButton.setAttribute('disabled', 'disabled');
  }
  
  try {
    // Capter une copie du conflit actuel immédiatement pour éviter les problèmes
    // si currentConflict.value devient null pendant l'exécution
    const conflictSnapshot = currentConflict.value ? { ...currentConflict.value } : null;
    
    if (!conflictSnapshot) {
      console.error('Impossible de résoudre : conflit est null');
      notification.next('error', 'Impossible de résoudre ce conflit. Données manquantes.');
      return;
    }
    
    if (!conflictSnapshot.resolution) {
      console.error('Impossible de résoudre : résolution manquante');
      notification.next('error', 'Impossible de résoudre ce conflit. Résolution manquante.');
      return;
    }
    
    if (!conflictSnapshot.original) {
      console.error('Impossible de résoudre : données originales manquantes');
      notification.next('error', 'Impossible de résoudre ce conflit. Données originales manquantes.');
      return;
    }
    
    const conflictId = conflictSnapshot.id;
    console.log(`Résolution du conflit ${conflictId} avec une copie sécurisée`);

    // Préparer les données pour l'envoi au serveur
    const conflictData = {
      conflictId: conflictId,
      resolution: conflictSnapshot.resolution,
      original: conflictSnapshot.original
    };

    // Traitement spécifique pour les données JSON
    if (conflictSnapshot.isJson && conflictSnapshot.resolution) {
      try {
        const parsedResolution = JSON.parse(conflictSnapshot.resolution);
        
        // Vérifier si c'est un objet service et s'il a toutes les propriétés requises
        if (conflictSnapshot.filename && 
            conflictSnapshot.filename.includes('/service/') && 
            parsedResolution) {
          if (!parsedResolution.label) {
            console.error('Service sans label détecté lors de la résolution:', parsedResolution);
            notification.next('error', 'Le service doit avoir une propriété "label". Veuillez l\'ajouter manuellement.');
            return;
          }
        }

        // S'assurer que la résolution est bien formée
        conflictData.resolution = JSON.stringify(parsedResolution);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        notification.next('error', 'Le format JSON de la résolution est invalide');
        return;
      }
    }

    console.log('Envoi de la résolution au serveur:', conflictData);
    
    try {
      // Envoyer les données au serveur
      const response = await axios.post('/crypto/resolve-conflict', conflictData);
      console.log('Réponse du serveur après résolution:', response.data);
      
      // Notifier l'utilisateur du succès
      notification.next('success', 'Conflit résolu avec succès, redémarrage de l\'application...');
      
      // Nettoyer l'état actuel immédiatement
      if (currentConflict.value && currentConflict.value.id === conflictId) {
        console.log(`Fermeture du conflit ${conflictId} après résolution`);
        isVisible.value = false;
        currentConflict.value = null;
      }
      
      // Rafraîchir la liste des conflits
      await fetchPendingConflicts();
      
      // Redémarrer l'application après un court délai pour permettre le traitement côté serveur
      setTimeout(async () => {
        try {
          await restartApplication();
        } catch (restartError) {
          console.error('Erreur lors du redémarrage:', restartError);
        }
      }, 1000);
      
      // NEW: Attempt to restart the service associated with the conflicted file
      try {
        // Find the service associated with the conflict
        let serviceId = null;
        
        // If the conflict is related to a service file, extract the service ID
        if (conflictSnapshot.filename && conflictSnapshot.filename.includes('/service/')) {
          // Extract the service name from the file path
          const filenameParts = conflictSnapshot.filename.split('/');
          const serviceFileName = filenameParts[filenameParts.length - 1];
          const serviceName = serviceFileName.replace('.encrypted.json', '');
          
          console.log(`Attempting to restart service: ${serviceName}`);
          
          // Get the service ID from its name
          try {
            const services = await stack.loadServices();
            const service = services.find(s => s.label === serviceName);
            
            if (service) {
              console.log(`Service found for restart: ${serviceName}`);
              
              // Restart the service
              await service.restart();
              notification.next('success', `Service ${serviceName} restarted successfully`);
            } else {
              console.log(`No service found with name: ${serviceName}`);
            }
          } catch (serviceError) {
            console.error(`Error while searching/restarting service ${serviceName}:`, serviceError);
          }
        } else {
          console.log("The file is not associated with a specific service, no restart needed");
        }
      } catch (restartError) {
        console.error("Error while attempting to restart the service:", restartError);
      }
      
      // Process the next conflict IMMEDIATELY, without delay
      console.log("Immediate processing of the next conflict after resolution");
      processNextConflict();
    } catch (requestError) {
      console.error('Error during server request:', requestError);
      throw requestError;
    }
  } catch (error) {
    console.error('Error during conflict resolution:', error);
    let errorMessage = 'Error during conflict resolution';
    
    if (typeof error === 'object' && error !== null && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response && 
        error.response.data && typeof error.response.data === 'object' && 
        'message' in error.response.data) {
      errorMessage = String(error.response.data.message);
    } else if (error instanceof Error) {
      errorMessage = `${error.name}: ${error.message}`;
    }
    
    notification.next('error', errorMessage);
  } finally {
    // Always re-enable the button
    if (resolveButton) {
      resolveButton.removeAttribute('disabled');
    }
  }
}


/**
 * Process the next conflict in the queue if any
 */
async function processNextConflict() {
  console.log('Processing next conflict. Queue size:', conflictQueue.value.length, 'isVisible:', isVisible.value);
  
  // Don't process if there's already a visible conflict or if the queue is empty
  if (isVisible.value || conflictQueue.value.length === 0) {
    console.log('No conflict to process: modal already visible or empty queue');
    return;
  }
  
  try {
    // Capture a conflict safely without modifying the queue
    // in case an error occurs
    if (conflictQueue.value.length === 0) {
      console.log('The queue is empty, nothing to process');
      return;
    }
    
    const nextConflict = {...conflictQueue.value[0]};
    
    // Verify that the conflict is valid before attempting to display it
    if (!nextConflict.id || !nextConflict.original) {
      console.error('Invalid conflict found in the queue, ignored');
      // Remove this invalid conflict to avoid getting stuck
      conflictQueue.value.shift();
      // Try to process the next conflict
      setTimeout(processNextConflict, 50);
      return;
    }
    
    console.log('Preparing to display the next conflict:', nextConflict.id);
    
    // Remove the conflict from the queue only if the display succeeds
    const displaySuccessful = await showConflict(nextConflict);
    
    if (displaySuccessful) {
      console.log('Conflict displayed successfully, removing from queue');
      // Now we can remove the conflict from the queue
      conflictQueue.value.shift();
    } else {
      console.error('Failed to display conflict, it remains in the queue');
      // Remove the problematic conflict anyway to avoid getting stuck
      conflictQueue.value.shift();
      // Try to process the next conflict after a delay
      setTimeout(processNextConflict, 200);
    }
  } catch (error) {
    console.error("Erreur lors du traitement du prochain conflit:", error);
    notification.next('error', `Erreur lors du traitement du conflit: ${getErrorMessage(error)}`);
    
    // In case of error, try to process the next conflict
    if (conflictQueue.value.length > 0) {
      conflictQueue.value.shift();
      setTimeout(processNextConflict, 300);
    }
  }
}

// Add click debugging in onMounted hook
onMounted(async () => {
  console.log('GitConflictModal mounted');
  
  // Debug global click handling in the modal
  setTimeout(() => {
    const modalContent = document.querySelector('.conflict-dialog .p-dialog-content');
    if (modalContent) {
      console.log('Adding click event listener to modal content for debugging');
      modalContent.addEventListener('click', (event) => {
        console.log('Click detected in modal content', {
          target: event.target,
          currentTarget: event.currentTarget,
          classes: event.target instanceof HTMLElement ? Array.from(event.target.classList) : [],
          id: event.target instanceof HTMLElement ? event.target.id : null,
          tagName: event.target instanceof HTMLElement ? event.target.tagName : null
        });
      });
    }
  }, 1000);
  
  // Set up a mutation observer to watch for when the modal becomes visible
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const dialog = document.querySelector('.conflict-dialog');
        if (dialog && dialog.classList.contains('p-dialog-visible')) {
          console.log('Modal is now visible - setting up click debugging');
          
          // Setup debug click handlers on json-value elements
          const jsonValues = document.querySelectorAll('.json-value');
          jsonValues.forEach(element => {
            if (element instanceof HTMLElement) {
              element.addEventListener('click', (event) => {
                console.log('Direct click on json-value:', {
                  element,
                  classes: Array.from(element.classList),
                  version: element.getAttribute('data-version'),
                  index: element.getAttribute('data-index')
                });
              });
              
              // Add visual debugging indicator
              element.style.position = 'relative';
              const debugIndicator = document.createElement('div');
              debugIndicator.innerText = '👆 Clickable';
              debugIndicator.style.position = 'absolute';
              debugIndicator.style.top = '0';
              debugIndicator.style.right = '0';
              debugIndicator.style.background = 'rgba(255,0,0,0.2)';
              debugIndicator.style.color = 'white';
              debugIndicator.style.padding = '2px 5px';
              debugIndicator.style.fontSize = '10px';
              debugIndicator.style.borderRadius = '3px';
              element.appendChild(debugIndicator);
            }
          });
          
          // Break the observer since we've found what we need
          observer.disconnect();
        }
      }
    }
  });
  
  // Start observing the document body for the dialog
  observer.observe(document.body, { 
    attributes: true, 
    childList: true, 
    subtree: true,
    attributeFilter: ['class']
  });
  
  // Ensure clean state at startup
  currentConflict.value = null;
  isVisible.value = false;
  conflictQueue.value = [];
  
  // Retrieve pending conflicts
  await fetchPendingConflicts();
  
  // Listen for conflict resolution events with defensive programming
  Socket.on('crypto:conflict-resolved', async (data) => {
    try {
      console.log('Event crypto:conflict-resolved received:', data);
      if (!data || !data.conflictId) {
        console.warn('Resolution event received without conflict ID');
        return;
      }
      
      const conflictId = data.conflictId;
      
      // Capture the current state to avoid race conditions
      const currentConflictId = currentConflict.value?.id;
      const isCurrentlyVisible = isVisible.value;
      
      // If a conflict is currently displayed and it matches the resolved conflict,
      // close it and clean up the states
      if (isCurrentlyVisible && currentConflictId === conflictId) {
        console.log(`Closing conflict ${conflictId} following external resolution`);
        // Close the current conflict safely
        isVisible.value = false;
        currentConflict.value = null;
      } else {
        console.log(`The resolved conflict ${conflictId} is not currently displayed (displayed: ${currentConflictId})`);
      }
      
      // Remove the resolved conflict from the queue safely
      const updatedQueue = conflictQueue.value.filter(c => c.id !== conflictId);
      const removedCount = conflictQueue.value.length - updatedQueue.length;
      
      if (removedCount > 0) {
        console.log(`${removedCount} conflict(s) removed from the queue`);
        conflictQueue.value = updatedQueue;
      }
      
      // Refresh the list of conflicts safely
      await fetchPendingConflicts();
      
      // Process the next conflict after a short delay if no conflicts are displayed
      if (!isVisible.value && conflictQueue.value.length > 0) {
        console.log('Scheduling processing of the next conflict');
        setTimeout(processNextConflict, 200);
      }
    } catch (error) {
      console.error('Error while processing conflict-resolved event:', error);
    }
  });
  
  // Listen for new conflicts with defensive programming
  Socket.on('crypto:conflict', async (conflict) => {
    try {
      if (!conflict || !conflict.id) {
        console.warn('New conflict event received without valid data');
        return;
      }
      
      console.log('New conflict detected:', conflict.id);
      
      // Refresh the list of conflicts before adding the new one
      await fetchPendingConflicts();
      
      // Verify that the conflict is still valid after refreshing
      if (conflict && conflict.id && conflict.original) {
        addConflict(conflict);
      }
    } catch (error) {
      console.error('Error while processing a new conflict:', error);
    }
  });
});

// Cleanup when component is unmounted
onUnmounted(() => {
  console.log('GitConflictModal unmounted');
  Socket.off('crypto:conflict-resolved');
  Socket.off('crypto:conflict');
});

/**
 * Fetch all pending conflicts from the server
 */
async function fetchPendingConflicts() {
  try {
    const { data: pendingConflicts } = await axios.get('/crypto/pending-conflicts');
    console.log('Conflicts retrieved from server:', pendingConflicts ? pendingConflicts.length : 0);
    
    if (Array.isArray(pendingConflicts) && pendingConflicts.length > 0) {
      console.log('Details of retrieved conflicts:', pendingConflicts.map(c => ({
        id: c.id,
        filename: c.filename,
        hasOriginal: !!c.original,
        hasOurVersion: !!c.ourVersion,
        hasTheirVersion: !!c.theirVersion
      })));
      
      // Verify and complete missing data
      const validConflicts = pendingConflicts.filter(conflict => {
        // Verify required fields
        if (!conflict.id || !conflict.original) {
          console.warn('Invalid conflict ignored (id or original missing):', conflict.id);
          return false;
        }
        
        // Ensure all necessary properties are present
        if (!conflict.ourVersion || !conflict.theirVersion) {
          console.warn('Conflict with missing versions:', conflict.id);
          // Keep it anyway but display it with a warning
        }
        
        return true;
      });
      
      // Add all pending conflicts to our queue
      validConflicts.forEach(conflict => {
        addConflict(conflict);
      });
      
      if (validConflicts.length > 0) {
        notification.next('error', `${validConflicts.length} Git conflict(s) pending resolution`, 'Git Conflicts');
      }
    }
  } catch (error) {
    console.error('Error while retrieving pending conflicts:', error);
    notification.next('error', `Error while retrieving conflicts: ${getErrorMessage(error)}`);
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
 * Add a conflict to the queue and show it if no conflict is currently being shown
 * @param {Conflict} conflict - The conflict to add
 */
function addConflict(conflict) {
  console.log('Adding a new conflict to the queue:', conflict.id);
  conflictQueue.value.push(conflict);
  
  // Process next conflict if we're not showing one already
  processNextConflict();
}

/**
 * Update JSON selections when manual edit changes
 */
function updateJsonFromManualEdit() {
  // We don't do anything specific here because manual editing
  // will directly modify currentConflict.resolution
  // and it's this value that will be sent
}

/**
 * Update text selections when manual edit changes
 */
function updateResolutionFromManualEdit() {
  // We don't do anything specific here because manual editing
  // will directly modify currentConflict.resolution
  // and it's this value that will be sent
}

/**
 * Update manual edit for a specific conflict
 * @param {number} index - Conflict index
 */
function updateManualEditForConflict(index) {
  // Check if the context is valid
  if (!currentConflict.value) {
    console.error("updateManualEditForConflict: currentConflict.value is null");
    return;
  }
  
  if (!currentConflict.value.jsonConflicts) {
    console.error("updateManualEditForConflict: jsonConflicts is null");
    return;
  }
  
  if (index < 0 || index >= currentConflict.value.jsonConflicts.length) {
    console.error(`updateManualEditForConflict: invalid index ${index}, jsonConflicts length: ${currentConflict.value.jsonConflicts.length}`);
    return;
  }
  
  const conflict = currentConflict.value.jsonConflicts[index];
  if (!conflict) {
    console.error(`updateManualEditForConflict: conflict at index ${index} is null`);
    return;
  }
  
  try {
    if (conflict.manualEdit !== undefined) {
      // Use updateJsonResolution to rebuild the complete resolution safely
      updateJsonResolution();
    }
  } catch (error) {
    console.error(`Error while updating manual edit for index ${index}:`, error);
  }
}

/**
 * Use the specified version in manual edit
 * @param {number} index - Conflict index
 * @param {'ours' | 'theirs'} version - Version to use
 */
function useVersionInManualEdit(index, version) {
  // Check if the context is valid
  if (!currentConflict.value) {
    console.error("useVersionInManualEdit: currentConflict.value is null");
    return;
  }
  
  if (!currentConflict.value.jsonConflicts) {
    console.error("useVersionInManualEdit: jsonConflicts is null");
    return;
  }
  
  if (index < 0 || index >= currentConflict.value.jsonConflicts.length) {
    console.error(`useVersionInManualEdit: invalid index ${index}, jsonConflicts length: ${currentConflict.value.jsonConflicts.length}`);
    return;
  }
  
  const conflict = currentConflict.value.jsonConflicts[index];
  if (!conflict) {
    console.error(`useVersionInManualEdit: conflict at index ${index} is null`);
    return;
  }
  
  try {
    console.log(`Using version ${version} for manual edit at index ${index}`);
    
    // Select the value to use
    const valueToUse = version === 'ours' ? conflict.ourValue : conflict.theirValue;
    
    // Format the value as JSON for display
    conflict.manualEdit = formatJsonValue(valueToUse);
    
    // Also update the selected version for visual display
    conflict.selectedVersion = version;
    
    console.log(`Manual edit updated with version ${version}:`, conflict.manualEdit);
    
    // Use updateJsonResolution to rebuild the complete resolution
    updateJsonResolution();
  } catch (error) {
    console.error(`Error while updating manual version for index ${index}:`, error);
  }
}

// Expose necessary functions for external references
defineExpose({
  addConflict,
  showConflict,
  resolveConflict,
  closeModal,
  refreshConflicts,
  processNextConflict,
  fetchPendingConflicts
});

// Add a watcher to detect changes in isVisible
watch(isVisible, (newValue) => {
  if (newValue && currentConflict.value) {
    console.log("Modal displayed, setting up event listeners");
    // The modal was just displayed, let's set up event listeners
    nextTick(() => {
      setupChunkListeners();
    });
  }
});

// Add a watcher to detect changes in currentConflict
watch(() => currentConflict.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log(`New conflict displayed (${newId}), setting up event listeners`);
    nextTick(() => {
      setupChunkListeners();
    });
  }
});
</script>

<style lang="scss" scoped>
.conflict-dialog {
  :deep(.p-dialog-content) {
    max-height: 80vh;
    overflow: auto;
  }
}

.conflict-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--surface-card);
  border-radius: 4px;
  margin-bottom: 10px;

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
  }

  .version-actions {
    display: flex;
    gap: 10px;
  }
}

/* Layout for standard text conflicts */
.conflicts-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .conflict-columns {
    display: flex;
    gap: 20px;
    min-height: 400px;

    .conflict-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      overflow: hidden;

      .column-header {
        padding: 10px;
        background-color: var(--surface-ground);
        border-bottom: 1px solid var(--surface-border);
        h4 {
          margin: 0;
        }
      }
    }
  }
}

/* Styles for the interactive editor */
.interactive-conflict {
  flex: 1;
  overflow: auto;
  padding: 10px;
  background-color: var(--surface-section);
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.interactive-editor {
  font-family: monospace;
  line-height: 1.5;
}

/* Styles for conflict chunks */
.diff-chunk {
  cursor: pointer !important; /* Force cursor to be pointer */
  padding: 2px 0;
  border-radius: 3px;
  transition: background-color 0.2s;
  position: relative; /* Add position for hover effect */

  &::after {
    content: "Click to select";
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0,0,0,0.1);
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::after {
    opacity: 1;
  }

  &.our-version {
    background-color: rgba(46, 204, 113, 0.1);
    border-left: 3px solid #2ecc71;
    padding-left: 5px;

    &.selected {
      background-color: rgba(46, 204, 113, 0.3);
    }

    &.not-selected {
      background-color: rgba(46, 204, 113, 0.05);
      text-decoration: line-through;
      opacity: 0.5;
    }
  }

  &.their-version {
    background-color: rgba(52, 152, 219, 0.1);
    border-left: 3px solid #3498db;
    padding-left: 5px;

    &.selected {
      background-color: rgba(52, 152, 219, 0.3);
    }

    &.not-selected {
      background-color: rgba(52, 152, 219, 0.05);
      text-decoration: line-through;
      opacity: 0.5;
    }
  }

  &:hover {
    filter: brightness(1.1);
  }
}

.common-text {
  color: var(--text-color);
}

/* Styles for the manual editing zone */
.manual-edit-container {
  flex: 1;
  padding: 10px;
  background-color: var(--surface-overlay);
  border: 2px solid var(--primary-color);
  border-radius: 4px;
  
  .manual-edit-header {
    margin-bottom: 8px;
    
    h4 {
      margin: 0 0 4px 0;
      color: var(--primary-color);
      font-weight: bold;
      display: flex;
      align-items: center;
      
      &::before {
        content: "✏️";
        margin-right: 5px;
      }
    }
    
    .manual-edit-info {
      font-size: 0.85rem;
      color: var(--text-color-secondary);
      font-style: italic;
    }
  }
  
  .manual-edit-area {
    width: 100%;
    height: 100%;
    font-family: monospace;
    min-height: 200px;
    resize: vertical;
    border: 1px solid var(--primary-color);
  }
}

/* Styles for JSON conflicts */
.json-conflicts {
  display: flex;
  flex-direction: column;
  gap: 20px;

  h3 {
    margin-top: 0;
  }

  .json-conflicts-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .json-conflict-item {
    border: 1px solid var(--surface-border);
    border-radius: 4px;
    overflow: hidden;
  }

  .json-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: var(--surface-ground);
    border-bottom: 1px solid var(--surface-border);

    .json-path {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
      font-family: monospace;
    }

    .manual-edit-actions {
      display: flex;
      gap: 10px;
    }
  }

  .conflict-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .conflict-versions {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;

    .json-value {
      flex: 1;
      padding: 10px;
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative; /* For pseudo-element positioning */

      .select-button {
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 10;
      }

      .select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.3);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none; /* Allow clicks to pass through */
        font-weight: bold;
      }

      &:hover .select-overlay {
        opacity: 1;
      }

      &.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color);
      }

      &:hover {
        background-color: var(--surface-hover);
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      .json-value-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        font-weight: bold;

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;

          &.your-version {
            background-color: #2ecc71;
          }

          &.their-version {
            background-color: #3498db;
          }
        }
      }

      .json-content {
        font-family: monospace;
        white-space: pre-wrap;
        overflow: auto;
        margin: 0;
      }

      &.our-value {
        background-color: rgba(46, 204, 113, 0.05);
      }

      &.their-value {
        background-color: rgba(52, 152, 219, 0.05);
      }
    }
  }
}

/* Message when there's no conflict */
.no-conflict-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  text-align: center;
  padding: 20px;
  background-color: var(--surface-section);
  border: 1px dashed var(--surface-border);
  border-radius: 4px;
  color: var(--text-color-secondary);
  font-size: 1.2rem;
}
</style>