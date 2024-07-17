// import "./assets/font/iconfont.css"
// import "./assets/css/base.less"
import TypeRenderer from "./src/TypeRenderer.jsx"
import type { App } from "vue";

TypeRenderer.install = function(Vue:App) {
  Vue.component(TypeRenderer.__name || 'TypeRenderer', TypeRenderer)
}

export default TypeRenderer
