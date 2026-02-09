<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ComponentList from './components/ComponentList.jsx'
import ComponentSandbox from './components/ComponentSandbox.jsx'
import ComponentSourceEditor from './components/ComponentSourceEditor.jsx'
import CreateComponentDialog from './components/CreateComponentDialog.vue'
import type { ComponentMeta } from '@renderer/type/definitionComponent'
import { useLocalLibraryStore } from '@renderer/stores/localLibrary/useLocalLibraryStore'
import { createMaterial, updateMaterial } from '@renderer/api/apis/materials'
import './style/componentLibrary.less'

const router = useRouter()
const localLibraryStore = useLocalLibraryStore()

// 本地组件库路径
const libraryPath = ref('')
// 组件列表
const componentList = ref<ComponentMeta[]>([])
// 当前选中的组件
const selectedComponent = ref<ComponentMeta | null>(null)
// 当前选中的文件信息
const selectedFile = ref<{ filePath?: string; isDescriptor?: boolean } | null>(null)
// 加载状态
const loading = ref(false)
// 新建组件弹窗
const showCreateDialog = ref(false)

// 预览区宽度（可拖拽调整）
const previewWidth = ref(420)
const MIN_PREVIEW = 280
const MAX_PREVIEW = 800

const startResize = (e: MouseEvent) => {
  e.preventDefault()
  const startX = e.clientX
  const startW = previewWidth.value

  const onMove = (e: MouseEvent) => {
    const delta = e.clientX - startX
    let w = startW + delta
    w = Math.max(MIN_PREVIEW, Math.min(MAX_PREVIEW, w))
    previewWidth.value = w
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// 发布按钮文案：根据是否已有云端 id 切换
const publishLabel = computed(() => {
  if (!selectedComponent.value) return '发布到物料平台'
  return selectedComponent.value.id ? '更新到物料平台' : '发布到物料平台'
})

// 按分组组织组件
const groupedComponents = computed(() => {
  const groups: Record<string, ComponentMeta[]> = {}
  componentList.value.forEach(comp => {
    const group = comp.group || '未分组'
    if (!groups[group]) groups[group] = []
    groups[group].push(comp)
  })
  return groups
})

// 返回首页（独立页面，需回到导航内的首页）
const onBack = () => {
  router.push({ name: 'lowCodeHome' })
}

// 选择组件库目录
const selectLibraryPath = async () => {
  if (window.electronAPI?.selectDirectory) {
    const path = await window.electronAPI.selectDirectory()
    if (path) {
      libraryPath.value = path
      const { withoutMetaTypes } = await refreshComponents()
      if (withoutMetaTypes.length) await tryPromptGenerateMeta(withoutMetaTypes)
    }
  } else {
    ElMessage.warning('Electron API 不可用，请在 Electron 环境中运行')
  }
}

// 刷新组件列表
const refreshComponents = async (): Promise<{ withoutMetaTypes: string[] }> => {
  const empty = { withoutMetaTypes: [] as string[] }
  if (!libraryPath.value) {
    ElMessage.warning('请先选择组件库目录')
    return empty
  }

  loading.value = true
  try {
    if (window.electronAPI?.scanLocalComponents) {
      const result = await window.electronAPI.scanLocalComponents(libraryPath.value)
      componentList.value = result.components as ComponentMeta[]
      localLibraryStore.setLocalLibraryComponents(result.components as ComponentMeta[])
      localStorage.setItem('componentLibraryPath', libraryPath.value)
      const count = result.components.length
      if (count > 0) {
        ElMessage.success(`加载了 ${count} 个组件`)
      } else {
        ElMessage.info('当前目录未发现组件')
      }
      return { withoutMetaTypes: result.withoutMetaTypes || [] }
    } else {
      componentList.value = getMockComponents()
      ElMessage.info('使用模拟数据')
      return empty
    }
  } catch (error) {
    console.error('扫描组件库失败:', error)
    ElMessage.error('扫描组件库失败')
    return empty
  } finally {
    loading.value = false
  }
}

// 缺少 meta.ts 时才提示生成
const tryPromptGenerateMeta = async (withoutMetaTypes: string[]) => {
  if (!withoutMetaTypes.length || !window.electronAPI?.saveComponentMeta) return
  try {
    await ElMessageBox.confirm(
      `以下组件缺少 meta.ts，是否自动生成描述？\n\n${withoutMetaTypes.join('、')}`,
      '生成 meta.ts',
      { confirmButtonText: '生成', cancelButtonText: '取消', type: 'info' }
    )
  } catch { return }
  
  for (const type of withoutMetaTypes) {
    const comp = componentList.value.find(c => c.type === type)
    if (comp) await window.electronAPI.saveComponentMeta(libraryPath.value, comp as never)
  }
  ElMessage.success('已生成描述（meta.ts）')
  const next = await refreshComponents()
  if (next.withoutMetaTypes.length) tryPromptGenerateMeta(next.withoutMetaTypes)
}

const handleRefresh = async () => {
  const { withoutMetaTypes } = await refreshComponents()
  if (withoutMetaTypes.length) await tryPromptGenerateMeta(withoutMetaTypes)
}

// 选择组件：默认打开 meta.ts，无则打开入口文件
const handleSelectComponent = (comp: ComponentMeta) => {
  selectedComponent.value = comp
  const descriptorPath = comp.descriptorPath || (comp.componentDir ? `${comp.componentDir}/meta.ts` : '')
  const entryPath = comp.npm?.localPath
  if (descriptorPath) {
    selectedFile.value = { filePath: descriptorPath, isDescriptor: true }
  } else if (entryPath) {
    selectedFile.value = { filePath: entryPath, isDescriptor: false }
  } else {
    selectedFile.value = null
  }
}

// 选择文件
const handleSelectFile = (fileInfo: { component: ComponentMeta; filePath?: string; isDescriptor?: boolean }) => {
  selectedComponent.value = fileInfo.component
  selectedFile.value = { filePath: fileInfo.filePath, isDescriptor: fileInfo.isDescriptor }
}

// 打开新建组件弹窗
const handleCreateComponent = () => {
  if (!libraryPath.value) {
    ElMessage.warning('请先选择组件库目录')
    return
  }
  showCreateDialog.value = true
}

// 新建组件提交
const handleCreateSubmit = async (meta: ComponentMeta) => {
  if (!libraryPath.value || !window.electronAPI?.createComponent) return
  try {
    await window.electronAPI.createComponent(libraryPath.value, meta as never)
    await refreshComponents()
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    const created = componentList.value.find(c => c.type === meta.type)
    if (created) {
      selectedComponent.value = created
      handleSelectComponent(created)
    }
  } catch (e: unknown) {
    ElMessage.error(`创建失败: ${e instanceof Error ? e.message : String(e)}`)
  }
}

// 发布 / 更新当前选中组件到物料平台
const handlePublish = async () => {
  if (!selectedComponent.value) {
    ElMessage.warning('请先在左侧选择一个组件')
    return
  }

  const meta: ComponentMeta = {
    ...selectedComponent.value,
    materialSource: 'platform',
  }

  try {
    if (meta.id) {
      // 已有 id，走更新
      const ok = await updateMaterial(meta.id, meta)
      if (!ok) {
        ElMessage.error('更新物料失败')
        return
      }
      selectedComponent.value = meta
      await persistMetaAndRefresh(meta)
      ElMessage.success('已更新到物料平台')
    } else {
      // 无 id，走创建
      const res = await createMaterial(meta)
      if (res && res.id != null) {
        meta.id = String(res.id)
        selectedComponent.value = meta
        await persistMetaAndRefresh(meta)
      }
      ElMessage.success('已发布到物料平台')
    }
  } catch (e) {
    console.error('发布到物料平台失败:', e)
    ElMessage.error('发布到物料平台失败，请检查物料平台服务')
  }
}

// 将 meta 写回本地 meta.ts 并刷新列表
const persistMetaAndRefresh = async (meta: ComponentMeta) => {
  if (!libraryPath.value || !window.electronAPI?.saveComponentMeta) return
  try {
    await window.electronAPI.saveComponentMeta(libraryPath.value, meta as never)
    await refreshComponents()
  } catch (e) {
    console.warn('回写本地 meta 失败:', e)
  }
}


// 模拟数据
const getMockComponents = (): ComponentMeta[] => [
  {
    type: 'MyButton',
    componentName: '自定义按钮',
    icon: 'icon-anniu',
    group: '自定义组件',
    npm: {
      exportName: 'MyButton',
      localPath: '/mock/MyButton/src/MyButton.jsx',
      sourceType: 'localFs'
    },
    props: {}
  }
]

onMounted(() => {
  const savedPath = localStorage.getItem('componentLibraryPath')
  if (savedPath) {
    libraryPath.value = savedPath
    handleRefresh()
  }
})
</script>

<template>
  <div class="component-library">
    <!-- 头部工具栏 -->
    <div class="library-header">
      <div class="header-left">
        <el-page-header @back="onBack">
          <template #content>
            <div class="header-content">
              <el-avatar
                class="header-avatar"
                :size="28"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
              <span class="header-title">本地组件库</span>
            </div>
          </template>
        </el-page-header>
      </div>
      <div class="header-right">
        <el-button @click="selectLibraryPath" type="primary" size="small">
          <i class="iconfont icon-wenjianjia" style="margin-right: 4px;"></i>
          打开目录
        </el-button>
        <el-button @click="handleRefresh" :loading="loading" size="small">
          <i class="iconfont icon-shuaxin" style="margin-right: 4px;"></i>
          刷新
        </el-button>
        <el-button @click="handleCreateComponent" type="success" size="small">
          <i class="iconfont icon-add" style="margin-right: 4px;"></i>
          新建
        </el-button>
        <el-button
          @click="handlePublish"
          size="small"
          type="warning"
          :disabled="!selectedComponent"
        >
          <i class="iconfont icon-shangchuan" style="margin-right: 4px;"></i>
          {{ publishLabel }}
        </el-button>
      </div>
    </div>
    
    <!-- 主内容区：三栏布局 -->
    <div class="library-main">
      <!-- 左侧：文件树 -->
      <div class="main-sidebar">
        <ComponentList
          :grouped-components="groupedComponents"
          :selected="selectedComponent"
          :library-path="libraryPath"
          @select="handleSelectComponent"
          @select-file="handleSelectFile"
          @refresh="handleRefresh"
        />
      </div>
      
      <!-- 中间 + 右侧：沙箱预览 + 代码编辑器（可拖拽调整大小） -->
      <div class="main-content">
        <template v-if="selectedComponent">
          <!-- 沙箱预览区 -->
          <div class="content-sandbox" :style="{ flex: `0 0 ${previewWidth}px` }">
            <div class="panel-header">
              <i class="iconfont icon-yulan" style="margin-right: 6px;"></i>
              <span>预览</span>
              <span class="component-name">{{ selectedComponent.componentName }}</span>
              <span v-if="selectedComponent.materialVersion || selectedComponent.componentVersion" class="version-badges">
                <el-tag v-if="selectedComponent.materialVersion" size="small" type="info">物料 {{ selectedComponent.materialVersion }}</el-tag>
                <el-tag v-if="selectedComponent.componentVersion" size="small" type="success">组件 {{ selectedComponent.componentVersion }}</el-tag>
              </span>
            </div>
            <div class="panel-body">
              <ComponentSandbox :component="selectedComponent" />
            </div>
          </div>
          
          <!-- 可拖动分隔条：水平方向调整 -->
          <div
            class="resize-divider resize-horizontal"
            @mousedown="startResize"
            title="拖动调整预览区与编辑区宽度"
          >
            <i class="iconfont icon-arrow_shuipingtuodong_sliding-horizontal"></i>
          </div>
          
          <!-- 代码编辑器区（meta.ts 与源码统一在此编辑） -->
          <div class="content-editor">
            <div class="panel-header">
              <span class="file-path" v-if="selectedFile?.filePath">
                {{ selectedFile.filePath.split('/').slice(-2).join('/') }}
              </span>
            </div>
            <div class="panel-body">
              <ComponentSourceEditor
                :component="selectedComponent"
                :file-path="selectedFile?.filePath"
                :is-descriptor="selectedFile?.isDescriptor"
                @saved="handleRefresh"
              />
            </div>
          </div>
        </template>
        <div v-else class="empty-content">
          <i class="iconfont icon-zujian" style="font-size: 64px; color: #ddd;"></i>
          <p>从左侧选择组件开始编辑</p>
          <p class="hint" v-if="!libraryPath">或点击「打开目录」选择组件库</p>
        </div>

        <!-- 新建组件弹窗 -->
        <CreateComponentDialog
          v-model="showCreateDialog"
          @submit="handleCreateSubmit"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.component-library {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  color: #303133;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  
  .header-left {
    :deep(.el-page-header) {
      --el-text-color-regular: #303133;
    }
    :deep(.el-page-header__back) {
      color: #606266;
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }
  
  .header-right {
    display: flex;
    gap: 8px;
  }
}

.library-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-sidebar {
  width: 260px;
  min-width: 200px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  overflow: auto;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  
  .content-sandbox {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-right: none;
    background: #fafafa;
  }
  
  .resize-divider {
    flex-shrink: 0;
    width: 6px;
    background: #e8e8e8;
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    
    &:hover {
      background: #409eff;
      .iconfont { opacity: 1; color: #fff; }
    }
    
    .iconfont {
      font-size: 14px;
      opacity: 0.5;
      color: #909399;
      pointer-events: none;
    }
  }
  
  .resize-horizontal .iconfont {
    font-family: 'iconfont' !important;
  }
  
  .content-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    background: #fff;
  }
  
  .panel-header {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    font-size: 12px;
    color: #606266;
    
    .editor-tabs {
      display: flex;
      gap: 4px;
      .tab-item {
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        color: #909399;
        &.active {
          color: #409eff;
          background: #ecf5ff;
        }
      }
    }
    
    .component-name,
    .file-path {
      margin-left: auto;
      color: #67c23a;
      font-family: 'Monaco', 'Menlo', monospace;
    }
    
    .version-badges {
      margin-left: 8px;
      display: flex;
      gap: 4px;
    }
  }
  
  .panel-body {
    flex: 1;
    overflow: auto;
  }
}

.empty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  
  p {
    margin-top: 16px;
    font-size: 14px;
  }
  .hint {
    margin-top: 8px;
    font-size: 12px;
    color: #c0c4cc;
  }
}
</style>
