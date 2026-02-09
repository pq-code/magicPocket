/**
 * 低代码渲染引擎主组件
 *
 * 功能说明：
 * 1. 根据页面 JSON 配置渲染真实的 UI 组件树
 * 2. 支持编辑模式（可拖拽排序）和预览模式（只读展示）
 * 3. 深度递归遍历组件树，逐层渲染子组件
 * 4. 处理组件选中、拖拽、历史记录等功能
 *
 * 架构特点：
 * - 响应式数据驱动：监听 pageJSON 变化并自动重新渲染
 * - 可插拔架构：通过 ComponentMaker 和 TypeRenderEngine 支持多种组件类型
 * - 拖拽支持：集成 vue-draggable-plus 实现组件拖拽排序
 * - 模式切换：支持编辑模式和预览模式
 *
 * 关键流程：
 * 1. 初始化：从 pinia store 获取页面数据
 * 2. 监听：watch pageJSON 变化并同步到本地状态
 * 3. 渲染：深度遍历组件树，递归渲染子组件
 * 4. 交互：处理拖拽、点击选中等用户操作
 *
 * 依赖组件：
 * - TypeRenderEngine: 类型化组件渲染器
 * - ComponentMaker: 可拖拽包装器
 * - useCanvasOperation: 画布操作 hook
 */

import { defineComponent, ref, watch, computed, inject } from 'vue';
import style from '../style/index.module.less';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts';
import { VueDraggable } from 'vue-draggable-plus';
import { TypeRenderEngine } from '../components/TypeRenderEngine';
import { storeToRefs } from 'pinia';
import useCanvasOperation from '@renderer/views/draggingDragging/hooks/useCanvasOperation.ts';
import ComponentMaker from '../components/ComponentMaker.jsx';
import { buildUUID } from '@renderer/utils';

const PREVIEW_MODE_KEY = 'lowcodePreviewMode';

const RenderEngine = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    listData: {
      type: Array,
      default: () => [],
    },
  },

  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },

  setup(props) {
    const { addHistoryOperatingObject } = useCanvasOperation();

    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);

    const previewMode = inject(PREVIEW_MODE_KEY, false);
    const whetherYouCanDrag = computed(() => previewMode ? false : pageJSON.value?.whetherYouCanDrag);

    // 画布数据直接使用 store 的 pageJSON.children，不经过 transform，避免「编辑/渲染分离」时把精简数据写回 store 导致内容丢失
    const componentList = ref(pageJSON.value?.children ?? []);

    watch(
      () => pageJSON.value?.children,
      (newChildren) => {
        componentList.value = newChildren ?? [];
      },
      { immediate: true, deep: false }
    );

    watch(
      [() => componentList.value, () => props.modelValue],
      ([newComponentList]) => {
        if (!whetherYouCanDrag.value) return;
        if (newComponentList !== pageJSON.value?.children) {
          pageJSON.value.children = newComponentList;
        }
        addHistoryOperatingObject();
      },
      { deep: true }
    );

    const renderComponents = (_page) => {
      if (!_page) return null;
      if (Array.isArray(_page)) {
        return _page.map((child) => {
          const children = Array.isArray(child.children) ? renderComponents(child.children) : [];
          return startRender(child, children);
        });
      } else {
        return startRender(_page);
      }
    };

    const startRender = (item, children) => {
      if (!item.key) {
        item.key = `${item.type}-${buildUUID()}`;
      }
      return whetherYouCanDrag ? (
        <ComponentMaker item={item}>
          {TypeRenderEngine(item, children)}
        </ComponentMaker>
      ) : (
        TypeRenderEngine(item, children)
      );
    };

    const clickContainer = (e) => {
      e.stopPropagation();
      currentOperatingObject.value = null;
    };

    const renderRootVnode = computed(() => {
      const renderComponent = renderComponents(componentList.value);
      const rootClass = [style.PageContainer, 'lowcode-page-root'].filter(Boolean).join(' ');
      return whetherYouCanDrag ? (
        <VueDraggable
          className={rootClass}
          vModel={componentList.value}
          group={{ name: 'people', pull: true, put: true }}
          ghostClass="ghost"
          chosenClass="chosen"
          selector="selector"
          animation={200}
          sort={true}
          onClick={clickContainer}
        >
          {renderComponent}
        </VueDraggable>
      ) : (
        <div className={rootClass}>{renderComponent}</div>
      );
    });

    return () => renderRootVnode.value;
  },
});

export default RenderEngine;

