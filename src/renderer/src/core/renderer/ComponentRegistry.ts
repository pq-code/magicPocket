/**
 * 组件注册表：type -> NodeNpmInfo
 * 渲染器只依赖 meta：优先用节点上的 npm，没有则查注册表。
 * 由应用/编辑器在启动或加载物料时注册，渲染器不写死任何组件列表。
 */
import type { NodeNpmInfo } from '@renderer/type/page-node';

const registry = new Map<string, NodeNpmInfo>();

export function registerComponent(type: string, npm: NodeNpmInfo): void {
  registry.set(type, npm);
}

export function getComponentNpm(type: string): NodeNpmInfo | undefined {
  return registry.get(type);
}

export function hasComponent(type: string): boolean {
  return registry.has(type);
}

export function registerFromMetaList(metaList: Array<{ type: string; npm?: NodeNpmInfo }>): void {
  metaList.forEach((meta) => {
    if (meta.npm) registry.set(meta.type, meta.npm);
  });
}

export function clearRegistry(): void {
  registry.clear();
}

export function getAllRegisteredTypes(): string[] {
  return Array.from(registry.keys());
}
