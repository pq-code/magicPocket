
import type { App } from "vue";

// 导入组件
import structuralContainer from './structuralContainer'
import PageContainer from './PageContainer'
import PTable from './p-table'

// 存储组件列表
const components = [
    structuralContainer,
    PageContainer,
    PTable,
]

const install = function (Vue: App) {
    // 遍历注册全局组件
    components.forEach((component: any)=> {
        Vue.component(component.__name || component.name, component);
    })
}

let windowObj = window as any

if (typeof windowObj !== 'undefined' && windowObj.Vue) {
    const vm = windowObj.Vue.createApp({})
    install(vm)
}

export default install

export {
    structuralContainer,
    PageContainer,
    PTable
}
