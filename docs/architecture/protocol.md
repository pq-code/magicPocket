# JSON 协议规范

## 协议概述

MagicPocket 低代码平台采用标准化的 JSON 协议来描述页面结构和组件配置。协议设计遵循以下原则：

1. **语义化**: 结构清晰，含义明确
2. **标准化**: 统一的字段命名和数据格式
3. **扩展性**: 支持未来的功能扩展
4. **AI 友好**: 易于 AI 理解和生成

## 协议结构

### 页面根节点 (PageRoot)

```typescript
interface PageRoot {
  /** 固定为 'page' */
  type: 'page';

  /** 页面标题 */
  title: string;

  /** 是否允许画布拖拽排序 */
  whetherYouCanDrag: boolean;

  /** 根节点配置 */
  props: Record<string, unknown>;

  /** 画布顶层节点列表 */
  children: CanvasNode[];

  /**
   * 页面脚本（Vue 模式：setup 写法，原生 JS）
   * 与画布组件一起参与「生成代码」时，会合并为完整页面 JS/TSX。
   * 运行时通过注入 pageJSON / refs / onMounted / onBeforeUnmount 等执行。
   */
  script?: string;

  /** @deprecated 请使用 script。保留仅为兼容旧数据 */
  hooks?: {
    onMounted?: string;
    onUnmounted?: string;
  };

  /** 页面样式文件内容（原始 CSS 文本）*/
  css?: string;

  /** 可选：协议版本，便于后续兼容 */
  version?: string;

  /** 可选：元数据，便于协作与审计 */
  metadata?: {
    name?: string;
    description?: string;
    updatedAt?: string;
  };
}
```

### 画布节点 (CanvasNode)

```typescript
interface CanvasNode {
  /** 组件类型，渲染器据此选组件 */
  type: string;

  /** 实例唯一 id，用于选中/删除/历史，应在创建时生成 */
  key?: string;

  /** 中文展示名（组件库/控制器用） */
  componentName: string;

  /** 组件库分组 */
  group?: string;

  /** 图标类名 */
  icon?: string;

  /** 当前实例的配置（表单值、样式等） */
  props: Record<string, unknown>;

  /** 子节点数组 */
  children: CanvasNode[];

  /** 外部包信息，用于按包加载组件 */
  npm?: NodeNpmInfo;
}
```

### 组件加载信息 (NodeNpmInfo)

```typescript
interface NodeNpmInfo {
  /** 导出名 */
  exportName: string;

  /** 包名，如 element-plus、@renderer/packages */
  package?: string;

  /** 是否解构导入 */
  destructuring?: boolean;

  /** 项目内组件路径（如 packages/Form/src/Form.jsx） */
  component?: string;

  /** 组件版本 */
  version?: string;

  /** 远程组件 URL（ESM/UMD） */
  url?: string;

  /** 本地文件系统路径（绝对路径） */
  localPath?: string;

  /** 加载来源类型 */
  sourceType?: 'builtin' | 'local' | 'npm' | 'remote' | 'localFs';

  /** 私有 npm registry 地址 */
  registry?: string;
}
```

## JSON 类型定义文件

完整类型定义见: `/src/renderer/src/type/page-node.ts`

## 编辑用 JSON vs 渲染用 JSON

### 编辑用 JSON (EditorJSON)
- 包含完整的控制器信息
- 保留所有编辑器专用属性
- 支持实时编辑和配置
- 包含调试和开发信息

```json
{
  "type": "page",
  "title": "客户信息表单",
  "whetherYouCanDrag": true,
  "props": {
    "className": "PageContainer"
  },
  "children": [
    {
      "type": "Form",
      "key": "form-1",
      "componentName": "表单",
      "group": "基础组件",
      "props": {
        "formProps": {
          "title": "表单属性",
          "children": [
            {
              "label": "几列",
              "type": "segmented",
              "value": 8,
              "key": "span"
            }
          ]
        },
        "formItemProps": {
          "title": "表单项",
          "children": [],
          "itemList": [
            {
              "type": "input",
              "primaryKey": "name",
              "label": "姓名",
              "required": true
            }
          ]
        }
      },
      "controllers": {
        "visible": true,
        "editable": true
      }
    }
  ]
}
```

### 渲染用 JSON (RenderJSON)
- 只保留必要的结构和数据
- 去除编辑器专用属性
- 优化渲染性能
- 简化数据结构

```json
{
  "type": "page",
  "children": [
    {
      "type": "Form",
      "key": "form-1",
      "props": {
        "span": 8,
        "gutter": 20
      },
      "children": [
        {
          "type": "input",
          "key": "input-1",
          "props": {
            "name": "name",
            "label": "姓名",
            "required": true
          }
        }
      ]
    }
  ]
}
```

## 协议转换

### 从编辑 JSON 到渲染 JSON

