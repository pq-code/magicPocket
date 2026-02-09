# MagicPocket 低代码平台 - 技术架构说明

## 项目概述
MagicPocket 是一个基于 Electron + Vue3 + TypeScript 的桌面端低代码平台，旨在让用户通过拖拽方式快速搭建页面。

## 整体架构

```
src/
├── main/                 # Electron 主进程代码
│   └── ...
├── preload/              # 预加载脚本，连接渲染进程和主进程
│   └── ...
├── renderer/             # Vue 渲染进程代码
│   ├── assets/           # 静态资源
│   ├── components/       # 通用业务组件
│   ├── internal/         # 核心低代码功能组件
│   │   ├── CodeEditor/   # 代码编辑器（Monaco Editor）
│   │   ├── ControlPanel/ # 属性控制面板
│   │   ├── CreateCode/   # 代码生成器
│   │   ├── PageContainer/# 页面容器
│   │   ├── RenderEngine/ # 渲染引擎
│   │   └── CodeHighlight/# 代码高亮组件
│   ├── packages/         # 物料组件库
│   │   ├── DlockContainer/ # 通用容器组件
│   │   ├── Form/         # 表单组件
│   │   ├── Table/        # 表格组件
│   │   ├── El*/          # Element Plus 二次封装组件
│   │   └── material.ts   # 物料统一导出
│   ├── stores/           # Pinia 状态管理
│   ├── type/             # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图组件
│   │   └── draggingDragging/ # 低代码主界面
│   │       ├── components/    # 主界面组件
│   │       └── hooks/         # 主界面相关 hooks
│   └── main.ts           # Vue 入口
└── ...
```

## 核心功能模块

### 1. 渲染引擎 (RenderEngine)
- **功能**：将页面 JSON 配置转换为真实 UI
- **架构**：组件树递归渲染 + 拖拽支持
- **关键技术**：Vue3、vue-draggable-plus、深度优先遍历算法

### 2. 属性控制面板 (ControlPanel)
- **功能**：根据选中组件动态生成属性编辑界面
- **架构**：meta 描述驱动 + 动态表单渲染
- **关键技术**：Element Plus、响应式编程

### 3. 组件物料库 (Packages)
- **功能**：提供可拖拽的组件库
- **架构**：组件 + meta 描述协议
- **设计原则**：组件与配置分离，易于扩展

### 4. 状态管理 (Pinia)
- **功能**：管理页面数据、当前选中对象、操作历史
- **核心 store**：useDraggingDraggingStore

### 5. 代码生成器 (CreateCode)
- **功能**：将低代码配置转换为实际的前端代码
- **技术栈**：AST 解析、模板引擎

## 关键数据流

### 页面渲染流程
1. 用户拖拽组件到画布
2. 组件 JSON 配置添加到页面数据结构
3. RenderEngine 监听到数据变化
4. 深度遍历 JSON，递归渲染组件树
5. Vue 虚拟 DOM 更新，UI 展现

### 属性编辑流程
1. 用户在画布上点击组件
2. currentOperatingObject 状态更新
3. ControlPanel 监听到选中对象变化
4. 根据组件 meta 描述动态生成属性表单
5. 用户修改属性值，JSON 数据结构同步更新
6. 渲染引擎检测到数据变化，重新渲染

## 核心配置协议

### 组件 Meta 描述协议
```typescript
interface ComponentMeta {
  componentName: string;  // 组件名称
  type: string;           // 组件类型
  icon: string;           // 图标
  group: string;          // 所属分组
  props: {                // 属性配置
    [groupName]: {
      title: string;
      children: PropConfig[];
      style: object;
    }
  }
}
```

### 页面 JSON 协议
```typescript
interface PageNode {
  type: string;           // 组件类型
  key: string;            // 组件唯一标识
  children: PageNode[];   // 子组件
  props: object;          // 组件属性
}
```

## 扩展机制

### 新增组件步骤
1. 在 packages/ 下创建新组件目录
2. 实现组件功能逻辑
3. 定义组件 meta 描述（type, props等）
4. 在 material.ts 中注册组件

### 自定义属性面板
1. 在组件 meta 中定义 component 属性指向自定义面板
2. 创建自定义面板组件，接收 item 数据
3. 组件自动加载自定义面板

## 技术栈
- **主框架**：Vue3 + TypeScript
- **UI 库**：Element Plus
- **拖拽**：vue-draggable-plus
- **代码编辑器**：Monaco Editor
- **状态管理**：Pinia
- **打包工具**：Electron + Vite
- **样式**：Less

## 设计理念

1. **协议驱动**：通过 JSON 配置描述页面结构
2. **组件化**：所有功能以组件形式组织
3. **可扩展**：开放的物料库机制，易于新增组件
4. **响应式**：数据驱动的 UI 更新机制
5. **高性能**：合理利用 Vue3 响应式系统，避免不必要的重渲染