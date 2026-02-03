/**
 * RenderEngine 组件物料描述（内部）
 * 仅用于组件库读取 meta.ts，避免 readSource 报错
 */
export const RenderEngine = {
  componentName: '渲染引擎',
  type: 'RenderEngine',
  icon: 'icon-yinqing',
  group: '内部',
  npm: {
    exportName: 'RenderEngine',
    package: '@renderer/packages',
    destructuring: true
  },
  props: {}
}
