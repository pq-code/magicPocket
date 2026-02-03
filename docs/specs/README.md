# MagicPocket 协议规范

本目录包含低代码平台的协议文档、JSON Schema 与示例，供 Agent、渲染器、控制器统一遵循。

## 目录结构

```
specs/
├── README.md                 # 本说明
├── page-node.md              # 页面节点协议文档
├── config-schema.md          # 配置项 Schema 文档
├── component-descriptor.md   # 组件描述协议文档
├── schemas/                  # JSON Schema（供 Agent 校验）
│   ├── page-node.schema.json
│   └── config-item.schema.json
└── examples/                 # 标准示例 JSON
    ├── page-minimal.json     # 最小合法页面
    ├── page-with-container.json  # 含容器的页面
    ├── node-container.json   # 容器节点示例
    └── node-form-input.json  # 表单+输入框示例
```

## 使用方式

### Agent 生成/编辑画布

1. 阅读 `page-node.md`、`component-descriptor.md` 了解协议
2. 使用 `schemas/page-node.schema.json` 校验生成的 JSON
3. 参考 `examples/` 中的示例

### 运行时校验

可引入 `ajv` 等库加载 JSON Schema 做运行时校验。
