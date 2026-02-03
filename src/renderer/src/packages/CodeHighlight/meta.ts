/**
 * CodeHighlight 组件物料描述（内置/编辑器用）
 * 供渲染器按 type 解析，不写死在渲染引擎中
 */
export const CodeHighlight = {
  componentName: '代码高亮',
  type: 'CodeHighlight',
  group: '内置组件',
  npm: {
    exportName: 'CodeHighlight',
    package: '@renderer/packages',
    destructuring: true
  },
  props: {},
  children: [],
};
