# 组件开发指南

## 组件库概述

MagicPocket 低代码平台的组件库是整个系统的核心，提供了一系列可视化组件供用户拖拽使用。组件库的设计遵循以下原则：

1. **标准化**: 统一的接口规范
2. **可复用**: 高度模块化设计
3. **易扩展**: 支持自定义组件
4. **AI 友好**: 结构清晰，便于理解和操作

## 组件分类

### 按功能分类
- **基础组件**: div容器、文本、按钮等
- **表单组件**: 输入框、下拉选择、日期选择等
- **布局组件**: 卡片、表格、分栏等
- **导航组件**: 菜单、标签页、面包屑等
- **反馈组件**: 弹窗、消息提示、加载等

### 按来源分类
- **内置组件**: 框架自带的基础组件
- **第三方组件**: 如 Element Plus 等 UI 库
- **自定义组件**: 业务定制组件

## 组件接口规范

### 标准组件结构

```typescript
interface LowCodeComponent {
  // 组件基本信息
  componentName: string;        // 组件显示名称
  type: string;                 // 组件类型标识符
  icon?: string;                // 组件图标
  group?: string;               // 组件所属分组

  // 渲染信息
  npm?: NodeNpmInfo;            // 组件 npm 信息
  props: Record<string, any>;   // 组件属性配置

  // 控制器信息（编辑态）
  controllers?: ControllerConfig[];  // 控制器配置
  children?: CanvasNode[];      // 子组件
}
```

### 组件元数据结构

```typescript
interface ComponentMeta {
  // 基本信息
  title: string;                // 组件标题
  description: string;          // 组件描述
  category: string;             // 组件分类

  // 属性配置
  props: ComponentProp[];       // 组件属性列表
  events?: ComponentEvent[];    // 组件事件列表
  slots?: ComponentSlot[];      // 插槽定义

  // 渲染配置
  defaultProps?: Record<string, any>;  // 默认属性
  relatedComponents?: string[];        // 相关组件
}

interface ComponentProp {
  name: string;                 // 属性名
  title: string;                // 属性标题
  description?: string;         // 属性描述
  type: PropType;               // 属性类型
  defaultValue?: any;           // 默认值
  setter?: SetterConfig;        // 属性设置器配置
}

type PropType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
```

## 组件开发流程

### 1. 创建组件文件结构

```
packages/
└── MyComponent/
    ├── index.ts              # 组件入口
    ├── meta.ts               # 组件元数据
    ├── src/
    │   └── MyComponent.jsx   # 组件实现
    └── style/
        └── index.less        # 组件样式
```

### 2. 组件实现示例

**src/MyComponent.jsx**
```jsx
import { defineComponent } from 'vue';

const MyComponent = defineComponent({
  name: 'MyComponent',

  props: {
    title: {
      type: String,
      default: '默认标题'
    },
    content: {
      type: String,
      default: '默认内容'
    },
    visible: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { slots }) {
    return () => (
      <div class="my-component">
        {props.visible && (
          <>
            <h3 class="my-component-title">{props.title}</h3>
            <div class="my-component-content">{props.content}</div>
            {slots.default && slots.default()}
          </>
        )}
      </div>
    );
  }
});

export default MyComponent;
```

**meta.ts**
```typescript
export default {
  componentName: '自定义组件',
  title: 'MyComponent',
  type: 'MyComponent',
  description: '这是一个自定义组件示例',
  icon: 'icon-custom',
  group: '自定义组件',

  props: [
    {
      name: 'title',
      title: '标题',
      type: 'string',
      defaultValue: '默认标题',
      setter: 'StringSetter'
    },
    {
      name: 'content',
      title: '内容',
      type: 'string',
      defaultValue: '默认内容',
      setter: 'TextAreaSetter'
    },
    {
      name: 'visible',
      title: '是否可见',
      type: 'boolean',
      defaultValue: true,
      setter: 'BoolSetter'
    }
  ]
};
```

**index.ts**
```typescript
import MyComponent from './src/MyComponent';
import meta from './meta';

MyComponent.displayName = 'MyComponent';
MyComponent.lowCodeMeta = meta;

export { MyComponent as default, meta };
```

### 3. 注册组件

将新组件添加到组件库入口文件中：

**packages/index.ts**
```typescript
export { default as MyComponent, meta as MyComponentMeta } from './MyComponent';
```

## 组件注册机制

### 全局组件注册

```typescript
// 组件注册中心
import { App } from 'vue';

// 自动注册 packages 目录下的所有组件
export function registerComponents(app: App) {
  const componentModules = import.meta.glob('./packages/*/index.ts', { eager: true });

  Object.values(componentModules).forEach((module: any) => {
    if (module.default && module.meta) {
      const { default: component, meta } = module;
      app.component(meta.type, component);

      // 注册到组件库
      registerToLibrary(meta.type, meta);
    }
  });
}
```

### 组件库管理

```typescript
// 组件库注册和管理
class ComponentLibrary {
  private components: Map<string, ComponentMeta> = new Map();

  register(type: string, meta: ComponentMeta) {
    this.components.set(type, meta);
  }

  get(type: string): ComponentMeta | undefined {
    return this.components.get(type);
  }

  getAll(): ComponentMeta[] {
    return Array.from(this.components.values());
  }

  getByGroup(group: string): ComponentMeta[] {
    return this.getAll().filter(meta => meta.group === group);
  }
}

export const componentLibrary = new ComponentLibrary();
```

## 组件属性配置

### 属性设置器 (Setter)

不同的数据类型需要对应的设置器：

