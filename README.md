# pure-ui

[English](README.en.md)

为 Pi 的折叠工具调用提供安静、适配终端宽度的 transcript 外壳，同时通过 `Ctrl+O` 保留原生详情。此包还包含一个仅负责显示的思考块适配器。

### 安装

```fish
pi install git:github.com/Chasen-Liao/pure-ui
```

重启 Pi，或运行 `/reload`。

## 功能变化

折叠后的工具行使用语义化主题色，不显示齿轮、背景填充、盒状内边距或填充空行：

```text
  % Read
    • src/a.ts                         42 lines
    • src/b.ts                         18 lines
```

- **两列外侧缩进。** 工具标记和图片输出与缩进后的对话表面对齐。终端非常窄时会减少装饰，为有效内容留出空间。
- **`%` 工具标题。** 当摘要和结果能够放在一行时，单次调用保持单行显示。多调用组会按连续的工具类型显示一个 `%` 标题。
- **`•` 子项分组。** 只有多调用组的成员会显示项目符号。
- **语义化低对比度状态。** 工具名称突出显示，摘要和已确定的元数据使用柔和颜色，等待状态使用警告色，失败保持错误色。普通工具状态不使用背景色。
- **适配宽度的结果尾部。** 较长的摘要会在 `→ done`、`→ 42 lines`、`→ +2/-1` 或 `bash` 耗时等有用尾部之前截断。
- **稳定的运行中分组。** 相邻调用按出现顺序分组。等待状态和 `bash` 的耗时会在最终结果中稳定下来，不改变行数。
- **安静回合分组。** 如果中间没有可见文本或思考内容，连续调用可以跨 assistant 行合并。可见的 assistant 内容仍然会形成边界。
- **MCP 和自渲染工具。** 它们稳定的调用标签、紧凑参数、等待状态、成功状态和第一行错误会使用相同的折叠外壳。展开后恢复原生自定义详情。
- **图片保持可见。** 图片回退文本和终端图片组件会在对应标记下方使用相同缩进渲染。
- **用户执行的 `!` bash 块。** 执行显示由本扩展负责：用户输入的命令使用带轨道的提示外壳（深色表面、状态色轨道），而不是 Pi 的绿色规则。
- **原生展开仍然权威。** `Ctrl+O` 会恢复 Pi 的完整独立工具渲染，包括完整结果、自定义渲染器和错误详情。

## Subagent 计划

识别出的 `subagent` 调用会以共享工具风格渲染为无边框计划，并使用 `↪` 代替普通的 `%` 工具标记：

```text
  ↪ subagent chain (3 steps) [repo-review]
    1. 🐝 bee [workhorse] Challenge the compatibility conclusion…
    2. 🐝 bee …
```

单次调用保持为一行 `↪ [<emoji>] [<profile>][<agent>] <task preview>`，不显示工具标签；`↪` 标记用于识别它。链式调用会显示包含类型、数量和范围的标题，下面列出编号步骤（并行任务列表不显示编号），每一步依次显示 emoji、profile 徽章和名称徽章。agent 的显示名称（emoji + name）会从原生计划组件中提取（包括单次调用标题），必要时回退到 args，并使用 `accent` 颜色；其他内容保持柔和色，失败的 subagent 使用全红显示。Subagent 不会加入普通工具分组。

Subagent 运行时，计划标题尾部会显示流式结果详情中的实时进度，例如 `→ 1 turn · provider/model`（警告色）；调用结束后保持相同的 `→ N turns · provider/model` 摘要（柔和色）。turn 数会跨任务汇总，只有所有任务使用同一模型时才显示模型名。

格式错误、含义不明确、未来版本或过于窄的形状会回退为通用的 `↪ subagent …` 折叠行，而不会丢失信息；`Ctrl+O` 仍然会暴露原生 subagent 渲染器。

## Edit 差异

已完成的 `edit` 调用无需展开即可看到变更：调用行会增加 `+added/-removed` 结果统计，下面渲染有边界的 diff 块（新增行为 added 色，删除行为 removed 色，上下文使用柔和色，折叠区域显示为 `...`，最多显示 12 行并附带数量尾部）。使用 `Ctrl+O` 仍可查看完整原生 diff，包括行号和行内单词高亮。

折叠行中的文件和路径会保持 Pi 的显示方式：经过清理以适配单行显示时，带超链接的路径（Pi 会为 `read` 调用路径包裹 OSC 8 超链接）仍保留可见文本。

## 范围边界

