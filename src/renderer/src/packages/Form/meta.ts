/**
 * Form 组件物料描述
 * 表单项 formItemProps 支持：required（必填）、requiredMessage（校验文案，默认「xx不能为空」）、
 * trigger（校验触发：blur/change）、rules（Element Plus 规则数组）。提交前会做必填校验。
 */
export const Form = {
  componentName: '表单',
  type: 'Form',
  icon: 'icon-dingdan',
  group: '基础组件',
  npm: {
    exportName: 'Form',
    package: '@renderer/packages',
    destructuring: true
  },
  props: {
    className: '',
    style: '',
    formProps: {
      title: '表单属性',
      children: [
        {
          label: '是否只读',
          type: 'segmented',
          value: '',
          options: [{ label: '是', value: true }, { label: '否', value: false }],
          key: 'isReadOnly'
        },
        {
          label: '几列',
          type: 'segmented',
          value: '',
          key: 'span',
          options: [
            { label: '1列', value: 24 },
            { label: '2列', value: 12 },
            { label: '3列', value: 8 },
            { label: '4列', value: 6 },
            { label: '5列', value: 4 }
          ]
        },
        {
          label: '列间距',
          type: 'input',
          value: '',
          rightText: 'px',
          key: 'gutter'
        },
        {
          label: '是否有查询按钮',
          type: 'segmented',
          value: '',
          key: 'isSubmit',
          options: [{ label: '是', value: true }, { label: '否', value: false }]
        },
        {
          label: '是否有重置',
          type: 'segmented',
          value: '',
          key: 'isReset',
          options: [{ label: '是', value: true }, { label: '否', value: false }]
        },
        {
          label: '表单外边距',
          type: 'input',
          value: '',
          rightText: 'px',
          key: 'csmargin'
        },
        {
          label: '表单内边距',
          type: 'input',
          value: '',
          rightText: 'px',
          key: 'cspadding'
        },
        {
          label: 'Api',
          type: 'input',
          value: '',
          longInput: true,
          rightText: 'url',
          key: 'api'
        }
      ]
    },
    formItemProps: {
      title: '表单项',
      component: 'packages/Form/components/FormItemConfig.jsx',
      children: [],
      itemList: [
        {
          componentName: '输入框',
          type: 'input',
          icon: '',
          group: '基础组件',
          npm: {
            exportName: 'ElInput',
            package: 'element-plus',
            destructuring: true
          },
          props: {
            formItemProps: {
              primaryKey: '760',
              label: '表单项',
              size: 'medium',
              device: 'desktop',
              fullWidth: true,
              placeholder: '请输入'
            },
            fnEvent: {
              onChange: {
                type: 'function',
                value: 'if(value > 10) {alert(value)}',
                parameter: ['value']
              },
              onInput: {
                type: 'function',
                value: 'if(value > 10) {alert(value)}',
                parameter: ['value']
              }
            }
          }
        },
        {
          componentName: '输入框',
          type: 'Select',
          icon: '',
          group: '基础组件',
          npm: {
            exportName: 'ElSelect',
            package: 'element-plus',
            destructuring: true
          },
          props: {
            formItemProps: {
              primaryKey: '11111',
              label: '表单项',
              size: 'medium',
              device: 'desktop',
              fullWidth: true,
              placeholder: '请输入'
            },
            fnEvent: {
              onChange: {
                type: 'function',
                value: `
                const childVnode = props.item.props.formItemProps.itemList || [];
                if(value == 1) {
                  childVnode[0].type = 'Select';
                  console.log(childVnode)
                } else {
                  childVnode.push(
                    {
                      componentName: "输入框",
                      type: "input",
                      icon: "",
                      group: "基础组件",
                      npm: {
                        exportName: "ElInput",
                        package: "element-plus",
                        destructuring: true
                      },
                      props: {
                        formItemProps: {
                          primaryKey: 'input' + props.item?.props.formItemProps.itemList.length,
                          label: "表单项",
                          size: "medium",
                          device: "desktop",
                          fullWidth: true
                        },
                        placeholder: "请输入"
                      },
                    key: Math.random().toString(36)}
                  )
                }
              `,
                parameter: ['value', 'props']
              }
            }
          }
        }
      ]
    }
  },
  children: []
}
