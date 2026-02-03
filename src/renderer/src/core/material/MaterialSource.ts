/**
 * 物料源抽象：支持多种组件注册方式
 * - LocalMaterialSource: 项目内 materialArea
 * - LocalFsMaterialSource: 本地文件系统组件库
 * - RemoteMaterialSource: 远程组件库
 */

import type { ComponentMeta } from '@renderer/type/definitionComponent';
import type { ComponentSourceType } from '@renderer/type/page-node';

/** 物料源接口 */
export interface MaterialSource {
  /** 来源标识 */
  id: string;
  /** 来源名称 */
  name: string;
  /** 来源类型 */
  sourceType: ComponentSourceType;
  /** 获取所有组件 meta */
  getComponents(): Promise<ComponentMeta[]>;
  /** 刷新组件列表 */
  refresh?(): Promise<void>;
  /** 是否可用 */
  isAvailable(): boolean;
}

/** 物料源注册中心 */
class MaterialRegistry {
  private sources: Map<string, MaterialSource> = new Map();
  private componentMap: Map<string, ComponentMeta> = new Map();
  
  /** 注册物料源 */
  registerSource(source: MaterialSource): void {
    this.sources.set(source.id, source);
    console.log(`[MaterialRegistry] 注册物料源: ${source.name} (${source.id})`);
  }
  
  /** 移除物料源 */
  unregisterSource(id: string): void {
    this.sources.delete(id);
  }
  
  /** 获取所有物料源 */
  getSources(): MaterialSource[] {
    return Array.from(this.sources.values());
  }
  
  /** 获取指定物料源 */
  getSource(id: string): MaterialSource | undefined {
    return this.sources.get(id);
  }
  
  /** 加载所有物料源的组件 */
  async loadAllComponents(): Promise<ComponentMeta[]> {
    this.componentMap.clear();
    const allComponents: ComponentMeta[] = [];
    
    for (const source of this.sources.values()) {
      if (!source.isAvailable()) continue;
      
      try {
        const components = await source.getComponents();
        components.forEach(comp => {
          // 按 type 去重，后注册的覆盖先注册的
          this.componentMap.set(comp.type, comp);
          allComponents.push(comp);
        });
        console.log(`[MaterialRegistry] 从 ${source.name} 加载了 ${components.length} 个组件`);
      } catch (error) {
        console.error(`[MaterialRegistry] 加载 ${source.name} 失败:`, error);
      }
    }
    
    return allComponents;
  }
  
  /** 根据 type 获取组件 meta */
  getComponentByType(type: string): ComponentMeta | undefined {
    return this.componentMap.get(type);
  }
  
  /** 获取所有已加载的组件 */
  getAllComponents(): ComponentMeta[] {
    return Array.from(this.componentMap.values());
  }
  
  /** 按分组获取组件 */
  getComponentsByGroup(): Record<string, ComponentMeta[]> {
    const groups: Record<string, ComponentMeta[]> = {};
    for (const comp of this.componentMap.values()) {
      const group = comp.group || '未分组';
      if (!groups[group]) groups[group] = [];
      groups[group].push(comp);
    }
    return groups;
  }
  
  /** 刷新所有物料源 */
  async refreshAll(): Promise<void> {
    for (const source of this.sources.values()) {
      if (source.refresh) {
        await source.refresh();
      }
    }
    await this.loadAllComponents();
  }
}

/** 全局物料注册中心实例 */
export const materialRegistry = new MaterialRegistry();

/** =========== 内置物料源实现 =========== */

/**
 * 项目内物料源（materialArea）
 */
export class LocalMaterialSource implements MaterialSource {
  id = 'local';
  name = '项目内组件';
  sourceType: ComponentSourceType = 'local';
  
  private componentList: ComponentMeta[] = [];
  
  constructor(components: ComponentMeta[]) {
    this.componentList = components;
  }
  
  async getComponents(): Promise<ComponentMeta[]> {
    return this.componentList;
  }
  
  isAvailable(): boolean {
    return true;
  }
  
  /** 更新组件列表 */
  setComponents(components: ComponentMeta[]): void {
    this.componentList = components;
  }
}

/**
 * 本地文件系统物料源
 */
export class LocalFsMaterialSource implements MaterialSource {
  id = 'localFs';
  name = '本地组件库';
  sourceType: ComponentSourceType = 'localFs';
  
  private basePath: string;
  private components: ComponentMeta[] = [];
  
  constructor(basePath: string) {
    this.basePath = basePath;
  }
  
  async getComponents(): Promise<ComponentMeta[]> {
    return this.components;
  }
  
  async refresh(): Promise<void> {
    // 通过 Electron API 扫描本地目录
    if (typeof window !== 'undefined' && (window as any).electronAPI?.scanLocalComponents) {
      this.components = await (window as any).electronAPI.scanLocalComponents(this.basePath);
    } else {
      console.warn('[LocalFsMaterialSource] 无法访问 Electron API');
      this.components = [];
    }
  }
  
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).electronAPI?.scanLocalComponents;
  }
  
  getBasePath(): string {
    return this.basePath;
  }
  
  setBasePath(path: string): void {
    this.basePath = path;
  }
}

/**
 * 远程物料源
 */
export class RemoteMaterialSource implements MaterialSource {
  id: string;
  name: string;
  sourceType: ComponentSourceType = 'remote';
  
  private apiUrl: string;
  private components: ComponentMeta[] = [];
  
  constructor(id: string, name: string, apiUrl: string) {
    this.id = id;
    this.name = name;
    this.apiUrl = apiUrl;
  }
  
  async getComponents(): Promise<ComponentMeta[]> {
    return this.components;
  }
  
  async refresh(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl);
      const data = await response.json();
      this.components = data.components || [];
    } catch (error) {
      console.error(`[RemoteMaterialSource] 获取远程组件失败: ${this.apiUrl}`, error);
      this.components = [];
    }
  }
  
  isAvailable(): boolean {
    return !!this.apiUrl;
  }
}
