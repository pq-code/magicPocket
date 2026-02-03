/**
 * 组件描述协议：物料库中组件的元数据结构
 * 与 materialArea 组件定义、component-descriptor.md 对齐
 * @see docs/specs/component-descriptor.md
 * @see docs/组件库与物料库说明.md 物料来源与「可用 meta」定义
 */

import type { NodeNpmInfo } from './page-node';
import type { ConfigPropsGroup } from './config-item-schema';

/** 物料组件元数据：组件库中每个组件的定义 */
export interface ComponentMeta {
  /** 组件类型，与画布节点 type 一致 */
  type: string;
  /** 中文展示名 */
  componentName: string;
  /** 图标类名 */
  icon?: string;
  /** 组件库分组 */
  group?: string;
  /** 外部包信息，内置组件（如 container）可省略 */
  npm?: NodeNpmInfo;
  /** 配置结构：含 ConfigPropsGroup 与默认值 */
  props?: ComponentMetaProps;
  /** 默认子节点，可选 */
  children?: unknown[];
  /**
   * ===== 物料平台 / 本地组件库扩展字段（可选） =====
   * 以下字段主要用于：
   * - 区分「本地 / 平台 / 内置」物料来源
   * - 记录版本、状态、统计信息
   * - 为 AI / 搜索 提供更丰富的语义信息
   */
  /** 物料在平台中的唯一 id（云端存储用） */
  id?: string;
  /** 物料自身版本（协议/配置版本），如 1.0.0 */
  materialVersion?: string;
  /** 对应底层组件版本（npm 包版本或本地组件版本） */
  componentVersion?: string;
  /** 物料来源：platform 云端物料 / local 本地组件库 / builtin 内置静态物料 */
  materialSource?: 'platform' | 'local' | 'builtin';
  /** 当前物料状态：草稿 / 试用 / 稳定 / 已废弃 */
  status?: 'draft' | 'beta' | 'stable' | 'deprecated';
  /** 可见范围：私有 / 团队 / 组织 / 公开 */
  scope?: 'private' | 'team' | 'org' | 'public';
  /** 所属项目或空间 id（用于隔离不同工程的物料） */
  projectId?: string;
  /** 人类可读的一句话描述，便于搜索与 AI 理解 */
  description?: string;
  /** 更详细的 AI 友好描述，可由 AI 生成，用于推荐与自动拼装 */
  aiSummary?: string;
  /** 语义标签，如 ['表单', '搜索', 'ElementPlus'] */
  tags?: string[];
  /** 粗粒度类别，如 'form' | 'layout' | 'data-display' */
  category?: string;
  /** 典型使用场景描述 */
  usageScenarios?: string[];
  /** 使用统计：被拖拽/引用次数（由平台统计） */
  usageCount?: number;
  /** 创建/更新审计信息（平台用，可选） */
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  /**
   * ===== 本地组件库扫描时的运行时字段（不持久化到 meta.ts） =====
   */
  /** 存在 meta.ts 时的文件路径 */
  descriptorPath?: string;
  /** 组件目录的完整路径 */
  componentDir?: string;
  /** 组件目录下的文件树 */
  fileTree?: Array<{ id: string; label: string; isFile?: boolean; isFolder?: boolean; filePath?: string; isDescriptor?: boolean; children?: unknown[] }>;
}

/**
 * 组件 props 结构：键以 Props 结尾的为配置分组
 * @see ConfigPropsGroup
 */
export interface ComponentMetaProps {
  className?: string;
  style?: string;
  [key: string]: unknown;
}

/** 配置分组（xxxProps），与 ConfigPropsGroup 一致 */
export type ComponentPropsGroup = ConfigPropsGroup;

/**
 * 判断 meta 是否可在渲染器中使用：有 type 且 npm 能解析出加载方式（local/localFs/npm/remote），
 * 或仅凭 type 在应用启动时已通过 registerFromMetaList 注册。
 * 用于物料库过滤、本地组件库校验等。
 */
export function isUsableMeta(meta: Partial<ComponentMeta>): boolean {
  if (!meta?.type || typeof meta.type !== 'string') return false;
  const npm = meta.npm;
  if (!npm) return false; // 无 npm 时依赖启动时注册，此处仅判断「自带 npm 可解析」
  return !!(npm.component || npm.localPath || npm.package || npm.url);
}

/**
 * @deprecated 使用 ComponentMeta，与 materialArea 结构一致
 */
export interface DefinitionComponent extends ComponentMeta {
  /** 兼容旧字段 */
  title?: string;
}
