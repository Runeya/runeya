<template>
  <div class="kanban-container">
    <!-- Header with boards -->
    <div class="kanban-header">
      <div class="boards-section">
        <h1 class="kanban-title">
          <i class="fas fa-columns"></i>
          Kanban Board
        </h1>
        
        <div class="board-tabs">
          <div 
            v-for="board in boards" 
            :key="board.id"
            class="board-tab"
            :class="{ 'active': selectedBoard?.id === board.id }"
            @click="selectBoard(board)"
          >
            <span class="board-name">{{ board.name }}</span>
            <Button 
              icon="fas fa-times" 
              severity="danger" 
              text 
              size="small"
              class="delete-board-btn"
              @click.stop="confirmDeleteBoard(board)"
            />
          </div>
          
          <div class="add-board-section">
            <InputText 
              v-if="showNewBoardInput"
              v-model="newBoardName" 
              @keypress.enter="createBoard"
              @blur="cancelNewBoard"
              placeholder="Board name..."
              class="new-board-input"
              ref="newBoardInput"
            />
            <Button 
              v-else
              icon="fas fa-plus" 
              label="New Board"
              severity="secondary" 
              outlined
              size="small"
              @click="showNewBoardForm"
              class="add-board-btn"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board" v-if="selectedBoard">
      <div class="columns-container">
        <KanbanColumn
          v-for="column in boardColumns" 
          :key="column.id"
          :column="column"
          :board="selectedBoard"
          @refresh="refreshData"
          @card-moved="handleCardMoved"
        />
        
        <div class="add-column-card" @click="createNewColumn">
          <div class="add-column-content">
            <i class="fas fa-plus"></i>
            <span>Add Column</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-state-content">
        <i class="fas fa-columns empty-icon"></i>
        <h2>Welcome to Kanban</h2>
        <p>Create your first board to get started organizing your tasks.</p>
        <Button 
          label="Create First Board" 
          icon="fas fa-plus"
          @click="showNewBoardForm"
          class="create-first-board-btn"
        />
      </div>
    </div>

    <!-- Delete Board Confirmation -->
    <Dialog 
      appendTo="self"
      v-model:visible="deleteDialogVisible" 
      modal 
      header="Delete Board" 
      :style="{ width: '30rem' }"
      class="delete-dialog"
    >
      <div class="delete-dialog-content">
        <i class="fas fa-exclamation-triangle warning-icon"></i>
        <p>
          Are you sure you want to delete <strong>"{{ boardToDelete?.name }}"</strong>?
          <br>
          This action cannot be undone.
        </p>
      </div>
      <template #footer>
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="deleteDialogVisible = false" 
        />
        <Button 
          label="Delete" 
          severity="danger" 
          @click="executeDeleteBoard" 
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import KanbanColumn from './components/KanbanColumn.vue';
import args from './helpers/args';

const callServer = args.params.callServer;

// Reactive data
const boards = ref([]);
const selectedBoard = ref(null);
const boardColumns = ref([]);
const deleteDialogVisible = ref(false);
const boardToDelete = ref(null);
const showNewBoardInput = ref(false);
const newBoardName = ref('');
const newBoardInput = ref(null);
const isLoading = ref(false);

// Lifecycle
onMounted(async () => {
  await refreshData();
});

