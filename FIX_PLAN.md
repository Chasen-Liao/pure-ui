# pure-ui 修复计划

> 基于本机 Pi `0.85.1` / `@earendil-works/pi-tui` `0.85.1` 的兼容性检查结果。
> 本文只记录本轮批准范围及延期项，不代表延期项已经完成。

## 目标与约束

- 折叠工具调用、相邻分组、`Ctrl+O` 原生渲染、思考标签和 `/toggle-info` 的现有 TUI 行为保持不变。
- 不修改工具参数、工具结果、provider 内容或会话消息，不改变视觉/产品行为。
- Pi 不支持私有字段或方法时继续安全回退到原生渲染。
- 当前验证基线：pure-ui `0.3.1`、Pi `0.85.1`、Node `>=20`。

## 本轮实施范围

### F1：修复 npm 包检查清单

`npm pack --dry-run` 会自动包含 `README.en.md`。发布检查脚本的 expected 列表必须包含该文件；除此之外不把 `test/`、`scripts/` 或本计划加入发布包。

验收：`npm run package:check` 与 `npm pack --dry-run` 的清单一致。

### F2：建立最小可重复测试入口

增加 `npm test`（运行 `vitest run test`）、Vitest、TypeScript、Node 类型和当前 Pi `0.85.1` 测试依赖，并提交 lockfile，使干净环境可以用 `npm ci` 验证。此处不做完整 CI 或版本矩阵。

验收：`npm ci`、`npm test`、`npm run package:check` 成功。

### F3/F4：修复 session_start 的重复 UI 操作及模式保护

只保留一个 `session_start` handler，并在读取 `ctx.ui` 前检查 `ctx.mode === "tui"`。组件 prototype 的现有 feature detection、安装和恢复路径不在本轮重构；非 TUI session 不应触发 TUI 主题或展开状态操作。

验收：TUI 只设置一次主题和展开状态；rpc/print/json 等无 UI 上下文的 session 不抛错。

### F6：合并所有非空 text result block

`resultText()` 收集所有 `type === "text"` 且为字符串的 block，丢弃空白 block，对剩余 block 做边界 trim 后用一个换行连接；没有可用 block 时保留 `getTextOutput()` fallback。补充多文本、空文本、错误摘要及 text+image 回归测试。

验收：摘要和行数包含所有非空文本；image-only 与 text+image 仍使用现有图片路径。

## 延期项

以下项目不属于本轮，不应在 F1/F2/F3/F4/F6 中顺手实现：

- **F5：全局 chat hook 生命周期及完整 wrapper 卸载。** 包括 `globalThis` hook owner/generation 管理、完整 prototype wrapper 卸载和 reload 生命周期重构；本轮仅保留已有 shutdown 恢复路径。
- **F7：Pi 私有 API 兼容性 smoke test 及最低版本/当前版本/nightly 矩阵。**
- **F8：README、README.en.md 与 CHANGELOG 的配置历史和 release note 全量同步。**

视觉设计、默认分组策略、新工具类型/MCP action 识别、会话数据和历史消息均保持现状，另行处理。

## 完成命令

```bash
npm ci
npm test
npm run package:check
npm pack --dry-run
```
