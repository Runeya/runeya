<template>
  <div class="kanban-column">
    <!-- Column Header -->
    <div class="column-header">
      <div class="column-title-section">
        <div class="color-indicator" :style="{ backgroundColor: column.color }"></div>
        <InputText 
          v-model="columnTitle"
          @blur="updateColumnName"
          @keypress.enter="updateColumnName"
          class="column-title-input"
          :class="{ 'editing': isEditingTitle }"
          @focus="isEditingTitle = true"
        />
      </div>
      
      <div class="column-actions">
        <Badge :value="cards.length" severity="info" class="card-count-badge" />
        <Button 
          icon="fas fa-trash" 
          severity="danger" 
          text 
          size="small"
          @click="confirmDeleteColumn"
          class="delete-column-btn"
          :title="'Delete column'"
        />
      </div>
    </div>

    <!-- Cards Container -->
    <div class="cards-container">
      <!-- Add Card Button -->
      <div class="add-card-button" @click="showAddCardForm">
        <i class="fas fa-plus"></i>
        <span>Add a card</span>
      </div>

      <!-- Draggable Cards -->
      <draggable
        v-model="cards"
        group="kanban-cards"
        @start="onDragStart"
        @end="onDragEnd"
        @change="onCardsChanged"
        class="cards-list"
        item-key="id"
        :animation="200"
      >
        <template #item="{ element: card }">
          <div 
            class="kanban-card"
            @click="editCard(card)"
            :class="{ 'dragging': isDragging }"
          >
            <!-- Card Header -->
            <div class="card-header">
              <div class="card-priority-indicator"></div>
              <div class="card-id">#{{ card.id.slice(-4) }}</div>
            </div>
            
            <!-- Card Content -->
            <div class="card-main-content">
              <h4 class="card-title">{{ card.name }}</h4>
              <p v-if="card.description" class="card-description">
                {{ card.description }}
              </p>
            </div>
            
            <!-- Card Tags (if we add them later) -->
            <div class="card-tags" v-if="card.tags && card.tags.length">
              <span 
                v-for="tag in card.tags" 
                :key="tag"
                class="card-tag"
                :style="{ backgroundColor: tag.color || '#e2e8f0' }"
              >
                {{ tag.name }}
              </span>
            </div>
            
            <!-- Card Footer -->
            <div class="card-footer">
              <div class="card-meta">
                <i class="fas fa-clock"></i>
                <span class="card-time">{{ formatDate(card.createdAt) }}</span>
              </div>
              
              <div class="card-actions">
                <Button 
                  icon="fas fa-edit" 
                  severity="secondary" 
                  text 
                  rounded
                  size="small"
                  @click.stop="editCard(card)"
                  class="edit-card-btn"
                  :title="'Edit card'"
                />
                <Button 
                  icon="fas fa-trash" 
                  severity="danger" 
                  text 
                  rounded
                  size="small"
                  @click.stop="confirmDeleteCard(card)"
                  class="delete-card-btn"
                  :title="'Delete card'"
                />
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Add/Edit Card Modal -->
    <Dialog 
      appendTo="self"
      v-model:visible="cardModalVisible" 
      modal 
      :header="editingCard?.id ? 'Edit Card' : 'Add Card'"
      :style="{ width: '32rem' }"
      class="card-modal"
    >
      <div class="card-form">
        <div class="form-group">
          <label for="card-name">Card Title *</label>
          <InputText 
            id="card-name"
            v-model="cardForm.name" 
            placeholder="Enter card title..."
            class="card-input"
            ref="cardNameInput"
          />
        </div>

        <div class="form-group">
          <label for="card-description">Description</label>
          <Textarea 
            id="card-description"
            v-model="cardForm.description" 
            placeholder="Add a description..."
            rows="4"
            class="card-textarea"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="closeCardModal" 
        />
        <Button 
          :label="editingCard?.id ? 'Update' : 'Add Card'" 
          @click="saveCard"
          :disabled="!cardForm.name.trim()"
        />
      </template>
    </Dialog>

    <!-- Delete Card Confirmation -->
    <Dialog 
      appendTo="self"
      v-model:visible="deleteCardModalVisible" 
      modal 
      header="Delete Card" 
      :style="{ width: '28rem' }"
      class="delete-modal"
    >
      <div class="delete-modal-content">
        <i class="fas fa-exclamation-triangle warning-icon"></i>
        <p>Are you sure you want to delete <strong>"{{ cardToDelete?.name }}"</strong>?</p>
      </div>
      <template #footer>
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="deleteCardModalVisible = false" 
        />
        <Button 
          label="Delete" 
          severity="danger" 
          @click="executeDeleteCard" 
        />
      </template>
    </Dialog>

    <!-- Delete Column Confirmation -->
    <Dialog 
      appendTo="self"
      v-model:visible="deleteColumnModalVisible" 
      modal 
      header="Delete Column" 
      :style="{ width: '28rem' }"
      class="delete-modal"
    >
      <div class="delete-modal-content">
        <i class="fas fa-exclamation-triangle warning-icon"></i>
        <p>
          Are you sure you want to delete <strong>"{{ column.name }}"</strong>?
          <br>
          All cards in this column will also be deleted.
        </p>
      </div>
      <template #footer>
        <Button 
          label="Cancel" 
          severity="secondary" 
          @click="deleteColumnModalVisible = false" 
        />
        <Button 
          label="Delete" 
          severity="danger" 
          @click="executeDeleteColumn" 
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import draggable from 'vuedraggable';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Badge from 'primevue/badge';
import args from '../helpers/args';

