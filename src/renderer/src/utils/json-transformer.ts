/**
 * JSON 结构转换器
 *
 * 用于将编辑用的完整 JSON 结构转换为渲染用的简化 JSON 结构
 * 编辑 JSON 包含所有控制器和配置信息，而渲染 JSON 只包含渲染必需的数据
 */

import type { PageRoot, CanvasNode, NodeNpmInfo } from '@renderer/type/page-node';

/**
 * 渲染用页面根节点
 * 移除了编辑器专用属性，只保留渲染必需的信息
 */
export interface RenderPageRoot {
  type: 'page';
  title?: string;
  whetherYouCanDrag?: boolean;
  props: Record<string, unknown>;
  children: RenderCanvasNode[];
  script?: string;
  css?: string;
  version?: string;
  metadata?: {
    name?: string;
    description?: string;
    updatedAt?: string;
  };
}

/**
 * 渲染用画布节点
 * 移除了编辑器专用的配置属性，只保留渲染必需的数据
 */
export interface RenderCanvasNode {
  type: string;
  key?: string;
  componentName?: string;
  group?: string;
  icon?: string;
  props: Record<string, unknown>;
  children: RenderCanvasNode[];
  npm?: NodeNpmInfo;
}

/**
 * 将编辑用 JSON 转换为渲染用 JSON
 *
 * @param editorJSON 编辑用的完整 JSON 结构
 * @returns 渲染用的简化 JSON 结构
 */
export function transformToRenderJSON(editorJSON: PageRoot): RenderPageRoot {
  return {
    type: editorJSON.type,
    title: editorJSON.title,
    whetherYouCanDrag: editorJSON.whetherYouCanDrag,
    props: editorJSON.props,
    children: transformCanvasNodes(editorJSON.children),
    script: editorJSON.script,
    css: editorJSON.css,
    version: editorJSON.version,
    metadata: editorJSON.metadata
  };
}

/**
 * 转换画布节点数组
 *
 * @param editorNodes 编辑用的节点数组
 * @returns 渲染用的节点数组
 */
export function transformCanvasNodes(editorNodes: CanvasNode[]): RenderCanvasNode[] {
  return editorNodes.map(node => transformCanvasNode(node));
}

/**
 * 转换单个画布节点
 *
 * @param editorNode 编辑用的节点
 * @returns 渲染用的节点
 */
export function transformCanvasNode(editorNode: CanvasNode): RenderCanvasNode {
  // 过滤掉编辑器专用的属性，只保留渲染必需的属性
  const renderProps = filterRenderProps(editorNode.props);

  return {
    type: editorNode.type,
    key: editorNode.key,
    componentName: editorNode.componentName,
    group: editorNode.group,
    icon: editorNode.icon,
    props: renderProps,
    children: transformCanvasNodes(editorNode.children),
    npm: editorNode.npm
  };
}

/**
 * 过滤渲染属性，移除编辑器专用的配置
 *
 * @param props 原始属性对象
 * @returns 过滤后的属性对象
 */
function filterRenderProps(props: Record<string, unknown>): Record<string, unknown> {
  const filteredProps: Record<string, unknown> = {};

  // 定义渲染必需的 Props 白名单（这些是组件渲染真正需要的）
  const renderPropsWhitelist = [
    'formProps', 'layoutProps', 'titleProps', 'tableProps', 'gridProps',
    'buttonProps', 'inputProps', 'selectProps', 'modalProps', 'cardProps',
    'formItemProps', 'listProps', 'tabsProps', 'paginationProps', 'treeProps'
  ];

  // 定义编辑器专用属性黑名单（这些是编辑器专用的配置）
  const editorOnlyBlacklist = [
    'controllerProps', 'settingProps', 'designProps', 'configProps',
    'propertyProps', 'attributeProps', 'optionProps'
  ];

  for (const [key, value] of Object.entries(props)) {
    // 如果在白名单中，保留并递归处理内部结构
    if (renderPropsWhitelist.some(whiteKey => whiteKey === key)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        filteredProps[key] = filterRenderProps(value as Record<string, unknown>);
      } else {
        filteredProps[key] = value;
      }
    }
    // 如果在黑名单中，跳过（不添加到结果中）
    else if (editorOnlyBlacklist.some(blackKey => blackKey === key)) {
      continue; // 跳过编辑器专用属性
    }
    // 如果是编辑器专用属性模式（如包含编辑器配置相关字段），跳过
    else if (isEditorOnlyProperty(key)) {
      continue; // 跳过以特定后缀结尾的编辑器专用属性
    }
    // 其他属性按原样处理（可能是组件本身的属性）
    else {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 如果是嵌套对象，递归过滤
        filteredProps[key] = filterRenderProps(value as Record<string, unknown>);
      } else {
        filteredProps[key] = value;
      }
    }
  }

  return filteredProps;
}

/**
 * 判断是否为编辑器专用属性
 *
 * @param key 属性名
 * @returns 是否为编辑器专用属性
 */
function isEditorOnlyProperty(key: string): boolean {
  // 常见的编辑器专用属性后缀（但不包括渲染必需的 props）
  const editorOnlySuffixes = [
    'Config', 'Setting', 'Option', 'Options', 'Attribute',
    'Property', 'Rule', 'Validator', 'Controller', 'Editor',
    'Designer', 'Inspector', 'Meta', 'Schema'
  ];

  // 但要排除那些是渲染必需的后缀
  const renderNeededSuffixes = ['Props'];

  // 如果既在编辑器专用后缀中，又不在渲染必需的后缀中，则认为是编辑器专用
  const isEditorSuffix = editorOnlySuffixes.some(suffix => key.endsWith(suffix));
  const isRenderNeededSuffix = renderNeededSuffixes.some(suffix => key.endsWith(suffix));

  return isEditorSuffix && !isRenderNeededSuffix;
}

/**
 * 创建编辑器专用的节点
 * 与渲染节点相反，用于在编辑器中显示完整的配置信息
 *
 * @param renderNode 渲染用节点
 * @param editorSpecificProps 编辑器专用属性
 * @returns 编辑器用节点
 */
export function createEditorNode(renderNode: RenderCanvasNode, editorSpecificProps?: Record<string, unknown>): CanvasNode {
  return {
    type: renderNode.type,
    key: renderNode.key,
    componentName: renderNode.componentName,
    group: renderNode.group,
    icon: renderNode.icon,
    props: {
      ...renderNode.props,
      ...(editorSpecificProps || {})
    },
    children: renderNode.children.map(child => createEditorNode(child)),
    npm: renderNode.npm
  };
}