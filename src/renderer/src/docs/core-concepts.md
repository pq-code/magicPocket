# MagicPocket 低代码平台 - 核心概念与术语说明

## 1. 组件物料 (Component Material)
组件物料是低代码平台的基础构建单元，包含：
- **componentName**: 组件展示名称
- **type**: 组件唯一标识类型
- **props**: 组件属性配置结构，按功能分组（如 positionProps, layoutProps, styleProps）
- **meta 描述**: 定义组件在画布中的行为和属性面板结构

## 2. 组件属性分组协议
为了便于管理和展示，组件属性按照功能分为多个组：

### 2.1 位置属性 (positionProps)
- 定义组件的位置和尺寸信息
- 包含：left, top, width, height, rotate 等
- 映射到 CSS position 和 transform 属性

### 2.2 布局属性 (layoutProps)
- 定义组件的布局行为
- 包含：display, flexDirection, justifyContent, alignItems, gap 等
- 支持 Flex 和 Grid 布局模式
- 使用 showWhen 属性实现条件显示

### 2.3 样式属性 (以 cs 开头)
- 以 `cs` 前缀开头的属性表示样式属性
- 如：csborderRadius, csbackgroundColor, csfontSize
- 在属性面板中被归类到"样式"标签页
- 最终转换为对应的 CSS 样式属性

## 3. 页面 JSON 协议
描述页面结构和组件配置的标准格式：

```json
{
  "type": "page",
  "key": "page-root",
  "children": [
    {
      "type": "container",
      "key": "container-123",
      "props": {
        "positionProps": {
          "title": "位置",
          "children": [...],
          "style": {}
        },
        "layoutProps": {
          "title": "布局",
          "children": [...],
          "style": {}
        }
      },
      "children": [...]
    }
  ]
}
```

## 4. 渲染流程
1. **配置收集**: 通过 `collectProps` 函数将组件属性按组收集
2. **样式转换**: 将属性转换为 CSS 样式对象
3. **组件创建**: 根据组件类型创建对应的 Vue 组件实例
4. **递归渲染**: 递归渲染子组件形成组件树

## 5. 状态管理
- **pageJSON**: 存储整个页面的 JSON 配置
- **currentOperatingObject**: 当前选中的组件对象
- **history**: 组件操作历史记录

## 6. 拖拽交互
- **编辑模式**: 可以拖拽组件进行布局调整
- **预览模式**: 只读展示，不支持拖拽和编辑
- **模式切换**: 通过 `PREVIEW_MODE_KEY` 注入的上下文变量控制

## 7. 动态单位支持
系统支持多种长度单位的输入和渲染：
- **固定单位**: px, pt, cm, mm, in, pc
- **相对单位**: rem, em, %
- **视口单位**: vw, vh, vmin, vmax
- **字体单位**: ch, ex
- 自动识别已带单位的值，只对纯数字添加默认单位

## 8. 代码生成机制
- **配置转代码**: 将页面 JSON 配置转换为实际的前端代码
- **多框架支持**: 支持 Vue、React 等多种前端框架代码生成
- **自定义模板**: 支持自定义代码生成模板

## 9. 扩展机制
- **新组件开发**: 遵循组件物料协议开发新组件
- **自定义属性面板**: 为特定组件开发专属属性配置面板
- **插件机制**: 支持插件扩展平台功能