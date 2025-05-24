<template>
  <div class="dashboard-page">
    <div class="page-header" v-if="title || $slots.header">
      <div class="page-header-content">
        <slot name="header">
          <h1 class="page-title">{{ title }}</h1>
          <p v-if="description" class="page-description">{{ description }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DashboardPageLayout',
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  }
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  .page-header-content {
    flex: 1;
    min-width: 0;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
  }
  
  .page-description {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }
  
  .page-actions {
    margin-left: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// Responsive design
@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    
    .page-title {
      font-size: 1.75rem;
    }
    
    .page-actions {
      margin-left: 0;
      justify-content: flex-end;
    }
  }
  
  .page-content {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-page {
    padding: 0.75rem;
  }
  
  .page-header {
    margin-bottom: 1rem;
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .page-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
  }
}
</style> 