// ─── Welcome Prompts Configuration ───────────────────────────────────────────
// Preset prompts rendered in WelcomeScreen empty state. Pure data, no state.

import { h } from 'vue'
import { Icon } from '@iconify/vue'
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts'

export const WELCOME_PROMPTS: PromptsItemsProps[] = [
  {
    key: 'code',
    label: '写一段代码',
    description: '让 AI 帮你编写 Python、JavaScript、Go 等语言的脚本',
    icon: h(Icon, { icon: 'tabler:code' }),
  },
  {
    key: 'explain',
    label: '解释概念',
    description: '深入浅出地解释技术名词或复杂概念',
    icon: h(Icon, { icon: 'tabler:bulb' }),
  },
  {
    key: 'summarize',
    label: '总结内容',
    description: '将长文本浓缩为要点摘要',
    icon: h(Icon, { icon: 'tabler:notes' }),
  },
  {
    key: 'translate',
    label: '翻译文字',
    description: '在中文、英文、日文等多种语言间互译',
    icon: h(Icon, { icon: 'tabler:language' }),
  },
]
