# 配置项 Schema 协议 (Config Schema Protocol)

本文档定义「可配置项」的结构与类型描述，供组件库 meta 与控制器 PropsItem 共用，Agent 可据此生成/校验配置项。

---

## 一、ConfigItemSchema（配置项）

描述单个配置项的结构。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 唯一键，对应节点 props 中的字段名 |
| label | string | 是 | 展示标签 |
| type | string | 是 | 控件类型，见下表 |
| value | any | 否 | 默认值 |
| required | boolean | 否 | 是否必填 |
| options | ConfigItemOption[] | 否 | 选项列表（segmented 等使用） |
| rightText | string | 否 | 右侧单位/后缀，如 `px`、`url` |
| longInput | boolean | 否 | 是否长输入框 |

### type 枚举

| type | 说明 | 对应控件 |
|------|------|----------|
| input | 文本输入 | ElInput |
| segmented | 分段选择 | ElSegmented |
| number | 数字输入 | ElInputNumber |
| boolean | 布尔开关 | ElSwitch |

### ConfigItemOption

```ts
{ label: string; value: string | number | boolean }
```

---

## 二、ConfigPropsGroup（配置分组）

如 `divProps`、`titleProps`、`formItemProps`。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 分组标题 |
| children | ConfigItemSchema[] | 是 | 配置项列表 |
| component | string | 否 | 自定义面板路径，如 `packages/Form/components/FormItemConfig.jsx` |
| style | object | 否 | 分组内联样式 |

### 约定

- **配置分组 key**：以 `Props` 结尾，如 `divProps`、`titleProps`
- **判断函数**：`isConfigPropsKey(key)` → `key.includes('Props')`

---

## 三、示例

### 单配置项

```json
{
  "key": "display",
  "label": "布局方式",
  "type": "segmented",
  "value": "",
  "options": [
    { "label": "grid", "value": "grid" },
    { "label": "flex", "value": "flex" }
  ]
}
```

### 配置分组

```json
{
  "title": "容器属性",
  "children": [
    { "key": "className", "label": "className", "type": "input", "value": "" },
    { "key": "display", "label": "布局方式", "type": "segmented", "value": "", "options": [...] }
  ]
}
```
