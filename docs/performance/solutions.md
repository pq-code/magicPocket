# 性能优化方案

## 概述

本文档详细阐述 MagicPocket 低代码平台的性能优化方案，针对当前存在的性能问题，提供系统性的解决方案。

## 优化目标

- **响应时间**: 页面操作响应时间 < 100ms
- **内存使用**: 保持在合理范围内，避免内存泄漏
- **CPU 使用**: 降低峰值 CPU 使用率 < 30%
- **大页面支持**: 支持超过 500 个组件的复杂页面
- **用户体验**: 消除卡顿现象，保证流畅操作

## 核心优化策略

### 1. JSON 结构分离与优化

#### 1.1 编辑 JSON 与渲染 JSON 分离

**目的**: 将编辑器专用的复杂 JSON 结构与渲染所需的简洁结构分离

**实现方案**:

```typescript
// 定义转换函数
export function createRenderJSON(editorJSON: EditorPageRoot): RenderPageRoot {
  // 移除编辑器专用属性，保留渲染必需的属性
  const transformNode = (editorNode: EditorCanvasNode): RenderCanvasNode => {
    const filteredProps: Record<string, any> = {};

    // 过滤掉编辑器专用的属性（以 Props 结尾的通常是控制器配置）
    for (const [key, value] of Object.entries(editorNode.props)) {
      if (!key.endsWith('Props')) {
        filteredProps[key] = value;
      }
    }

    return {
      type: editorNode.type,
      key: editorNode.key!,
      props: filteredProps,
      children: editorNode.children.map(transformNode),
      npm: editorNode.npm
    };
  };

  return {
    type: editorJSON.type,
    children: editorJSON.children.map(transformNode),
    script: editorJSON.script,
    css: editorJSON.css
  };
}
```

**使用场景**:
- 渲染引擎使用渲染 JSON
- 编辑器使用完整 JSON
- 两者通过转换函数关联

#### 1.2 精确监听替代深层监听

**当前问题**: 使用 `{ deep: true }` 监听整个 JSON 对象

**优化方案**:

```typescript
// 优化前
watch(
  () => pageJSON.value,
  (newVal) => {
    // 处理整个 JSON 变化
  },
  { deep: true }
);

// 优化后
const renderJSON = computed(() => createRenderJSON(pageJSON.value));

// 监听特定字段而不是整个对象
watch(
  () => renderJSON.value.children,
  (newChildren) => {
    componentList.value = newChildren;
  }
);
```

### 2. 渲染引擎优化

#### 2.1 实现虚拟滚动

**适用场景**: 页面包含大量组件时

```typescript
// 虚拟滚动渲染器
interface VirtualRendererProps {
  items: CanvasNode[];
  itemHeight: number;
  viewportHeight: number;
  bufferCount?: number;
}

const VirtualRenderEngine = defineComponent({
  props: {
    items: Array,
    itemHeight: { type: Number, default: 80 },
    viewportHeight: { type: Number, default: 600 },
    bufferCount: { type: Number, default: 5 }
  },

  setup(props) {
    const containerRef = ref<HTMLDivElement>();
    const visibleRange = ref({ start: 0, end: 10 });

    // 计算可见区域
    const calculateVisibleRange = () => {
      if (!containerRef.value) return { start: 0, end: 0 };

      const scrollTop = containerRef.value.scrollTop;
      const startIndex = Math.floor(scrollTop / props.itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(props.viewportHeight / props.itemHeight) + props.bufferCount,
        props.items.length
      );

      return {
        start: Math.max(0, startIndex - props.bufferCount),
        end: endIndex
      };
    };

    // 监听滚动事件
    const handleScroll = () => {
      visibleRange.value = calculateVisibleRange();
    };

    // 可见项目计算
    const visibleItems = computed(() => {
      return props.items.slice(visibleRange.value.start, visibleRange.value.end);
    });

    // 为可见项目计算样式
    const getPlaceholderHeight = (index: number) => {
      if (index < visibleRange.value.start) {
        return index * props.itemHeight;
      } else if (index >= visibleRange.value.end) {
        return (props.items.length - visibleRange.value.end) * props.itemHeight;
      }
      return 0;
    };

    return () => (
      <div
        ref={containerRef}
        style={{
          height: `${props.viewportHeight}px`,
          overflow: 'auto',
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        {/* 顶部占位符 */}
        {visibleRange.value.start > 0 && (
          <div style={{
            height: `${visibleRange.value.start * props.itemHeight}px`,
            position: 'relative'
          }} />
        )}

        {/* 可见项目 */}
        {visibleItems.value.map((item, idx) => (
          <div
            key={item.key}
            style={{
              height: `${props.itemHeight}px`,
              position: 'absolute',
              top: `${(visibleRange.value.start + idx) * props.itemHeight}px`,
              width: '100%'
            }}
          >
            <TypeRenderEngine item={item} />
          </div>
        ))}

        {/* 底部占位符 */}
        {visibleRange.value.end < props.items.length && (
          <div style={{
            height: `${(props.items.length - visibleRange.value.end) * props.itemHeight}px`,
            position: 'relative'
          }} />
        )}
      </div>
    );
  }
});
```

