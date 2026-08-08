<script setup lang="ts">
/**
 * LoginPage — 登录页（AuthLayout 子路由）
 */
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const loading = ref(false)

function handleLogin() {
  loading.value = true
  // 登录逻辑由 auth store 处理（后续模块）
  setTimeout(() => {
    loading.value = false
  }, 1500)
}
</script>

<template>
  <el-form @submit.prevent="handleLogin">
    <el-form-item>
      <el-input v-model="email" placeholder="邮箱地址" size="large" />
    </el-form-item>
    <el-form-item>
      <el-input v-model="password" type="password" placeholder="密码" size="large" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="large" :loading="loading" native-type="submit" style="width: 100%">
        登录
      </el-button>
    </el-form-item>
  </el-form>

  <div class="login-page__footer">
    <span>还没有账户？</span>
    <el-link type="primary">立即注册</el-link>
  </div>
</template>

<style scoped lang="scss">
.login-page__footer {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted, #9ca3af);
  margin-top: 8px;

  span {
    margin-right: 4px;
  }
}
</style>
