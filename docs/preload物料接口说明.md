# preload 物料接口与表结构说明

## 1. 表结构（sys_material）

与 `ComponentMeta` 对齐，支持低代码画布与物料平台：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 主键 |
| type | STRING(64) UNIQUE | 组件类型，与画布节点 type 一致 |
| componentName | STRING(128) | 中文展示名 |
| group | STRING(64) | 物料分组 |
| icon | STRING(128) | 图标类名 |
| npm | JSON | 加载信息：exportName, package, component, destructuring 等 |
| props | JSON | 默认 props（含 divProps/formItemProps 等） |
| fnEvent | JSON | 事件配置（如 onChange/onInput） |
| children | JSON | 默认子节点 |
| status | STRING(20) | published / draft，列表默认只拉 published |
| version | STRING(32) | 版本号 |
| createdBy / userName | STRING(64) | 创建人 |
| createdAt / updatedAt | 时间戳 | 自动维护 |

索引：`type`、`status`、`group`。

## 2. 默认数据来源

- `src/preload/data/defaultMaterials.ts`：与 `materialArea/components` 下各文件内容一致（Container、Input、Table、Button、Select、Divider、Image、Backtop、Breadcrumb、Carousel、PageHeader、Search）。
- 应用启动时自动执行一次 **seed**（按 type 不存在则插入，幂等），将默认物料填入表。

## 3. preload 下新增/修改

| 路径 | 说明 |
|------|------|
| **model/material.model.ts** | 新增。物料表模型，含 fnEvent/children 等 JSON 字段。 |
| **data/defaultMaterials.ts** | 新增。默认物料数组，供 seed 使用。 |
| **service/material.service.ts** | 新增。materialList、materialGetById、materialGetByType、materialCreate、materialUpdate、materialDelete、materialSeed。 |
| **controller/material.controller.ts** | 新增。Express 控制器：list、getOne、create、update、remove、seed。 |
| **router/material.ts** | 新增。Express 路由，挂载到 `/api`。 |
| **app/index.ts** | 修改。`app.use(express.json())`；挂载 `materialRouter` 到 `/api`；启动时 `require` 物料 model；`server.listen` 后执行一次 `materialSeed`。 |

## 4. 接口一览

服务根路径为应用启动的 HTTP 服务（如 `http://localhost:3000`），前缀 `/api`：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/materials | 分页列表，query：page、pageSize、group、search、createdBy、status |
| GET | /api/materials/:materialId | 获取单个物料 |
| POST | /api/materials | 创建物料，body 同 ComponentMeta |
| PATCH | /api/materials/:materialId | 更新物料 |
| DELETE | /api/materials/:materialId | 删除物料 |
| POST | /api/materials/seed | 填充默认物料（幂等），body 可选：createdBy、userName |

列表与单条返回的 `result` 为纯对象（含 type、componentName、npm、props、fnEvent、children 等），可直接给低代码左侧列表使用。

## 5. 前端对接说明

- 若物料接口由 **本应用 preload 提供**：前端物料 API 的 baseURL 应指向应用 HTTP 服务地址（如 `http://127.0.0.1:3000`），与 `config/node/config.ts` 中 `httpPort` 一致。
- 若物料接口由 **独立服务 127.0.0.1:3001** 提供：保持前端 `materials.ts` 的 baseURL 为 `http://127.0.0.1:3001`，独立服务需自行实现上述接口或复用同一套逻辑。