此包负责 transcript 中的所有**执行行**：折叠工具调用、工具分组、subagent 计划、思考标签，以及用户执行的 `!` bash 块（调整为带轨道的提示外壳）。Transcript 的**表面布局**——消息缩进、系统文本和状态规则对齐、编辑器表面，以及用户消息的已提交提示外壳——仍由 Pi 或其他布局扩展负责。

`!` 块的缩进遵循 Pi 的用户消息表面 token（参见 `src/bash-block.ts`）。如果加载了其他布局扩展，会在可用时使用其共享容器 hook。

## 完全隐藏信息：/toggle-info

默认 transcript 会折叠工具调用和思考内容，`Ctrl+O` / `Ctrl+T` 仍可像往常一样展开。当你只想查看文本时，运行 `/toggle-info` 会完全隐藏工具调用（包括用户执行的 `!` 块）和思考内容；再次运行即可恢复折叠视图。该开关按会话生效：每个会话默认显示信息。

## 内置思考块扩展

第二个包入口 `src/thinking-block-merger.ts` 会在显示副本中只合并直接相邻的 `thinking` 块。工具调用、文本、provider 块、签名和存储的会话消息都不会改变。

当 Pi 提供每行隐藏思考和流式字段时，隐藏的推理会使用这些原生主题标签：

```text
⠋ Thinking…  →  ⠙ Thinking…  →  …
+ Thought · 2.5s
```

实时标签会从 Pi 已经渲染的内容更新中采样原生 braille spinner 序列，不会额外添加计时器。适配器会在 `WeakMap` 中保存每个 assistant 行首次本地流式更新的时间戳。恢复的消息，或不提供流式参数的旧版运行时，会使用 `+ Thought`。可见思考模式仍由原生实现负责。这里没有 interval、timeout、render request、模型调用或网络操作。

## 本地开发

```fish
pi \
  -e ./src/index.ts \
  -e ./src/thinking-block-merger.ts
```

## 配置

默认会对同一 assistant 消息中的调用进行分组。Pi 通常会并行执行这些调用。如果希望同一消息中的调用保持为独立的紧凑行，同时继续跨安静回合分组连续调用：

```fish
set -lx PURE_UI_COLLAPSE_PARALLEL 0
pi
```

`0`、`false`、`no` 和 `off` 会禁用并行分组；`1`、`true`、`yes` 和 `on` 会启用。该值在扩展加载时读取。

### 折叠行颜色

折叠行（工具调用、`+ Thought`、subagent）默认使用主题的 `syntaxComment` 颜色——每个 Pi 主题都会提供该颜色，并且它通常显示为柔和色——加粗的工具名称和调用内容也共享该颜色。失败保持错误色，运行中的 spinner 保持原有色调。

主题可以使用可选颜色 token 分别覆盖每种折叠类型：

```json
{
  "colors": {
    "collapsedToolCall": "#6272a4",
    "collapsedThinkingCall": "#6272a4"
  }
}
```

## 兼容性和回退策略

**兼容的 Pi 版本：** `@earendil-works/pi-coding-agent` 和 `@earendil-works/pi-tui` `>=0.80.6`。

Pi 没有原生工具行、transcript 分组或每条消息隐藏思考标签的公开 hook。因此，本包使用三个小型且受保护的 prototype 适配器：

- `ToolExecutionComponent`：负责折叠显示；
- `Container`：负责相邻分组；
- `AssistantMessageComponent.updateContent`：负责仅用于显示的思考合并和生命周期标签。

每个适配器都会检测所需字段和方法，保留原始方法，使用幂等 symbol，捕获装饰性错误，并在 `session_shutdown` 时仍由自身持有补丁的情况下恢复原始方法。不支持的形状会安全回退到 Pi 的原生渲染。即使私有标签形状不可用，思考适配器仍会继续进行相邻合并。

展开的工具始终使用 Pi 的原生渲染器。折叠工具外壳直接负责两列缩进；transcript 布局扩展应保持工具行不变，以避免因加载顺序导致重复缩进。

> TODO：Pi 提供公开的 transcript 和工具渲染 API 后，迁移这些适配器。

## 设计

- 无运行时依赖。
- 不修改工具参数、工具结果、provider 内容或会话消息。
- 每行缓存分组输出，并在有意义的显示状态变化时失效。
- 无计时器或独立渲染循环。

## 开发

在仓库根目录执行：

```bash
npx vitest run test
npm run package:check
```

检查发布内容：

```bash
npm pack --dry-run
```

## 许可证

MIT
