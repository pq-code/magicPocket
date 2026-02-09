# 组件标准规范

## 概述

本文档定义了 MagicPocket 低代码平台中所有组件必须遵循的标准规范。所有组件（无论是内置组件、第三方组件包装还是自定义组件）都必须遵守这些规范以确保系统的统一性、可维护性和扩展性。

## 组件结构规范

### 文件组织结构

```
packages/
└── ComponentName/
    ├── index.ts              # 组件入口文件
    ├── meta.ts               # 组件元数据
    ├── test/                 # 测试文件
    │   └── ComponentName.test.ts
    ├── src/
    │   └── ComponentName.jsx # 组件实现
    ├── style/
    │   └── index.less        # 组件样式
    └── README.md             # 组件使用说明
```

### 命名规范

#### 组件命名
- 使用 PascalCase（大驼峰命名法）
- 名称应具有描述性，体现组件功能
- 避免过于宽泛的命名

```typescript
// 正确
const Button = defineComponent({...});
const DataGrid = defineComponent({...});

// 错误
const Btn = defineComponent({...});  // 过于简短
const MyComp = defineComponent({...}); // 不够描述性
```

#### 文件命名
- 源文件: `ComponentName.jsx`
- 样式文件: `index.less`
- 元数据文件: `meta.ts`
- 测试文件: `ComponentName.test.ts`

### 代码结构

#### 组件实现规范

```typescript
// 推荐的组件实现结构
import { defineComponent, ref, computed, watch } from 'vue';

// 类型定义
interface ComponentProps {
  title?: string;
  visible?: boolean;
  onAction?: (event: Event) => void;
}

// 默认值
const DEFAULT_PROPS = {
  title: '默认标题',
  visible: true
};

// 主组件
const MyComponent = defineComponent({
  name: 'MyComponent', // 组件名称

  // 属性定义
  props: {
    title: {
      type: String,
      default: DEFAULT_PROPS.title
    },
    visible: {
      type: Boolean,
      default: DEFAULT_PROPS.visible
    },
    onAction: Function
  },

  // 事件定义
  emits: ['action'],

  // 主要逻辑
  setup(props, { emit, slots }) {
    // 响应式数据
    const localState = ref('');

    // 计算属性
    const computedValue = computed(() => {
      return props.title.toUpperCase();
    });

    // 方法
    const handleClick = (event: MouseEvent) => {
      emit('action', event);
      props.onAction?.(event);
    };

    // 返回渲染函数所需内容
    return () => (
      <div class="my-component">
        {props.visible && (
          <h3 onClick={handleClick}>{computedValue.value}</h3>
        )}
        {slots.default && slots.default()}
      </div>
    );
  }
});

export default MyComponent;
```

#### 样式规范

```less
// 使用 BEM 命名规范
.my-component {
  // 组件主体样式
  padding: 16px;
  border: 1px solid #ebeef5;

  // 元素
  &__title {
    font-size: 16px;
    font-weight: bold;
  }

  // 修饰符
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--large {
    padding: 24px;
  }

  // 子组件
  &__content {
    margin-top: 8px;
  }
}

// 避免全局样式污染
// .global-class { ... } // ❌ 不要这样做
```

## 组件元数据规范

### Meta 文件结构

```typescript
import type { ComponentMeta } from '@renderer/type/component-meta';

const meta: ComponentMeta = {
  // 必需字段
  componentName: '按钮',           // 组件显示名称
  type: 'Button',                 // 组件类型标识
  description: '一个可点击的按钮组件', // 组件描述
  group: '基础组件',               // 组件分组
  icon: 'icon-button',            // 组件图标

  // 渲染信息
  npm: {
    exportName: 'Button',
    package: '@renderer/packages',
    destructuring: true
  },

  // 属性配置
  props: [
    {
      name: 'text',
      title: '按钮文本',
      type: 'string',
      defaultValue: '按钮',
      setter: 'StringSetter',
      description: '按钮显示的文本内容'
    },
    {
      name: 'type',
      title: '按钮类型',
      type: 'string',
      defaultValue: 'default',
      setter: {
        componentName: 'SelectSetter',
        props: {
          options: [
            { label: '默认', value: 'default' },
            { label: '主要', value: 'primary' },
            { label: '成功', value: 'success' },
            { label: '警告', value: 'warning' },
            { label: '危险', value: 'danger' }
          ]
        }
      }
    },
    {
      name: 'size',
      title: '按钮尺寸',
      type: 'string',
      defaultValue: 'medium',
      setter: {
        componentName: 'RadioGroupSetter',
        props: {
          options: [
            { label: '大', value: 'large' },
            { label: '中', value: 'medium' },
            { label: '小', value: 'small' }
          ]
        }
      }
    },
    {
      name: 'loading',
      title: '加载状态',
      type: 'boolean',
      defaultValue: false,
      setter: 'BoolSetter',
      description: '按钮是否处于加载状态'
    }
  ],

  // 插槽配置
  slots: [
    {
      name: 'default',
      title: '内容插槽',
      description: '按钮内部的自定义内容'
    }
  ],

  // 事件配置
  events: [
    {
      name: 'click',
      title: '点击事件',
      description: '按钮被点击时触发'
    }
  ],

  // 默认配置
  defaultProps: {
    text: '按钮',
    type: 'default'
  },

  // 相关组件
  relatedComponents: ['Icon', 'Link']
};

export default meta;
```