#### 2.2 组件懒加载与缓存

```typescript
// 组件缓存管理器
class ComponentCache {
  private cache = new Map<string, {
    component: any;
    timestamp: number;
    accessCount: number
  }>();

  private readonly maxAge = 10 * 60 * 1000; // 10分钟
  private readonly maxSize = 100; // 最大缓存数量

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问次数
    cached.accessCount++;
    return cached.component;
  }

  set(key: string, component: any) {
    // 检查缓存大小
    if (this.cache.size >= this.maxSize) {
      this.cleanupLRU();
    }

    this.cache.set(key, {
      component,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  private cleanupLRU() {
    // 按访问频率和时间清理最少使用的
    const entries = Array.from(this.cache.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.accessCount - b.accessCount);

    // 删除前 20% 的条目
    const deleteCount = Math.floor(entries.length * 0.2);
    for (let i = 0; i < deleteCount; i++) {
      this.cache.delete(entries[i].key);
    }
  }
}

// 懒加载组件工厂
export function createLazyComponent(node: CanvasNode) {
  const cacheKey = `${node.type}-${JSON.stringify(node.npm)}`;
  const cached = componentCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const LazyComponent = defineAsyncComponent(() => {
    return loadComponentByNpm(node.npm);
  });

  componentCache.set(cacheKey, LazyComponent);
  return LazyComponent;
}
```

### 3. 历史记录优化

#### 3.1 差分历史记录系统

**目的**: 替代保存完整 JSON 副本的方式，使用操作差分记录

