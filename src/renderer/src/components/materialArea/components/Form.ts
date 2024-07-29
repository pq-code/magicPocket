const component = async() => {
  const component = await import('@renderer/packages')
  return component
}

export const From = {
  componentName: "表单",
  type: "from",
  icon: "",
  group: "基础组件",
  npm: { // import { Message } from @alifd/next 的意思
    exportName: "From",
    package: '@renderer/packages',
    destructuring: true,
    component
  },
  props: {
    name: "title",
    propType: "string",
    description: "标题",
    defaultValue: "标题",
  },
  children: [
    {}
  ]
}

