import Form from "@renderer/packages/Form";


export const typeRender = (item, children) => {
  debugger
  let returnElement
  switch (item.type) {
    case 'Form':
      returnElement = (generateForm(item,children))
      break;
     // 其他类型的处理
    default:
      returnElement = generateContainer(item,children)
      break;
  }
  return returnElement;
}

const generateForm = (item,children) => {
  return (
    <Form key={item.key} pageJSON={item}>
      {children}
    </Form>
  )
}

const generateContainer = (item, children) => {
  debugger
  return (
    <div key={item.key} className={item.props.className} style={item.props.style}>
      {children}
    </div>
  )
}
