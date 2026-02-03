/**
 * 本地组件库 IPC 处理
 * 提供文件系统操作支持组件库管理
 */

import { ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 组件 Meta 信息接口
 */
/** 文件树节点（供前端展示） */
export interface FileTreeNode {
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
  /** 物料来源：local | platform | builtin */
  materialSource?: string
  /** 组件用途说明，便于搜索与 AI 识别 */
  description?: string
  /** 存在 meta.ts 时才有，供前端判断是否展示该文件 */
  descriptorPath?: string
  /** 组件目录的完整路径，用于构建文件树 */
  componentDir?: string
  /** 组件目录下的文件树（src、style、components 等） */
  fileTree?: FileTreeNode[]
  npm?: {
    exportName: string
    localPath?: string
    sourceType?: string
  }
  props?: Record<string, unknown>
}

const COMPONENT_EXTENSIONS = ['.vue', '.jsx', '.tsx', '.js']
const INDEX_NAMES = ['index.vue', 'index.jsx', 'index.tsx', 'index.js']

/** 扫描结果：组件列表 + 缺少 meta.ts 的组件 type 列表（仅无 meta.ts 时才需生成） */
export interface ScanResult {
  components: ComponentMeta[]
  withoutMetaTypes: string[]
}

/**
 * 从文件名得到组件 type（如 MyButton.vue -> MyButton）
 */
function typeFromFileName(name: string): string {
  return name.replace(/\.(vue|jsx|tsx|js)$/i, '')
}

/**
 * 递归构建组件目录的文件树
 */
function buildFileTree(
  dirPath: string,
  prefix: string,
  meta: ComponentMeta
): FileTreeNode[] {
  const nodes: FileTreeNode[] = []
  if (!fs.existsSync(dirPath)) return nodes
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return nodes
  }
  const skipDirs = ['node_modules', '.git', 'dist', 'out']
  for (const entry of entries) {
    if (entry.isDirectory() && skipDirs.includes(entry.name)) continue
    const fullPath = path.join(dirPath, entry.name)
    const nodeId = `${prefix}__${entry.name}`.replace(/[^a-zA-Z0-9_-]/g, '_')
    if (entry.isDirectory()) {
      nodes.push({
        id: nodeId,
        label: entry.name,
        isFolder: true,
        filePath: fullPath,
        children: buildFileTree(fullPath, nodeId, meta)
      })
    } else {
      nodes.push({
        id: nodeId,
        label: entry.name,
        isFile: true,
        filePath: fullPath,
        isDescriptor: entry.name === META_FILE,
        children: undefined
      })
    }
  }
  return nodes.sort((a, b) => {
    const aIsFolder = !!a.isFolder
    const bIsFolder = !!b.isFolder
    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1
    return a.label.localeCompare(b.label, undefined, { numeric: true })
  })
}

/**
 * 在组件目录内查找入口文件（与 packages 结构一致）
 * 1) 根目录 index.vue / index.jsx / index.tsx / index.js
 * 2) src/组件名.vue 等（如 Form/src/Form.jsx）
 */
function findEntryPath(componentDir: string, folderName: string): string | null {
  for (const name of INDEX_NAMES) {
    const p = path.join(componentDir, name)
    if (fs.existsSync(p)) return p
  }
  const srcDir = path.join(componentDir, 'src')
  if (!fs.existsSync(srcDir)) return null
  for (const ext of ['.jsx', '.vue', '.tsx', '.js']) {
    const p = path.join(srcDir, `${folderName}${ext}`)
    if (fs.existsSync(p)) return p
  }
  return null
}

/**
 * 扫描本地组件库目录（约定与 packages 一致）
 * 子目录视为组件的条件：有入口文件（index.vue/jsx 或 src/组件名.jsx）或 有 meta.ts 或 有 index.ts
 * - 有入口 + 可选 meta.ts：按完整组件处理
 * - 仅有 meta.ts / index.ts：按仅描述包处理，仍展示文件树
 */
const META_FILE = 'meta.ts'
const META_TS = 'meta.ts'

/**
 * 解析 meta.ts 内容：支持 JSON 与 TypeScript 两种格式
 * - JSON: 纯 JSON 文本（本地组件库生成）
 * - TypeScript: export const X = { ... } 或 export default { ... }（packages 内）
 */
