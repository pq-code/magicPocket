/**
 * ElInput 组件物料描述（Element Plus 二次封装）
 * 支持控制面板配置 placeholder、size、type、clearable 等
 */
export const ElInput = {
  componentName: '输入框',
  type: 'el-input',
  icon: 'icon-bianji',
  group: 'Element',
  description: 'Element Plus 输入框组件',
  npm: {
    exportName: 'ElInput',
    package: '@renderer/packages',
    destructuring: true,
  },
  props: {
    elInputProps: {
      title: '输入框属性',
      children: [
        { label: '占位文本', type: 'input', key: 'placeholder', value: '请输入' },
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
          label: '类型',
          type: 'segmented',
          key: 'type',
          value: 'text',
          options: [
            { label: 'text', value: 'text' },
            { label: 'textarea', value: 'textarea' },
            { label: 'password', value: 'password' },
            { label: 'number', value: 'number' },
          ],
        },
        { label: '禁用', type: 'boolean', key: 'disabled', value: false },
        { label: '可清空', type: 'boolean', key: 'clearable', value: false },
        { label: '显示密码', type: 'boolean', key: 'showPassword', value: false },
        { label: '只读', type: 'boolean', key: 'readonly', value: false },
        { label: '最大长度', type: 'number', key: 'maxlength', value: undefined },
        { label: '最小长度', type: 'number', key: 'minlength', value: undefined },
      ],
    },
  },
  children: [],
};
