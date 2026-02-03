import Table from './src/Table.jsx'
import type { App } from 'vue'

Table.install = function (Vue: App) {
  Vue.component((Table as any).__name || (Table as any).name || 'Table', Table)
}

export default Table
export { Table as TableMeta } from './meta'
