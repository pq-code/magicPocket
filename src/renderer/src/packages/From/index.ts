// import "./assets/font/iconfont.css"
// import "./assets/css/base.less"
import From from "./src/From.jsx"
import type { App } from "vue";

From.install = function(Vue:App) {
  Vue.component(From.__name || 'PageContainer', From)
}

export default From
