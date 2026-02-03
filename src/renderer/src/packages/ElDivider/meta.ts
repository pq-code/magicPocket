/**
 * ElDivider 组件物料描述（Element Plus 二次封装）
 */
export const ElDivider = {
  componentName: '分割线',
  type: 'el-divider',
  icon: 'icon-fengexian',
  group: 'Element',
  description: 'Element Plus 分割线组件',
  npm: {
    exportName: 'ElDivider',
    package: '@renderer/packages',
    destructuring: true,
  },
  props: {
    elDividerProps: {
      title: '分割线属性',
      children: [
        {
          label: '方向',
          type: 'segmented',
          key: 'direction',
          value: 'horizontal',
          options: [
            { label: '水平', value: 'horizontal' },
            { label: '垂直', value: 'vertical' },
          ],
        },
        {
          label: '线样式',
          type: 'segmented',
          key: 'border-style',
          value: 'solid',
          options: [
            { label: 'solid', value: 'solid' },
            { label: 'dashed', value: 'dashed' },
          ],
        },
        {
          label: '内容位置',
          type: 'segmented',
          key: 'content-position',
          value: 'center',
          options: [
            { label: '左', value: 'left' },
            { label: '中', value: 'center' },
            { label: '右', value: 'right' },
          ],
        },
        { label: '分割线文案', type: 'input', key: 'content', value: '' },
      ],
    },
  },
  children: [],
};