## 渲染引擎适配规范

### 组件与渲染引擎集成

所有组件必须适配 TypeRenderEngine 的组件加载机制：

```typescript
// 在 packages/index.ts 中注册
export { default as Button, meta as ButtonMeta } from './Button';
export { default as Input, meta as InputMeta } from './Input';
// ... 其他组件
```

### 组件加载协议

```typescript
// 组件需要支持的加载协议
interface LoadableComponent {
  // 组件名称
  displayName: string;

  // 低代码元数据
  lowCodeMeta?: ComponentMeta;

  // Vue 组件接口
  props?: Record<string, any>;
  emits?: string[];
  setup?: Function;
}
```

## 属性配置规范

### 标准属性类型

```typescript
// 支持的标准属性类型
type StandardPropType =
  | 'string'      // 字符串
  | 'number'      // 数字
  | 'boolean'     // 布尔值
  | 'object'      // 对象
  | 'array'       // 数组
  | 'enum'        // 枚举
  | 'function'    // 函数
  | 'slot'        // 插槽
  | 'event'       // 事件
  | 'color'       // 颜色
  | 'size'        // 尺寸
  | 'icon'        // 图标
  | 'text'        // 多行文本
  | 'expression'  // 表达式
  | 'variable';   // 变量

// 属性定义接口
interface ComponentProp {
  name: string;              // 属性名
  title: string;             // 属性标题（中文）
  description?: string;      // 属性描述
  type: StandardPropType;    // 属性类型
  defaultValue?: any;        // 默认值
  required?: boolean;        // 是否必需
  setter?: SetterConfig;     // 属性设置器配置
  condition?: Condition;     // 显示条件
  tooltip?: string;          // 提示信息
  group?: string;            // 属性分组
}

// 设置器配置
interface SetterConfig {
  componentName: string;     // 设置器组件名
  props?: Record<string, any>; // 设置器属性
}
```

### 常用属性设置器

```typescript
// 内置设置器
export const SETTER_COMPONENTS = {
  'StringSetter': () => import('./setters/StringSetter'),
  'NumberSetter': () => import('./setters/NumberSetter'),
  'BoolSetter': () => import('./setters/BoolSetter'),
  'TextSetter': () => import('./setters/TextSetter'),
  'ColorSetter': () => import('./setters/ColorSetter'),
  'SelectSetter': () => import('./setters/SelectSetter'),
  'RadioGroupSetter': () => import('./setters/RadioGroupSetter'),
  'CheckboxGroupSetter': () => import('./setters/CheckboxGroupSetter'),
  'SliderSetter': () => import('./setters/SliderSetter'),
  'ExpressionSetter': () => import('./setters/ExpressionSetter'),
  'VariableSetter': () => import('./setters/VariableSetter')
};
```

## 组件通信规范

### 事件规范

```typescript
// 事件定义示例
const events = [
  {
    name: 'click',
    title: '点击事件',
    description: '组件被点击时触发',
    arguments: [
      { name: 'event', type: 'MouseEvent', description: '鼠标事件对象' }
    ]
  },
  {
    name: 'change',
    title: '值改变事件',
    description: '组件值发生改变时触发',
    arguments: [
      { name: 'value', type: 'any', description: '新的值' }
    ]
  }
];
```

### 插槽规范

```typescript
// 插槽定义示例
const slots = [
  {
    name: 'default',
    title: '默认插槽',
    description: '组件的主要内容区域'
  },
  {
    name: 'header',
    title: '头部插槽',
    description: '组件头部内容区域'
  },
  {
    name: 'footer',
    title: '底部插槽',
    description: '组件底部内容区域'
  }
];
```