```typescript
function transformToRenderJSON(editorJSON: PageRoot): PageRoot {
  const { children, ...rest } = editorJSON;

  return {
    ...rest,
    children: transformNodes(children)
  };
}

function transformNodes(nodes: CanvasNode[]): CanvasNode[] {
  return nodes.map(node => {
    const { controllers, props, ...rest } = node;

    // 提取渲染所需的属性，过滤掉编辑器专用属性
    const renderProps = extractRenderProps(props);

    return {
      ...rest,
      props: renderProps,
      children: transformNodes(node.children)
    };
  });
}

function extractRenderProps(props: Record<string, any>): Record<string, any> {
  const renderProps = {};

  // 只保留渲染所需的属性，移除控制器配置等编辑器专用属性
  for (const [key, value] of Object.entries(props)) {
    if (!isControllerProperty(key)) {
      renderProps[key] = value;
    }
  }

  return renderProps;
}

function isControllerProperty(key: string): boolean {
  return key.endsWith('Props') && typeof key !== 'function';
}
```

## 协议验证

### JSON Schema 验证

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["page"]
    },
    "title": {
      "type": "string"
    },
    "whetherYouCanDrag": {
      "type": "boolean"
    },
    "props": {
      "type": "object"
    },
    "children": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/CanvasNode"
      }
    }
  },
  "required": ["type", "title", "whetherYouCanDrag", "props", "children"],
  "definitions": {
    "CanvasNode": {
      "type": "object",
      "properties": {
        "type": {"type": "string"},
        "key": {"type": "string"},
        "componentName": {"type": "string"},
        "props": {"type": "object"},
        "children": {"$ref": "#/properties/children"}
      },
      "required": ["type", "componentName", "props", "children"]
    }
  }
}
```

## 与宜搭 / 其他低代码平台的对比

### 宜搭（阿里 lowcode-engine）

- **一份 Schema，多段使用**：编辑器产出 `projectSchema`，顶层包含 `version`、`componentsMap`、**`componentsTree`**、`utils`、`css`、`config` 等。页面树是 **`projectSchema.componentsTree[0]`**，不是「根即 page」。
- **编辑与渲染**：同一份 `projectSchema` 既用于设计器编辑，也用于运行时渲染；渲染时从 `projectSchema.componentsTree[0]` 取页面树，再配合资产包（Assets）和渲染器渲染。
- **出码**：可选的「出码」会生成独立源码，不再依赖 Schema 和低代码运行时。

参考：[低代码引擎搭建协议规范](https://lowcode-engine.cn/site/docs/specs/lowcode-spec)

### 其他常见做法

- **同一份 JSON**：多数平台（含宜搭）在编辑器和预览/发布里共用同一套 Schema，只是用不同模块去「读」它（设计器写、渲染器读）。
- **两份 JSON**：少数场景会在「导出 / 纯运行时」再做一层裁剪（只保留结构+数据），用于减体积或安全隔离。MagicPocket 在 `utils/json-transformer.ts` 中实现了 `transformToRenderJSON`，**当前仅在工具/测试中使用，产品内未接入**；若后续增加「导出为运行时用」等功能，可在导出链路中调用，画布与保存仍使用同一份 pageJSON。

### 本应用当前约定（一套 Schema 多用途）

产品内**全部使用 store 中的同一份 pageJSON**，与宜搭「一套 Schema 多用途」一致：

| 用途           | 数据来源 / 行为 |
|----------------|------------------|
| 画布渲染       | `pageJSON.value.children` 直接交给 RenderEngine，不做转换 |
| 右侧控制器     | `currentOperatingObject` 指向 pageJSON 树上的节点 |
| 保存           | `editCodeConfig({ codeConfig: pageJSON.value })`，保存完整 Schema |
| 预览           | 解析后赋给 `pageJSON.value`，再交给 RenderEngine |
| 历史（撤销/重做） | `toSerializablePageSnapshot(pageJSON.value)` 做可序列化副本，协议形状不变 |
| 页面 JSON 弹窗「应用」 | 解析并容错后 `pageJSON.value = pageRoot`，支持根即 page、或 `data`/`page`/`root`/`schema`、或阿里协议 `componentsTree[0]` |

**说明**：当前产品内未使用 `transformToRenderJSON`；「渲染用」精简能力仅预留，供后续导出/运行时可选使用。

## 协议演进

### 版本管理

- **v1.0**: 初始版本，支持基本组件拖拽
- **v1.1**: 增加样式和脚本支持
- **v1.2**: 增加组件元数据支持
- **v2.0**: 分离编辑 JSON 和渲染 JSON

### 向后兼容

- 保留 `hooks` 字段用于向后兼容
- 通过 `version` 字段标识协议版本
- 提供版本转换工具

## 最佳实践

### 1. 清晰的命名规范
- 使用语义化字段名
- 保持命名一致性
- 避免缩写和歧义

### 2. 层次结构合理
- 避免过度嵌套
- 保持结构扁平化
- 合理的组件粒度

### 3. 数据类型规范
- 严格的数据类型定义
- 统一的枚举值
- 明确的可选字段

### 4. 扩展性考虑
- 为未来功能预留字段
- 支持插件化扩展
- 模块化设计

## 安全考虑

- 防止恶意脚本注入（script 字段）
- 验证组件类型合法性
- 限制外部资源加载