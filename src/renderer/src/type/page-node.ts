/**
 * 页面节点协议类型定义
 * 显式约定 pageJSON 根与画布节点的数据结构，避免隐式约定漂移
 * @see docs/architecture/protocol.md
 */

/**
 * 组件加载来源类型
 * - builtin: 内置组件（container 等）
 * - local: 项目内组件（packages/）
 * - npm: npm 包组件（element-plus 等）
 * - remote: 远程动态加载（CDN/URL）
 * - localFs: 本地文件系统组件库
 */
export type ComponentSourceType = 'builtin' | 'local' | 'npm' | 'remote' | 'localFs';

/** npm/组件加载信息，用于描述「如何加载」组件 */
export interface NodeNpmInfo {
  /** 导出名 */
  exportName: string;
  /** 包名，如 element-plus、@renderer/packages */
  package?: string;
  /** 是否解构导入 */
  destructuring?: boolean;
  /** 项目内组件路径（如 packages/Form/src/Form.jsx） */
  component?: string;
  /** 组件版本 */
  version?: string;
  /** 远程组件 URL（ESM/UMD） */
  url?: string;
  /** 本地文件系统路径（绝对路径） */
  localPath?: string;
  /** 加载来源类型，用于加载器分层 */
  sourceType?: ComponentSourceType;
  /** 私有 npm registry 地址 */
  registry?: string;
}

/** 画布节点：画布上每个组件对应一个节点实例 */
export interface CanvasNode {
  /** 组件类型，渲染器据此选组件 */
  type: string;
  /** 实例唯一 id，用于选中/删除/历史，应在创建时生成，渲染时不再修改 */
  key?: string;
  /** 中文展示名（组件库/控制器用） */
  componentName: string;
  /** 组件库分组 */
  group?: string;
  /** 图标类名 */
  icon?: string;
  /** 当前实例的配置（表单值、样式等） */
  props: Record<string, unknown>;
  /** 子节点数组 */
  children: CanvasNode[];
  /** 外部包信息，用于按包加载组件 */
  npm?: NodeNpmInfo;
}

/**
 * 页面根节点：整页描述的根
 * 编辑用 JSON：通常含完整 props（如 xxxProps.children 等），供控制器展示与回写。
 * 渲染用 JSON：可仅保留 type/key/children 与必要的 props 值，渲染器按 meta 补全缺失项。
 */
export interface PageRoot {
  /** 固定为 'page' */
  type: 'page';
  /** 页面标题 */
  title: string;
  /** 是否允许画布拖拽排序 */
  whetherYouCanDrag: boolean;
  /** 根节点配置 */
  props: Record<string, unknown>;
  /** 画布顶层节点列表 */
  children: CanvasNode[];
  /**
   * 页面脚本（Vue 模式：setup 写法，原生 JS）
   * 与画布组件一起参与「生成代码」时，会合并为完整页面 JS/TSX。
   * 运行时通过注入 pageJSON / refs / onMounted / onBeforeUnmount 等执行。
   */
  script?: string;
  /** @deprecated 请使用 script。保留仅为兼容旧数据，运行时优先读 script */
  hooks?: {
    onMounted?: string;
    onUnmounted?: string;
  };
  /** 页面样式文件内容（原始 CSS 文本），生成代码时对应单独样式文件 */
  css?: string;
  /** 可选：协议版本，便于后续兼容 */
  version?: string;
  /** 可选：元数据，便于协作与审计 */
  metadata?: {
    name?: string;
    description?: string;
    updatedAt?: string;
  };
}

/**
 * 提取可序列化的页面快照，排除 VueDraggable/Sortable 注入的循环引用
 * 仅保留协议约定的字段，用于历史记录比较与存储
 */
