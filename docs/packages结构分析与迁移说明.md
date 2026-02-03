# packages 结构分析与迁移说明

## 一、当前结构分析

### 1. packages 目录（组件实现）
| 包名 | 结构 | 有 index 注册 | 说明 |
|------|------|---------------|------|
| Form | src/Form.jsx, components/, style/ | ✅ index.ts | 表单组件 |
| Table | src/Table.jsx, components/, style/ | ❌ | 表格组件 |
| DlockContainer | src/DlockContainer.jsx, style/ | ❌ | div 容器实现 |
| Input | src/input.jsx | ❌ | 输入框（实现较简） |
| CodeHighlight | src/CodeHighlight.jsx, style/ | ❌ | 代码高亮 |
| ControlPanel | src/controlPanel.jsx, components/, style/ | ❌ | 控制面板（非物料） |
| CreateCode | src/CreateCode.jsx, style/ | ✅ index.ts | 创建代码弹窗（非物料） |
| PageContainer | src/PageContainer.jsx, style/, utils/ | ✅ index.ts | 画布容器（非物料） |
| RenderEngine | src/RenderEngine.jsx, components/, style/ | ✅ index.ts | 渲染引擎（非物料） |

### 2. materialArea/components 目录（组件描述/元数据）
| 文件 | type | 对应 packages | 使用 npm 来源 |
|------|------|---------------|---------------|
| Form.ts | Form | Form | packages/Form |
| Table.ts | table | Table | packages/Table |
| Container.ts | container | DlockContainer | 内置 |
| Input.ts | input | Input | element-plus |
| Button.ts | Button | - | element-plus |
| Select.ts | select | - | element-plus |
| Image.ts | image | - | element-plus |
| Divider.ts | divider | - | element-plus |
| Carousel.ts | carousel | - | element-plus |
| backtop.ts | Backtop | - | element-plus |
| PageHeader.ts | PageHeader | - | element-plus |
| Breadcrumb.ts | Breadcrumb | - | element-plus |
| Search.ts | Search | - | element-plus |

### 3. 对应关系总结
- **有自定义实现的**：Form → Form, Table → Table, Container → DlockContainer, Input → Input
- **纯 Element Plus 的**：Button, Select, Image, Divider, Carousel, Backtop, PageHeader, Breadcrumb, Search
- **纯 Element Plus 组件**：在 packages 下创建对应文件夹，只放 meta.ts（描述），不强制要求 src

## 二、目标结构

```
packages/
├── index.ts                 # 统一注册入口
├── Form/
│   ├── index.ts             # 独立注册 + 导出 meta
│   ├── meta.ts              # 组件描述（原 materialArea/Form.ts）
│   ├── src/Form.jsx
│   ├── components/
│   └── style/
├── Table/
│   ├── index.ts
│   ├── meta.ts              # 原 materialArea/Table.ts
│   ├── src/Table.jsx
│   └── ...
├── DlockContainer/
│   ├── index.ts
│   ├── meta.ts              # 原 materialArea/Container.ts
│   └── src/...
├── Input/
│   ├── index.ts
│   ├── meta.ts              # 原 materialArea/Input.ts
│   └── src/input.jsx
├── Button/
│   ├── index.ts             # 仅导出 meta
│   └── meta.ts              # 原 materialArea/Button.ts
├── Select/meta.ts + index.ts
├── Image/meta.ts + index.ts
├── Divider/meta.ts + index.ts
├── Carousel/meta.ts + index.ts
├── Backtop/meta.ts + index.ts
├── PageHeader/meta.ts + index.ts
├── Breadcrumb/meta.ts + index.ts
├── Search/meta.ts + index.ts
└── ...
```

## 三、注册模式

### 1. 独立注册（每个组件 index.ts）
```ts
// packages/Form/index.ts
import Form from './src/Form.jsx'
import type { App } from 'vue'

Form.install = function (Vue: App) {
  Vue.component(Form.name || 'Form', Form)
}

export default Form
export { Form } from './meta'
```

### 2. 统一注册（packages/index.ts）
```ts
// packages/index.ts
import type { App } from 'vue'
import Form from './Form'
import Table from './Table'
// ...

const components = [Form, Table, ...]

export function install(Vue: App) {
  components.forEach((comp: any) => {
    if (comp.install) Vue.use(comp)
    else if (comp.name) Vue.component(comp.name, comp)
  })
}

export { Form, Table, ... }
export * from './material' // 统一导出所有 meta
```

## 四、迁移步骤
1. 在各 packages/[X] 下创建 meta.ts，内容来自 materialArea/components/[X].ts
2. 为每个包补充 index.ts（独立注册 + 导出 meta）
3. 更新 packages/index.ts 做统一注册
4. 创建 packages/material.ts 统一导出所有 meta
5. 更新 materialArea 改为从 packages 导入
