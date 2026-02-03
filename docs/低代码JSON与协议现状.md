# 低代码 JSON 与协议现状

本文基于当前代码实现，说明**页面 JSON 长什么样、如何存储、协议在实现里的形态**，并与 `低代码协议设计讨论.md` 中的分层思路对照，便于讨论和演进。

---

## 一、当前 JSON 长什么样

### 1.1 顶层：页面根（pageJSON）

存在 **Pinia store**（`useDraggingDraggingStore`）里的 `pageJSON` 就是「整页描述」的根节点，结构大致如下：

```ts
// 根节点
{
  type: 'page',
  title: '页面',
  whetherYouCanDrag: true,   // 是否允许画布拖拽排序
  props: {
    className: 'PageContainer',
    style: '',
  },
  children: [ /* 画布第一层节点数组 */ ]
}
```

- **type**：固定 `'page'`，渲染时对应 PageContainer。
- **children**：画布顶层节点列表，每个元素都是一棵「组件树节点」。

### 1.2 画布节点：组件树节点（每个 node）

每个画布上的组件对应一个「节点对象」，当前实现里常见字段如下（**未在代码里集中用 TypeScript 类型约束，属隐式协议**）：

| 字段 | 含义 | 示例 |
|------|------|------|
| **type** | 组件类型，渲染器据此选组件 | `'container'`、`'Form'`、`'input'` |
| **key** | 实例唯一 id，用于选中/删除/历史 | 运行时生成，如 `container-1234` |
| **componentName** | 中文展示名（组件库/控制器用） | `"div容器"`、`"表单"` |
| **group** | 组件库分组 | `"基础组件"` |
| **icon** | 图标类名 | `"icon-fuxuankuangkong"` |
| **props** | 当前实例的配置（表单值、样式等） | 见下 |
| **children** | 子节点数组，递归同结构 | `[]` 或 `[{ type, props, children, ... }]` |
| **npm** | （可选）外部包信息，用于按包加载组件 | `{ package, exportName, destructuring }` |

- **props**：完全由各组件和控制器约定，没有统一 Schema。  
  - 例如容器：`className`、`style`、以及 divProps/titleProps 下按 label/key/type/value 的配置项。  
  - 例如表单子项：`formItemProps`（primaryKey、label、size 等）、`placeholder` 等。  
- **npm**：当组件来自 element-plus 或 @renderer/packages 时，用 `package` + `exportName` 做动态 import，与渲染器约定一致即可。

**示例（单节点）：**

```json
{
  "componentName": "div容器",
  "type": "container",
  "icon": "icon-fuxuankuangkong",
  "group": "基础组件",
  "props": {
    "className": "container",
    "style": ""
  },
  "children": []
}
```

带子节点的表单节点示例（与 store 里注释的示例一致）：

```json
{
  "componentName": "表单",
  "type": "Form",
  "group": "基础组件",
  "npm": {
    "exportName": "Form",
    "package": "@renderer/packages",
    "destructuring": true
  },
  "props": { "name": "title", "propType": "string", "description": "标题", "defaultValue": "标题" },
  "children": [
    {
      "componentName": "输入框",
      "type": "input",
      "npm": { "exportName": "ElInput", "package": "element-plus", "destructuring": true },
      "props": {
        "formItemProps": { "label": "表单项", "primaryKey": "760", ... },
        "placeholder": "请输入"
      },
      "children": []
    }
  ],
  "key": "e6eed8c8-708a-b22b-a068-c979006ff0fa"
}
```

所以：**当前“协议”就是这棵「树 + type + props + children + npm」的 JSON 形状**，没有单独的 Schema 文件或 JSON Schema 校验。

---

## 二、JSON 如何持久化（codeConfig）

- **后端/预加载**：`lowCodeConfig` 模型（Sequelize）表 `sys_lowCodeConfig`，字段包括：
  - `codeConfigId`、`codeConfigName`
  - **codeConfig**：TEXT，存的就是**整份 pageJSON**（即上面那棵树的根对象）的 JSON 字符串。
  - `userId`、`userName`、时间戳等。
