<script setup lang="ts">
import { Thinking } from 'vue-element-plus-x'

type ThinkingStatus = 'start' | 'thinking' | 'end' | 'error' | 'cancel'

interface Props {
  content?: string
  status?: ThinkingStatus
  duration?: string
}

withDefaults(defineProps<Props>(), {
  content: '',
  status: 'end',
  duration: '0.3s',
})
</script>

<template>
  <div class="thinking-chain-wrap">
    <Thinking
      :content="content"
      :status="status"
      :duration="duration"
    />
  </div>
</template>

<style scoped>
.thinking-chain-wrap {
  width: 100%;
}
</style>
