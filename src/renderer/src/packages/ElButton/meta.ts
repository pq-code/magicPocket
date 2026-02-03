/**
 * ElButton 组件物料描述（Element Plus 二次封装）
 * 支持控制面板配置 type、size、plain、round、按钮文字等
 */
export const ElButton = {
  componentName: '按钮',
  type: 'el-button',
  icon: 'icon-anniu',
  group: 'Element',
  description: 'Element Plus 按钮组件，支持多种类型与尺寸',
  npm: {
    exportName: 'ElButton',
    package: '@renderer/packages',
    destructuring: true,
  },
  props: {
    elButtonProps: {
      title: '按钮属性',
      children: [
        { label: '按钮文字', type: 'input', key: 'text', value: '按钮' },
        {
          label: '类型',
          type: 'segmented',
          key: 'type',
          value: 'primary',
          options: [
            { label: 'primary', value: 'primary' },
            { label: 'success', value: 'success' },
            { label: 'info', value: 'info' },
            { label: 'warning', value: 'warning' },
            { label: 'danger', value: 'danger' },
          ],
        },
        {
          label: '尺寸',
          type: 'segmented',
          key: 'size',
          value: 'default',
          options: [
            { label: 'large', value: 'large' },
            { label: 'default', value: 'default' },
            { label: 'small', value: 'small' },
          ],
        },
        {
          label: '朴素按钮',
          type: 'boolean',
          key: 'plain',
          value: false,
        },
        {
          label: '圆角按钮',
          type: 'boolean',
          key: 'round',
          value: false,
        },
        {
          label: '圆形按钮',
          type: 'boolean',
          key: 'circle',
          value: false,
        },
        {
          label: '链接按钮',
          type: 'boolean',
          key: 'link',
          value: false,
        },
        {
          label: '加载中',
          type: 'boolean',
          key: 'loading',
          value: false,
        },
        {
          label: '禁用',
          type: 'boolean',
          key: 'disabled',
          value: false,
        },
      ],
    },
  },
  children: [],
};
