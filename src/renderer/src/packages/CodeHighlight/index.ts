import CodeHighlight from './src/CodeHighlight.jsx'
import type { App } from 'vue'

CodeHighlight.install = function (Vue: App) {
  Vue.component((CodeHighlight as any).__name || (CodeHighlight as any).name || 'CodeHighlight', CodeHighlight)
}

export default CodeHighlight
