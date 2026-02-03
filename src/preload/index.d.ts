import { ElectronAPI } from '@electron-toolkit/preload'

/**
 * 组件 Meta 信息接口
 */
/** 文件树节点 */
interface FileTreeNode {
  id: string
  label: string
  isFile?: boolean
  isFolder?: boolean
  filePath?: string
  isDescriptor?: boolean
  children?: FileTreeNode[]
}

interface ComponentMeta {
  type: string
  componentName: string
  icon?: string
  group?: string
  descriptorPath?: string
  componentDir?: string
  fileTree?: FileTreeNode[]
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
  /** 扫描本地组件库目录 */
  scanLocalComponents: (basePath: string) => Promise<ScanResult>
  /** 保存组件 meta 信息 */
  saveComponentMeta: (basePath: string, meta: ComponentMeta) => Promise<void>
  /** 创建新组件 */
  createComponent: (basePath: string, meta: ComponentMeta) => Promise<void>
  /** 读取组件源码 */
  readComponentSource: (filePath: string) => Promise<string>
  /** 保存组件源码 */
  writeComponentSource: (filePath: string, content: string) => Promise<void>
  /** 删除文件或文件夹 */
  deleteFileOrFolder: (targetPath: string) => Promise<void>
  /** 重命名文件或文件夹 */
  renameFileOrFolder: (oldPath: string, newName: string) => Promise<void>
  /** 创建文件或文件夹 */
  createFileOrFolder: (parentPath: string, name: string, isFolder: boolean) => Promise<void>
  /** 选择目录 */
  selectDirectory: () => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ComponentLibraryAPI
    electronAPI: ComponentLibraryAPI
  }
}
