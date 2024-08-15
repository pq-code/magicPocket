import Form from "@renderer/packages/Form";
import { ElInput } from "element-plus";
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
import DlockContainer from '@renderer/packages/DlockContainer/src/DlockContainer.jsx'
/**
 * 根据类型和子元素渲染不同类型的组件
 *
 * @param item 当前渲染组件的类型信息
 * @param children 当前渲染组件的子元素
 * @returns 渲染完成的组件元素
 */
export const typeRender = (item, children) => {
  let returnElement
  switch (item.type) {
    case 'container':
      returnElement = generateContainer(item,children)
      break;
    case 'Form':
      returnElement = generateForm(item,children)
      break;
    case 'input':
      returnElement = generateInput(item,children)
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
    <DlockContainer item={item} children={children} />
    // <div
    //   key={item.key}
    //   className={item.props.className}
    //   style={item.props.style}
    //   onClick={clickContainer(item)}
    //   onMouseenter={handleMouseEnter}
    //   onMouseleave={handleMouseLeave}
    // >
    //   <PageContainer pageJSON={item} children={children} onChoose={clickContainer}></PageContainer>
    // </div>
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

