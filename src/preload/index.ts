import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * 组件 Meta 信息接口
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
  }
  props?: Record<string, unknown>
}

/** 扫描结果：组件列表 + 缺少 meta.json 的 type 列表 */
interface ScanResult {
  components: ComponentMeta[]
  withoutMetaTypes: string[]
}

// Custom APIs for renderer
// 通过 IPC 与主进程通信实现文件操作
const api = {
  // 本地组件库相关 API（通过 IPC 调用主进程）
  scanLocalComponents: (basePath: string): Promise<ScanResult> => {
    return ipcRenderer.invoke('componentLibrary:scan', basePath)
  },
  saveComponentMeta: (basePath: string, meta: ComponentMeta): Promise<void> => {
    return ipcRenderer.invoke('componentLibrary:saveMeta', basePath, meta)
  },
  createComponent: (basePath: string, meta: ComponentMeta): Promise<void> => {
    return ipcRenderer.invoke('componentLibrary:create', basePath, meta)
  },
  readComponentSource: (filePath: string): Promise<string> => {
    return ipcRenderer.invoke('componentLibrary:readSource', filePath)
  },
  writeComponentSource: (filePath: string, content: string): Promise<void> => {
    return ipcRenderer.invoke('componentLibrary:writeSource', filePath, content)
  },
  deleteFileOrFolder: (targetPath: string): Promise<void> => {
    return ipcRenderer.invoke('componentLibrary:delete', targetPath)
  },
  renameFileOrFolder: (oldPath: string, newName: string): Promise<void> => {
    return ipcRenderer.invoke('componentLibrary:rename', oldPath, newName)
  },
  createFileOrFolder: (parentPath: string, name: string, isFolder: boolean): Promise<void> => {
    return ipcRenderer.invoke('componentLibrary:createFile', parentPath, name, isFolder)
  },

  // 目录选择
  selectDirectory: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:selectDirectory')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', api) // 兼容渲染器中的调用
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.electronAPI = api
}
