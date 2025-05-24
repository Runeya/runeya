<template>
  <div class="dashboard-layout">
    <div class="dashboard-header">
      <div class="logo">
        <span class="app-name">Runeya</span>
      </div>
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>
    <div class="dashboard-content">
      <DashboardSidebar />
      <main class="main-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import DashboardSidebar from './DashboardSidebar.vue';

export default defineComponent({
  name: 'DashboardLayout',
  components: {
    DashboardSidebar
  }
});
</script>

<style lang="scss" scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.dashboard-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: var(--surface-a);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .logo {
    display: flex;
    align-items: center;

    .app-name {
      font-size: 1.5rem;
      font-weight: 600;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;

  .main-content {
    flex: 1;
    overflow: auto;
    padding: 20px;
  }
}
</style> 