- **渲染进程**：
  - 通过接口 `getCodeConfig({ codeConfigId, codeConfigName })` 拉取，拿到 `res.result.codeConfig` 后**整体赋给** `pageJSON.value`。
  - 保存时在 `useCanvasOperation` 里调用 `saveCodeConfig`，把 `pageJSON.value` 作为 `codeConfig` 传过去。

也就是说：**一份“页面” = 一个 codeConfig 记录 = 一整棵 pageJSON 树**；没有按节点或按区块的增量协议，也没有版本号/协作字段。

---

## 三、和「协议设计讨论」的对应关系

| 设计文档中的层/协议 | 当前实现情况 |
|--------------------|--------------|
| **Schema 描述协议** | 未统一。props 结构由各组件在 materialArea 里手写（如 Container 的 divProps.children：label/type/value/key），控制器按同一结构渲染配置面板，没有独立 Schema 文件或 JSON Schema。 |
| **扩展 Schema** | 无。没有 color/size/dataSource 等扩展类型的统一描述。 |
| **组件描述协议** | **有隐式形态**：组件库侧（materialArea）每个组件导出一个对象，包含 type、componentName、group、icon、**props 的“配置项列表”**（如 divProps/titleProps 的 children）；画布节点 = 同构 + 实例 key + 实例 props。没有单独的「元数据」与「实例」类型定义，也没有 version/package 的显式协议字段（npm 是零散用的）。 |
| **组件通信 / 行为 / 条件** | 未实现。没有事件名、数据注入、行为描述、条件表达式的统一协议。 |
| **实时协作** | 未实现。无 OT/CRDT、无操作序列。 |

因此可以概括为：

- **当前“协议” = 页面树 JSON 的形态约定（type + props + children + key + npm） + 组件库侧“配置项列表”的约定。**
- **没有**独立的 Schema 层、没有行为/条件/通信的显式协议，**没有**协作协议。

---

## 四、数据流简图（当前实现）

```
┌─────────────────┐    拖拽/配置变更      ┌──────────────────┐
│  组件库（左）    │ ──────────────────►  │  pageJSON        │
│  materialArea   │                      │  (Pinia store)   │
│  各组件 meta    │                      │  根 + children  │
└─────────────────┘                      └────────┬─────────┘
        │                                          │
        │ 组件描述（type/group/props 结构）          │ 整树
        ▼                                          ▼
┌─────────────────┐                      ┌──────────────────┐
│  控制器（右）    │ ◄── currentOperating │  渲染器（中）     │
│  ControlPanel   │     Object + 节点     │  RenderEngine    │
│  按 props 结构   │     props 双向绑定   │  TypeRenderEngine│
│  渲染表单项      │                      │  递归渲染树      │
└─────────────────┘                      └──────────────────┘
        │                                          │
        │ 保存/加载                                 │
        ▼                                          ▼
┌─────────────────┐                      getCodeConfig 拉取
│  lowCodeConfig  │  codeConfig =        pageJSON.value =
│  codeConfig     │  pageJSON 序列化     res.result.codeConfig
└─────────────────┘
```

---

## 五、可讨论的下一步（和设计文档一致）

1. **显式化“节点协议”**：把当前 pageJSON 根 + 节点的字段（type、key、props、children、npm 等）写成 TypeScript 类型或一份 `docs/specs/page-node.md`，避免隐式约定漂移。
2. **统一 Schema**：先定「配置项」的通用描述（类型、必填、默认值等），再让组件库的 props 描述和控制器表单项共用同一套结构（可为 JSON Schema 子集或自研简化 DSL）。
3. **组件描述协议**：把「组件库 meta」与「画布节点实例」在类型或文档里区分开（如 ComponentDescriptor vs. NodeInstance），并约定 version/package 的显式字段。
4. **持久化**：当前 codeConfig 存整树即可；若以后做协作/增量，再考虑存操作序列或版本号。

如果你愿意，我们可以下一步具体定：**节点协议的 TypeScript 类型** 或 **一版最小的 Schema 字段表**，再在现有 JSON 上逐步对齐。
