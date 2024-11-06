import { DataTypes } from 'sequelize'
import { seq } from '../db/sqlite'

//创建模型
export const lowCodeConfig = seq.define(
  'sys_lowCodeConfig',
  {
    codeConfigId: {
      type: DataTypes.CHAR(64),
      allowNull: false, //是否可以为空
      unique: true, // 唯一
      comment: '配置id'
    },
    codeConfigName: {
      type: DataTypes.CHAR(64),
      allowNull: false, //是否可以为空
      unique: true, // 唯一
      comment: '配置名称'
    },
    codeConfig: {
      type: DataTypes.TEXT,
      allowNull: false, // 是否可以为空
      unique: false, // 唯一
      comment: 'JSON配置'
    },
    userId: {
      type: DataTypes.CHAR(64),
      allowNull: false, //是否可以为空
      unique: false, // 唯一
      comment: '创建人的id'
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false, //是否可以为空
      unique: false, // 唯一
      comment: '创建人的用户名'
    },
  },
  {
    // 告诉 sequelize 不需要自动将表名变成复数
    freezeTableName: true,
    // tableName: 'student',// 自定义表名
    timestamps: true, // 不需要自动创建 createAt / updateAt 这两个字段
    // paranoid:true,//逻辑删除，当调用destroy的，不会删除，而是多出一列，叫做deletedAt，将其设置为true,从而表示删除真实项目中，我们没有真删除，都是逻辑删除
    omitNull: true, //是否忽略空值
    // 指定索引
    indexes: [
      {
        // 索引名称
        name: 'codeConfigId',
        // 索引字段名称
        fields: ['codeConfigId']
      },
      {
        // 索引名称
        name: 'userId',
        // 索引字段名称
        fields: ['userId']
      }
    ]
  }
)

//  强制创建数据表
// 如果表存在不会删除重新生成
//   .sync({ alter: true })
lowCodeConfig
  .sync()
  .then((res) => {
    console.log(`sys_lowCodeConfig·创建表成功`, res)
  })
  .catch((err) => {
    console.error(`sys_lowCodeConfig·创建表失败`, err)
  })
