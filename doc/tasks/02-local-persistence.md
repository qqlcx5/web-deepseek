# M02 本地持久化与迁移

## 模块目标

将规范化 `AppData` 保存到 IndexedDB，并保证连续更新不会覆盖新状态。旧根结构在读取时迁移或丢弃，不再进入新记录。

## 子任务

- [x] 建立 Orbit 专用 IndexedDB 记录。
  - 输入：`AppData` 和数据库配置。
  - 输出：`orbit-chat/appData/main` 单记录读写 API。
  - 完成判定：首次打开自动建库；保存、读取、清空均由单独函数完成。

- [x] 实现保存队列和防抖。
  - 输入：连续的 Provider、Topic、Message、Settings 变更。
  - 输出：200ms 内变更合并为一次串行写入。
  - 完成判定：写入失败可见；后一次快照不会被先完成的旧写入覆盖。

- [x] 实现 AppData 版本归一化。
  - 输入：空记录、旧版本记录、缺失字段记录。
  - 输出：符合当前版本的 `AppData`，带完整 Settings 默认值与唯一默认 Assistant。
  - 完成判定：未知根字段不被再次保存；无效 Topic 回退到默认 Assistant。

- [x] 连接和错误处理。
  - 输入：数据库升级、读取失败、写入失败。
  - 输出：连接关闭恢复逻辑和用户可读取的保存失败状态。
  - 完成判定：页面不会因 IndexedDB 异常无法加载；顶栏可显示保存中和失败。

## 验收

- [x] 刷新后 Provider、Assistant、Topic、Message、Settings 全部恢复。
- [x] 连续 20 次更新后最后一条 Message 未丢失。
- [x] `npm run type-check` 通过。