```typescript
// 字符串设置器
export const StringSetter = defineComponent({
  props: ['value'],
  emits: ['change'],

  setup(props, { emit }) {
    return () => (
      <ElInput
        modelValue={props.value}
        onUpdate:modelValue={(val) => emit('change', val)}
      />
    );
  }
});

// 数字设置器
export const NumberSetter = defineComponent({
  props: ['value'],
  emits: ['change'],

  setup(props, { emit }) {
    return () => (
      <ElInputNumber
        modelValue={props.value}
        onUpdate:modelValue={(val) => emit('change', val)}
      />
    );
  }
});

// 布尔设置器
export const BoolSetter = defineComponent({
  props: ['value'],
  emits: ['change'],

  setup(props, { emit }) {
    return () => (
      <ElSwitch
        modelValue={props.value}
        onUpdate:modelValue={(val) => emit('change', val)}
      />
    );
  }
});
```

### 属性配置面板

```jsx
// 属性配置面板
const PropsPanel = defineComponent({
  props: ['selectedComponent'],

  setup(props) {
    const updateProp = (propName: string, value: any) => {
      // 更新选中组件的属性
      props.selectedComponent.props[propName] = value;
    };

    return () => {
      if (!props.selectedComponent) return <div>请选择组件</div>;

      const meta = componentLibrary.get(props.selectedComponent.type);
      if (!meta) return <div>组件元数据不存在</div>;

      return (
        <div class="props-panel">
          <h4>{meta.componentName} 属性配置</h4>

          {meta.props.map(prop => (
            <div key={prop.name} class="prop-item">
              <label>{prop.title}</label>

              {/* 根据设置器类型渲染 */}
              {prop.setter === 'StringSetter' && (
                <StringSetter
                  value={props.selectedComponent.props[prop.name]}
                  onChange={(val) => updateProp(prop.name, val)}
                />
              )}

              {prop.setter === 'NumberSetter' && (
                <NumberSetter
                  value={props.selectedComponent.props[prop.name]}
                  onChange={(val) => updateProp(prop.name, val)}
                />
              )}

              {prop.setter === 'BoolSetter' && (
                <BoolSetter
                  value={props.selectedComponent.props[prop.name]}
                  onChange={(val) => updateProp(prop.name, val)}
                />
              )}
            </div>
          ))}
        </div>
      );
    };
  }
});
```

## 组件生命周期

### 组件创建
1. 用户从组件面板拖拽组件到画布
2. 系统根据组件元数据创建组件实例
3. 生成唯一 key 值
4. 设置默认属性值

### 组件更新
1. 用户在属性面板修改组件属性
2. 组件实例属性被更新
3. 触发组件重新渲染

### 组件删除
1. 用户选择要删除的组件
2. 从 JSON 结构中移除组件
3. 清理相关资源

## 组件性能优化

### 1. 组件懒加载
```typescript
// 懒加载组件工厂
export function lazyLoadComponent(type: string) {
  return defineAsyncComponent(() => {
    return import(`@renderer/packages/${type}/src/${type}.jsx`)
      .catch(() => import('@renderer/packages/DummyComponent')); // 降级处理
  });
}
```

### 2. 组件缓存
```typescript
// 组件缓存机制
class ComponentCache {
  private cache: Map<string, any> = new Map();

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, component: any) {
    this.cache.set(key, component);
  }

  clear() {
    this.cache.clear();
  }
}

export const componentCache = new ComponentCache();
```

### 3. 虚拟化渲染
对于列表类组件，采用虚拟化渲染：

```typescript
// 虚拟列表组件
const VirtualList = defineComponent({
  props: {
    items: Array,
    itemHeight: Number,
    visibleCount: Number
  },

  setup(props) {
    const visibleRange = ref({ start: 0, end: props.visibleCount || 10 });

    const visibleItems = computed(() => {
      return props.items.slice(
        visibleRange.value.start,
        visibleRange.value.end
      );
    });

    // 监听滚动事件，更新可见范围

    return { visibleItems };
  }
});
```

## 组件测试

### 单元测试
```typescript
import { mount } from '@vue/test-utils';
import MyComponent from './src/MyComponent';

describe('MyComponent', () => {
  test('renders title correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test Title' }
    });

    expect(wrapper.text()).toContain('Test Title');
  });

  test('hides content when visible is false', async () => {
    const wrapper = mount(MyComponent, {
      props: { visible: false }
    });

    await wrapper.setProps({ visible: true });
    expect(wrapper.find('.my-component-content').exists()).toBe(true);
  });
});
```

### 集成测试
测试组件与其他系统的集成情况：

```typescript
// 测试组件能否正确地被拖拽到画布上
test('component can be dragged to canvas', async () => {
  const component = {
    type: 'MyComponent',
    componentName: '自定义组件',
    props: {}
  };

  // 模拟拖拽操作
  await simulateDragToCanvas(component);

  // 验证组件是否被正确添加到画布
  const canvasComponents = getCanvasComponents();
  expect(canvasComponents.some(c => c.type === 'MyComponent')).toBe(true);
});
```

## 最佳实践

### 1. 组件设计原则
- **单一职责**: 每个组件只负责一个功能
- **可配置**: 提供丰富的属性配置选项
- **可组合**: 支持嵌套使用
- **一致性**: 与其他组件保持一致的交互模式

### 2. 代码质量
- **类型安全**: 使用 TypeScript 提供完整的类型定义
- **可维护性**: 代码结构清晰，注释完整
- **性能优化**: 避免不必要的重渲染
- **错误处理**: 完善的错误边界和异常处理

### 3. 文档完善
- 每个组件都应有详细的使用文档
- 提供组件的最佳使用示例
- 说明组件的性能特点和注意事项

### 4. 样式规范
- 使用 BEM 命名规范
- 组件样式隔离，避免全局污染
- 提供主题定制能力