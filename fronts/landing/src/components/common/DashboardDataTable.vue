<template>
  <DataTable 
    v-bind="$attrs"
    :value="value"
    stripedRows
    responsiveLayout="scroll"
    class="dashboard-data-table"
    :dataKey="dataKey || 'id'"
    :paginator="enablePagination && (value?.length || 0) > rowsPerPage"
    :rows="rowsPerPage"
    :rowsPerPageOptions="rowsPerPageOptions"
    :paginatorTemplate="paginatorTemplate"
    :sortMode="sortMode"
    :loading="loading"
  >
    <slot></slot>
  </DataTable>
</template>

<script>
import { defineComponent } from 'vue';
import DataTable from 'primevue/datatable';

export default defineComponent({
  name: 'DashboardDataTable',
  components: {
    DataTable
  },
  inheritAttrs: false,
  props: {
    value: {
      type: Array,
      default: () => []
    },
    dataKey: {
      type: String,
      default: 'id'
    },
    loading: {
      type: Boolean,
      default: false
    },
    enablePagination: {
      type: Boolean,
      default: true
    },
    rowsPerPage: {
      type: Number,
      default: 10
    },
    rowsPerPageOptions: {
      type: Array,
      default: () => [5, 10, 20, 50]
    },
    paginatorTemplate: {
      type: String,
      default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
    },
    sortMode: {
      type: String,
      default: 'multiple'
    }
  }
});
</script>

<style lang="scss" scoped>
.dashboard-data-table {
  width: 100%;
  
  :deep(.p-datatable-thead) {
    th {
      font-weight: 600;
      background-color: var(--surface-c);
      border-bottom: 2px solid var(--surface-d);
      padding: 1rem;
      
      .p-column-header-content {
        font-weight: 600;
        color: var(--text-color);
      }
      
      .p-sortable-column:hover {
        background-color: var(--surface-hover);
      }
      
      .p-sortable-column-icon {
        color: var(--text-color-secondary);
      }
    }
  }
  
  :deep(.p-datatable-tbody) {
    tr {
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--surface-hover);
      }
      
      td {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--surface-d);
        vertical-align: middle;
      }
      
      &:last-child td {
        border-bottom: none;
      }
    }
  }
  
  :deep(.p-datatable-emptymessage) {
    td {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-color-secondary);
      font-style: italic;
    }
  }
  
  :deep(.p-paginator) {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--surface-d);
    background-color: var(--surface-a);
    
    .p-paginator-pages {
      .p-paginator-page {
        min-width: 2.5rem;
        height: 2.5rem;
        
        &.p-paginator-page-selected {
          background-color: var(--primary-color);
          color: var(--primary-color-text);
        }
      }
    }
    
    .p-dropdown {
      border: 1px solid var(--surface-d);
    }
  }
  
  :deep(.p-datatable-loading-overlay) {
    background-color: rgba(255, 255, 255, 0.8);
    
    .p-datatable-loading-icon {
      font-size: 2rem;
      color: var(--primary-color);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .dashboard-data-table {
    :deep(.p-datatable-thead) th {
      padding: 0.75rem 0.5rem;
      font-size: 0.875rem;
    }
    
    :deep(.p-datatable-tbody) td {
      padding: 0.75rem 0.5rem;
      font-size: 0.875rem;
    }
    
    :deep(.p-paginator) {
      padding: 0.5rem;
      
      .p-paginator-pages .p-paginator-page {
        min-width: 2rem;
        height: 2rem;
        font-size: 0.875rem;
      }
    }
  }
}
</style> 