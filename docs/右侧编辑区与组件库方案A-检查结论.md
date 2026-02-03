# 右侧编辑区与组件库方案 A 检查结论

## 一、右侧编辑区实现（与讨论方案对照）

### 1. 是否符合「schema 驱动 + 少量自定义面板」

- **是**。`ControlPanel` 读取当前选中节点 `item.props`，只处理 key 包含 `Props` 的分组（`isConfigPropsKey`）。
- 每个分组：
  - 有 `children`（`ConfigItemSchema[]`）→ 用通用 **PropsItem** 按 `type` 渲染表单项；
  - 有 `component`（路径）→ 用 **AsyncPanel** 加载自定义面板（如 FormItemConfig、TableColumnConfig）。
- 与之前讨论的「通用属性用 schema，复杂组件用自定义面板」一致。

### 2. 数据流

- 右侧 `item` 来自 `currentOperatingObject`（画布选中节点），与 `pageJSON` 中节点是同一引用，在 PropsItem 里改 `e.value` 会直接更新画布数据，无需额外 emit。
- 拖拽落点到画布时，`componentContainer` 的 `cloneComponent` 使用整份物料（含 `props`），因此若 meta 里配了 `xxxProps`，节点会带上该结构，右侧能正常展示。

### 3. 当前缺口

- **PropsItem** 只实现了 `input`、`segmented`，`ConfigItemSchema` 中的 `number`、`boolean` 会显示「暂无该类型」。
- **PropsItem** 未对 `props.item` 做数组校验，若误传 `undefined` 会报错。
- **ControlPanel** 当节点没有任何 `xxxProps` 时，「组件」Tab 为空，缺少「暂无配置」类提示。

---

## 二、组件库方案 A 符合性

- **方案 A**：组件库只做「自定义组件」（开发、meta 编辑、源码、预览、发布）；Element 等第三方仅作为物料在左侧面板使用，不在组件库里编辑。
- **当前实现**：
  - 组件库列表来自 `refreshComponents` → `scanLocalComponents(libraryPath)`，只展示**本地目录扫描结果**，不包含内置/Element/平台物料。
  - 左侧画布物料区使用 `materialArea` 的 `componentList`（本地 + 平台，按你之前约定已去掉 builtin），与组件库数据源分离。
- **结论**：当前分工符合方案 A，无需为方案 A 再拆一个「物料库」页面。

---

## 三、建议的小改动（已做）

1. **PropsItem**：对 `props.item` 做数组校验；为 `number`、`boolean` 增加对应控件（ElInputNumber、ElSwitch），与 schema 一致。
2. **ControlPanel**：当 `item.props` 中没有任何 `xxxProps` 时，显示简短占位文案，避免空白困惑。

---

## 四、总结

| 项 | 状态 |
|----|------|
| 右侧按 schema 驱动（xxxProps + children/component） | ✅ 已实现 |
| 通用控件 PropsItem（input/segmented，补 number/boolean） | ✅ 已补全并加防护 |
| 复杂组件走自定义 AsyncPanel | ✅ 已实现 |
| 组件库仅本地扫描、不包含 Element/内置 | ✅ 符合方案 A |
| 左侧物料与组件库数据源分离 | ✅ 一致 |

整体实现与讨论方案一致，仅做上述小改进即可视为「合理实现」。
