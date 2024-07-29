
// export const componentList = [
//   {
//     componentName: "div容器",
//     type: "container",
//     icon: "",
//     group: "基础组件",
//     props: {
//       name: "title",
//       className: 'container',
//       style: ''
//     },
//     children:[]
//   },
//   {
//     componentName: "表单",
//     type: "from",
//     icon: "",
//     group: "基础组件",
//     npm: { // import { Message } from @alifd/next 的意思
//       exportName: "From",
//       package: '@renderer/packages',
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     },
//     children:[]
//   },
//   {
//     componentName: "输入框",
//     type: "input",
//     icon: "",
//     group: "基础组件",
//     npm: {
//       exportName: "ElInput",
//       package: "element-plus",
//       // version: "1.19.18",
//       // package: "src/index.js",
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     }
//   },
//   {
//     componentName: "下拉框",
//     type: "select",
//     icon: "",
//     group: "基础组件",
//     npm: { // import { Message } from @alifd/next 的意思
//       exportName: "ElSelect",
//       package: "element-plus",
//       // version: "1.19.18",
//       // package: "src/index.js",
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     }
//   },
//   {
//     componentName: "tabel表格",
//     type: "tabel",
//     icon: "",
//     group: "基础组件",
//     npm: { // import { Message } from @alifd/next 的意思
//       exportName: "Ptabel",
//       package: "@renderer/packages",
//       // version: "1.19.18",
//       // package: "src/index.js",
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     }
//   },
// ]

// export const componentMap = {
//   container:   {
//     componentName: "div容器",
//     type: "container",
//     icon: "",
//     group: "基础组件",
//     props: {
//       name: "title",
//       className: 'container1',
//       style: ''
//     },
//     children:[]
//   },
//   from:  {
//     componentName: "表单",
//     type: "from",
//     icon: "",
//     group: "基础组件",
//     npm: { // import { Message } from @alifd/next 的意思
//       exportName: "From",
//       package: '@renderer/packages',
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     },
//     children:[]
//   },
//   input: {
//     componentName: "输入框",
//     type: "input",
//     icon: "",
//     group: "基础组件",
//     npm: {
//       exportName: "ElFrom",
//       package: "element-plus",
//       // version: "1.19.18",
//       // package: "src/index.js",
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     }
//   },
//   select: {
//     componentName: "下拉框",
//     type: "select",
//     icon: "",
//     group: "基础组件",
//     npm: { // import { Message } from @alifd/next 的意思
//       exportName: "el-select",
//       package: "element-plus",
//       // version: "1.19.18",
//       // package: "src/index.js",
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     }
//   },
//   tabel:  {
//     componentName: "tabel表格",
//     type: "tabel",
//     icon: "",
//     group: "基础组件",
//     npm: { // import { Message } from @alifd/next 的意思
//       exportName: "Ptabel",
//       package: "@renderer/packages",
//       // version: "1.19.18",
//       // package: "src/index.js",
//       destructuring: true,
//     },
//     props: {
//       name: "title",
//       propType: "string",
//       description: "标题",
//       defaultValue: "标题"
//     }
//   },
// }

import { createApp } from "vue";

const app = createApp({});


const componentList = []

const setComponentList = () => {
  Object.keys(componentMap).forEach((e) => {
    let npm = componentMap[e].npm
    if (npm && npm.component) {
      npm.component().then(res => {
        if (res) {
          if (!window[componentMap[e].npm.exportName]) {
            // if (npm.destructuring) {
            //   window[componentMap[e].npm.exportName] = res
            // } else {
            //   window[componentMap[e].npm.exportName] = res
            // }
            window[componentMap[e].npm.exportName] = res
            app.component(npm.exportName, res);
          }
        }
      })
    }
    componentList.push(componentMap[e])
  })
  return componentList
}


export const componentMap = {
  container: {
    componentName: "div容器",
    type: "container",
    icon: "",
    group: "基础组件",
    props: {
      name: "title",
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
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题",
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
  },
}


setComponentList()

export { componentList,setComponentList }
