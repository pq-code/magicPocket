/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

/**
 * 组件 Meta 信息接口（与 preload 保持一致）
 */
interface ComponentMeta {
  type: string
  componentName: string
  icon?: string
  group?: string
  npm?: {
    exportName: string
    localPath?: string
    sourceType?: string
    package?: string
    component?: string
    url?: string
  }
  props?: Record<string, unknown>
}

/** 扫描结果 */
interface ScanResult {
  components: ComponentMeta[]
  withoutMetaTypes: string[]
}

/**
 * 本地组件库 API
 */
interface ComponentLibraryAPI {
  scanLocalComponents: (basePath: string) => Promise<ScanResult>
  saveComponentMeta: (basePath: string, meta: ComponentMeta) => Promise<void>
  createComponent: (basePath: string, meta: ComponentMeta) => Promise<void>
  readComponentSource: (filePath: string) => Promise<string>
  writeComponentSource: (filePath: string, content: string) => Promise<void>
  selectDirectory: () => Promise<string | null>
}

declare global {
  interface Window {
    electronAPI?: ComponentLibraryAPI
    api?: ComponentLibraryAPI
  }
}
