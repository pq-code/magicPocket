<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { listCodeConfigs, saveCodeConfig, editCodeConfig, deleteCodeConfig } from '@renderer/api/apis/lowCode/lowCode'
import type { CodeConfigItem } from '@renderer/api/apis/lowCode/lowCode'
import { createDefaultPageRoot } from '@renderer/type/page-node'
import './style/lowCodeHome.less'

const router = useRouter()
const loading = ref(false)
const pageList = ref<CodeConfigItem[]>([])
const total = ref(0)
const searchKeyword = ref('')
const filterStatus = ref('all')

const filteredList = computed(() => {
  let list = pageList.value
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(
      (item) =>
        item.codeConfigName?.toLowerCase().includes(kw) ||
        item.codeConfigId?.toLowerCase().includes(kw)
    )
  }
  return list
})

const formatTime = (str: string) => {
  const d = new Date(str)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await listCodeConfigs({ page: 1, pageSize: 100 })
    pageList.value = res.list
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载页面列表失败')
  } finally {
    loading.value = false
  }
}

/** 打开示例页面（不依赖后端存储） */
const goDemo = () => {
  router.push({
    name: 'draggingDragging',
    query: {
      demo: 'customer-form'
    }
  })
}

/** 进入编辑页 */
const goEdit = (item: CodeConfigItem) => {
  router.push({
    name: 'draggingDragging',
    query: {
      codeConfigId: item.codeConfigId,
      codeConfigName: item.codeConfigName
    }
  })
}

/** 新建页面 */
const handleCreate = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入页面名称', '新建页面', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '页面名称不能为空'
    })
    if (!value?.trim()) return
    const name = value.trim()
    const codeConfigId = crypto.randomUUID?.() || `lc-${Date.now()}`
    const emptyPage = createDefaultPageRoot()
    await saveCodeConfig({
      codeConfigId,
      codeConfigName: name,
      codeConfig: emptyPage,
      userId: 'local',
      userName: 'local'
    })
    ElMessage.success('创建成功')
    await fetchList()
    goEdit({ codeConfigId, codeConfigName: name })
  } catch (e) {
    if ((e as { action?: string })?.action !== 'cancel') {
      ElMessage.error('创建失败')
    }
  }
}

/** 修改名称 */
const handleRename = async (item: CodeConfigItem) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新名称', '修改名称', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.codeConfigName,
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空'
    })
    if (!value?.trim() || value.trim() === item.codeConfigName) return
    await editCodeConfig({
      codeConfigId: item.codeConfigId,
      codeConfigName: value.trim()
    })
    ElMessage.success('修改成功')
    item.codeConfigName = value.trim()
  } catch (e) {
    if ((e as { action?: string })?.action !== 'cancel') {
      ElMessage.error('修改失败')
    }
  }
}

/** 删除 */
const handleDelete = async (item: CodeConfigItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除「${item.codeConfigName}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  const ok = await deleteCodeConfig(item.codeConfigId)
  if (ok) {
    ElMessage.success('已删除')
    await fetchList()
  } else {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="low-code-home">
    <div class="low-code-home-header">
      <div class="header-left">
        <h1>低代码页面</h1>
        <p class="header-desc">创建与管理你的可视化页面</p>
      </div>
      <div class="header-actions">
        <el-button @click="goDemo" class="create-btn" plain>
          查看示例页面
        </el-button>
        <el-button type="primary" size="large" @click="handleCreate" class="create-btn">
          <el-icon><Plus /></el-icon>
          新建页面
        </el-button>
      </div>
    </div>

    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索应用名称"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filterStatus" placeholder="全部" class="filter-select">
        <el-option label="全部" value="all" />
      </el-select>
    </div>

    <div class="low-code-home-content">
      <el-skeleton v-if="loading" :rows="6" animated />
      <el-empty v-else-if="filteredList.length === 0" description="暂无已编排的页面，点击上方按钮创建" class="empty-tip">
        <el-button type="primary" @click="handleCreate">创建第一个页面</el-button>
      </el-empty>
      <div v-else class="page-grid">
        <div
          v-for="item in filteredList"
          :key="item.codeConfigId"
          class="page-card"
          @click="goEdit(item)"
        >
          <div class="page-card-header">
            <i class="iconfont icon-wenjianjia page-card-icon"></i>
            <span class="page-card-title">{{ item.codeConfigName }}</span>
            <div class="page-card-menu" @click.stop>
              <el-dropdown trigger="click" @command="(cmd: string) => cmd === 'rename' ? handleRename(item) : handleDelete(item)">
                <span class="menu-trigger">
                  <i class="iconfont icon-hanbaocaidanzhedie"></i>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="rename">修改名称</el-dropdown-item>
                    <el-dropdown-item command="delete" divided class="dropdown-item-danger">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="page-card-id">页面 ID {{ item.codeConfigId }}</div>
          <div class="page-card-time">
            更新于 {{ item.updatedAt ? formatTime(item.updatedAt) : (item.createdAt ? formatTime(item.createdAt) : '-') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