function parseMetaContent(content: string): ComponentMeta | null {
  const trimmed = content.trim()
  if (!trimmed) return null

  // 1. 尝试 JSON 解析
  try {
    const meta = JSON.parse(trimmed) as ComponentMeta
    if (meta && typeof meta.type === 'string') return meta
  } catch {
    // 非 JSON，尝试解析 TS/JS 导出
  }

  // 2. 解析 TypeScript: export const X = { ... } 或 export default { ... }
  try {
    // 移除块注释 /* ... */
    let code = trimmed.replace(/\/\*[\s\S]*?\*\//g, '')
    // 移除行注释 // ...
    code = code.replace(/\/\/[^\n]*/g, '')
    code = code.trim()

    // 匹配 export const X = {...} 或 export default {...}
    const exportMatch = code.match(/export\s+(?:const\s+\w+\s*=\s*|default\s+)([\s\S]+)/)
    if (!exportMatch) return null

    const objStr = exportMatch[1].trim()
    // 取对象部分（支持尾随分号）
    const objMatch = objStr.match(/^(\{[\s\S]*\})\s*;?\s*$/)
    if (!objMatch) return null

    // 使用 Function 安全执行（仅解析本地项目文件）
    const fn = new Function(`return (${objMatch[1]})`)
    const meta = fn() as ComponentMeta
    if (meta && typeof meta.type === 'string') return meta
  } catch {
    // 解析失败
  }
  return null
}

function scanLocalComponents(basePath: string): ScanResult {
  const components: ComponentMeta[] = []
  const withoutMetaTypes: string[] = []
  const seenTypes = new Set<string>()

  if (!fs.existsSync(basePath)) {
    console.warn(`[scanLocalComponents] 目录不存在: ${basePath}`)
    return { components, withoutMetaTypes }
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true })

  // 1. 子文件夹（packages 结构）
  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const componentDir = path.join(basePath, entry.name)
    const type = entry.name
    if (seenTypes.has(type)) continue
    seenTypes.add(type)

    const entryPath = findEntryPath(componentDir, entry.name)
    const hasMetaTs = fs.existsSync(path.join(componentDir, META_TS))
    const hasIndexTs = fs.existsSync(path.join(componentDir, 'index.ts'))

    // 有 index（入口）或 meta.ts 或 index.ts 才视为组件，否则跳过
    const isComponent = !!entryPath || hasMetaTs || hasIndexTs
    if (!isComponent) continue

    // 无入口文件但有 meta.ts 或 index.ts：仅描述包，仍列入列表并展示文件树
    if (!entryPath) {
      const metaOnly: ComponentMeta = {
        type,
        componentName: type,
        group: '自定义组件',
        materialSource: 'local',
        description: '',
        npm: { exportName: type, sourceType: 'localFs' },
        componentDir,
        fileTree: buildFileTree(componentDir, type, {} as ComponentMeta)
      }
      if (!hasMetaTs) withoutMetaTypes.push(type)
      components.push(metaOnly)
      continue
    }

    const descriptorPath = path.join(componentDir, META_FILE)

    if (fs.existsSync(descriptorPath)) {
      try {
        const metaContent = fs.readFileSync(descriptorPath, 'utf-8')
        const meta = parseMetaContent(metaContent)
        if (!meta) throw new Error('解析结果为空')
        // 有 package/component/sourceType 时保留原加载方式，不强制 localFs
        const hasPackage = !!(meta.npm?.package)
        const hasComponent = !!(meta.npm?.component)
        const hasSourceType = !!(meta.npm?.sourceType)
        meta.npm = {
          ...meta.npm,
          exportName: meta.npm?.exportName || meta.type,
          localPath: entryPath,
          ...((hasPackage || hasComponent || hasSourceType) ? {} : { sourceType: 'localFs' })
        }
        meta.descriptorPath = descriptorPath
        meta.componentDir = componentDir
        meta.fileTree = buildFileTree(componentDir, type, meta)
        if (!hasMetaTs) withoutMetaTypes.push(type)
        components.push(meta)
      } catch (error) {
        console.error(`[scanLocalComponents] 解析 meta.ts 失败: ${descriptorPath}`, error)
        if (!hasMetaTs) withoutMetaTypes.push(type)
        const fallbackMeta: ComponentMeta = {
          type,
          componentName: type,
          group: '自定义组件',
          materialSource: 'local',
          description: '',
          npm: { exportName: type, localPath: entryPath },
          componentDir,
          fileTree: buildFileTree(componentDir, type, {} as ComponentMeta)
        }
        components.push(fallbackMeta)
      }
      continue
    }

    if (!hasMetaTs) withoutMetaTypes.push(type)
    const meta: ComponentMeta = {
      type,
      componentName: type,
      group: '自定义组件',
      materialSource: 'local',
      description: '',
      npm: { exportName: type, localPath: entryPath },
      componentDir,
      fileTree: buildFileTree(componentDir, type, {} as ComponentMeta)
    }
    components.push(meta)
  }

  // 2. 平铺：当前目录下的单文件组件（无目录即无 meta.ts，需生成）
  for (const entry of entries) {
    if (entry.isDirectory()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!COMPONENT_EXTENSIONS.includes(ext)) continue

    const type = typeFromFileName(entry.name)
    if (!type || seenTypes.has(type)) continue

    const filePath = path.join(basePath, entry.name)
    seenTypes.add(type)
    withoutMetaTypes.push(type)
    components.push({
      type,
      componentName: type,
      group: '自定义组件',
      materialSource: 'local',
      description: '',
      npm: { exportName: type, localPath: filePath, sourceType: 'localFs' },
      fileTree: [{ id: `${type}__entry`, label: entry.name, isFile: true, filePath }]
    })
  }

  return { components, withoutMetaTypes }
}

/** 保存到 meta.ts 时排除的运行时字段 */
const RUNTIME_ONLY_KEYS = ['descriptorPath', 'componentDir', 'fileTree']

