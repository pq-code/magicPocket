/**
 * ElSelect 组件物料描述（Element Plus 二次封装）
 * 支持控制面板配置 placeholder、size、clearable、multiple 等
 */
export const ElSelect = {
  componentName: '下拉选择',
  type: 'el-select',
  icon: 'icon-xiala',
  group: 'Element',
  description: 'Element Plus 下拉选择组件',
  npm: {
    exportName: 'ElSelect',
    package: '@renderer/packages',
    destructuring: true,
  },
  props: {
    elSelectProps: {
      title: '下拉选择属性',
      children: [
        { label: '占位文本', type: 'input', key: 'placeholder', value: '请选择' },
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
        { label: '禁用', type: 'boolean', key: 'disabled', value: false },
        { label: '可清空', type: 'boolean', key: 'clearable', value: false },
        { label: '多选', type: 'boolean', key: 'multiple', value: false },
        {
          label: '选项(JSON)',
          type: 'input',
          key: 'options',
          value: '[{"label":"选项一","value":"1"},{"label":"选项二","value":"2"},{"label":"选项三","value":"3"}]',
          longInput: true,
        },
      ],
    },
  },
  children: [],
};
