/**
 * packages 统一注册入口
 * 支持独立注册（各包 index.ts）+ 统一注册（本文件）
 */
import type { App } from 'vue'

import Form from './Form'
import Table from './Table'
import DlockContainer from './DlockContainer'
import ElButton from './ElButton'
import ElInput from './ElInput'
import ElSelect from './ElSelect'
import ElDivider from './ElDivider'
import ElSwitch from './ElSwitch'

/** 有 Vue 组件的包（需全局注册） */
const vueComponents = [Form, Table, DlockContainer, ElButton, ElInput, ElSelect, ElDivider, ElSwitch]

/** 统一安装：注册所有 Vue 组件 */
export function install(Vue: App) {
  vueComponents.forEach((comp: any) => {
    if (comp?.install) {
      Vue.use(comp)
    } else if (comp?.name) {
      Vue.component(comp.name, comp)
    }
  })
}

/** 默认导出：供 app.use(packages) 使用 */
export default { install }

/** 导出各包默认组件（具名导出，供动态加载使用） */
export { default as Form } from './Form'
export { default as Table } from './Table'
export { default as DlockContainer } from './DlockContainer'
export { default as ElButton } from './ElButton'
export { default as ElInput } from './ElInput'
export { default as ElSelect } from './ElSelect'
export { default as ElDivider } from './ElDivider'
export { default as ElSwitch } from './ElSwitch'

/** 导出物料描述（供 materialArea 使用） */
export * from './material'
