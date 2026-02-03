# 组件加载协议

## 概述

统一组件描述协议，屏蔽来源差异。通过扩展的 `npm` 字段表达「如何加载」组件。

## 加载来源类型

```typescript
type ComponentSourceType = 'builtin' | 'local' | 'npm' | 'remote' | 'localFs';
```

| 类型 | 说明 | 示例 |
|------|------|------|
| `builtin` | 内置组件 | `container`、`Form` |
| `local` | 项目内组件 | `packages/MyButton/index.jsx` |
| `npm` | npm 包组件 | `element-plus` 的 `ElInput` |
| `remote` | 远程动态加载 | CDN 上的 ESM/UMD 组件 |
| `localFs` | 本地文件系统 | `/Users/xxx/components/MyButton` |

## npm 字段扩展

```typescript
interface NodeNpmInfo {
  /** 导出名 */
  exportName: string;
  /** 包名（npm 组件） */
  package?: string;
  /** 是否解构导入 */
  destructuring?: boolean;
  /** 项目内组件路径 */
  component?: string;
  /** 组件版本 */
  version?: string;
  /** 远程组件 URL */
  url?: string;
  /** 本地文件系统路径 */
  localPath?: string;
  /** 加载来源类型 */
  sourceType?: ComponentSourceType;
  /** 私有 npm registry */
  registry?: string;
}
```

## 加载器分层

```
┌─────────────────────────────────────────┐
│           TypeRenderEngine              │
│  (根据 sourceType 选择加载策略)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           ComponentLoader               │
│  (统一加载入口，带缓存)                  │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌────▼────┐
│Builtin│   │  Local  │   │   NPM   │
│       │   │(Vite)   │   │(import) │
└───────┘   └─────────┘   └─────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐
│Remote │   │LocalFs  │
│(ESM)  │   │(Electron)│
└───────┘   └─────────┘
```

## 各来源配置示例

### 1. 内置组件 (builtin)

```json
{
  "type": "container",
  "componentName": "div容器"
}
```

### 2. 项目内组件 (local)

```json
{
  "type": "Form",
  "componentName": "表单",
  "npm": {
    "exportName": "Form",
    "component": "packages/Form/src/Form.jsx",
    "sourceType": "local"
  }
}
```

### 3. NPM 组件 (npm)

```json
{
  "type": "input",
  "componentName": "输入框",
  "npm": {
    "exportName": "ElInput",
    "package": "element-plus",
    "sourceType": "npm",
    "destructuring": true
  }
}
```

### 4. 远程组件 (remote)

```json
{
  "type": "RemoteChart",
  "componentName": "远程图表",
  "npm": {
    "exportName": "Chart",
    "url": "https://cdn.example.com/chart-component.esm.js",
    "sourceType": "remote"
  }
}
```

### 5. 本地文件组件 (localFs)

```json
{
  "type": "MyButton",
  "componentName": "自定义按钮",
  "npm": {
    "exportName": "MyButton",
    "localPath": "/Users/xxx/components/MyButton/index.vue",
    "sourceType": "localFs"
  }
}
```

## 物料源抽象

```typescript
interface MaterialSource {
  id: string;
  name: string;
  sourceType: ComponentSourceType;
  getComponents(): Promise<ComponentMeta[]>;
  refresh?(): Promise<void>;
  isAvailable(): boolean;
}
```

### 内置物料源

- `LocalMaterialSource`: 项目内 materialArea
- `LocalFsMaterialSource`: 本地文件系统组件库
- `RemoteMaterialSource`: 远程组件库 API

## 安全考虑

### 远程组件

1. **白名单机制**: 限制可加载的远程 URL 域名
2. **CSP 配置**: 配置 Content-Security-Policy
3. **沙箱执行**: UMD 组件使用受限的沙箱环境
4. **签名验证**: 可选的组件签名验证

### 本地文件组件

1. **路径限制**: 只允许加载指定目录下的组件
2. **Electron 权限**: 通过 contextBridge 限制 API 暴露

## 缓存策略

```typescript
// 组件缓存 key 生成规则
function getCacheKey(npm: NodeNpmInfo): string {
  if (npm.url) return `remote:${npm.url}`;
  if (npm.localPath) return `localFs:${npm.localPath}`;
  if (npm.component) return `local:${npm.component}`;
  if (npm.package) return `npm:${npm.package}:${npm.exportName}`;
  return `builtin:${npm.exportName}`;
}
```

- 内置组件: 永久缓存
- 项目内组件: 开发时热更新，生产永久缓存
- NPM 组件: 永久缓存（版本号区分）
- 远程组件: 可配置 TTL 或 ETag 验证
- 本地文件组件: 文件 mtime 变化时刷新
