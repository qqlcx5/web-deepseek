<template>
  <div v-if="usage" class="token-usage-bar">
    <div class="token-usage-bar__header">
      <span class="token-usage-bar__label">Token 用量</span>
      <span
        class="token-usage-bar__count"
        :class="usageClass"
      >
        {{ formattedUsed }} / {{ formattedTotal }} tokens
      </span>
    </div>

    <ElProgress
      :percentage="usage.percentage"
      :color="progressColor"
      :stroke-width="8"
      :show-text="false"
    />

    <div v-if="isWarning" class="token-usage-bar__warning">
      <span class="token-usage-bar__warning-icon">!</span>
      <span>{{ warningText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElProgress } from 'element-plus'
import type { TokenUsage } from '@/types/model'

const props = defineProps<{
  usage: TokenUsage | null
}>()

function formatNumber(n: number): string {
  return n.toLocaleString()
}

const formattedUsed = computed(() => formatNumber(props.usage?.used ?? 0))
const formattedTotal = computed(() => formatNumber(props.usage?.total ?? 0))

const usageClass = computed(() => {
  if (!props.usage) return ''
  const pct = props.usage.percentage
  if (pct > 90) return 'token-usage-bar__count--danger'
  if (pct > 60) return 'token-usage-bar__count--warning'
  return ''
})

const progressColor = computed(() => {
  if (!props.usage) return '#67c23a'
  const pct = props.usage.percentage
  if (pct > 90) return '#f56c6c'
  if (pct > 60) return '#e6a23c'
  return '#67c23a'
})

const isWarning = computed(() => (props.usage?.percentage ?? 0) > 60)

const warningText = computed(() => {
  if (!props.usage) return ''
  const pct = props.usage.percentage
  if (pct > 90) return 'Token 即将耗尽，请及时续费或切换模型'
  if (pct > 60) return 'Token 使用已超过 60%，请注意用量'
  return ''
})
</script>

<style lang="scss" scoped>
.token-usage-bar {
  padding: 8px 0;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  &__label {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  &__count {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--el-text-color-secondary);

    &--warning {
      color: #e6a23c;
    }

    &--danger {
      color: #f56c6c;
    }
  }

  &__warning {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    font-size: 12px;
    color: #e6a23c;
    padding: 4px 8px;
    background: rgba(230, 162, 60, 0.08);
    border-radius: 4px;

    .token-usage-bar__warning-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      background: #e6a23c;
      border-radius: 50%;
      flex-shrink: 0;
    }
  }
}
</style>
