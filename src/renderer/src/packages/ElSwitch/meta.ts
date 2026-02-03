/**
 * ElSwitch 组件物料描述（Element Plus 二次封装）
 */
export const ElSwitch = {
  componentName: '开关',
  type: 'el-switch',
  icon: 'icon-kaiguan',
  group: 'Element',
  description: 'Element Plus 开关组件',
  npm: {
    exportName: 'ElSwitch',
    package: '@renderer/packages',
    destructuring: true,
  },
  props: {
    elSwitchProps: {
      title: '开关属性',
      children: [
        { label: '默认值', type: 'boolean', key: 'modelValue', value: false },
        { label: '禁用', type: 'boolean', key: 'disabled', value: false },
        { label: '加载中', type: 'boolean', key: 'loading', value: false },
        { label: '激活文案', type: 'input', key: 'active-text', value: '' },
        { label: '关闭文案', type: 'input', key: 'inactive-text', value: '' },
      ],
    },
  },
  children: [],
};
