<template>
  <div class="dashboard-card">
    <div v-if="title || $slots.header" class="card-header">
      <div class="card-header-content">
        <slot name="header">
          <h2 class="card-title">{{ title }}</h2>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="card-content" :class="{ 'no-header': !title && !$slots.header }">
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin loading-icon"></i>
        <span class="loading-text">{{ loadingText || $t('common.loading') || 'Loading...' }}</span>
      </div>
      
      <div v-else-if="isEmpty && $slots.empty" class="empty-state">
        <slot name="empty"></slot>
      </div>
      
      <div v-else-if="isEmpty" class="empty-state">
        <i v-if="emptyIcon" :class="`fas ${emptyIcon} empty-icon`"></i>
        <h3 v-if="emptyTitle" class="empty-title">{{ emptyTitle }}</h3>
        <p v-if="emptyDescription" class="empty-description">{{ emptyDescription }}</p>
        <slot name="empty-actions"></slot>
      </div>
      
      <div v-else class="card-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'DashboardCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: ''
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    emptyIcon: {
      type: String,
      default: ''
    },
    emptyTitle: {
      type: String,
      default: ''
    },
    emptyDescription: {
      type: String,
      default: ''
    }
  },
  setup() {
    const { t } = useI18n();
    
    return {
      t
    };
  }
});
</script>

<style lang="scss" scoped>
.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  
  .card-header-content {
    flex: 1;
    min-width: 0;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: #374151;
    line-height: 1.4;
  }
  
  .card-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
  }
  
  .card-actions {
    margin-left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
}

.card-content {
  padding: 1.5rem;
  
  &.no-header {
    padding-top: 1.5rem;
  }
}

.card-body {
  min-height: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
  
  .loading-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #9ca3af;
  }
  
  .loading-text {
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  
  .empty-icon {
    font-size: 3rem;
    color: #9ca3af;
    margin-bottom: 1rem;
  }
  
  .empty-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
  }
  
  .empty-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0 0 1.5rem 0;
    max-width: 400px;
    line-height: 1.5;
  }
}

// Responsive design
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    
    .card-actions {
      margin-left: 0;
      justify-content: flex-end;
    }
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .loading-state,
  .empty-state {
    padding: 2rem 1rem;
    
    .empty-icon {
      font-size: 2.5rem;
    }
  }
}
</style> 