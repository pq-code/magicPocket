import Form from "@renderer/packages/Form";
import { ElInput } from "element-plus";


export const typeRender = (item, children) => {
  let returnElement
  switch (item.type) {
    case 'container':
      returnElement = generateContainer(item,children)
      break;
    case 'Form':
      returnElement = (generateForm(item,children))
      break;
    case 'input':
      returnElement = (generateInput(item,children))
      break;
     // 其他类型的处理
    default:
      returnElement = null
      break;
  }
  return returnElement;
}

const generateContainer = (item, children) => {
  return (
    <div key={item.key} className={item.props.className} style={item.props.style}>
      {children}
    </div>
  )
}
const generateForm = (item, children) => {
  return (
    <Form key={item.key} pageJSON={item} children={children} />
  )
}

const generateInput = (item, children) => {
  return (
    <ElInput {...item.props.formItemProps}>
    </ElInput>
  )
}

