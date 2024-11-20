import Form from "@renderer/packages/Form";
import { ElInput } from "element-plus";
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
import DlockContainer from '@renderer/packages/DlockContainer/src/DlockContainer.jsx'

const component = (url) => {
  if (url.includes('element')) {
    return defineAsyncComponent({
      loader: () => import(url),
      delay: 200,
    })
  } else {
    return defineAsyncComponent({
      // loader: () => import('../../../packages/Table/src/Table.jsx'),
      loader: () => import(/* @vite-ignore */'../../../' + url),
      delay: 200,
    })
  }
}

/**
 * 根据类型和子元素渲染不同类型的组件
 *
 * @param item 当前渲染组件的类型信息
 * @param children 当前渲染组件的子元素
 * @returns 渲染完成的组件元素
 */
export const typeRender = (item, children) => {
  let npm = item.npm
  let AsyncComp = null
  let returnElement = null
  if (npm?.component && npm.component.includes('packages')) {
    AsyncComp = component(npm.component)
  } else {
    switch (item.type) {
      case 'container':
        returnElement = generateContainer(item, children)
        break;
      case 'Form':
        returnElement = generateForm(item, children)
        break;
      case 'input':
        returnElement = generateInput(item, children)
        break;
      // 其他类型的处理
      default:
        returnElement = null
        break;
    }
  }
  return returnElement || <AsyncComp key={item.key} item={item} children={children} > {children}</AsyncComp>
}

const generateContainer = (item, children) => {
  return (
    <DlockContainer item={item}>
      {children}
    </DlockContainer>
  )
}

const generateForm = (item, children) => {
  return (
    <Form key={item.key} item={item} children={children} >
      {children}
    </Form>
  )
}

const generateInput = (item, children) => {
  return (
    <ElInput {...item.props.formItemProps}>
    </ElInput>
  )
}

