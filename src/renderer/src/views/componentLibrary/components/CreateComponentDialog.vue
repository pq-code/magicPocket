<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import type { ComponentMeta } from '@renderer/type/definitionComponent'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', meta: ComponentMeta): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const form = ref({
  type: '',
  componentName: '',
  group: '自定义组件',
  description: '',
  icon: ''
})

watch(() => props.modelValue, (v) => {
  if (v) {
    form.value = {
      type: '',
      componentName: '',
      group: '自定义组件',
      description: '',
      icon: ''
    }
  }
})

const typePattern = /^[a-zA-Z][a-zA-Z0-9]*$/

const handleSubmit = () => {
  if (!typePattern.test(form.value.type)) return
  const meta: ComponentMeta = {
    type: form.value.type,
    componentName: form.value.componentName || `新组件-${form.value.type}`,
    group: form.value.group || '自定义组件',
    description: form.value.description || '',
    icon: form.value.icon || undefined,
    props: {}
  }
  emit('submit', meta)
}

const handleCancel = () => {
  visible.value = false
}
</script>

<template>
  <ElDialog
    v-model="visible"
    title="新建组件"
    width="420px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <ElForm :model="form" label-width="80px" label-position="left">
      <ElFormItem label="类型" required>
        <ElInput
          v-model="form.type"
          placeholder="英文，字母开头，如 MyButton"
          maxlength="64"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="名称">
        <ElInput v-model="form.componentName" placeholder="中文展示名，如 自定义按钮" />
      </ElFormItem>
      <ElFormItem label="分组">
        <ElInput v-model="form.group" placeholder="如 自定义组件、基础组件" />
      </ElFormItem>
      <ElFormItem label="描述">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="组件用途说明，便于搜索与 AI 识别"
        />
      </ElFormItem>
      <ElFormItem label="图标">
        <ElInput v-model="form.icon" placeholder="图标类名，如 icon-anniu" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="primary" :disabled="!typePattern.test(form.type)" @click="handleSubmit">
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>