## 组件性能规范

### 性能优化要求

1. **避免不必要的重渲染**
   - 使用 `computed` 进行计算属性缓存
   - 使用 `shallowRef` 或 `reactive` 适当管理状态
   - 合理使用 `v-memo` 进行渲染优化

2. **合理的数据结构**
   - 避免深层嵌套的对象
   - 使用 `Map` 或 `Set` 优化查找性能
   - 适时使用虚拟滚动

3. **组件懒加载**
   ```typescript
   // 对于复杂的子组件使用懒加载
   const LazySubComponent = defineAsyncComponent(() =>
     import('./SubComponent')
   );
   ```

### 内存管理

- 及时清理事件监听器
- 合理使用 `watch` 和 `watchEffect`，记得停止监听
- 避免循环引用

## 组件测试规范

### 测试文件结构

```
packages/ComponentName/
├── test/
│   ├── unit/              # 单元测试
│   │   └── ComponentName.unit.test.ts
│   ├── integration/       # 集成测试
│   │   └── ComponentName.integration.test.ts
│   └── e2e/             # 端到端测试
│       └── ComponentName.e2e.test.ts
```

### 单元测试规范

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MyComponent from '../src/MyComponent';

describe('MyComponent', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('默认标题');
  });

  it('handles click events properly', async () => {
    const mockFn = vi.fn();
    const wrapper = mount(MyComponent, {
      props: {
        onAction: mockFn
      }
    });

    await wrapper.find('h3').trigger('click');
    expect(mockFn).toHaveBeenCalled();
  });

  it('updates visibility based on prop', async () => {
    const wrapper = mount(MyComponent);

    expect(wrapper.find('h3').exists()).toBe(true);

    await wrapper.setProps({ visible: false });
    expect(wrapper.find('h3').exists()).toBe(false);
  });
});
```

## 国际化规范

### 国际化支持

组件需要支持国际化，使用标准的 i18n 机制：

```typescript
// 组件内的国际化
import { useI18n } from 'vue-i18n';

const MyComponent = defineComponent({
  setup() {
    const { t } = useI18n();

    return () => (
      <div class="my-component">
        <h3>{t('component.title')}</h3>
        <p>{t('component.description')}</p>
      </div>
    );
  }
});
```

### 语言包结构

```typescript
// 国际化语言包示例
export default {
  zh: {
    component: {
      title: '组件标题',
      description: '组件描述',
      actions: {
        confirm: '确定',
        cancel: '取消'
      }
    }
  },
  en: {
    component: {
      title: 'Component Title',
      description: 'Component Description',
      actions: {
        confirm: 'Confirm',
        cancel: 'Cancel'
      }
    }
  }
};
```

## 组件发布规范

### 版本管理

- 使用语义化版本控制 (SemVer)
- 遵循 `MAJOR.MINOR.PATCH` 格式
- 破坏性变更需要增加主版本号

### 包发布

```json
{
  "name": "@magicipocket/button",
  "version": "1.0.0",
  "description": "MagicPocket 低代码平台按钮组件",
  "keywords": ["magicipocket", "lowcode", "button"],
  "author": "MagicPocket Team",
  "license": "MIT",
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0"
  }
}
```

## 代码审查清单

在提交组件代码前，请检查以下项目：

- [ ] 组件遵循文件结构规范
- [ ] 组件名称符合命名规范
- [ ] 代码风格符合 ESLint 规则
- [ ] 组件实现了完整的元数据定义
- [ ] 组件具备必要的测试用例
- [ ] 组件支持主题定制
- [ ] 组件支持国际化
- [ ] 组件具备良好的性能表现
- [ ] 组件具备适当的错误处理机制
- [ ] 组件具有清晰的文档说明
- [ ] 组件没有内存泄漏风险
- [ ] 组件支持无障碍访问 (a11y)
- [ ] 组件支持键盘导航

## 组件审核流程

1. **代码提交**: 提交代码和相关测试
2. **自动化检查**: CI/CD 自动检查代码质量
3. **同行评审**: 至少一位同事进行代码审查
4. **测试验证**: 验证组件功能和性能
5. **文档审核**: 确认文档完整性
6. **集成测试**: 测试组件在平台中的表现
7. **批准发布**: 通过所有审核后合并到主分支