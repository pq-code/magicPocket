/**
 * JSON 转换器测试脚本
 * 用于验证编辑JSON到渲染JSON的转换是否正确
 */

import { createDemoCustomerFormPageRoot } from '@renderer/type/page-node';
import { transformToRenderJSON } from '@renderer/utils/json-transformer';

console.log('=== JSON 转换器测试 ===');

// 获取示例页面
const demoPage = createDemoCustomerFormPageRoot();
console.log('原始编辑JSON节点数量:', countNodes(demoPage.children));

// 转换为渲染JSON
const renderPage = transformToRenderJSON(demoPage);
console.log('转换后渲染JSON节点数量:', countNodes(renderPage.children));

// 检查关键属性是否保留
checkCriticalProps(demoPage.children, renderPage.children);

console.log('\n=== 转换测试完成 ===');

/**
 * 计算节点数量
 */
function countNodes(nodes: any[], count = 0): number {
  if (!Array.isArray(nodes)) return count;

  for (const node of nodes) {
    count++;
    if (node.children && Array.isArray(node.children)) {
      count = countNodes(node.children, count);
    }
  }
  return count;
}

/**
 * 检查关键属性是否正确保留
 */
function checkCriticalProps(originalNodes: any[], convertedNodes: any[]) {
  console.log('\n--- 关键属性检查 ---');

  // 检查第一个节点
  if (originalNodes[0] && convertedNodes[0]) {
    const orig = originalNodes[0];
    const conv = convertedNodes[0];

    console.log('节点类型:', orig.type, '->', conv.type);
    console.log('是否有key:', !!orig.key, '->', !!conv.key);
    console.log('是否有props:', !!orig.props, '->', !!conv.props);

    // 检查 props 中的重要字段
    console.log('原始props keys:', Object.keys(orig.props || {}));
    console.log('转换后props keys:', Object.keys(conv.props || {}));

    // 检查是否有 formProps、layoutProps 等关键属性
    const importantKeys = ['formProps', 'layoutProps', 'titleProps'];
    for (const key of importantKeys) {
      const origHas = orig.props && orig.props[key] !== undefined;
      const convHas = conv.props && conv.props[key] !== undefined;
      console.log(`${key}: ${origHas} -> ${convHas}`);
    }
  }
}