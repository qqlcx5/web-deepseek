<script setup lang="ts">
import { Welcome, Prompts } from 'vue-element-plus-x'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const emit = defineEmits<{ promptClick: [text: string] }>()

const promptItems = [
  { key: 'doc', label: '整理文档', description: '把零散内容整理成清晰的结构和行动计划' },
  { key: 'brainstorm', label: '头脑风暴', description: '围绕一个目标生成多个可执行的想法' },
  { key: 'code', label: '解释代码', description: '逐步解释代码逻辑，并指出潜在问题' },
  { key: 'translate', label: '翻译文本', description: '保持原意和语气，翻译成自然的中文' },
]

function onItemClick(item: any) {
  emit('promptClick', item.description)
}
</script>

<template>
  <div class="welcome-wrap">
    <Welcome
      :icon="undefined"
      title="今天想聊点什么？"
      description="本地优先 · 多 Provider · 数据自主可控"
    >
      <template #icon>
        <div class="welcome-icon">
          <i class="i-tabler-sparkles text-2xl" style="color: #5b56d6" />
        </div>
      </template>
    </Welcome>

    <div class="prompts-section">
      <Prompts
        title="快捷操作"
        :items="promptItems"
        @item-click="onItemClick"
      />
    </div>

    <!-- Assistant regularPhrases -->
    <div v-if="app.activeAssistant?.regularPhrases?.length" class="phrases-section">
      <div class="phrases-title">常用短语</div>
      <div class="phrases-list">
        <button
          v-for="(phrase, idx) in app.activeAssistant.regularPhrases"
          :key="idx"
          class="phrase-chip"
          @click="emit('promptClick', phrase)"
        >
          {{ phrase }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.welcome-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 54vh;
  padding: 32px 16px;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 24px;
  background: #efefff;
  color: #5b56d6;
  margin-bottom: 20px;
}

.prompts-section {
  margin-top: 28px;
  width: 100%;
  max-width: 620px;
}

.phrases-section {
  margin-top: 20px;
  width: 100%;
  max-width: 620px;
}

.phrases-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #667085;
  margin-bottom: 8px;
  text-align: left;
}

.phrases-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.phrase-chip {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 6px 14px;
  font-size: 13px;
  color: #667085;
  transition: all 0.15s;

  &:hover {
    border-color: #5b56d6;
    background: #efefff;
    color: #5b56d6;
  }
}
</style>
