import { DataTypes } from 'sequelize'
import { seq } from '../db/sqlite'

//创建模型
export const User = seq.define(
  'sys_user',
  {
    //id会被sequelize自动创建
    userId: {
      type: DataTypes.CHAR(64),
      allowNull: false, //是否可以为空
      unique: true, // 唯一
      comment: 'UUID'
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false, //是否可以为空
      unique: true, // 唯一
      comment: '唯一用户名'
    },
    userPassword: {
      type: DataTypes.CHAR(64),
      allowNull: false, //是否可以为空
      comment: '密码'
    },
    externalToken: {
      type: DataTypes.STRING,
      allowNull: false, //是否可以为空
      comment: '第三方系统token'
    },
    secretKey: {
      type: DataTypes.CHAR(64),
      allowNull: true, //是否可以为空
      comment: '登录密钥'
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true, //是否可以为空
      comment: '用户邮箱'
    },
    userProfilePhoto: {
      type: DataTypes.STRING(255),
      allowNull: true, //是否可以为空
      comment: '用户头像'
    },
    user_registration_time: {
      type: DataTypes.DATE(6),
      allowNull: true, //是否可以为空
      comment: '注册时间'
    },
    userLoginTime: {
      type: DataTypes.DATE(6),
      allowNull: true, //是否可以为空
      comment: '最后登陆时间'
    },
    userNickname: {
      type: DataTypes.STRING(40),
      allowNull: true, //是否可以为空
      comment: '用户昵称'
    },
    userInfo: {
      type: DataTypes.JSON,
      allowNull: true, //是否可以为空
      comment: '用户信息'
    },
    userSource: {
      type: DataTypes.STRING(40),
      allowNull: true, //是否可以为空
      comment: '用户来源'
    },
    userSourceId: {
      type: DataTypes.STRING(40),
      allowNull: true, //是否可以为空
      comment: '用户来源Id'
    }
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
User
  .sync()
  .then((res) => {
    console.log(`sys_user·创建表成功`, res)
  })
  .catch((err) => {
    console.error(`sys_user·创建表失败`, err)
  })