export function toSerializablePageSnapshot(page: unknown): PageRoot | null {
  if (!page || typeof page !== 'object') return null;
  const p = page as Record<string, unknown>;
  const children = Array.isArray(p.children) ? p.children : [];

  return {
    type: 'page',
    title: (p.title as string) ?? '页面',
    whetherYouCanDrag: Boolean(p.whetherYouCanDrag ?? true),
    props: (p.props && typeof p.props === 'object') ? toPlainObject(p.props) : {},
    children: children.map((child) => toSerializableNode(child)).filter(Boolean) as CanvasNode[],
    script: typeof p.script === 'string' ? p.script : undefined,
    hooks: (p.hooks && typeof p.hooks === 'object') ? toPlainObject(p.hooks) as PageRoot['hooks'] : undefined,
    css: typeof p.css === 'string' ? p.css : undefined,
    metadata: (p.metadata && typeof p.metadata === 'object') ? toPlainObject(p.metadata) as PageRoot['metadata'] : undefined,
  };
}

/** 提取可序列化的节点，排除 Sortable 等注入的非协议字段 */
function toSerializableNode(node: unknown): Partial<CanvasNode> | null {
  if (!node || typeof node !== 'object') return null;
  const n = node as Record<string, unknown>;
  const children = Array.isArray(n.children) ? n.children : [];

  return {
    type: (n.type as string) ?? '',
    key: n.key as string | undefined,
    componentName: (n.componentName as string) ?? '',
    group: n.group as string | undefined,
    icon: n.icon as string | undefined,
    props: toPlainObject(n.props),
    children: children.map((child) => toSerializableNode(child)).filter(Boolean) as CanvasNode[],
    npm: (n.npm && typeof n.npm === 'object') ? (toPlainObject(n.npm) as unknown as NodeNpmInfo) : undefined,
  };
}

/** 递归转为纯 JSON 对象，排除 Sortable/Vue 注入的字段、函数、DOM 等 */
function toPlainObject(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) return {};
  if (typeof val !== 'object') return {};
  if (Array.isArray(val)) return {};
  const obj = val as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('Sortable') || key === 'el' || key === '__ob__') continue;
    const v = obj[key];
    if (typeof v === 'function') continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v) && 'type' in (v as object) && 'componentName' in (v as object)) {
      const node = toSerializableNode(v);
      if (node) result[key] = node;
    } else if (Array.isArray(v)) {
      result[key] = v.map((item) => (typeof item === 'object' && item && 'componentName' in (item as object) && 'type' in (item as object) ? toSerializableNode(item) : toPlainValue(item)));
    } else if (typeof v === 'object' && v !== null) {
      result[key] = toPlainObject(v);
    } else {
      result[key] = v;
    }
  }
  return result;
}

