/**
 * 类型渲染引擎：纯 meta 驱动，不写死组件列表
 * - 根据节点 npm（或注册表 type -> npm）通过加载器动态解析组件
 * - 支持 local / npm / remote / localFs，与组件库、编辑器解耦
 */
import { resolveSourceType, createAsyncComponent, loadComponent } from '@renderer/core/loader';
import { getComponentNpm } from '@renderer/core/renderer/ComponentRegistry';

/**
 * 根据节点和子节点渲染组件
 * 1. npm = item.npm ?? registry.get(item.type)
 * 2. 无 npm -> 未知组件
 * 3. 有 npm -> createAsyncComponent(npm) 渲染，传入 item / children
 *
 * @param item 画布节点（含 type、props、npm 等）
 * @param children 子节点 VNode 数组
 */
export function TypeRenderEngine(item, children) {
  const npm = item.npm ?? getComponentNpm(item.type);

  if (!npm) {
    return (
      <div class="unknown-component">
        未知组件: {item.type}
        <span class="unknown-hint">（未配置 npm / 未注册）</span>
      </div>
    );
  }

  const AsyncComp = createAsyncComponent(npm);

  return (
    <AsyncComp key={item.key} item={item} children={children}>
      {children}
    </AsyncComp>
  );
}

export { resolveSourceType, loadComponent };
