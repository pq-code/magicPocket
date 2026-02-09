# MagicPocket 项目文档说明

## 概述

本项目采用模块化的文档结构，将不同类型的技术文档按照功能分类组织，以便于维护和查阅。

## 文档结构

### 1. 架构设计文档 (`docs/architecture/`)

包含系统整体架构设计相关的文档：

- `overview.md`: 系统架构概览，包括各模块职责和交互关系
- `rendering.md`: 渲染引擎设计文档，包括性能优化策略
- `protocol.md`: JSON 协议规范（一套 Schema 多用途，与宜搭一致；编辑/渲染/保存/预览共用同一 pageJSON）
- `preview-analysis.md`: 预览卡死原因分析与可选方案（iframe/新窗口/第三方渲染器等，仅讨论不改代码）

### 2. 组件库文档 (`docs/components/`)

包含组件开发和使用相关的文档：

- `guidelines.md`: 组件开发指南，包含开发流程和最佳实践
- `standards.md`: 组件标准规范，定义所有组件必须遵循的技术规范

### 3. 性能优化文档 (`docs/performance/`)

包含性能问题分析和优化方案：

- `issues.md`: 详细的性能问题分析，包括问题根源和影响
- `solutions.md`: 针对性性能优化方案，包括具体实现策略

## 文档维护准则

### 文档编写原则
1. **准确性**: 文档内容应与实际代码实现保持一致
2. **时效性**: 随着代码更新及时更新相关文档
3. **实用性**: 重点解决开发中遇到的实际问题
4. **简洁性**: 避免冗余信息，突出重点内容

### 文档更新流程
1. 修改代码的同时更新相关文档
2. 提交 PR 时检查文档是否需要更新
3. 定期审查文档的准确性和完整性

## 最佳实践

### 查阅文档
- 新手: 从 `docs/architecture/overview.md` 开始了解整体架构
- 组件开发: 参考 `docs/components/guidelines.md` 和 `docs/components/standards.md`
- 性能问题: 查看 `docs/performance/issues.md` 和 `docs/performance/solutions.md`

### 贡献文档
- 添加新功能时，同时更新相关文档
- 发现文档错误时及时修正
- 对于重大架构变更，更新相应的架构文档

## 文档索引

| 主题 | 文档路径 | 说明 |
|------|----------|------|
| 系统架构 | `docs/architecture/overview.md` | 整体架构设计 |
| 渲染引擎 | `docs/architecture/rendering.md` | 渲染性能优化 |
| JSON 协议 | `docs/architecture/protocol.md` | 数据结构规范 |
| 组件开发 | `docs/components/guidelines.md` | 开发指南 |
| 组件规范 | `docs/components/standards.md` | 技术规范 |
| 性能问题 | `docs/performance/issues.md` | 问题分析 |
| 优化方案 | `docs/performance/solutions.md` | 优化策略 |

---

*此文档最后更新时间: 2026-02-09*