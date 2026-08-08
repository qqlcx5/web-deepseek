<script setup lang="ts">
/**
 * HomePage — Landing 首页
 */
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <h1 class="hero__title">Cherry Studio</h1>
      <p class="hero__subtitle">AI 驱动的智能对话平台，让创造更高效</p>
      <div class="hero__actions">
        <el-button type="primary" size="large" @click="router.push('/chat')">开始对话</el-button>
        <el-button size="large" @click="router.push('/login')">登录账户</el-button>
      </div>
    </section>

    <section class="features">
      <div class="features__item">
        <h3>多模型支持</h3>
        <p>接入 GPT、Claude、DeepSeek 等主流大模型，灵活切换</p>
      </div>
      <div class="features__item">
        <h3>智能对话</h3>
        <p>上下文感知、流式响应、Markdown 渲染，自然流畅的对话体验</p>
      </div>
      <div class="features__item">
        <h3>数据安全</h3>
        <p>本地优先架构，API Key 加密存储，保护您的隐私</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

.hero {
  text-align: center;
  padding: 100px 24px 80px;
  background: linear-gradient(135deg, #eff6ff 0%, #f9fafb 100%);

  &__title {
    font-size: 48px;
    font-weight: 800;
    color: var(--color-primary, #3b82f6);
    margin: 0 0 16px;
    letter-spacing: -1px;
  }

  &__subtitle {
    font-size: 18px;
    color: var(--color-text-secondary, #6b7280);
    margin: 0 0 40px;
  }

  &__actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  max-width: 960px;
  margin: -40px auto 80px;
  padding: 0 24px;

  &__item {
    background: var(--color-bg, #fff);
    border: 1px solid var(--color-border-light, #e5e7eb);
    border-radius: 12px;
    padding: 32px 24px;
    text-align: center;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 12px;
    }

    p {
      font-size: 14px;
      color: var(--color-text-secondary, #6b7280);
      margin: 0;
      line-height: 1.6;
    }
  }
}

@media (max-width: 768px) {
  .hero__title {
    font-size: 32px;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
