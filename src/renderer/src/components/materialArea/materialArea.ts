export const componentList = [
  {
    componentName: "表单",
    title: "from",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "ElFrom",
      main: 'element-plus',
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
  {
    componentName: "输入框",
    title: "input",
    icon: "",
    group: "基础组件",
    npm: {
      exportName: "ElFrom",
      package: "element-plus",
      // version: "1.19.18",
      // main: "src/index.js",
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
  {
    componentName: "下拉框",
    title: "select",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "el-select",
      package: "element-plus",
      // version: "1.19.18",
      // main: "src/index.js",
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
  {
    componentName: "tabel表格",
    title: "tabel",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "Ptabel",
      package: "@renderer/packages",
      // version: "1.19.18",
      // main: "src/index.js",
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
]

export const componentMap = {
  from:  {
    componentName: "表单",
    title: "from",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "ElFrom",
      main: 'element-plus',
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
  input: {
    componentName: "输入框",
    title: "input",
    icon: "",
    group: "基础组件",
    npm: {
      exportName: "ElFrom",
      package: "element-plus",
      // version: "1.19.18",
      // main: "src/index.js",
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
  select: {
    componentName: "下拉框",
    title: "select",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "el-select",
      package: "element-plus",
      // version: "1.19.18",
      // main: "src/index.js",
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
  tabel:  {
    componentName: "tabel表格",
    title: "tabel",
    icon: "",
    group: "基础组件",
    npm: { // import { Message } from @alifd/next 的意思
      exportName: "Ptabel",
      package: "@renderer/packages",
      // version: "1.19.18",
      // main: "src/index.js",
      destructuring: true,
    },
    props: [{
      name: "title",
      propType: "string",
      description: "标题",
      defaultValue: "标题"
    }]
  },
}
