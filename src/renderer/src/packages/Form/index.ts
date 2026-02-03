import Form from './src/Form.jsx'
import type { App } from 'vue'

Form.install = function (Vue: App) {
  Vue.component((Form as any).__name || (Form as any).name || 'Form', Form)
}

export default Form
export { Form as FormMeta } from './meta'
