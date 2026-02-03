# 组件描述协议 (Component Descriptor Protocol)

本文档定义「可被编排的组件」的元数据结构，组件库（materialArea）与 Agent 均遵循此协议。

---

## 一、组件元数据（Material Meta）

组件库中每个组件的定义，用于拖拽时生成画布节点。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 组件类型，与画布节点 type 一致 |
| componentName | string | 是 | 中文展示名 |
| icon | string | 否 | 图标类名 |
| group | string | 否 | 组件库分组 |
| npm | NodeNpmInfo | 条件 | 非内置组件必填 |
| props | object | 否 | 配置结构，见下文 |
| children | CanvasNode[] | 否 | 默认子节点（可选） |

### props 结构

- 键以 `Props` 结尾的为**配置分组**，符合 ConfigPropsGroup
- 其他键为**默认值**，如 `className`、`style`

```ts
{
  className?: string;
  style?: string;
  divProps?: ConfigPropsGroup;
  titleProps?: ConfigPropsGroup;
  formItemProps?: ConfigPropsGroup;
  // ...
}
```

---

## 二、画布节点与元数据的关系

| 维度 | 组件元数据（Material） | 画布节点（CanvasNode） |
|------|------------------------|------------------------|
| 来源 | materialArea 组件定义 | 拖拽/Agent 生成的实例 |
| 用途 | 描述「组件长什么样」 | 描述「当前实例的配置」 |
| props | 含 ConfigPropsGroup 结构 | 含用户配置后的值 |
| children | 默认子项（可选） | 实际子节点 |

**拖拽生成**：从 meta 深拷贝 → 补充 `key` → 作为新节点加入画布。

---

## 三、内置组件一览

| type | componentName | group | npm |
|------|---------------|-------|-----|
| container | div容器 | 基础组件 | 无 |
| Form | 表单 | 基础组件 | @renderer/packages |
| input | 输入框 | 输入组件 | element-plus |
| Select | 下拉框 | 输入组件 | element-plus |
| table | 表格 | 基础组件 | @renderer/packages |
| Image | 图片 | 基础组件 | - |
| Divider | 分割线 | 基础组件 | - |
| Carousel | 轮播 | 基础组件 | - |
| Button | 按钮 | 基础组件 | - |
| 等 | ... | ... | ... |

---

## 四、Agent 生成新组件约定

1. **type**：必须为已注册组件 type
2. **componentName**：与 meta 一致
3. **npm**：从 meta 复制
4. **props**：从 meta 复制默认结构，再按需修改 value
5. **children**：数组，可空
6. **key**：生成 `{type}-{uuid}` 格式
