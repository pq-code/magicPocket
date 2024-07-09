
import type { App } from "vue";

// 导入组件
// import StructuralContainer from './StructuralContainer'
// import PageContainer from './PageContainer'
import PTable from './PTable'

// 存储组件列表
const components = [
    // StructuralContainer,
    // PageContainer,
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
    // StructuralContainer,
    // PageContainer,
    PTable
}
