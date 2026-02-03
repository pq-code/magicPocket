import { DataTypes } from 'sequelize'
import { seq } from '../db/sqlite'

/** 物料上架状态 */
export const MATERIAL_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published'
} as const

/**
 * 物料表：与 ComponentMeta 对齐，支持 npm/props/fnEvent/children 存 JSON
 * - type 唯一，用于去重与 seed
 * - 低代码左侧列表只拉 status=published
 */
export const materialModel = seq.define(
  'sys_material',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '主键'
    },
    type: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment: '组件类型，与画布节点 type 一致'
    },
    componentName: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: '中文展示名'
    },
    group: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '物料分组'
    },
    icon: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: '图标类名'
    },
    npm: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '加载信息：exportName, package, component, destructuring 等'
    },
    props: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '默认 props 结构（含 divProps/formItemProps 等）'
    },
    fnEvent: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '事件配置（如 onChange/onInput）'
    },
    children: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '默认子节点'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: MATERIAL_STATUS.PUBLISHED,
      comment: '上架状态：published | draft'
    },
    version: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: '版本号'
    },
    createdBy: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '创建人 id'
    },
    userName: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '创建人名称'
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      { name: 'idx_type', fields: ['type'] },
      { name: 'idx_status', fields: ['status'] },
      { name: 'idx_group', fields: ['group'] }
    ]
  }
)

materialModel
  .sync()
  .then(() => {
    console.log('sys_material 表同步成功')
  })
  .catch((err) => {
    console.error('sys_material 表同步失败', err)
  })
