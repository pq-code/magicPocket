// import "./assets/font/iconfont.css"
// import "./assets/css/base.less"
import structuralContainer from "./src/structuralContainer.jsx"
import type { App } from "vue";

structuralContainer.install = function(Vue:App) {
  Vue.component(structuralContainer.__name || 'structuralContainer', structuralContainer)
}

export default structuralContainer
