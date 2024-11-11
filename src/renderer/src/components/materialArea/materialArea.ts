import { createApp } from "vue";
import { Form } from "./components/Form";
import { Container } from "./components/Container";
import { Table } from "./components/Table";

const app = createApp({});

const components = [
  Container,
  Form,
  Table
]

function arrayToObject(arr) {
  return arr.reduce((obj, item, index) => {
    obj[item.type] = item;
    return obj;
  }, {});
}

const componentList = []

const setComponentList = () => {
  Object.keys(componentMap).forEach((e) => {
    // let npm = componentMap[e].npm
    // if (npm && npm.component) {
    //   npm.component().then(res => {
    //     if (res) {
    //       if (!window[componentMap[e].npm.exportName]) {
    //         window[componentMap[e].npm.exportName] = res
    //         app.component(npm.exportName, res);
    //       }
    //     }
    //   })
    // }
    componentList.push(componentMap[e])
  })
  return componentList
}

export let componentMap = {
  container: {
    componentName: "div容器",
    type: "container",
    icon: "",
    group: "基础组件",
    props: {
      titleProps: {
        title: '标题',
        children: [
          {
            label: '标题',
            type: 'input',
            value: '',
          },
          {
            label: '文字大小',
            type: 'input',
            value: '',
          },
          {
            label: '粗细',
            type: 'input',
            value: '',
          },
          {
            label: '内间距',
            type: 'input',
            value: '',
          },
          {
            label: '外间距',
            type: 'input',
            value: '',
          },
          {
            label: '标题位置',
            type: 'segmented',
            value: '',
            options: [
              {
                label: '左',
                value: 'left'
              },
              {
                label: '右',
                value: 'right'
              },
              {
                label: '中',
                value: 'center'
              },
            ]
          },
        ]
      },
      className: 'container',
      style: ''
    },
    children:[]
  },
  Form:  {
    componentName: "表单",
    type: "Form",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "Form",
      package: '@renderer/packages',
      destructuring: true,
      component: async() => {
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
            options: [ {
              label: '是',
              value: true
            },
            {
              label: '否',
              value: false
            },]
          },
          {
            label: '几列',
            type: 'segmented',
            value: '',
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
          },
          {
            label: '是否查询交按钮',
            type: 'segmented',
            value: '',
            options: [ {
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
            options: [ {
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
            rightText: 'url'
          }
        ]
      },
      formItemProps: {
        title: '表单项',
        vnode: ''
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
  },
  input: {
    componentName: "输入框",
    type: "input",
    icon: "",
    group: "基础组件",
    npm: {
      exportName: "El-Input",
      package: "element-plus",
      // version: "1.19.18",
      // package: "src/index.js",
      destructuring: true,
    },
    props: {
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }
  },
  select: {
    componentName: "下拉框",
    type: "select",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "ElSelect",
      package: "element-plus",
      // version: "1.19.18",
      // package: "src/index.js",
      destructuring: true,
    },
    props: {
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }
  },
  tabel:  {
    componentName: "tabel表格",
    type: "tabel",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "Ptabel",
      package: "@renderer/packages",
      // version: "1.19.18",
      // package: "src/index.js",
      destructuring: true,
    },
    props: {
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }
  }
}

componentMap = arrayToObject(components)
setComponentList()

export { componentList, setComponentList }
