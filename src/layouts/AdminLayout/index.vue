<script setup lang="ts">
/**
 * AdminLayout — 管理端布局
 *
 * 结构：AdminSidebar + <router-view />
 */
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-layout__sidebar">
      <div class="admin-layout__sidebar-header">
        <h2 class="admin-layout__logo">管理后台</h2>
      </div>
      <nav class="admin-layout__nav">
        <router-link to="/admin" class="admin-layout__nav-item" exact-active-class="admin-layout__nav-item--active">
          概览
        </router-link>
        <router-link to="/admin/users" class="admin-layout__nav-item" active-class="admin-layout__nav-item--active">
          用户管理
        </router-link>
        <router-link to="/admin/models" class="admin-layout__nav-item" active-class="admin-layout__nav-item--active">
          模型管理
        </router-link>
        <router-link to="/admin/logs" class="admin-layout__nav-item" active-class="admin-layout__nav-item--active">
          操作日志
        </router-link>
      </nav>
      <div class="admin-layout__sidebar-footer">
        <router-link to="/chat" class="admin-layout__back-link">返回应用</router-link>
      </div>
    </aside>

    <main class="admin-layout__main">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg, #fff);
}

.admin-layout__sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-bg-secondary, #1f2937);
  color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-layout__sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-layout__logo {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.admin-layout__nav {
  flex: 1;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-layout__nav-item {
  padding: 10px 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  &--active {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-weight: 600;
  }
}

.admin-layout__sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-layout__back-link {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;

  &:hover {
    color: #fff;
  }
}

.admin-layout__main {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}
</style>
