/**
 * 核心模块统一导出
 * - loader: 组件加载器
 * - material: 物料源
 * - renderer: 组件注册表（type -> npm，供渲染器按 meta 解析）
 */

export * from './loader';
export * from './material';
export * from './renderer/ComponentRegistry';
