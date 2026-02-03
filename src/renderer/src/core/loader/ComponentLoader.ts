/**
 * 组件加载器：分层支持不同来源的组件加载
 * - builtin: 内置组件
 * - local: 项目内组件
 * - npm: npm 包组件
 * - remote: 远程动态加载
 * - localFs: 本地文件系统组件库
 */

import { defineAsyncComponent, type Component, h } from 'vue';
import type { NodeNpmInfo, ComponentSourceType } from '@renderer/type/page-node';

/** 组件加载结果 */
export interface LoadedComponent {
  component: Component;
  sourceType: ComponentSourceType;
  error?: Error;
}

/** 组件缓存 */
const componentCache = new Map<string, Component>();

/**
 * 生成组件缓存 key（对外供 createAsyncComponent 缓存用）
 */
export function getCacheKey(npm: NodeNpmInfo): string {
  if (npm.url) return `remote:${npm.url}`;
  if (npm.localPath) return `localFs:${npm.localPath}`;
  if (npm.component) return `local:${npm.component}`;
  if (npm.package) return `npm:${npm.package}:${npm.exportName}`;
  return `builtin:${npm.exportName}`;
}

/**
 * 判断加载来源类型
 */
export function resolveSourceType(npm?: NodeNpmInfo): ComponentSourceType {
  if (!npm) return 'builtin';
  if (npm.sourceType) return npm.sourceType;
  if (npm.url) return 'remote';
  // package 可解析时优先用 npm，localPath 仅用于文件树/编辑器，不用于加载
  if (npm.package) return 'npm';
  if (npm.localPath) return 'localFs';
  if (npm.component) return 'local';
  return 'builtin';
}

/**
 * 加载项目内组件（packages/）
 * 使用 @renderer 别名（指向 src/renderer/src）保证路径正确
 */
async function loadLocalComponent(npm: NodeNpmInfo): Promise<Component> {
  const path = npm.component;
  if (!path) throw new Error('缺少 component 路径');
  
  // 如果路径已经包含 @renderer，直接使用；否则添加前缀
  const importPath = path.startsWith('@renderer/') ? path : `@renderer/${path}`;
  
  const module = await import(/* @vite-ignore */ importPath);
  return npm.destructuring ? module[npm.exportName] : module.default;
}

/**
 * 加载 npm 包组件
 */
async function loadNpmComponent(npm: NodeNpmInfo): Promise<Component> {
  const pkg = npm.package;
  if (!pkg) throw new Error('缺少 package 名称');
  
  // 对于本地 packages（@renderer/packages），直接加载
  if (pkg === '@renderer/packages') {
    const packages = await import('@renderer/packages');
    return (packages as unknown as Record<string, Component>)[npm.exportName];
  }
  
  // 对于已知的 npm 包，直接 import
  if (pkg === 'element-plus') {
    const elementPlus = await import('element-plus');
    return (elementPlus as unknown as Record<string, Component>)[npm.exportName];
  }
  
  // 其他 npm 包的动态加载（需要构建时处理）
  const module = await import(/* @vite-ignore */ pkg);
  return npm.destructuring ? module[npm.exportName] : module.default;
}

/**
 * 加载远程组件（ESM/UMD）
 */
async function loadRemoteComponent(npm: NodeNpmInfo): Promise<Component> {
  const url = npm.url;
  if (!url) throw new Error('缺少远程 URL');
  
  try {
    // ESM 模块加载
    const module = await import(/* @vite-ignore */ url);
    return npm.destructuring ? module[npm.exportName] : module.default;
  } catch (e) {
    // 降级为 fetch + eval（UMD）
    console.warn(`ESM 加载失败，尝试 UMD: ${url}`, e);
    const response = await fetch(url);
    const code = await response.text();
    
    // 简单的 UMD 解析（生产环境需更安全的沙箱）
    const exports: Record<string, unknown> = {};
    const module = { exports };
    // eslint-disable-next-line no-new-func
    new Function('exports', 'module', code)(exports, module);
    
    return (module.exports as Record<string, Component>)[npm.exportName] || module.exports as Component;
  }
}

/**
 * 加载本地文件系统组件
 */
async function loadLocalFsComponent(npm: NodeNpmInfo): Promise<Component> {
  const localPath = npm.localPath;
  if (!localPath) throw new Error('缺少本地路径');
  
  // Electron 环境下可通过 preload 暴露的 API 读取
  // 这里假设有 window.electronAPI.loadComponent
  if (typeof window !== 'undefined' && (window as any).electronAPI?.loadComponent) {
    return await (window as any).electronAPI.loadComponent(localPath, npm.exportName);
  }
  
  // 降级：尝试通过 file:// 协议加载（需要配置 CSP）
  const module = await import(/* @vite-ignore */ `file://${localPath}`);
  return npm.destructuring ? module[npm.exportName] : module.default;
}

/**
 * 统一组件加载入口
 */
export async function loadComponent(npm: NodeNpmInfo): Promise<Component> {
  const cacheKey = getCacheKey(npm);
  
  // 检查缓存
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }
  
  const sourceType = resolveSourceType(npm);
  let component: Component;
  
  switch (sourceType) {
    case 'local':
      component = await loadLocalComponent(npm);
      break;
    case 'npm':
      component = await loadNpmComponent(npm);
      break;
    case 'remote':
      component = await loadRemoteComponent(npm);
      break;
    case 'localFs':
      component = await loadLocalFsComponent(npm);
      break;
    default:
      throw new Error(`未知的组件来源类型: ${sourceType}`);
  }
  
  // 缓存
  componentCache.set(cacheKey, component);
  return component;
}

/** 异步组件包装缓存，同一 npm 只创建一个 defineAsyncComponent */
const asyncComponentWrapperCache = new Map<string, Component>();

/**
 * 创建异步组件（用于渲染器），按 npm 缓存包装组件
 */
export function createAsyncComponent(npm: NodeNpmInfo): Component {
  const cacheKey = getCacheKey(npm);
  if (asyncComponentWrapperCache.has(cacheKey)) {
    return asyncComponentWrapperCache.get(cacheKey)!;
  }
  const AsyncComp = defineAsyncComponent({
    loader: () => loadComponent(npm),
    delay: 200,
    timeout: 10000,
    onError(error, _retry, fail) {
      console.error('组件加载失败:', error);
      fail();
    },
  });
  asyncComponentWrapperCache.set(cacheKey, AsyncComp);
  return AsyncComp;
}

/**
 * 清除组件缓存
 */
export function clearComponentCache(key?: string): void {
  if (key) {
    componentCache.delete(key);
  } else {
    componentCache.clear();
  }
}

/**
 * 预加载组件
 */
export async function preloadComponent(npm: NodeNpmInfo): Promise<void> {
  await loadComponent(npm);
}