// Methods
async function refreshData() {
  isLoading.value = true;
  try {
    await refreshBoards();
    if (selectedBoard.value) {
      await refreshColumns();
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    isLoading.value = false;
  }
}

async function refreshBoards() {
  try {
    const { data } = await callServer('getAllBoards');
    boards.value = data || [];
    
    // Keep selected board if it still exists
    if (selectedBoard.value) {
      selectedBoard.value = boards.value.find((b) => b?.id === selectedBoard.value.id) || null;
    }
  } catch (error) {
    console.error('Error refreshing boards:', error);
  }
}

async function refreshColumns() {
  if (!selectedBoard.value) return;
  
  try {
    const { data } = await callServer('getBoardColumns', { 
      boardId: selectedBoard.value.id 
    });
    boardColumns.value = data || [];
  } catch (error) {
    console.error('Error refreshing columns:', error);
  }
}

function selectBoard(board) {
  selectedBoard.value = board;
  refreshColumns();
}

async function showNewBoardForm() {
  showNewBoardInput.value = true;
  await nextTick();
  newBoardInput.value?.$el.focus();
}

function cancelNewBoard() {
  showNewBoardInput.value = false;
  newBoardName.value = '';
}

async function createBoard() {
  if (!newBoardName.value.trim()) {
    cancelNewBoard();
    return;
  }
  
  try {
    const { data } = await callServer('createBoard', { 
      name: newBoardName.value.trim() 
    });
    
    if (data) {
      await refreshBoards();
      selectedBoard.value = data;
      await refreshColumns();
    }
    
    cancelNewBoard();
  } catch (error) {
    console.error('Error creating board:', error);
  }
}

function confirmDeleteBoard(board) {
  boardToDelete.value = board;
  deleteDialogVisible.value = true;
}

async function executeDeleteBoard() {
  if (!boardToDelete.value) return;
  
  try {
    await callServer('deleteBoard', { 
      boardId: boardToDelete.value.id 
    });
    
    // Clear selected board if it was deleted
    if (selectedBoard.value?.id === boardToDelete.value.id) {
      selectedBoard.value = null;
      boardColumns.value = [];
    }
    
    await refreshBoards();
  } catch (error) {
    console.error('Error deleting board:', error);
  }
  
  deleteDialogVisible.value = false;
  boardToDelete.value = null;
}

async function createNewColumn() {
  if (!selectedBoard.value) return;
  
  try {
    await callServer('createColumn', { 
      boardId: selectedBoard.value.id,
      name: 'New Column',
      color: '#6b7280'
    });
    
    await refreshColumns();
  } catch (error) {
    console.error('Error creating column:', error);
  }
}

async function handleCardMoved(moveData) {
  try {
    await callServer('moveCard', moveData);
    await refreshColumns();
  } catch (error) {
    console.error('Error moving card:', error);
  }
}
</script>

<style scoped lang="scss">
.kanban-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.kanban-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kanban-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  i {
    color: #3b82f6;
  }
}

.board-tabs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.board-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  &.active {
    background: var(--system-primary400);
    border-color: var(--system-primary400);
    color: white;

    .board-name {
      color: white;
      font-weight: 600;
    }
  }

  .board-name {
    font-weight: 500;
    color: var(--system-color);
  }

  .delete-board-btn {
    opacity: 0.7;
    transition: opacity 0.2s;
    background: white;

    &:hover {
      opacity: 1;
    }
  }
}

.add-board-section {
  display: flex;
  align-items: center;
}

.new-board-input {
  min-width: 180px;
  height: 44px;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 0 1rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.add-board-btn {
  height: 44px;
  border-radius: 12px;
  font-weight: 500;
}

.kanban-board {
  flex: 1;
  overflow: hidden;
  padding: 2rem;
}

.columns-container {
  display: flex;
  gap: 1.5rem;
  height: 100%;
  overflow-x: auto;
  padding-bottom: 1rem;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;

    &:hover {
      background: #94a3b8;
    }
  }
}

.add-column-card {
  min-width: 300px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  }
}

.add-column-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-weight: 500;

  i {
    font-size: 2rem;
    color: #3b82f6;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;

  .empty-icon {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  p {
    font-size: 1.125rem;
    color: #64748b;
    margin: 0 0 2rem 0;
    line-height: 1.6;
  }

  .create-first-board-btn {
    font-size: 1.125rem;
    padding: 0.875rem 2rem;
    border-radius: 12px;
    font-weight: 600;
  }
}

.delete-dialog {
  :deep(.p-dialog) {
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }

  :deep(.p-dialog-header) {
    background: #fef2f2;
    border-radius: 16px 16px 0 0;
    border-bottom: 1px solid #fecaca;
    color: #dc2626;
    font-weight: 600;
  }
}

.delete-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;

  .warning-icon {
    font-size: 1.5rem;
    color: #f59e0b;
    margin-top: 0.25rem;
  }

  p {
    margin: 0;
    line-height: 1.6;
    color: #374151;
  }

  strong {
    color: #1f2937;
  }
}

@media (max-width: 768px) {
  .kanban-header {
    padding: 1rem;
  }

  .kanban-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .board-tabs {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .kanban-board {
    padding: 1rem;
  }

  .columns-container {
    gap: 1rem;
  }

  .add-column-card {
    min-width: 250px;
  }
}
</style>
