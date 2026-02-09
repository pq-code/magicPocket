/**
 * 类型渲染引擎：纯 meta 驱动，不写死组件列表
 * - 根据节点 npm（或注册表 type -> npm）通过加载器动态解析组件
 * - 支持 local / npm / remote / localFs，与组件库、编辑器解耦
 * - 使用组件缓存机制提升性能
 */

import { resolveSourceType, createAsyncComponent, loadComponent } from '@renderer/core/loader';
import { getComponentNpm } from '@renderer/core/renderer/ComponentRegistry';
import { cachedComponentLoader, generateComponentCacheKey } from '@renderer/utils/component-cache';

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
  const registryNpm = getComponentNpm(item.type);

  // 兼容历史数据：旧页面里保存的 npm 可能是 localFs（file:// 本地路径），
  // 在当前 Electron 环境下无法直接 import，需要回退到注册表里的 npm 配置。
  const shouldFallbackToRegistry =
    item.npm &&
    !item.npm.package &&
    (item.npm.sourceType === 'localFs' || (!!item.npm.localPath && String(item.npm.localPath).includes('/src/renderer/src/packages/')));

  const npm = shouldFallbackToRegistry ? registryNpm : (item.npm ?? registryNpm);

  if (!npm) {
    return (
      <div class="unknown-component">
        未知组件: {item.type}
        <span class="unknown-hint">（未配置 npm / 未注册）</span>
      </div>
    );
  }

  // 生成缓存键并使用缓存的组件
  const cacheKey = generateComponentCacheKey(item.type, npm);
  const AsyncComp = createAsyncComponent(npm);

  return (
    <AsyncComp key={item.key} item={item} children={children}>
      {children}
    </AsyncComp>
  );
}

export { resolveSourceType, loadComponent };