```typescript
// 操作类型定义
type OperationType = 'ADD' | 'REMOVE' | 'UPDATE' | 'MOVE';

interface HistoryOperation {
  type: OperationType;
  path: string; // 节点路径，如 'children[0].children[1].props.title'
  oldValue?: any;
  newValue?: any;
  timestamp: number;
}

class DiffHistoryManager {
  private operations: HistoryOperation[] = [];
  private currentIndex = -1;
  private readonly maxHistory = 50;

  // 添加操作记录
  addOperation(operation: Omit<HistoryOperation, 'timestamp'>) {
    // 如果当前不在历史末尾，删除后续历史（类似传统编辑器的行为）
    if (this.currentIndex < this.operations.length - 1) {
      this.operations = this.operations.slice(0, this.currentIndex + 1);
    }

    this.operations.push({
      ...operation,
      timestamp: Date.now()
    });

    // 限制历史记录数量
    if (this.operations.length > this.maxHistory) {
      this.operations.shift();
      this.currentIndex = this.operations.length - 1;
    } else {
      this.currentIndex = this.operations.length - 1;
    }
  }

  // 撤销操作
  undo(currentJSON: PageRoot): PageRoot | null {
    if (this.currentIndex < 0) return null;

    const operation = this.operations[this.currentIndex];
    this.currentIndex--;

    return this.applyReverseOperation(currentJSON, operation);
  }

  // 重做操作
  redo(currentJSON: PageRoot): PageRoot | null {
    if (this.currentIndex >= this.operations.length - 1) return null;

    this.currentIndex++;
    const operation = this.operations[this.currentIndex];

    return this.applyOperation(currentJSON, operation);
  }

  private applyOperation(json: PageRoot, operation: HistoryOperation): PageRoot {
    const result = JSON.parse(JSON.stringify(json)); // 简化克隆

    switch (operation.type) {
      case 'ADD':
        this.setValueAtPath(result, operation.path, operation.newValue);
        break;
      case 'REMOVE':
        this.removeValueAtPath(result, operation.path);
        break;
      case 'UPDATE':
        this.setValueAtPath(result, operation.path, operation.newValue);
        break;
      case 'MOVE':
        // 实现移动逻辑
        break;
    }

    return result;
  }

  private applyReverseOperation(json: PageRoot, operation: HistoryOperation): PageRoot {
    const result = JSON.parse(JSON.stringify(json));

    switch (operation.type) {
      case 'ADD':
        this.removeValueAtPath(result, operation.path);
        break;
      case 'REMOVE':
        this.setValueAtPath(result, operation.path, operation.oldValue);
        break;
      case 'UPDATE':
        this.setValueAtPath(result, operation.path, operation.oldValue);
        break;
      case 'MOVE':
        // 实现反向移动逻辑
        break;
    }

    return result;
  }

  private setValueAtPath(obj: any, path: string, value: any) {
    const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.').filter(k => k);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  private removeValueAtPath(obj: any, path: string) {
    const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.').filter(k => k);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    delete current[keys[keys.length - 1]];
  }
}
```

### 4. 内存管理优化

#### 4.1 响应式数据优化

```typescript
// 使用 shallowReactive 优化大型对象
import { shallowReactive, reactive, computed } from 'vue';

const optimizedPageJSON = shallowReactive({
  type: 'page',
  title: '页面',
  whetherYouCanDrag: true,
  props: {},
  children: [], // 子节点使用浅响应式
  script: '',
  css: ''
});

// 对于需要深层响应式的部分单独处理
const componentStates = new Map<string, Record<string, any>>();

// 优化渲染引擎状态管理
const RenderEngineWithOptimizedState = defineComponent({
  setup() {
    // 使用计算属性缓存，避免重复计算
    const processedChildren = computed(() => {
      return optimizeChildrenForRendering(pageJSON.value.children);
    });

    // 虚拟化数据处理
    const virtualizedData = useVirtualization(processedChildren.value);

    return { virtualizedData };
  }
});

// 虚拟化钩子
function useVirtualization(items: CanvasNode[]) {
  const containerRef = ref<HTMLElement>();
  const [startIndex, endIndex] = useVirtualScroll(containerRef, items);

  return computed(() => items.slice(startIndex.value, endIndex.value));
}
```

### 5. 异步优化策略

#### 5.1 批量更新

```typescript
// 防抖批量更新
class BatchUpdater {
  private pendingUpdates: Array<() => void> = [];
  private updateScheduled = false;
  private readonly delay = 16; // ~60fps

  scheduleUpdate(updateFn: () => void) {
    this.pendingUpdates.push(updateFn);

    if (!this.updateScheduled) {
      this.updateScheduled = true;
      setTimeout(() => {
        this.processUpdates();
      }, this.delay);
    }
  }

  private processUpdates() {
    // 批量处理所有待更新操作
    this.pendingUpdates.forEach(update => update());
    this.pendingUpdates = [];
    this.updateScheduled = false;
  }
}

const batchUpdater = new BatchUpdater();

// 使用示例
const handleMultipleChanges = () => {
  // 而不是立即更新
  // updateComponentProps(props1);
  // updateComponentProps(props2);
  // updateComponentProps(props3);

  // 使用批量更新
  batchUpdater.scheduleUpdate(() => updateComponentProps(props1));
  batchUpdater.scheduleUpdate(() => updateComponentProps(props2));
  batchUpdater.scheduleUpdate(() => updateComponentProps(props3));
};
```

### 6. 组件层面优化

#### 6.1 使用 Vue.memo 优化渲染

