<template>
  <aside class="dashboard-sidebar">
    <div class="sidebar-top">
      <OrganizationSwitcher />
    </div>
    <div class="sidebar-menu">
      <PanelMenu :model="menuItems" multipe class="sidebar-panel-menu" />
    </div>
    <div class="sidebar-bottom">
    </div>
  </aside>
</template>

<script>
import { defineComponent, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import authStore from '../../stores/authStore';
import OrganizationSwitcher from './OrganizationSwitcher.vue';
import PanelMenu from 'primevue/menu';

export default defineComponent({
  name: 'DashboardSidebar',
  components: {
    OrganizationSwitcher,
    PanelMenu
  },
  setup() {
    const user = computed(() => authStore.user.value);
    const router = useRouter();
    const { t } = useI18n();
    
    const menuItems = ref([
      {
        label: t('dashboard.sidebar.organizations') || 'Dashboard',
        icon: 'fas fa-home',
        items: [
          {
            label: t('dashboard.sidebar.organizations') || 'Organizations',
            icon: 'fas fa-building',
            command: () => router.push({name: 'organizations'})
          },
          {
            label: t('dashboard.sidebar.organizationMembers') || 'Organization Members',
            icon: 'fas fa-users',
            command: () => router.push({name: 'organization-members'})
          },
          {
            label: t('dashboard.sidebar.organizationSettings') || 'Organization Settings',
            icon: 'fas fa-cog',
            command: () => router.push({name: 'organization-settings'})
          },
        ]
      },
      {
        label: t('dashboard.sidebar.apiKeys') || 'API Keys',
        icon: 'fas fa-key',
        items: [
          {
            label: t('dashboard.sidebar.manageApiKeys') || 'Manage API Keys',
            icon: 'fas fa-key',
            command: () => router.push({name: 'api-keys'})
          }
        ]
      },
      {
        label: t('dashboard.plugins.title') || 'My Plugins',
        icon: 'fas fa-puzzle-piece',
        items: [
          {
            label: t('dashboard.plugins.yourPlugins') || 'Your Plugins',
            icon: 'fas fa-puzzle-piece',
            command: () => router.push({name: 'my-plugins'})
          }
        ]
      }
    ]);
    
    return {
      user,
      menuItems
    };
  }
});
</script>

<style lang="scss" scoped>
.dashboard-sidebar {
  background-color: var(--surface-b);
  border-right: 1px solid var(--surface-d);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-top {
  padding: 15px;
  border-bottom: 1px solid var(--surface-d);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.sidebar-panel-menu {
  width: 100%;
  
  :deep(.p-panelmenu-header-link) {
    padding: 0.75rem 1.25rem;
    
    .p-menuitem-icon {
      margin-right: 0.75rem;
    }
  }
  
  :deep(.p-menuitem) {
    margin-bottom: 0.25rem;
  }
  
  :deep(.p-panelmenu-header) {
    &.p-highlight {
      .p-panelmenu-header-link {
        background-color: var(--primary-color);
        color: var(--primary-color-text);
        border-color: var(--primary-color);
      }
    }
  }
  
  :deep(.p-menuitem-link-active) {
    background-color: var(--primary-color);
    color: var(--primary-color-text);
    
    .p-menuitem-icon, .p-menuitem-text {
      color: var(--primary-color-text);
    }
  }
}

.sidebar-bottom {
  padding: 15px;
  border-top: 1px solid var(--surface-d);
}

.user-profile {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--surface-c);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
:deep(.p-menu-item-icon) {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 