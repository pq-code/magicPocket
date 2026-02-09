# 渲染引擎设计

## 渲染引擎 (RenderEngine)

### 位置
`/src/renderer/src/internal/RenderEngine/src/RenderEngine.jsx`

### 职责
- 根据页面 JSON 配置渲染真实的 UI 组件树
- 支持编辑模式（可拖拽排序）和预览模式（只读展示）
- 深度递归遍历组件树，逐层渲染子组件
- 处理组件选中、拖拽、历史记录等功能

### 架构特点
- **响应式数据驱动**: 监听 pageJSON 变化并自动重新渲染
- **可插拔架构**: 通过 ComponentMaker 和 TypeRenderEngine 支持多种组件类型
- **拖拽支持**: 集成 vue-draggable-plus 实现组件拖拽排序
- **模式切换**: 支持编辑模式和预览模式

### 关键流程
1. 初始化：从 pinia store 获取页面数据
2. 监听：watch pageJSON 变化并同步到本地状态
3. 渲染：深度遍历组件树，递归渲染子组件
4. 交互：处理拖拽、点击选中等用户操作

### 性能问题分析

#### 当前问题
1. **深层监听**: 使用 `{ deep: true }` 监听整个 pageJSON 对象
2. **频繁重渲染**: JSON 任何变化都触发整个组件树重渲染
3. **内存占用**: 复杂页面的 JSON 结构导致内存消耗大

#### 优化策略

##### 1. 分离渲染 JSON
创建专门用于渲染的简化 JSON 结构：

```javascript
// 优化后的渲染引擎部分代码概念
const optimizedRenderEngine = defineComponent({
  setup(props) {
    // 使用计算属性分离渲染数据
    const renderData = computed(() => {
      return transformToRenderJSON(pageJSON.value);
    });

    // 监听特定字段而不是整个 JSON
    watch(
      () => pageJSON.value.children,
      (newChildren) => {
        componentList.value = newChildren;
      }
    );
  }
});
```

##### 2. 实现虚拟滚动
对于包含大量组件的页面，使用虚拟滚动技术：

```javascript
// 虚拟滚动概念实现
const VirtualRenderEngine = defineComponent({
  setup(props) {
    const visibleRange = ref({ start: 0, end: 20 });

    const visibleComponents = computed(() => {
      return componentList.value.slice(
        visibleRange.value.start,
        visibleRange.value.end
      );
    });
  }
});
```

##### 3. 组件懒加载
只在组件进入可视区域时才加载：

```javascript
// 懒加载组件工厂
const LazyComponentFactory = (componentType) => {
  return defineAsyncComponent(() => {
    return import(`@renderer/packages/${componentType}/src/${componentType}.jsx`);
  });
};
```

### 组件 Maker (ComponentMaker)

#### 位置
`/src/renderer/src/internal/RenderEngine/components/ComponentMaker.jsx`

#### 职责
- 包装可拖拽组件
- 提供拖拽、选中等交互功能
- 处理组件操作事件

### 类型渲染引擎 (TypeRenderEngine)

#### 位置
`/src/renderer/src/internal/RenderEngine/components/TypeRenderEngine.jsx`

#### 职责
- 根据节点类型动态解析组件
- 支持多种组件加载来源
- 处理组件注册表映射

#### 优化建议
1. **组件缓存**: 对已加载的组件进行缓存，避免重复加载
2. **预加载**: 预加载常用组件，提升首次渲染速度
3. **错误处理**: 完善未知组件的错误处理和降级策略

```javascript
// 组件缓存优化概念
const componentCache = new Map();

const getCachedComponent = (npmInfo) => {
  const cacheKey = JSON.stringify(npmInfo);
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey);
  }

  const component = createAsyncComponent(npmInfo);
  componentCache.set(cacheKey, component);
  return component;
};
```

## 预览模式 (Preview Mode)

通过 Provider/Inject 机制实现预览模式：

```javascript
// 预览模式上下文
provide(PREVIEW_MODE_KEY, true);

// 在渲染引擎中
const previewMode = inject(PREVIEW_MODE_KEY, false);
const whetherYouCanDrag = computed(() =>
  previewMode ? false : pageJSON.value.whetherYouCanDrag
);
```

## 性能优化检查清单

- [ ] 替换深层监听为精确监听
- [ ] 实现渲染 JSON 与编辑 JSON 分离
- [ ] 添加组件缓存机制
- [ ] 实现虚拟滚动（可选）
- [ ] 优化拖拽性能
- [ ] 减少不必要的重渲染
- [ ] 优化内存使用