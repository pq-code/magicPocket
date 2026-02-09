/**
 * 物料统一导出：所有组件的 meta 描述
 * 供 materialArea、ComponentRegistry 注册等使用
 */
import { Form } from './Form/meta'
import { Container } from './DlockContainer/meta'
import { Table } from './Table/meta'
import { ElButton } from './ElButton/meta'
import { ElInput } from './ElInput/meta'
import { ElSelect } from './ElSelect/meta'
import { ElDivider } from './ElDivider/meta'
import { ElSwitch } from './ElSwitch/meta'

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
