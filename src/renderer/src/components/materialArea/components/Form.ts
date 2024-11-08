
import { defineAsyncComponent } from 'vue'
export const Form = {
  componentName: "表单",
  type: "Form",
  icon: "",
  group: "基础组件",
  npm: {
    exportName: "Form",
    package: '@renderer/packages',
    destructuring: true,
    component: async () => {
      const component = await import('@renderer/packages')
      console.log(component)
      return component['Form']
    }
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
          options: [{
            label: '是',
            value: true
          },
          {
            label: '否',
            value: false
            },],
          key: 'isReadOnly'
        },
        {
          label: '几列',
          type: 'segmented',
          value: '',
          key: 'span',
          options: [
            {
              label: '1列',
              value: 24
            },
            {
              label: '2列',
              value: 12
            },
            {
              label: '3列',
              value: 8
            },
            {
              label: '4列',
              value: 6
            },
            {
              label: '5列',
              value: 4
            },
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
          options: [{
            label: '是',
            value: true
          },
          {
            label: '否',
            value: false
          },]
        },
        {
          label: '是否有重置',
          type: 'segmented',
          value: '',
          key: 'isReset',
          options: [{
            label: '是',
            value: true
          },
          {
            label: '否',
            value: false
          },]
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
      vnode: '',
      component: 'packages/Form/components/FormItemConfig.jsx',
      children: [
      ]
    },
    aaaProps: {
      title: '测试',
      vnode: '',
      component: 'packages/Form/components/FormItemConfig.jsx',
      children: [
      ]
    }
  },
  children: [
    {
      componentName: "输入框",
      type: "input",
      icon: "",
      group: "基础组件",
      npm: {
        exportName: "ElInput",
        package: "element-plus",
        // version: "1.19.18",
        // package: "src/index.js",
        destructuring: true,
      },
      props: {
        "formItemProps": {
          "primaryKey": "760",
          "label": "表单项",
          "size": "medium",
          "device": "desktop",
          "fullWidth": true
        },
        "placeholder": "请输入"
      }
    },
    {
      componentName: "输入框",
      type: "input",
      icon: "",
      group: "基础组件",
      npm: {
        exportName: "ElInput",
        package: "element-plus",
        // version: "1.19.18",
        // package: "src/index.js",
        destructuring: true,
      },
      props: {
        "formItemProps": {
          "primaryKey": "760",
          "label": "表单项",
          "size": "medium",
          "device": "desktop",
          "fullWidth": true
        },
        "placeholder": "请输入"
      }
    },
    {
      componentName: "输入框",
      type: "input",
      icon: "",
      group: "基础组件",
      npm: {
        exportName: "ElInput",
        package: "element-plus",
        // version: "1.19.18",
        // package: "src/index.js",
        destructuring: true,
      },
      props: {
        "formItemProps": {
          "primaryKey": "760",
          "label": "表单项",
          "size": "medium",
          "device": "desktop",
          "fullWidth": true
        },
        "placeholder": "请输入"
      }
    },
  ]
}

