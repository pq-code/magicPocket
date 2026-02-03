# 页面节点协议 (Page Node Protocol)

本文档定义 MagicPocket 低代码平台的**页面根**与**画布节点**数据结构，供渲染器、控制器、Agent 统一遵循。

---

## 一、页面根 (PageRoot)

整页描述的根节点，存储于 `pageJSON`。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定 `"page"` |
| title | string | 是 | 页面标题 |
| whetherYouCanDrag | boolean | 是 | 是否允许画布拖拽排序 |
| props | object | 是 | 根节点配置，如 `className`、`style` |
| children | CanvasNode[] | 是 | 画布顶层节点列表 |
| version | string | 否 | 协议版本，便于兼容 |
| metadata | object | 否 | 元数据：`name`、`description`、`updatedAt` |

### 示例

```json
{
  "type": "page",
  "title": "页面",
  "whetherYouCanDrag": true,
  "props": {
    "className": "PageContainer",
    "style": ""
  },
  "children": []
}
```

---

## 二、画布节点 (CanvasNode)

画布上每个组件对应一个节点实例。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 组件类型，渲染器据此选组件 |
| key | string | 否 | 实例唯一 id，用于选中/删除/历史 |
| componentName | string | 是 | 中文展示名 |
| group | string | 否 | 组件库分组 |
| icon | string | 否 | 图标类名 |
| props | object | 是 | 当前实例配置 |
| children | CanvasNode[] | 是 | 子节点数组 |
| npm | NodeNpmInfo | 否 | 外部包信息，用于按包加载 |

### NodeNpmInfo

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| exportName | string | 是 | 导出名 |
| package | string | 是 | 包名，如 `element-plus`、`@renderer/packages` |
| destructuring | boolean | 否 | 是否解构导入 |
| component | string | 否 | 自定义组件路径，如 `packages/Form/src/Form.jsx` |

---

## 三、内置组件 type 枚举

| type | 说明 | npm.package |
|------|------|-------------|
| container | div 容器 | 无（内置） |
| Form | 表单 | @renderer/packages |
| input | 输入框 | element-plus |
| Select | 下拉框 | element-plus |
| table | 表格 | @renderer/packages |
| Form、Table 等需 `npm.component` 时 | 自定义面板 | 同上 |

---

## 四、Agent 操作约定

- **新增节点**：从组件库 meta 复制结构，补充 `key`（格式 `{type}-{uuid}`）
- **编辑节点**：修改 `props` 中对应 key 的值
- **删除节点**：从父节点 `children` 中移除
- **移动节点**：调整 `children` 数组顺序
