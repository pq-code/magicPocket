/**
 * 组件缓存管理器
 *
 * 用于缓存已加载的组件实例，避免重复加载和初始化，
 * 提升渲染性能，特别是在大量重复组件的情况下
 */

import type { Component } from 'vue';

class ComponentCache {
  private cache = new Map<string, {
    component: Component;
    timestamp: number;
    accessCount: number;
  }>();

  private readonly maxAge = 10 * 60 * 1000; // 10分钟
  private readonly maxSize = 50; // 最大缓存数量
  private readonly gcInterval = 5 * 60 * 1000; // 5分钟执行一次垃圾回收

  constructor() {
    // 设置定时垃圾回收
    setInterval(() => {
      this.performGC();
    }, this.gcInterval);
  }

  /**
   * 获取缓存的组件
   * @param key 缓存键
   * @returns 缓存的组件或 null
   */
  get(key: string): Component | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问次数
    cached.accessCount++;
    return cached.component;
  }

  /**
   * 设置组件到缓存
   * @param key 缓存键
   * @param component 要缓存的组件
   */
  set(key: string, component: Component): void {
    // 检查缓存大小，如果超出限制则清理LRU
    if (this.cache.size >= this.maxSize) {
      this.cleanupLRU();
    }

    this.cache.set(key, {
      component,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  /**
   * 从缓存中删除指定组件
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 执行垃圾回收，清理过期的缓存项
   */
  private performGC(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清理最少使用的缓存项（LRU算法）
   */
  private cleanupLRU(): void {
    // 按访问频率和时间清理最少使用的
    const entries = Array.from(this.cache.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.accessCount - b.accessCount);

    // 删除前 20% 的条目
    const deleteCount = Math.floor(entries.length * 0.2);
    for (let i = 0; i < deleteCount; i++) {
      this.cache.delete(entries[i].key);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 全局组件缓存实例
export const componentCache = new ComponentCache();

/**
 * 生成组件缓存键
 * @param type 组件类型
 * @param npmInfo 组件npm信息
 * @returns 缓存键
 */
export function generateComponentCacheKey(type: string, npmInfo?: any): string {
  if (npmInfo) {
    return `${type}-${JSON.stringify(npmInfo)}`;
  }
  return type;
}

/**
 * 缓存组件加载函数
 * @param cacheKey 缓存键
 * @param loader 组件加载函数
 * @returns 组件或Promise<Component>
 */
export async function cachedComponentLoader<T extends Component>(
  cacheKey: string,
  loader: () => Promise<T> | T
): Promise<T> {
  // 先尝试从缓存获取
  const cached = componentCache.get(cacheKey);
  if (cached) {
    return cached as T;
  }

  // 如果缓存中没有，则加载组件
  const component = await Promise.resolve(loader());

  // 将加载的组件存入缓存
  componentCache.set(cacheKey, component);

  return component;
}