function toPlainValue(val: unknown): unknown {
  if (val === null || val === undefined || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(toPlainValue);
  return toPlainObject(val);
}

/** 创建空页面根的默认值 */
export const createDefaultPageRoot = (): PageRoot => ({
  type: 'page',
  title: '页面',
  whetherYouCanDrag: true,
  props: {
    className: 'PageContainer',
    style: '',
  },
  children: [],
});

/** 表单项快捷构造 */
function fi(opts: {
  type: 'input' | 'select' | 'textarea';
  primaryKey: string;
  label: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
  span?: number;
  options?: { label: string; value: string }[];
}) {
  const { type, primaryKey, label, required, value, placeholder, span, options } = opts;
  const formItemProps: Record<string, unknown> = {
    primaryKey,
    label,
    required: !!required,
    value: value ?? '',
    placeholder,
    options,
  };
  if (span !== undefined) formItemProps.span = span;
  return {
    componentName: type === 'input' ? '输入框' : type === 'select' ? '下拉选择' : '多行文本',
    type,
    icon: '',
    group: '基础组件',
    npm: { exportName: type === 'textarea' ? 'ElInput' : type === 'select' ? 'ElSelect' : 'ElInput', package: 'element-plus', destructuring: true },
    props: { formItemProps },
  };
}

/**
 * 示例页面：客户信息表单（高保真复现 UI 设计）
 * - 顶部 Tab：基础资料 / 客户分析 / 拜访记录
 * - 四个区块：基础信息、开票信息、发票邮寄信息1、发票邮寄信息2，标题左侧蓝色竖线
 * - 表单两列布局，必填星号，输入框/下拉/多行文本
 */
const CUSTOMER_FORM_PAGE_CSS = `
/* 客户表单示例：Tab 条 */
.customer-form-tabs { display: flex; flex-direction: row; align-items: center; border-bottom: 1px solid #e4e7ed; margin-bottom: 24px; background: transparent !important; min-height: auto !important; padding: 0 !important; }
.customer-form-tabs .customer-tab { background: transparent !important; min-height: auto !important; padding: 0 !important; margin-bottom: -1px; border: none !important; }
.customer-form-tabs .customer-tab .DivContainerTitle { padding: 12px 20px; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; margin: 0; font-size: 14px; color: #606266; }
.customer-form-tabs .customer-tab:first-child .DivContainerTitle { color: #409EFF; border-bottom-color: #409EFF; font-weight: 500; }

/* 区块标题：左侧蓝色竖线 */
.customer-form-section .DivContainerTitle { border-left: 4px solid #409EFF; padding-left: 12px; margin-bottom: 16px; font-size: 16px; font-weight: 600; color: #303133; }
.customer-form-section { background: #fff !important; padding: 20px 24px !important; margin-bottom: 16px !important; }

/* 页面底色与内边距（画布根节点带 class lowcode-page-root） */
.lowcode-page-root { background: #f5f7fa !important; padding: 24px !important; min-height: 100% !important; }
`;

export const createDemoCustomerFormPageRoot = (): PageRoot => ({
  type: 'page',
  title: '客户信息表单示例',
  whetherYouCanDrag: true,
  props: { className: 'PageContainer', style: '' },
  css: CUSTOMER_FORM_PAGE_CSS,
  children: [
    // 顶部 Tab：基础资料 | 客户分析 | 拜访记录
    {
      type: 'container',
      key: 'tabs-strip',
      componentName: 'div容器',
      group: '基础组件',
      icon: 'icon-fuxuankuangkong',
      npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
      props: {
        layoutProps: { title: '布局', children: [{ key: 'display', value: 'flex' }, { key: 'className', value: 'customer-form-tabs' }], style: {} },
        titleProps: { title: '标题', children: [], style: {} },
      },
      children: [
        {
          type: 'container',
          key: 'tab-1',
          componentName: 'div容器',
          group: '基础组件',
          icon: 'icon-fuxuankuangkong',
          npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
          props: {
            layoutProps: { title: '布局', children: [{ key: 'className', value: 'customer-tab' }], style: {} },
            titleProps: { title: '标题', children: [{ key: 'title', value: '基础资料' }], style: {} },
          },
          children: [],
        },
        {
          type: 'container',
          key: 'tab-2',
          componentName: 'div容器',
          group: '基础组件',
          icon: 'icon-fuxuankuangkong',
          npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
          props: {
            layoutProps: { title: '布局', children: [{ key: 'className', value: 'customer-tab' }], style: {} },
            titleProps: { title: '标题', children: [{ key: 'title', value: '客户分析' }], style: {} },
          },
          children: [],
        },
        {
          type: 'container',
          key: 'tab-3',
          componentName: 'div容器',
          group: '基础组件',
          icon: 'icon-fuxuankuangkong',
          npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
          props: {
            layoutProps: { title: '布局', children: [{ key: 'className', value: 'customer-tab' }], style: {} },
            titleProps: { title: '标题', children: [{ key: 'title', value: '拜访记录' }], style: {} },
          },
          children: [],
        },
      ],
    },
    // 基础信息
    {
      type: 'container',
      key: 'base-info-container',
      componentName: 'div容器',
      group: '基础组件',
      icon: 'icon-fuxuankuangkong',
      npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
      props: {
        layoutProps: { title: '布局', children: [{ key: 'display', value: 'flex' }, { key: 'className', value: 'customer-form-section' }], style: {} },
        titleProps: { title: '标题', children: [{ key: 'title', value: '基础信息' }], style: {} },
      },
      children: [
        {
          type: 'Form',
          key: 'base-info-form',
          componentName: '表单',
          group: '基础组件',
          icon: 'icon-dingdan',
          npm: { exportName: 'Form', package: '@renderer/packages', destructuring: true },
          props: {
            formProps: {
              title: '表单属性',
              children: [
                { label: '几列', type: 'segmented', value: 8, key: 'span', options: [{ label: '1列', value: 24 }, { label: '2列', value: 12 }, { label: '3列', value: 8 }, { label: '4列', value: 6 }] },
                { label: '列间距', type: 'input', value: '20', rightText: 'px', key: 'gutter' },
                { label: '是否有查询按钮', type: 'segmented', value: false, key: 'isSubmit', options: [{ label: '是', value: true }, { label: '否', value: false }] },
                { label: '是否有重置', type: 'segmented', value: false, key: 'isReset', options: [{ label: '是', value: true }, { label: '否', value: false }] },
              ],
            },
            formItemProps: {
              title: '表单项',
              component: 'packages/Form/components/FormItemConfig.jsx',
              children: [],
              itemList: [
                fi({ type: 'input', primaryKey: 'fullName', label: '全称', required: true, value: '山东市鲁能化工科技有限公司' }),
                fi({ type: 'input', primaryKey: 'shortName', label: '简称', required: true, value: '山东市鲁能化工科技' }),
                fi({ type: 'select', primaryKey: 'status', label: '状态', required: true, value: '启用', options: [{ label: '启用', value: '启用' }, { label: '禁用', value: '禁用' }] }),
                fi({ type: 'input', primaryKey: 'mnemonic', label: '助记码', value: 'SDSLNHGKJYXGS' }),
                fi({ type: 'select', primaryKey: 'region', label: '地区', value: '北京市', options: [{ label: '北京市', value: '北京市' }, { label: '上海市', value: '上海市' }, { label: '山东省', value: '山东省' }] }),
                fi({ type: 'select', primaryKey: 'intentionLevel', label: '意向等级', value: 'A', options: [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }] }),
                fi({ type: 'select', primaryKey: 'businessRelation', label: '业务关系', value: '客户', options: [{ label: '客户', value: '客户' }, { label: '供应商', value: '供应商' }, { label: '物流服务商', value: '物流服务商' }, { label: '仓储服务商', value: '仓储服务商' }, { label: '加工服务商', value: '加工服务商' }, { label: '金融机构', value: '金融机构' }] }),
                fi({ type: 'select', primaryKey: 'customerCategory', label: '客户类别', value: '企业用户', options: [{ label: '企业用户', value: '企业用户' }, { label: '个人用户', value: '个人用户' }] }),
                fi({ type: 'select', primaryKey: 'unitType', label: '单位类型', value: '经销商', options: [{ label: '经销商', value: '经销商' }, { label: '直客', value: '直客' }] }),
                fi({ type: 'select', primaryKey: 'companyNature', label: '单位性质', value: '公海客户', options: [{ label: '公海客户', value: '公海客户' }, { label: '私海客户', value: '私海客户' }] }),
                fi({ type: 'select', primaryKey: 'creditRating', label: '信誉度', value: '高', options: [{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }] }),
                fi({ type: 'input', primaryKey: 'legalRepresentative', label: '法人代表', value: '李克勤' }),
                fi({ type: 'input', primaryKey: 'socialCreditCode', label: '社会信用代码', value: '45645641564' }),
                fi({ type: 'input', primaryKey: 'phone', label: '电话', value: '15248754741' }),
                fi({ type: 'input', primaryKey: 'fax', label: '传真', value: '223654875' }),
                fi({ type: 'input', primaryKey: 'contactAddress', label: '联系地址', value: '北京三里屯望京soho163号' }),
                fi({ type: 'select', primaryKey: 'infoSource', label: '信息来源', value: '手动创建', options: [{ label: '手动创建', value: '手动创建' }, { label: '导入', value: '导入' }] }),
                fi({ type: 'textarea', primaryKey: 'remark', label: '备注', placeholder: '常用备注的地址', span: 24 }),
                fi({ type: 'select', primaryKey: 'customerLevel', label: '客户等级', value: 'B', options: [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }] }),
                fi({ type: 'input', primaryKey: 'assignedSalesperson', label: '归属业务员', placeholder: '请选择' }),
              ],
            },
          },
          children: [],
        },
      ],
    },
    // 开票信息
    {
      type: 'container',
      key: 'invoice-info-container',
      componentName: 'div容器',
      group: '基础组件',
      icon: 'icon-fuxuankuangkong',
      npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
      props: {
        layoutProps: { title: '布局', children: [{ key: 'display', value: 'flex' }, { key: 'className', value: 'customer-form-section' }], style: {} },
        titleProps: { title: '标题', children: [{ key: 'title', value: '开票信息' }], style: {} },
      },
      children: [
        {
          type: 'Form',
          key: 'invoice-info-form',
          componentName: '表单',
          group: '基础组件',
          icon: 'icon-dingdan',
          npm: { exportName: 'Form', package: '@renderer/packages', destructuring: true },
          props: {
            formProps: {
              title: '表单属性',
              children: [
                { label: '几列', type: 'segmented', value: 12, key: 'span', options: [{ label: '1列', value: 24 }, { label: '2列', value: 12 }, { label: '3列', value: 8 }, { label: '4列', value: 6 }] },
                { label: '列间距', type: 'input', value: '20', rightText: 'px', key: 'gutter' },
                { label: '是否有查询按钮', type: 'segmented', value: false, key: 'isSubmit', options: [{ label: '是', value: true }, { label: '否', value: false }] },
                { label: '是否有重置', type: 'segmented', value: false, key: 'isReset', options: [{ label: '是', value: true }, { label: '否', value: false }] },
              ],
            },
            formItemProps: {
              title: '表单项',
              component: 'packages/Form/components/FormItemConfig.jsx',
              children: [],
              itemList: [
                fi({ type: 'input', primaryKey: 'taxpayerId', label: '纳税人识别号' }),
                fi({ type: 'input', primaryKey: 'invoiceTitle', label: '开票抬头', value: '山东市鲁能化工科技有限公司' }),
                fi({ type: 'input', primaryKey: 'openingBank', label: '开户银行' }),
                fi({ type: 'input', primaryKey: 'bankAccount', label: '银行账号' }),
                fi({ type: 'input', primaryKey: 'invoicePhone', label: '开票电话' }),
                fi({ type: 'input', primaryKey: 'invoiceAddress', label: '开票地址', value: '发v贝尔v' }),
              ],
            },
          },
          children: [],
        },
      ],
    },
    // 发票邮寄信息1
    {
      type: 'container',
      key: 'invoice-delivery1-container',
      componentName: 'div容器',
      group: '基础组件',
      icon: 'icon-fuxuankuangkong',
      npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
      props: {
        layoutProps: { title: '布局', children: [{ key: 'display', value: 'flex' }, { key: 'className', value: 'customer-form-section' }], style: {} },
        titleProps: { title: '标题', children: [{ key: 'title', value: '发票邮寄信息1' }], style: {} },
      },
      children: [
        {
          type: 'Form',
          key: 'invoice-delivery1-form',
          componentName: '表单',
          group: '基础组件',
          icon: 'icon-dingdan',
          npm: { exportName: 'Form', package: '@renderer/packages', destructuring: true },
          props: {
            formProps: {
              title: '表单属性',
              children: [
                { label: '几列', type: 'segmented', value: 12, key: 'span', options: [{ label: '1列', value: 24 }, { label: '2列', value: 12 }, { label: '3列', value: 8 }, { label: '4列', value: 6 }] },
                { label: '列间距', type: 'input', value: '20', rightText: 'px', key: 'gutter' },
                { label: '是否有查询按钮', type: 'segmented', value: false, key: 'isSubmit', options: [{ label: '是', value: true }, { label: '否', value: false }] },
                { label: '是否有重置', type: 'segmented', value: false, key: 'isReset', options: [{ label: '是', value: true }, { label: '否', value: false }] },
              ],
            },
            formItemProps: {
              title: '表单项',
              component: 'packages/Form/components/FormItemConfig.jsx',
              children: [],
              itemList: [
                fi({ type: 'input', primaryKey: 'receiver1', label: '发票收件人', required: true, value: '刘杰明' }),
                fi({ type: 'input', primaryKey: 'receiverPhone1', label: '收件人电话', required: true, value: '15248754741' }),
                fi({ type: 'select', primaryKey: 'mailingAddress1', label: '邮寄地址', value: '北京市/北京市/东城区', options: [{ label: '北京市/北京市/东城区', value: '北京市/北京市/东城区' }, { label: '上海市/上海市/浦东新区', value: '上海市/上海市/浦东新区' }] }),
                fi({ type: 'input', primaryKey: 'detailedAddress1', label: '详细地址', value: '发v贝尔v' }),
              ],
            },
          },
          children: [],
        },
      ],
    },
    // 发票邮寄信息2
    {
      type: 'container',
      key: 'invoice-delivery2-container',
      componentName: 'div容器',
      group: '基础组件',
      icon: 'icon-fuxuankuangkong',
      npm: { exportName: 'DlockContainer', package: '@renderer/packages', destructuring: true },
      props: {
        layoutProps: { title: '布局', children: [{ key: 'display', value: 'flex' }, { key: 'className', value: 'customer-form-section' }], style: {} },
        titleProps: { title: '标题', children: [{ key: 'title', value: '发票邮寄信息2' }], style: {} },
      },
      children: [
        {
          type: 'Form',
          key: 'invoice-delivery2-form',
          componentName: '表单',
          group: '基础组件',
          icon: 'icon-dingdan',
          npm: { exportName: 'Form', package: '@renderer/packages', destructuring: true },
          props: {
            formProps: {
              title: '表单属性',
              children: [
                { label: '几列', type: 'segmented', value: 12, key: 'span', options: [{ label: '1列', value: 24 }, { label: '2列', value: 12 }, { label: '3列', value: 8 }, { label: '4列', value: 6 }] },
                { label: '列间距', type: 'input', value: '20', rightText: 'px', key: 'gutter' },
                { label: '是否有查询按钮', type: 'segmented', value: false, key: 'isSubmit', options: [{ label: '是', value: true }, { label: '否', value: false }] },
                { label: '是否有重置', type: 'segmented', value: false, key: 'isReset', options: [{ label: '是', value: true }, { label: '否', value: false }] },
              ],
            },
            formItemProps: {
              title: '表单项',
              component: 'packages/Form/components/FormItemConfig.jsx',
              children: [],
              itemList: [
                fi({ type: 'input', primaryKey: 'receiver2', label: '发票收件人', required: true, value: '李克勤' }),
                fi({ type: 'input', primaryKey: 'receiverPhone2', label: '收件人电话', required: true, value: '15248754741' }),
                fi({ type: 'select', primaryKey: 'mailingAddress2', label: '邮寄地址', value: '北京市/北京市/东城区', options: [{ label: '北京市/北京市/东城区', value: '北京市/北京市/东城区' }, { label: '上海市/上海市/浦东新区', value: '上海市/上海市/浦东新区' }] }),
                fi({ type: 'input', primaryKey: 'detailedAddress2', label: '详细地址', value: '北京三里屯望京路524号' }),
              ],
            },
          },
          children: [],
        },
      ],
    },
  ],
});

