import DlockContainer from './src/DlockContainer.jsx'
import type { App } from 'vue'

DlockContainer.install = function (Vue: App) {
  Vue.component((DlockContainer as any).__name || (DlockContainer as any).name || 'DlockContainer', DlockContainer)
}

export default DlockContainer
export { Container as ContainerMeta } from './meta'
