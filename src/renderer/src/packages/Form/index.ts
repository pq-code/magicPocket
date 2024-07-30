// import "./assets/font/iconfont.css"
// import "./assets/css/base.less"
import Form from "./src/Form.jsx"
import type { App } from "vue";

Form.install = function(Vue:App) {
  Vue.component(Form.__name || 'Form', Form)
}

export default Form
