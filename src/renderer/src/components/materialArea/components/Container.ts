const component = async () => {
  const component = await import('@renderer/packages')
  return component
}

export const Container = {
  componentName: "div容器",
  type: "container",
  icon: "",
  group: "基础组件",
  props: {
    divProps: {
      title: '容器属性',
      children: [
        {
          label: '文字大小',
          type: 'input',
          value: '',
          key: 'fontSize'
        },
        {
          label: '粗细',
          type: 'input',
          value: '',
          key: 'fontWeight'
        },
        {
          label: '内间距',
          type: 'input',
          value: '',
          key: 'padding'
        },
        {
          label: '外间距',
          type: 'input',
          value: '',
          key: 'margin'
        },
        {
          label: 'className',
          type: 'input',
          value: '',
          key: 'className'
        },
        {
          label: '布局方式',
          type: 'segmented',
          value: '',
          key: 'display',
          options: [
            {
              label: 'grid',
              value: 'grid'
            },
            {
              label: 'flex',
              value: 'flex'
            }
          ]
        },
      ],
      style: {
      }
    },
    titleProps: {
      title: '标题',
      children: [
        {
          label: '标题',
          type: 'input',
          value: '',
          key: 'title'
        },
        {
          label: '文字大小',
          type: 'input',
          value: '',
          key: 'fontSize'
        },
        {
          label: '粗细',
          type: 'input',
          value: '',
          key: 'fontWeight'
        },
        {
          label: '内间距',
          type: 'input',
          value: '',
          key: 'padding'
        },
        {
          label: '外间距',
          type: 'input',
          value: '',
          key: 'margin'
        },
        {
          label: '标题位置',
          type: 'segmented',
          value: '',
          key: 'textAlign',
          options: [
            {
              label: '左',
              value: 'left'
            },
            {
              label: '中',
              value: 'center'
            },
            {
              label: '右',
              value: 'right'
            },
          ]
        },
        {
          label: 'className',
          type: 'input',
          value: '',
          key: 'className'
        },
      ],
      style: {
      }
    },
    className: 'container',
    style: ''
  },
  children:[]
}