/**
 * 保存组件 meta 信息
 * - 移除 npm.localPath（由扫描时自动生成）
 * - 移除 descriptorPath/componentDir/fileTree（运行时字段，不持久化）
 */
function saveComponentMeta(basePath: string, meta: ComponentMeta): void {
  const componentDir = path.join(basePath, meta.type)

  // 确保目录存在
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
  }

  const descriptorPath = path.join(componentDir, META_FILE)

  const metaToSave: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(meta)) {
    if (RUNTIME_ONLY_KEYS.includes(key)) continue
    metaToSave[key] = val
  }
  if (metaToSave.npm && typeof metaToSave.npm === 'object') {
    const npm = metaToSave.npm as Record<string, unknown>
    delete npm.localPath
  }

  fs.writeFileSync(descriptorPath, JSON.stringify(metaToSave, null, 2), 'utf-8')
}

/**
 * 创建新组件
 */
function createComponent(basePath: string, meta: ComponentMeta): void {
  const componentDir = path.join(basePath, meta.type)
  
  // 创建目录
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
  }
  
  // 创建 meta.ts
  saveComponentMeta(basePath, meta)
  
  // 创建默认的 index.vue
  const indexPath = path.join(componentDir, 'index.vue')
  if (!fs.existsSync(indexPath)) {
    const template = `<script setup lang="ts">
/**
 * ${meta.componentName}
 * 自动生成的组件模板
 */
defineProps<{
  item?: Record<string, unknown>
}>()
</script>

<template>
  <div class="${meta.type.toLowerCase()}">
    ${meta.componentName}
  </div>
</template>

<style scoped>
.${meta.type.toLowerCase()} {
  /* 组件样式 */
}
</style>
`
    fs.writeFileSync(indexPath, template, 'utf-8')
  }
}

/**
 * 读取组件源码
 */
function readComponentSource(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * 保存组件源码
 */
function writeComponentSource(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8')
}

/**
 * 删除文件或文件夹（递归）
 */
function deleteFileOrFolder(targetPath: string): void {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`路径不存在: ${targetPath}`)
  }
  const stat = fs.statSync(targetPath)
  if (stat.isDirectory()) {
    fs.rmSync(targetPath, { recursive: true })
  } else {
    fs.unlinkSync(targetPath)
  }
}

/**
 * 重命名文件或文件夹
 */
function renameFileOrFolder(oldPath: string, newName: string): void {
  if (!fs.existsSync(oldPath)) {
    throw new Error(`路径不存在: ${oldPath}`)
  }
  const parentDir = path.dirname(oldPath)
  const newPath = path.join(parentDir, newName)
  if (fs.existsSync(newPath)) {
    throw new Error(`目标已存在: ${newName}`)
  }
  fs.renameSync(oldPath, newPath)
}

/**
 * 在指定目录下创建文件或文件夹
 */
function createFileOrFolder(parentPath: string, name: string, isFolder: boolean): void {
  if (!fs.existsSync(parentPath)) {
    throw new Error(`父目录不存在: ${parentPath}`)
  }
  const fullPath = path.join(parentPath, name)
  if (fs.existsSync(fullPath)) {
    throw new Error(`已存在: ${name}`)
  }
  if (isFolder) {
    fs.mkdirSync(fullPath, { recursive: true })
  } else {
    fs.writeFileSync(fullPath, '', 'utf-8')
  }
}

/**
 * 注册组件库相关 IPC 处理程序
 */
export function registerComponentLibraryHandlers(): void {
  // 扫描组件库（返回组件列表 + 缺少 meta 的 type 列表）
  ipcMain.handle('componentLibrary:scan', (_event, basePath: string) => {
    return scanLocalComponents(basePath) as ScanResult
  })
  
  // 保存组件 meta
  ipcMain.handle('componentLibrary:saveMeta', (_event, basePath: string, meta: ComponentMeta) => {
    saveComponentMeta(basePath, meta)
  })
  
  // 创建组件
  ipcMain.handle('componentLibrary:create', (_event, basePath: string, meta: ComponentMeta) => {
    createComponent(basePath, meta)
  })
  
  // 读取源码
  ipcMain.handle('componentLibrary:readSource', (_event, filePath: string) => {
    return readComponentSource(filePath)
  })
  
  // 保存源码
  ipcMain.handle('componentLibrary:writeSource', (_event, filePath: string, content: string) => {
    writeComponentSource(filePath, content)
  })

  // 删除文件/文件夹
  ipcMain.handle('componentLibrary:delete', (_event, targetPath: string) => {
    deleteFileOrFolder(targetPath)
  })

  // 重命名文件/文件夹
  ipcMain.handle('componentLibrary:rename', (_event, oldPath: string, newName: string) => {
    renameFileOrFolder(oldPath, newName)
  })

  // 创建文件/文件夹
  ipcMain.handle('componentLibrary:createFile', (_event, parentPath: string, name: string, isFolder: boolean) => {
    createFileOrFolder(parentPath, name, isFolder)
  })

  console.log('[ComponentLibrary] IPC handlers registered')
}
