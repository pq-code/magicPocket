/**
 * 页面节点协议类型定义
 * 显式约定 pageJSON 根与画布节点的数据结构，避免隐式约定漂移
 * @see docs/低代码JSON与协议现状.md
 */

/**
 * 组件加载来源类型
 * - builtin: 内置组件（container 等）
 * - local: 项目内组件（packages/）
 * - npm: npm 包组件（element-plus 等）
 * - remote: 远程动态加载（CDN/URL）
 * - localFs: 本地文件系统组件库
 */
export type ComponentSourceType = 'builtin' | 'local' | 'npm' | 'remote' | 'localFs';

/** npm/组件加载信息，用于描述「如何加载」组件 */
export interface NodeNpmInfo {
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
  /** 加载来源类型，用于加载器分层 */
  sourceType?: ComponentSourceType;
  /** 私有 npm registry 地址 */
  registry?: string;
}

/** 画布节点：画布上每个组件对应一个节点实例 */
export interface CanvasNode {
  /** 组件类型，渲染器据此选组件 */
  type: string;
  /** 实例唯一 id，用于选中/删除/历史，应在创建时生成，渲染时不再修改 */
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

/** 页面根节点：整页描述的根 */
export interface PageRoot {
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
  /** 可选：协议版本，便于后续兼容 */
  version?: string;
  /** 可选：元数据，便于协作与审计 */
  metadata?: {
    name?: string;
    description?: string;
    updatedAt?: string;
  };
}

/**
 * 提取可序列化的页面快照，排除 VueDraggable/Sortable 注入的循环引用
 * 仅保留协议约定的字段，用于历史记录比较与存储
 */
export function toSerializablePageSnapshot(page: unknown): PageRoot | null {
  if (!page || typeof page !== 'object') return null;
  const p = page as Record<string, unknown>;
  const children = Array.isArray(p.children) ? p.children : [];

  return {
    type: 'page',
    title: (p.title as string) ?? '页面',
    whetherYouCanDrag: Boolean(p.whetherYouCanDrag ?? true),
    props: (p.props && typeof p.props === 'object') ? toPlainObject(p.props) : {},
    children: children.map((child) => toSerializableNode(child)).filter(Boolean) as CanvasNode[],
  };
}

/** 提取可序列化的节点，排除 Sortable 等注入的非协议字段 */
function toSerializableNode(node: unknown): Partial<CanvasNode> | null {
  if (!node || typeof node !== 'object') return null;
  const n = node as Record<string, unknown>;
  const children = Array.isArray(n.children) ? n.children : [];

  return {
    type: (n.type as string) ?? '',
    key: n.key as string | undefined,
    componentName: (n.componentName as string) ?? '',
    group: n.group as string | undefined,
    icon: n.icon as string | undefined,
    props: toPlainObject(n.props),
    children: children.map((child) => toSerializableNode(child)).filter(Boolean) as CanvasNode[],
    npm: (n.npm && typeof n.npm === 'object') ? (toPlainObject(n.npm) as unknown as NodeNpmInfo) : undefined,
  };
}

/** 递归转为纯 JSON 对象，排除 Sortable/Vue 注入的字段、函数、DOM 等 */
function toPlainObject(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) return {};
  if (typeof val !== 'object') return {};
  if (Array.isArray(val)) return {};
  const obj = val as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('Sortable') || key === 'el' || key === '__ob__') continue;
    const v = obj[key];
    if (typeof v === 'function') continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v) && 'type' in (v as object) && 'componentName' in (v as object)) {
      const node = toSerializableNode(v);
      if (node) result[key] = node;
    } else if (Array.isArray(v)) {
      result[key] = v.map((item) => (typeof item === 'object' && item && 'componentName' in (item as object) && 'type' in (item as object) ? toSerializableNode(item) : toPlainValue(item)));
    } else if (typeof v === 'object' && v !== null) {
      result[key] = toPlainObject(v);
    } else {
      result[key] = v;
    }
  }
  return result;
}

function toPlainValue(val: unknown): unknown {
  if (val === null || val === undefined || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(toPlainValue);
  return toPlainObject(val);
}

/** 创建空页面根的默认值 */
export const createDefaultPageRoot = (): PageRoot => ({
  type: 'page',
  title: '页面',
  whetherYouCanDrag: true,
  props: {
    className: 'PageContainer',
    style: '',
  },
  children: [],
});
