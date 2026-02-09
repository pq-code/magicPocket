import { defineComponent, computed } from 'vue';
import { ElTree } from 'element-plus';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts';
import { storeToRefs } from 'pinia';

/**
 * 图层树：以树形结构展示 pageJSON 组件层级
 * - 类似 PS 图层面板，便于选中、查看结构
 * - 点击节点会同步更新 currentOperatingObject
 */
const LayerTree = defineComponent({
  name: 'LayerTree',
  setup() {
    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);

    const treeData = computed(() => {
      // 用一个虚拟根节点承载 pageJSON，避免直接把 PageRoot 交给 ElTree
      return [
        {
          key: '__page_root__',
          componentName: pageJSON.value.title || '页面',
          type: 'page',
          _ref: pageJSON.value,
          children: pageJSON.value.children || [],
        },
      ];
    });

    const defaultProps = {
      children: 'children',
      label: 'componentName',
    };

    const handleNodeClick = (data) => {
      // 虚拟根节点：选中整页
      if (data.key === '__page_root__') {
        currentOperatingObject.value = pageJSON.value;
        return;
      }
      // 其它节点：直接使用节点引用
      currentOperatingObject.value = data;
    };

    const currentKey = computed(() => currentOperatingObject.value?.key || '__page_root__');

    return () => (
      <div class="layer-tree">
        <ElTree
          data={treeData.value}
          node-key="key"
          default-expand-all
          highlight-current
          props={defaultProps}
          current-node-key={currentKey.value}
          onNode-click={handleNodeClick}
        />
      </div>
    );
  },
});

export default LayerTree;

