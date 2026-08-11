# 18 - 语音输入

> 需求来源：§3 F-10  
> 优先级：P2  
> 目标：useRecord hook 实现浏览器语音转文字

## 任务清单

### 18.1 useRecord 集成

- [ ] 创建 `src/composables/useVoiceInput.ts`
- [ ] 使用 useRecord hook
- [ ] `start()` / `stop()` 控制录音
- [ ] `loading` 状态响应式
- [ ] `value` 实时识别文本

### 18.2 浏览器 API 适配

- [ ] 使用 Web Speech API（SpeechRecognition）
- [ ] 检测浏览器支持情况
- [ ] 不支持时隐藏语音按钮并提示

### 18.3 XSender 集成

- [ ] 在 XSender 的 `#action-list` 插槽添加语音按钮
- [ ] 点击开始录音，再次点击停止
- [ ] 录音中显示动画/波形
- [ ] 识别结果实时填入输入框

### 18.4 语言设置

- [ ] 识别语言跟随 `settings.language`（zh-CN / en-US）
- [ ] 或跟随 `settings.targetLanguage`

### 18.5 错误处理

- [ ] 麦克风权限被拒绝：提示用户授权
- [ ] 识别失败：显示错误信息
- [ ] 网络错误（部分浏览器需要在线识别）：提示

## 验收

- 语音按钮在支持的浏览器中显示
- 点击开始录音，实时识别文字填入输入框
- 不支持的浏览器隐藏按钮
- 权限拒绝时有明确提示
