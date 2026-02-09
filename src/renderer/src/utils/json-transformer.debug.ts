/**
 * JSON 转换器调试脚本
 * 验证转换器是否正确处理示例数据
 */

import { createDemoCustomerFormPageRoot } from '@renderer/type/page-node';
import { transformToRenderJSON } from '@renderer/utils/json-transformer';

console.log('=== JSON 转换器调试 ===');

// 创建示例页面
const demoPage = createDemoCustomerFormPageRoot();
console.log('原始页面节点数:', countNodes(demoPage.children));

// 验证关键组件是否包含必要的 props
console.log('\\n--- 验证第一个 container 组件 ---');
if (demoPage.children && demoPage.children[0]) {
  const firstNode = demoPage.children[0];
  console.log('节点类型:', firstNode.type);
  console.log('节点属性keys:', Object.keys(firstNode.props || {}));

  if (firstNode.props) {
    console.log('layoutProps 存在:', !!firstNode.props.layoutProps);
    console.log('titleProps 存在:', !!firstNode.props.titleProps);

    if (firstNode.props.layoutProps) {
      console.log('layoutProps 内容:', firstNode.props.layoutProps);
    }
    if (firstNode.props.titleProps) {
      console.log('titleProps 内容:', firstNode.props.titleProps);
    }
  }

  // 检查子节点
  if (firstNode.children && firstNode.children[0]) {
    const childNode = firstNode.children[0];
    console.log('\\n子节点类型:', childNode.type);
    console.log('子节点属性keys:', Object.keys(childNode.props || {}));

    if (childNode.props) {
      console.log('formProps 存在:', !!childNode.props.formProps);
      console.log('formItemProps 存在:', !!childNode.props.formItemProps);

      if (childNode.props.formProps) {
        console.log('formProps 标题:', childNode.props.formProps.title);
      }
      if (childNode.props.formItemProps) {
        console.log('formItemProps 标题:', childNode.props.formItemProps.title);
      }
    }
  }
}

// 转换为渲染JSON
console.log('\\n--- 转换为渲染JSON ---');
const renderPage = transformToRenderJSON(demoPage);
console.log('渲染页面节点数:', countNodes(renderPage.children));

// 验证转换后数据
console.log('\\n--- 验证转换后的第一个 container 组件 ---');
if (renderPage.children && renderPage.children[0]) {
  const firstNode = renderPage.children[0];
  console.log('节点类型:', firstNode.type);
  console.log('节点属性keys:', Object.keys(firstNode.props || {}));

  if (firstNode.props) {
    console.log('layoutProps 存在:', !!firstNode.props.layoutProps);
    console.log('titleProps 存在:', !!firstNode.props.titleProps);

    if (firstNode.props.layoutProps) {
      console.log('layoutProps 内容:', typeof firstNode.props.layoutProps);
    }
    if (firstNode.props.titleProps) {
      console.log('titleProps 内容:', typeof firstNode.props.titleProps);
    }
  }

  // 检查子节点
  if (firstNode.children && firstNode.children[0]) {
    const childNode = firstNode.children[0];
    console.log('\\n子节点类型:', childNode.type);
    console.log('子节点属性keys:', Object.keys(childNode.props || {}));

    if (childNode.props) {
      console.log('formProps 存在:', !!childNode.props.formProps);
      console.log('formItemProps 存在:', !!childNode.props.formItemProps);

      if (childNode.props.formProps) {
        console.log('formProps 标题:', childNode.props.formProps.title);
      }
      if (childNode.props.formItemProps) {
        console.log('formItemProps 标题:', childNode.props.formItemProps.title);
      }
    }
  }
}

console.log('\\n=== 调试完成 ===');

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