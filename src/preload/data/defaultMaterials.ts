/**
 * 默认物料数据：与 materialArea/components 一致，用于首次写入物料表（seed）
 * 结构对齐 ComponentMeta：type, componentName, group, icon, npm, props, fnEvent?, children?
 */
export interface DefaultMaterialRow {
  type: string
  componentName: string
  group: string
  icon?: string
  npm?: Record<string, unknown>
  props?: Record<string, unknown>
  fnEvent?: Record<string, unknown>
  children?: unknown[]
}

export const defaultMaterials: DefaultMaterialRow[] = [
  {
    componentName: 'div容器',
    type: 'container',
    icon: 'icon-fuxuankuangkong',
    group: '基础组件',
    npm: {
      exportName: 'DlockContainer',
      package: '@renderer/packages',
      destructuring: true
    },
    props: {
      divProps: {
        title: '容器属性',
        children: [
          { label: '高度', type: 'input', value: '', key: 'csheight' },
          { label: '文字大小', type: 'input', value: '23', key: 'csfontSize' },
          { label: '粗细', type: 'input', value: '', key: 'csfontWeight' },
          { label: '内间距', type: 'input', value: '10', key: 'cspadding' },
          { label: '外间距', type: 'input', value: '', key: 'csmargin' },
          { label: 'className', type: 'input', value: '', key: 'className' },
          { label: '布局方式', type: 'segmented', value: '', key: 'display', options: [{ label: 'grid', value: 'grid' }, { label: 'flex', value: 'flex' }] },
          { label: '是否滚动', type: 'segmented', value: '', key: 'overflow', options: [{ label: '是', value: true }, { label: '否', value: false }] }
        ],
        style: {}
      },
      titleProps: {
        title: '标题',
        children: [
          { label: '标题', type: 'input', value: '', key: 'title' },
          { label: '高度', type: 'input', value: '30', key: 'csheight' },
          { label: '文字大小', type: 'input', value: '23', key: 'csfontSize' },
          { label: '粗细', type: 'input', value: '', key: 'csfontWeight' },
          { label: '内间距', type: 'input', value: '', key: 'cspadding' },
          { label: '外间距', type: 'input', value: '0 0 10 0', key: 'csmargin' },
          { label: '标题位置', type: 'segmented', value: '', key: 'cstextAlign', options: [{ label: '左', value: 'left' }, { label: '中', value: 'center' }, { label: '右', value: 'right' }] },
          { label: 'className', type: 'input', value: '', key: 'className' }
        ],
        style: {}
      },
      className: 'container',
      style: ''
    },
    children: []
  },
  {
    componentName: 'tabel表格',
    type: 'table',
    icon: 'icon-Tab_zidingyiziduan',
    group: '基础组件',
    npm: { exportName: 'Table', package: '@renderer/packages', destructuring: true },
    children: [],
    props: {
      name: 'title',
      propType: 'string',
      description: '标题',
      defaultValue: '标题',
      tableProps: {
        title: '表格属性',
        children: [
          { label: '是否只读', type: 'segmented', value: false, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'isReadOnly' },
          { label: '是否可以勾选', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'selectable' },
          { label: '是否带序号', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'serialNumber' },
          { label: '是否分页', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'showPagination' },
          { label: '是否纵向带边框', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'border' },
          { label: '是否为斑马纹', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'stripe' },
          { label: '列的宽度是否自撑开', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'fit' },
          { label: '是否显示表头', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'showHeader' },
          { label: '是否计算合计', type: 'segmented', value: true, options: [{ label: '是', value: true }, { label: '否', value: false }], key: 'showSummary' }
        ]
      },
      tableColumnProps: {
        title: '表格项',
        component: 'packages/Table/components/TableColumnConfig.jsx',
        children: [],
        itemList: [
          { label: '表格1', prop: 'a', width: 200, align: 'center' },
          { label: '表格2', prop: 'b', width: 200, align: 'center' },
          { label: '表格3', prop: 'c', width: 200, align: 'center' },
          { label: '表格4', prop: 'd', width: 200, align: 'center' },
          { label: '表格5', prop: 'e', width: 200, align: 'center' }
        ]
      },
      pagingProps: { title: '分页', children: [{ label: '每页显示条数', type: 'input', value: '', key: 'pageSize' }, { label: '当前页', type: 'input', value: '', key: 'currentPage' }, { label: '总条数', type: 'input' }] }
    },
    data: [
      { a: '2', b: '1', c: '1', d: '1', e: '1' },
      { a: '2', b: '2', c: '2', d: '2', e: '2' },
      { a: '3', b: '3', c: '3', d: '3', e: '3' },
      { a: '4', b: '4', c: '4', d: '4', e: '4' },
      { a: '5', b: '5', c: '5', d: '5', e: '5' },
      { a: '6', b: '6', c: '6', d: '6', e: '6' }
    ]
  },
  // Element 二次封装（支持控制面板）
  {
    componentName: '按钮',
    type: 'el-button',
    icon: 'icon-anniu',
    group: 'Element',
    npm: { exportName: 'ElButton', package: '@renderer/packages', destructuring: true },
    props: {
      elButtonProps: {
        title: '按钮属性',
        children: [
          { label: '按钮文字', type: 'input', key: 'text', value: '按钮' },
          { label: '类型', type: 'segmented', key: 'type', value: 'primary', options: [{ label: 'primary', value: 'primary' }, { label: 'success', value: 'success' }, { label: 'info', value: 'info' }, { label: 'warning', value: 'warning' }, { label: 'danger', value: 'danger' }] },
          { label: '尺寸', type: 'segmented', key: 'size', value: 'default', options: [{ label: 'large', value: 'large' }, { label: 'default', value: 'default' }, { label: 'small', value: 'small' }] },
          { label: '朴素按钮', type: 'boolean', key: 'plain', value: false },
          { label: '圆角按钮', type: 'boolean', key: 'round', value: false },
          { label: '圆形按钮', type: 'boolean', key: 'circle', value: false },
          { label: '链接按钮', type: 'boolean', key: 'link', value: false },
          { label: '加载中', type: 'boolean', key: 'loading', value: false },
          { label: '禁用', type: 'boolean', key: 'disabled', value: false }
        ]
      }
    },
    children: []
  },
  {
    componentName: '输入框',
    type: 'el-input',
    icon: 'icon-bianji',
    group: 'Element',
    npm: { exportName: 'ElInput', package: '@renderer/packages', destructuring: true },
    props: {
      elInputProps: {
        title: '输入框属性',
        children: [
          { label: '占位文本', type: 'input', key: 'placeholder', value: '请输入' },
          { label: '尺寸', type: 'segmented', key: 'size', value: 'default', options: [{ label: 'large', value: 'large' }, { label: 'default', value: 'default' }, { label: 'small', value: 'small' }] },
          { label: '类型', type: 'segmented', key: 'type', value: 'text', options: [{ label: 'text', value: 'text' }, { label: 'textarea', value: 'textarea' }, { label: 'password', value: 'password' }, { label: 'number', value: 'number' }] },
          { label: '禁用', type: 'boolean', key: 'disabled', value: false },
          { label: '可清空', type: 'boolean', key: 'clearable', value: false },
          { label: '显示密码', type: 'boolean', key: 'showPassword', value: false },
          { label: '只读', type: 'boolean', key: 'readonly', value: false }
        ]
      }
    },
    children: []
  },
  {
    componentName: '下拉选择',
    type: 'el-select',
    icon: 'icon-xiala',
    group: 'Element',
    npm: { exportName: 'ElSelect', package: '@renderer/packages', destructuring: true },
    props: {
      elSelectProps: {
        title: '下拉选择属性',
        children: [
          { label: '占位文本', type: 'input', key: 'placeholder', value: '请选择' },
          { label: '尺寸', type: 'segmented', key: 'size', value: 'default', options: [{ label: 'large', value: 'large' }, { label: 'default', value: 'default' }, { label: 'small', value: 'small' }] },
          { label: '禁用', type: 'boolean', key: 'disabled', value: false },
          { label: '可清空', type: 'boolean', key: 'clearable', value: false },
          { label: '多选', type: 'boolean', key: 'multiple', value: false }
        ]
      }
    },
    children: []
  },
  {
    componentName: '分割线',
    type: 'el-divider',
    icon: 'icon-fengexian',
    group: 'Element',
    npm: { exportName: 'ElDivider', package: '@renderer/packages', destructuring: true },
    props: {
      elDividerProps: {
        title: '分割线属性',
        children: [
          { label: '方向', type: 'segmented', key: 'direction', value: 'horizontal', options: [{ label: '水平', value: 'horizontal' }, { label: '垂直', value: 'vertical' }] },
          { label: '线样式', type: 'segmented', key: 'border-style', value: 'solid', options: [{ label: 'solid', value: 'solid' }, { label: 'dashed', value: 'dashed' }] },
          { label: '分割线文案', type: 'input', key: 'content', value: '' }
        ]
      }
    },
    children: []
  },
  {
    componentName: '开关',
    type: 'el-switch',
    icon: 'icon-kaiguan',
    group: 'Element',
    npm: { exportName: 'ElSwitch', package: '@renderer/packages', destructuring: true },
    props: {
      elSwitchProps: {
        title: '开关属性',
        children: [
          { label: '默认值', type: 'boolean', key: 'modelValue', value: false },
          { label: '禁用', type: 'boolean', key: 'disabled', value: false },
          { label: '加载中', type: 'boolean', key: 'loading', value: false }
        ]
      }
    },
    children: []
  }
]