```typescript
// 优化组件渲染
const MemoizedRenderNode = memo(
  ({ item, children }: { item: CanvasNode; children?: any }) => {
    return (
      <TypeRenderEngine item={item}>
        {children}
      </TypeRenderEngine>
    );
  },
  (prevProps, nextProps) => {
    // 只有在关键属性变化时才重新渲染
    return prevProps.item.key === nextProps.item.key &&
           JSON.stringify(prevProps.item.props) === JSON.stringify(nextProps.item.props);
  }
);
```

#### 6.2 使用 v-memo 优化列表渲染

```vue
<template>
  <!-- 使用 v-memo 优化列表渲染 -->
  <div v-for="node in visibleNodes"
       :key="node.key"
       v-memo="[node.key, node.type, JSON.stringify(node.props)]">
    <TypeRenderEngine :item="node" />
  </div>
</template>
```

## 性能监控与测试

### 1. 实时性能监控

```typescript
// 性能监控工具
class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];

  startTracking(name: string) {
    return performance.mark(name);
  }

  endTracking(startMark: string, measureName: string) {
    performance.measure(measureName, startMark);
    const measurement = performance.getEntriesByName(measureName)[0];

    const metric: PerformanceMetric = {
      name: measureName,
      duration: measurement.duration,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    this.reportIfExceedsThreshold(metric);
  }

  private reportIfExceedsThreshold(metric: PerformanceMetric) {
    if (metric.duration > 100) { // 超过 100ms 警告
      console.warn(`性能警告: ${metric.name} 耗时 ${metric.duration}ms`);
    }
  }
}

const perfTracker = new PerformanceTracker();

// 使用示例
const renderComponent = (node: CanvasNode) => {
  perfTracker.startTracking('render-start');
  const result = renderComponentImpl(node);
  perfTracker.endTracking('render-start', 'component-render');
  return result;
};
```

### 2. 性能测试用例

```typescript
// 性能测试套件
describe('Performance Tests', () => {
  test('Large page rendering', async () => {
    const largePage = createLargeTestPage(500); // 创建500个节点的页面

    const startTime = performance.now();
    const { result } = render(<RenderEngine pageJSON={largePage} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(500); // 应在500ms内完成
  });

  test('JSON update performance', async () => {
    const pageJSON = ref(createDefaultPageRoot());
    const startTime = performance.now();

    // 模拟频繁更新
    for (let i = 0; i < 100; i++) {
      pageJSON.value.children.push(createTestNode(i));
    }

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // 100次更新应在1秒内
  });
});
```

## 实施路线图

### 第一阶段：基础优化 (Week 1-2)
- [ ] 实现编辑 JSON 与渲染 JSON 分离
- [ ] 替换深层监听为精确监听
- [ ] 实现基本组件缓存

### 第二阶段：进阶优化 (Week 3-4)
- [ ] 实现虚拟滚动渲染器
- [ ] 优化历史记录系统
- [ ] 实现批量更新机制

### 第三阶段：全面优化 (Week 5-6)
- [ ] 实现差分历史记录
- [ ] 完善性能监控
- [ ] 优化内存管理
- [ ] 性能测试与验证

## 验证指标

### 量化指标
- **渲染响应时间**: 从 >500ms 降至 <100ms
- **内存使用**: 降低 30% 以上
- **大型页面支持**: 从 <100 节点提升至 >500 节点
- **CPU 使用率**: 峰值从 80% 降至 <30%

### 用户体验指标
- 消除卡顿现象
- 操作响应流畅
- 支持复杂页面编辑

## 风险控制

### 技术风险
- **兼容性**: 确保优化不影响现有功能
- **稳定性**: 充分测试后再上线
- **回滚计划**: 保留原有实现在紧急情况下回滚

### 实施风险
- **开发进度**: 分阶段实施，及时调整计划
- **测试覆盖**: 完善自动化测试覆盖
- **性能回归**: 建立性能基线防止回归

通过以上系统性的优化方案，MagicPocket 低代码平台的性能将得到显著提升，用户体验将大幅改善。