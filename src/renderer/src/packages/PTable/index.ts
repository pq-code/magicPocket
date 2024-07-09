// import "./assets/font/iconfont.css"
// import "./assets/css/base.less"
import PTable from "./src/PTable.vue"
import type { App } from "vue";

PTable.install = function(Vue:App) {
  Vue.component(PTable.__name || 'PTable', PTable)
}

export default PTable
