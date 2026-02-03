import ControlPanel from './src/controlPanel.jsx'
import type { App } from 'vue'

ControlPanel.install = function (Vue: App) {
  Vue.component((ControlPanel as any).__name || (ControlPanel as any).name || 'ControlPanel', ControlPanel)
}

export default ControlPanel