const callServer = args.params.callServer;

const props = defineProps({
  column: {
    required: true,
    type: Object,
  },
  board: {
    required: true,
    type: Object,
  },
});

const emit = defineEmits(['refresh', 'card-moved']);

// Reactive data
const cards = ref([]);
const columnTitle = ref(props.column.name || '');
const isEditingTitle = ref(false);
const isDragging = ref(false);

// Modal states
const cardModalVisible = ref(false);
const deleteCardModalVisible = ref(false);
const deleteColumnModalVisible = ref(false);
const editingCard = ref(null);
const cardToDelete = ref(null);

// Form data
const cardForm = ref({
  name: '',
  description: ''
});

// Refs
const cardNameInput = ref(null);

// Lifecycle
onMounted(async () => {
  await refreshCards();
});

// Watch for column prop changes
watch(() => props.column, async (newColumn) => {
  if (newColumn) {
    columnTitle.value = newColumn.name || '';
    await refreshCards();
  }
}, { deep: true });

// Methods
async function refreshCards() {
  try {
    const { data } = await callServer('getColumnCards', { 
      boardId: props.board.id, 
      columnId: props.column.id 
    });
    cards.value = data || [];
  } catch (error) {
    console.error('Error refreshing cards:', error);
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

async function updateColumnName() {
  isEditingTitle.value = false;
  
  if (columnTitle.value.trim() !== props.column.name) {
    try {
      await callServer('updateColumn', {
        boardId: props.board.id,
        columnId: props.column.id,
        name: columnTitle.value.trim() || 'Untitled Column'
      });
      emit('refresh');
    } catch (error) {
      console.error('Error updating column name:', error);
      columnTitle.value = props.column.name; // Revert on error
    }
  }
}

function showAddCardForm() {
  editingCard.value = null;
  cardForm.value = {
    name: '',
    description: ''
  };
  cardModalVisible.value = true;
  
  nextTick(() => {
    cardNameInput.value?.$el?.focus();
  });
}

function editCard(card) {
  editingCard.value = card;
  cardForm.value = {
    name: card.name || '',
    description: card.description || ''
  };
  cardModalVisible.value = true;
  
  nextTick(() => {
    cardNameInput.value?.$el?.focus();
  });
}

function closeCardModal() {
  cardModalVisible.value = false;
  editingCard.value = null;
  cardForm.value = {
    name: '',
    description: ''
  };
}

async function saveCard() {
  if (!cardForm.value.name.trim()) return;
  
  try {
    if (editingCard.value?.id) {
      // Update existing card
      await callServer('updateCard', {
        boardId: props.board.id,
        columnId: props.column.id,
        cardId: editingCard.value.id,
        name: cardForm.value.name.trim(),
        description: cardForm.value.description.trim()
      });
    } else {
      // Create new card
      await callServer('createCard', {
        boardId: props.board.id,
        columnId: props.column.id,
        name: cardForm.value.name.trim(),
        description: cardForm.value.description.trim()
      });
    }
    
    await refreshCards();
    closeCardModal();
  } catch (error) {
    console.error('Error saving card:', error);
  }
}

function confirmDeleteCard(card) {
  cardToDelete.value = card;
  deleteCardModalVisible.value = true;
}

async function executeDeleteCard() {
  if (!cardToDelete.value) return;
  
  try {
    await callServer('deleteCard', {
      boardId: props.board.id,
      columnId: props.column.id,
      cardId: cardToDelete.value.id
    });
    
    await refreshCards();
  } catch (error) {
    console.error('Error deleting card:', error);
  }
  
  deleteCardModalVisible.value = false;
  cardToDelete.value = null;
}

function confirmDeleteColumn() {
  deleteColumnModalVisible.value = true;
}

async function executeDeleteColumn() {
  try {
    await callServer('deleteColumn', {
      boardId: props.board.id,
      columnId: props.column.id
    });
    
    emit('refresh');
  } catch (error) {
    console.error('Error deleting column:', error);
  }
  
  deleteColumnModalVisible.value = false;
}

// Drag & Drop handlers
function onDragStart() {
  isDragging.value = true;
}

function onDragEnd() {
  isDragging.value = false;
}

async function onCardsChanged(event) {
  if (event.added) {
    // Card moved to this column
    const { element: card, newIndex } = event.added;
    
    emit('card-moved', {
      cardId: card.id,
      fromColumnId: card.columnId,
      toColumnId: props.column.id,
      boardId: props.board.id,
      newIndex
    });
  } else if (event.moved) {
    // Card reordered within this column
    await updateCardOrder();
  }
}

async function updateCardOrder() {
  try {
    const cardIds = cards.value.map(card => card.id);
    await callServer('updateColumn', {
      boardId: props.board.id,
      columnId: props.column.id,
      cardIds: cardIds
    });
  } catch (error) {
    console.error('Error updating card order:', error);
  }
}
</script>

<style scoped lang="scss">
.kanban-column {
  min-width: 300px;
  max-width: 300px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: calc(100vh - 200px);
}

.column-header {
  padding: 1.25rem 1.25rem 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.column-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.column-title-input {
  font-weight: 600;
  font-size: 1rem;
  color: #1e293b;
  border: none;
  background: transparent;
  padding: 0.5rem;
  border-radius: 6px;
  flex: 1;
  transition: all 0.2s;

  &:focus, &.editing {
    background: #f8fafc;
    border: 1px solid #3b82f6;
    outline: none;
  }

  &:not(:focus):not(.editing) {
    border: 1px solid transparent;
  }
}

.column-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-count-badge {
  background: #f1f5f9;
  color: #64748b;
  font-weight: 600;
}

.delete-column-btn {
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.cards-container {
  padding: 0 1.25rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  max-height: calc(100vh - 300px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
}

.add-card-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;

  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    color: #3b82f6;
  }

  i {
    font-size: 0.875rem;
  }
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: #c7d2fe;
    box-shadow: 
      0 8px 25px rgba(59, 130, 246, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(145deg, #ffffff 0%, #fafbff 100%);

    &::before {
      opacity: 1;
    }

    .card-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.dragging {
    opacity: 0.9;
    transform: rotate(3deg) scale(1.05);
    box-shadow: 
      0 12px 32px rgba(59, 130, 246, 0.3),
      0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.card-priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(45deg, #10b981, #059669);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  flex-shrink: 0;
}

.card-id {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  background: rgba(100, 116, 139, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
}

.card-main-content {
  margin-bottom: 1rem;
}

.card-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-description {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-weight: 400;
}

.card-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.card-tag {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
  border: 1px solid rgba(229, 231, 235, 0.5);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    transform: translateY(-1px);
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;

  i {
    color: #94a3b8;
    opacity: 0.8;
  }
}

.card-time {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.edit-card-btn, .delete-card-btn {
  width: 32px;
  height: 32px;
  opacity: 0.8;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

.edit-card-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);

  &:hover {
    background: rgba(59, 130, 246, 0.15);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
}

.delete-card-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);

  &:hover {
    background: rgba(239, 68, 68, 0.15);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
}

// Modal Styles
.card-modal {
  :deep(.p-dialog) {
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }

  :deep(.p-dialog-header) {
    background: #f8fafc;
    border-radius: 16px 16px 0 0;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
  }
}

.card-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }
}

.card-input, .card-textarea {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.delete-modal {
  :deep(.p-dialog-header) {
    background: #fef2f2;
    border-bottom: 1px solid #fecaca;
    color: #dc2626;
  }
}

.delete-modal-content {
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
  .kanban-column {
    min-width: 280px;
    max-width: 280px;
  }

  .column-header {
    padding: 1rem;
  }

  .cards-container {
    padding: 0 1rem 1rem 1rem;
  }
}
</style> 