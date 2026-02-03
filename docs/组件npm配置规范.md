# 组件 npm 配置规范

## 问题总结

### 原问题

拖拽物料到画布时报错：
```
TypeError: Failed to resolve module specifier '@renderer/packages/Form/src/Form.jsx'
```

### 根本原因

组件 meta 配置中同时指定了 `package` 和 `component` 字段，导致加载逻辑混乱：

```typescript
// ❌ 错误配置
npm: {
  exportName: 'Form',
  package: '@renderer/packages',           // npm 类型标识
  component: 'packages/Form/src/Form.jsx', // local 类型标识
  destructuring: true
}
```

在 `ComponentLoader.ts` 的 `resolveSourceType` 函数中，判断优先级为：
1. `url` → `remote`
2. `localPath` → `localFs`
3. **`component` → `local`** ⚠️
4. `package` → `npm`

因此这些组件被错误识别为 `local` 类型，但加载路径又不正确。

## 正确配置规范

### 1. npm 包组件（Element Plus 等）

**适用场景**：从 npm 包加载的第三方组件

```typescript
npm: {
  exportName: 'ElButton',     // 导出名称
  package: 'element-plus',    // npm 包名
  destructuring: true         // 是否解构导入
}
```

**加载逻辑**：
```typescript
import { ElButton } from 'element-plus'  // destructuring: true
// 或
import ElButton from 'element-plus'      // destructuring: false
```

### 2. 本地项目组件（packages/）

**适用场景**：项目内 `packages/` 目录下的自定义组件

```typescript
npm: {
  exportName: 'Form',              // 具名导出（从 packages/index.ts）
  package: '@renderer/packages',   // 使用统一入口
  destructuring: true              // 使用具名导出
}
```

**加载逻辑**：
```typescript
import { Form } from '@renderer/packages'
```

**实现说明**：
- 所有本地组件通过 `packages/index.ts` 统一导出
- `packages/index.ts` 导出具名组件：`export { default as Form } from './Form'`
- 使用 `package: '@renderer/packages'` 统一入口，避免动态路径问题
- **优势**：Vite 可以正确处理 `@renderer/packages` 别名，无需运行时动态拼接路径

### 3. 远程组件（URL 加载）

**适用场景**：从远程 CDN 加载的组件

```typescript
npm: {
  exportName: 'MyComponent',
  url: 'https://cdn.example.com/my-component.esm.js',
  destructuring: true
}
```

### 4. 本地文件系统组件（Electron）

**适用场景**：通过本地文件系统路径加载（组件库功能）

```typescript
npm: {
  exportName: 'CustomComponent',
  localPath: '/Users/xxx/components/CustomComponent.js',
  destructuring: false
}
```

## 修复的文件列表

### 基础物料组件

1. ✅ `Form/meta.ts`
   ```typescript
   // 修复前
   npm: {
     exportName: 'Form',
     package: '@renderer/packages',
     component: 'packages/Form/src/Form.jsx',
     destructuring: true
   }
   
   // 修复后（最终版本）
   npm: {
     exportName: 'Form',
     package: '@renderer/packages',
     destructuring: true
   }
   ```

2. ✅ `DlockContainer/meta.ts`
   ```typescript
   // 修复前
   npm: {
     exportName: 'DlockContainer',
     package: '@renderer/packages',
     component: 'packages/DlockContainer/src/DlockContainer.jsx',
     destructuring: true
   }
   
   // 修复后（最终版本）
   npm: {
     exportName: 'DlockContainer',
     package: '@renderer/packages',
     destructuring: true
   }
   ```

3. ✅ `Table/meta.ts`
   ```typescript
   // 修复前
   npm: {
     exportName: 'Table',
     package: '@renderer/packages',
     component: 'packages/Table/src/Table.jsx',
     destructuring: true
   }
   
   // 修复后（最终版本）
   npm: {
     exportName: 'Table',
     package: '@renderer/packages',
     destructuring: true
   }
   ```

### 内置组件

4. ✅ `ControlPanel/meta.ts`
   ```typescript
   npm: {
     exportName: 'ControlPanel',
     package: '@renderer/packages',
     destructuring: true
   }
   ```

5. ✅ `CreateCode/meta.ts`
   ```typescript
   npm: {
     exportName: 'CreateCode',
     package: '@renderer/packages',
     destructuring: true
   }
   ```

6. ✅ `PageContainer/meta.ts`
   ```typescript
   npm: {
     exportName: 'PageContainer',
     package: '@renderer/packages',
     destructuring: true
   }
   ```

7. ✅ `CodeHighlight/meta.ts`
   ```typescript
   npm: {
     exportName: 'CodeHighlight',
     package: '@renderer/packages',
     destructuring: true
   }
   ```

### Element Plus 组件

