import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ElementPlusX from 'vue-element-plus-x'
import 'vue-element-plus-x/styles/index.css'
import 'virtual:uno.css'
import './styles/chat.css'

import App from './App.vue'
import router from './router'

// Initialize theme before mount
const storedTheme = localStorage.getItem('theme-mode') || 'light'
const isDark = storedTheme === 'dark' || (storedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
if (isDark) document.documentElement.classList.add('dark')

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(ElementPlusX)

app.mount('#app')
