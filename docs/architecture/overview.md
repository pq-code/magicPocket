# 架构概览

## 整体架构

MagicPocket 低代码平台采用分层架构设计，主要包括以下几个层次：

```
┌─────────────────┐
│   AI 层         │ ← AI 理解、推荐、辅助
├─────────────────┤
│   应用层        │ ← 用户界面、操作逻辑
├─────────────────┤
│   渲染层        │ ← 渲染引擎、组件管理
├─────────────────┤
│   数据层        │ ← JSON 协议、状态管理
├─────────────────┤
│   组件库层      │ ← 标准化组件、第三方库
└─────────────────┘
```

## 核心模块

### 1. 渲染引擎 (RenderEngine)
- **位置**: `/src/renderer/src/internal/RenderEngine/`
- **职责**: 根据 JSON 配置渲染真实 UI 组件树
- **特点**:
  - 响应式数据驱动
  - 可插拔架构
  - 支持编辑模式和预览模式

### 2. 类型渲染引擎 (TypeRenderEngine)
- **位置**: `/src/renderer/src/internal/RenderEngine/components/TypeRenderEngine.jsx`
- **职责**: 根据节点类型动态解析和加载组件
- **特点**:
  - 纯 meta 驱动
  - 支持多种组件来源 (local/npm/remote/localFs)
  - 与组件库、编辑器解耦

### 3. 状态管理 (Pinia Store)
- **位置**: `/src/renderer/src/stores/draggingDragging/useDraggingDraggingStore.ts`
- **职责**: 管理页面 JSON 数据、操作对象、历史记录等
- **特点**:
  - 集中化状态管理
  - 支持撤销/重做操作
  - 响应式数据绑定

### 4. 画布操作 (Canvas Operation)
- **位置**: `/src/renderer/src/views/draggingDragging/hooks/useCanvasOperation.ts`
- **职责**: 提供拖拽、历史记录、快捷键等功能
- **特点**:
  - 集中化操作逻辑
  - 支持快捷键操作
  - 历史记录管理

## 数据流

```
用户操作 → Canvas Operation → Store 更新 → JSON 变化 → RenderEngine → UI 渲染
```

## 关键协议

### 页面数据：一套 Schema 多用途

画布、控制器、保存、预览、历史、JSON 弹窗均使用 store 中的**同一份 pageJSON**，不在渲染或保存路径做「编辑→渲染」转换。与宜搭等平台一致；若需「导出/运行时」精简版，可单独在导出链路使用 `transformToRenderJSON`。详见 [protocol.md](./protocol.md#与宜搭--其他低代码平台的对比)。

### JSON 协议结构
```typescript
interface PageRoot {
  type: 'page';                    // 固定为 'page'
  title: string;                   // 页面标题
  whetherYouCanDrag: boolean;      // 是否允许画布拖拽排序
  props: Record<string, unknown>;  // 根节点配置
  children: CanvasNode[];          // 画布顶层节点列表
  script?: string;                 // 页面脚本
  css?: string;                    // 页面样式
}

interface CanvasNode {
  type: string;                    // 组件类型
  key?: string;                    // 实例唯一 id
  componentName: string;          // 中文展示名
  props: Record<string, unknown>;  // 当前实例的配置
  children: CanvasNode[];          // 子节点数组
  npm?: NodeNpmInfo;              // 外部包信息
}
```

## 设计原则

1. **分离关注点**: 编辑和渲染逻辑分离
2. **响应式**: 基于 Vue 3 的响应式系统
3. **可扩展**: 支持自定义组件和插件
4. **高性能**: 优化渲染和状态更新
5. **AI 友好**: 清晰的语义化结构