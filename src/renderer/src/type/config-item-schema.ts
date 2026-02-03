/**
 * 配置项 Schema 类型定义
 * 统一「可配置项」的结构与类型描述，供组件库 meta 与控制器 PropsItem 共用
 * @see docs/协议优化建议-参考博客.md
 */

/** 配置项选项（用于 select/segmented） */
export interface ConfigItemOption {
  label: string;
  value: string | number | boolean;
}

/** 配置项 Schema：描述单个配置项的结构 */
export interface ConfigItemSchema {
  /** 唯一键，对应节点 props 中的字段名 */
  key: string;
  /** 展示标签 */
  label: string;
  /** 控件类型：input | segmented | 等 */
  type: 'input' | 'segmented' | 'number' | 'boolean';
  /** 默认值 */
  value?: unknown;
  /** 是否必填 */
  required?: boolean;
  /** 选项列表（segmented 等使用） */
  options?: ConfigItemOption[];
  /** 右侧单位/后缀文案，如 px、url */
  rightText?: string;
  /** 是否长输入框 */
  longInput?: boolean;
}

/** 配置分组：如 divProps、titleProps、formItemProps */
export interface ConfigPropsGroup {
  /** 分组标题 */
  title: string;
  /** 该分组下的配置项列表 */
  children: ConfigItemSchema[];
  /** 可选：自定义面板组件路径，用于复杂配置（如 FormItemConfig） */
  component?: string;
  /** 可选：分组内联样式 */
  style?: Record<string, string>;
}

/** 判断是否为配置分组（约定：key 以 Props 结尾） */
export const isConfigPropsKey = (key: string): boolean => key.includes('Props');
