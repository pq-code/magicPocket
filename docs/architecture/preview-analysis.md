# 低代码「预览」卡死分析与可选方案

> 仅做问题分析与方案讨论，不涉及具体代码修改。

## 一、当前预览流程简述

1. **编辑页点击「预览」**（`draggingDraggingHead.jsx`）
   - 对 `pageJSON.value` 做一次 `JSON.parse(JSON.stringify(...))` 深拷贝
   - 将序列化后的字符串写入 `localStorage`（key: `lowcode_preview_page`）
   - 同窗口内 `router.push({ name: 'lowCodePreview' })`

2. **预览页**（`lowCodePreview.vue`）
   - `onMounted` 里从 `localStorage` 读取字符串 → `JSON.parse` → 赋给 `pageJSON.value`
   - 执行 `applyPageCss(page)`、`runPageScript(page)`
   - `nextTick` 后设 `hasData = true`，模板渲染 `<RenderEngine />`

3. **渲染**
   - 与编辑页**共用同一套** Pinia store（`pageJSON`）和**同一套** `RenderEngine`（同一棵组件树：ComponentMaker、TypeRenderEngine、DlockContainer、Form 等）
   - 仅通过 `provide('lowcodePreviewMode', true)` 关闭拖拽/选中态

---

## 二、卡死可能原因（为何难根治）

1. **主线程在路由切换时集中做太多事**
   - 深拷贝 + 两次大 JSON 序列化/反序列化（写 localStorage、读 localStorage）
   - 整棵 page 树替换 store → 触发大量响应式更新
   - 执行用户页面脚本 `runPageScript`（若脚本里有死循环或重计算，会直接卡死）
   - 紧接着同一帧内渲染整棵低代码树（递归、大量组件实例、Vue 的 diff/挂载）
   - 以上若都在主线程同步执行，页面会长时间无响应，表现为「点击预览就卡死」

2. **与编辑页共用同一 Vue 应用**
   - 路由从编辑切到预览时，编辑页组件卸载、预览页挂载，但仍是**同一个应用、同一 store**
   - 若编辑页存在对 `pageJSON` 的 watch 或依赖，在替换 `pageJSON.value` 时可能仍会触发，加重负担
   - 预览页使用的 RenderEngine / 组件树与编辑页完全一致，没有「轻量预览专用」路径，无法从架构上减负

3. **预览页没有做「隔离」与「降级」**
   - 没有 iframe / 新窗口隔离，也没有「仅渲染、不跑编辑态逻辑」的独立运行时
   - 大页面 + 复杂表单时，单次渲染成本高，且与编辑页共享同一运行时环境

因此，若只在当前架构上做小修小补（例如 debounce、nextTick 拆分），往往治标不治本；要明显缓解，通常需要从「预览运行环境」和「数据传递方式」上做取舍。

---

## 三、可选方案（不改代码，仅作方向参考）

### 方案 A：iframe 预览（隔离运行环境）

- **思路**：编辑页不跳转，在当前页内弹出 iframe；iframe 的 src 指向一个**仅做预览**的独立页面（或通过 `srcdoc` / blob URL 内联 HTML+脚本）。预览所需 schema 通过 `postMessage` 或 URL 参数传入。
- **优点**：预览与编辑完全隔离，预览卡死或崩溃不影响编辑；可单独对传入 iframe 的 schema 做精简或校验。
- **缺点**：需维护「仅渲染」的入口或独立构建；大 schema 用 postMessage 更合适，URL 有长度限制；与主应用通信需约定协议。

### 方案 B：新窗口预览

- **思路**：`window.open` 打开新窗口，新窗口只加载「预览应用」或同一应用但仅挂载预览路由；数据通过 `postMessage` 或 localStorage 传递。
- **优点**：与编辑页进程/线程分离，至少编辑页不会因预览渲染而卡死。
- **缺点**：新窗口内若仍用当前同一套 RenderEngine 渲染大页面，新窗口本身仍可能卡；需处理跨窗口通信与生命周期。

### 方案 C：使用第三方「仅渲染」低代码运行时

- **思路**：将当前 pageJSON 转成某一套通用或开源低代码协议，在预览环境里**只跑该协议的渲染器**，不再跑编辑态那套 RenderEngine。

  - **阿里 lowcode-engine 渲染器**  
    - 协议：`projectSchema.componentsTree` + `componentsMap` 等（[搭建协议规范](https://lowcode-engine.cn/site/docs/specs/lowcode-spec)）。  
    - 有 [@alilc/lowcode-react-renderer](https://github.com/alilc/lowcode-react-renderer)（React），渲染器为「纯展示」设计，不包含设计器逻辑。  
    - 需要：把 MagicPocket 的 pageJSON 转成阿里协议；预览用 React 渲染器（或在 Vue 里嵌 iframe 跑 React 预览页）。

  - **amis**（百度）  
    - JSON 配置驱动，有现成渲染器；协议与当前 page 树不同，需做 schema 映射。

  - **其他 H5/低代码开源**  
    - 若有「仅渲染、无设计器」的轻量运行时，且协议可映射，也可考虑：预览只跑该运行时（独立 tab/iframe），编辑仍用现有 Vue 方案。

- **优点**：预览路径轻、职责单一，渲染器针对「展示」优化，稳定性更好。
- **缺点**：需做协议转换与维护；若用 React 渲染器，存在技术栈差异（Vue 主应用 + React 预览或 iframe）。

### 方案 D：预览页「轻量渲染」或出码

- **思路**：预览不直接跑完整 RenderEngine，而是：
  - 要么在服务端/构建时把 pageJSON 转成「静态 HTML」或「简化 Vue 描述」，预览页只渲染这份结果（如 v-html 或预编译轻量组件）；
  - 要么走「出码」：根据 pageJSON 生成一段最小可运行的前端代码，预览时只执行这段代码（例如在 iframe 或新窗口）。
- **优点**：预览可做到非常轻，不依赖设计器那套组件树。
- **缺点**：需要出码或序列化管线，工作量大；要处理动态表单、脚本等与当前能力的对应关系。

### 方案 E：当前架构下的缓解措施（仍可能有限）

- **延迟渲染**：预览页先只显示 loading，用 `requestIdleCallback` 或 `setTimeout` 在下一帧/空闲时再赋 `pageJSON` 并设 `hasData = true`，避免与路由切换、脚本执行挤在同一帧。
- **Worker 预处理**：将 `JSON.parse`、深拷贝、甚至部分「准备渲染数据」放到 Web Worker，减轻主线程；渲染本身仍在主线程，若卡在 Vue 渲染/响应式，收益有限。
- **虚拟化/懒加载**：若树很大，可考虑首屏只渲染可见区域或按需挂载子节点；对单次渲染成本有一定缓解，但不解决脚本或 store 替换带来的卡顿。

---

## 四、小结与建议

- **卡死**大概率来自：同窗口路由切换 + 大 JSON 读写与解析 + 整树替换 store + 执行用户脚本 + 同一套重型 RenderEngine 一次性渲染，主线程被占满。
- **根本缓解**往往需要：**隔离预览环境**（iframe / 新窗口）和/或 **换用/增加「仅渲染」的轻量运行时**（如阿里 lowcode-engine 的渲染器），而不是只在当前预览页里调参。
- 若希望**先少改代码、先验证**：可优先尝试 **iframe 预览**（编辑页写 schema 到 postMessage，iframe 内独立页面只负责接收并渲染），或 **新窗口预览**（数据仍可走 localStorage，但渲染在另一窗口）；再视效果考虑是否引入第三方渲染器或出码。

以上为分析与方向性讨论，具体实现需按项目排期与技术栈再定。