之前已修复（移除多余的 `component` 字段）：
- ✅ `Button/meta.ts`
- ✅ `PageHeader/meta.ts`
- ✅ `Search/meta.ts`
- ✅ `Breadcrumb/meta.ts`
- ✅ `Backtop/meta.ts`
- ✅ `Carousel/meta.ts`
- ✅ `Divider/meta.ts`
- ✅ `Image/meta.ts`

## 配置检查清单

在创建或修改组件 meta 时，请检查：

- [ ] **只选择一种加载方式**：不要同时指定 `package` 和 `component`
- [ ] **本地组件路径正确**：指向 `packages/ComponentName`，不是 `packages/ComponentName/src/ComponentName.jsx`
- [ ] **destructuring 正确**：
  - Element Plus 等命名导出：`destructuring: true`
  - 本地组件 default 导出：`destructuring: false`
- [ ] **exportName 正确**：
  - Element Plus：`ElButton`、`ElInput` 等
  - 本地组件：通常是 `'default'` 或组件名
- [ ] **index.ts 导出正确**：本地组件必须在 `index.ts` 中正确导出

## 加载流程

```
ComponentMeta (meta.ts)
    ↓
TypeRenderEngine 获取 npm 配置
    ↓
resolveSourceType 判断类型
    ↓
┌─────────────┬──────────────┬──────────────┬──────────────┐
│   npm       │   local      │   remote     │   localFs    │
│ (package)   │ (component)  │   (url)      │ (localPath)  │
└─────────────┴──────────────┴──────────────┴──────────────┘
    ↓              ↓              ↓              ↓
loadNpmComponent  loadLocalComponent  loadRemoteComponent  loadLocalFsComponent
    ↓              ↓              ↓              ↓
  缓存并返回组件实例
    ↓
createAsyncComponent 包装为异步组件
    ↓
Vue 渲染
```

## 验证方法

### 1. 检查 resolveSourceType 返回

在 `ComponentLoader.ts` 中添加日志：

```typescript
export function resolveSourceType(npm?: NodeNpmInfo): ComponentSourceType {
  if (!npm) return 'builtin';
  if (npm.sourceType) return npm.sourceType;
  if (npm.url) return 'remote';
  if (npm.localPath) return 'localFs';
  if (npm.component) return 'local';
  if (npm.package) return 'npm';
  return 'builtin';
}
```

### 2. 测试拖拽渲染

1. 打开应用
2. 从左侧组件库拖拽组件到画布
3. 检查是否正常渲染
4. 查看浏览器控制台是否有错误

### 3. 检查组件缓存

```javascript
// 在浏览器控制台
import { getAllRegisteredTypes } from '@renderer/core/renderer/ComponentRegistry'
console.log('已注册的组件类型:', getAllRegisteredTypes())
```

## 常见错误

### 错误 1：Failed to resolve module specifier

**原因**：路径格式不正确

```typescript
// ❌ 错误
component: '@renderer/packages/Form/src/Form.jsx'

// ✅ 正确
component: 'packages/Form'
```

### 错误 2：组件未定义

**原因**：`destructuring` 配置错误

```typescript
// ❌ 错误：default 导出使用了 destructuring
npm: {
  exportName: 'default',
  component: 'packages/Form',
  destructuring: true  // ❌
}

// ✅ 正确
npm: {
  exportName: 'default',
  component: 'packages/Form',
  destructuring: false  // ✅
}
```

### 错误 3：Cannot read properties of undefined

**原因**：`exportName` 与实际导出不匹配

```typescript
// 实际导出
export default Form

// ❌ 错误配置
npm: {
  exportName: 'FormComponent',  // ❌ 找不到这个导出
  component: 'packages/Form',
  destructuring: true
}

// ✅ 正确配置
npm: {
  exportName: 'default',        // ✅ 匹配 default 导出
  component: 'packages/Form',
  destructuring: false
}
```

## 最佳实践

1. **统一通过 index.ts 导出**
   - 每个组件包都应该有 `index.ts` 作为入口
   - meta 配置指向包目录，不是具体文件

2. **命名规范**
   - Element Plus 组件：使用 `El` 前缀
   - 本地组件：使用 PascalCase 命名
   - 组件类型（type）：使用 camelCase 或 PascalCase

3. **文档同步**
   - 修改 meta 配置后，同步更新物料平台数据
   - 确保物料平台返回的数据结构与 meta 一致

4. **测试流程**
   - 创建新组件后，先测试静态物料
   - 确认渲染正常后，再上传到物料平台
   - 从物料平台拉取后再次测试

## 参考

- [低代码 JSON 与协议现状](./低代码JSON与协议现状.md)
- [组件库与物料库说明](./组件库与物料库说明.md)
- [物料平台接入说明](./物料平台接入说明.md)
