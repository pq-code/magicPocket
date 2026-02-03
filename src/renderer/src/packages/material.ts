/**
 * 物料统一导出：所有组件的 meta 描述
 * 供 materialArea、ComponentRegistry 注册等使用
 */
import { Form } from './Form/meta'
import { Container } from './DlockContainer/meta'
import { Table } from './Table/meta'
import { CodeHighlight } from './CodeHighlight/meta'
import { ControlPanel } from './ControlPanel/meta'
import { CreateCode } from './CreateCode/meta'
import { PageContainer } from './PageContainer/meta'
import { ElButton } from './ElButton/meta'
import { ElInput } from './ElInput/meta'
import { ElSelect } from './ElSelect/meta'
import { ElDivider } from './ElDivider/meta'
import { ElSwitch } from './ElSwitch/meta'

/** 内置组件（编辑器/沙箱用，不参与画布物料列表） */
export const internalComponents = [
  CodeHighlight,
  ControlPanel,
  CreateCode,
  PageContainer,
]

/** 物料列表：低代码画布可用组件（含 Element 二次封装） */
export const materialComponents = [
  Container,
  Form,
  Table,
  ElButton,
  ElInput,
  ElSelect,
  ElDivider,
  ElSwitch,
]

export {
  Form,
  Container,
  Table,
  ElButton,
  ElInput,
  ElSelect,
  ElDivider,
  ElSwitch,
}
