# MagicPocket 低代码平台 - 组件架构说明

## 核心组件说明

### 1. 控制面板系列 (internal/ControlPanel/)
- **controlPanel.jsx**: 主控制器面板组件，负责根据选中的画布节点动态渲染配置项
  - 提供「组件」、「样式」、「高级」三个标签页
  - 自动按 meta 配置结构组织属性分组
  - 支持动态加载自定义配置面板
  - 实现响应式更新机制，选中节点时实时刷新配置

- **PropsItem.jsx**: 属性项渲染器，根据属性类型渲染不同输入控件
  - 支持 input、segmented、number、boolean、color 等多种输入类型
  - 负责渲染输入框、开关、颜色选择器等具体控件
  - 与 Element Plus 组件库集成

### 2. 渲染引擎系列 (internal/RenderEngine/)
- **RenderEngine.jsx**: 通用渲染引擎，根据组件 JSON 配置渲染真实 UI
  - 接收组件描述协议并转换为对应的 Vue 组件
  - 支持嵌套组件渲染
  - 处理组件间的父子关系和事件传递

- **ComponentMaker.jsx**: 组件创建器，根据组件类型生成相应的渲染元素
  - 处理内置组件和第三方组件的注册和渲染
  - 管理组件实例化过程

### 3. 代码编辑器系列 (internal/CodeEditor/)
- **MonacoEditor.jsx**: 基于 Monaco Editor 的代码编辑器组件
  - 支持语法高亮、自动补全等高级功能
  - 集成 VSCode 编辑器体验
  - 实现防抖更新机制避免性能问题

- **CodeHighlight.jsx**: 轻量级代码高亮组件（备选方案）
  - 基于 highlight.js 的简单代码高亮
  - 支持代码片段选择和复制

### 4. 容器组件系列 (packages/DlockContainer/)
- **DlockContainer.jsx**: 通用 DIV 容器组件，作为画布的基本布局单元
  - 支持绝对定位和 Flex/Grid 布局
  - 提供丰富的样式配置项
  - 支持动态单位（%、rpx、vw、vh 等）

- **meta.ts**: DlockContainer 的物料描述文件
  - 定义组件属性配置结构
  - 包含位置、布局、样式等多个属性组
  - 支持条件显示（showWhen）

### 5. 布局相关 (internal/PageContainer/)
- **PageContainer.jsx**: 页面容器，管理整个低代码页面的结构
  - 提供页面级别的布局和样式管理
  - 支持页面级事件和生命周期

### 6. 功能组件 (internal/CreateCode/)
- **CreateCode.jsx**: 代码生成器，将低代码配置转换为实际代码
  - 实现配置到代码的转换逻辑
  - 支持多种前端框架代码生成

## 左侧面板组件 (views/draggingDragging/components/)

- **draggingDraggingL.jsx**: 组件库面板，展示可用的物料组件
  - 左侧组件分类导航
  - 拖拽操作支持

- **draggingDraggingR.jsx**: 属性配置面板，显示选中组件的属性编辑器
  - 右侧属性配置区域
  - 与 ControlPanel 组件关联

- **draggingDraggingMain.jsx**: 主画布区域，处理组件拖拽放置逻辑
  - 画布交互逻辑
  - 组件放置和定位
  - 页面 JSON 编辑功能

## 核心 Hooks

- **useCodeConfig.ts**: 代码配置处理器
  - 将配置项转换为实际样式
  - 处理单位转换（px 默认单位等）
  - 支持动态单位（%、rpx、vw、vh 等）

- **useCanvasOperation.ts**: 画布操作处理器
  - 管理画布上的组件操作
  - 处理增删改查逻辑

## 数据存储

- **useDraggingDraggingStore.ts**: Pinia 状态管理
  - 存储页面 JSON 数据
  - 管理当前选中对象
  - 操作历史记录

## 包结构说明 (packages/)

- **Form**: 表单相关组件及其配置面板
- **Table**: 表格组件及配置项
- **ElDivider**: Element UI 分割线组件
- **DlockContainer**: 通用容器组件
- **PageContainer**: 页面容器组件
- **RenderEngine**: 渲染引擎相关组件
- **CreateCode**: 代码生成工具
- **ControlPanel**: 控制面板相关组件
- **CodeHighlight**: 代码高亮组件