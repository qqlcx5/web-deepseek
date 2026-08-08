<template>
  <div class="about-settings">
    <h2 class="section-title">关于</h2>

    <div class="about-card">
      <div class="about-logo">Cherry Studio Web</div>
      <p class="about-desc">AI 驱动的智能对话平台</p>

      <div class="about-info">
        <div class="info-row">
          <span class="info-label">版本</span>
          <span class="info-value">{{ versionText }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">构建日期</span>
          <span class="info-value">{{ buildDate }}</span>
        </div>
      </div>

      <div class="about-links">
        <el-link type="primary" :href="changelogUrl" target="_blank">更新日志</el-link>
        <el-link type="primary" href="https://github.com" target="_blank">反馈与建议</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAppVersion } from '@/api/settings'

const versionText = ref('--')
const buildDate = ref('--')
const changelogUrl = ref('#')

onMounted(async () => {
  try {
    const res = await fetchAppVersion()
    if (res?.data) {
      versionText.value = res.data.version ?? '--'
      buildDate.value = res.data.buildDate ?? '--'
      changelogUrl.value = res.data.changelogUrl ?? '#'
    }
  } catch {
    versionText.value = '开发版'
    buildDate.value = '--'
  }
})
</script>

<style scoped lang="scss">
.about-settings {
  max-width: 600px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--text-primary, #111827);
}

.about-card {
  padding: 32px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  text-align: center;
}

.about-logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary, #3b82f6);
  margin-bottom: 8px;
}

.about-desc {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 24px;
}

.about-info {
  text-align: left;
  max-width: 300px;
  margin: 0 auto 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--border-color, #f3f4f6);

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  color: var(--text-muted, #9ca3af);
}

.info-value {
  color: var(--text-primary, #111827);
}

.about-links {
  display: flex;
  justify-content: center;
  gap: 24px;
}
</style>
