<!--
  聊天入口：直接渲染 OrbitChat
  OrbitChat 内部已有 Welcome 组件处理无会话空态
-->
<script setup lang="ts">
import OrbitChat from '@/pages/chat/layouts/OrbitChat/index.vue';
</script>

<template>
  <div class="chat-container">
    <OrbitChat />
  </div>
</template>

<style lang="scss" scoped>
.chat-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>