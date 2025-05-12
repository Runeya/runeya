/**
 * Module dedicated to Git conflict storage
 * Helps avoid circular references between modules
 */

// Temporary storage for pending conflicts
const pendingConflicts = [];

/**
 * Store a Git conflict for later resolution
 * @param {Object} conflict - The conflict data
 * @returns {string} - The ID of the stored conflict
 */
function storeConflict(conflict) {
  const conflictId = Date.now().toString();
  pendingConflicts.push({
    id: conflictId,
    timestamp: Date.now(),
    ...conflict
  });
  
  // Limit the number of stored conflicts (keep only the last 20)
  if (pendingConflicts.length > 20) {
    pendingConflicts.shift();
  }
  
  return conflictId;
}

/**
 * Get all pending Git conflicts
 * @returns {Array} - List of pending conflicts
 */
function getPendingConflicts() {
  return pendingConflicts;
}

/**
 * Remove a conflict from the pending list
 * @param {string} conflictId - The ID of the conflict to remove
 */
function removeConflict(conflictId) {
  const index = pendingConflicts.findIndex(c => c.id === conflictId);
  if (index !== -1) {
    pendingConflicts.splice(index, 1);
  }
}

// Exporter les fonctions
module.exports = {
  storeConflict,
  getPendingConflicts,
  removeConflict
}; 