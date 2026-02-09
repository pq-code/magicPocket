import { defineComponent, computed, inject } from 'vue';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts';
import { storeToRefs } from 'pinia';
import style from '../style/index.module.less';
import { VueDraggable } from 'vue-draggable-plus';
import useCodeConfig from '@renderer/views/draggingDragging/hooks/useCodeConfig.ts';

const PREVIEW_MODE_KEY = 'lowcodePreviewMode';

/** 容器样式合并顺序：组件(位置+布局) + 样式(圆角/图层/填充/描边/特效)，兼容旧 divProps */
const CONTAINER_STYLE_KEYS = [
  'positionProps',
  'layoutProps',
  'radiusProps',
  'layerProps',
  'fillProps',
  'strokeProps',
  'effectsProps',
  'positionSizeProps',
  'alignProps',
  'divProps',
];

// 辅助函数：智能解析值，支持带单位的值
const parseValueWithUnit = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  // 如果值已经包含单位（%、px、em、rem、vw、vh、rpx等），直接返回
  if (typeof value === 'string' && /[%pxremvwh]+/.test(value)) {
    return value;
  }
  // 如果是纯数字，加上 px 单位
  if (typeof value === 'number' || /^\d+$/.test(value)) {
    return `${value}px`;
  }
  return value;
};

const DlockContainer = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    item: {
      type: Object,
      default: () => ({})
    },
    children: {
      type: Array,
      default: () => []
    }
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit, slots }) {
    const { collectProps } = useCodeConfig();

    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);
    const previewMode = inject(PREVIEW_MODE_KEY, false);
    const whetherYouCanDrag = computed(() => previewMode ? false : pageJSON.value.whetherYouCanDrag);

    /** 捕获阶段点击：先选中当前容器，若点击的是子组件则子组件冒泡时会覆盖为子组件。避免重复赋同一节点导致递归更新 */
    const onContainerClickCapture = (e) => {
      if (!whetherYouCanDrag.value) return;
      if (currentOperatingObject.value?.key === props.item?.key) return;
      currentOperatingObject.value = props.item;
    };

    const renderComponent = () => {
      const vnodeProps = collectProps(props.item.props);

      const Dom = [];
      if (vnodeProps.titleProps?.props?.title) {
        const titleDom = (
          <div className={[vnodeProps?.titleProps?.props['className'], style.DivContainerTitle].filter(Boolean).join(' ')} style={vnodeProps.titleProps.style}>
            {vnodeProps.titleProps.props.title}
          </div>
        );
        Dom.unshift(titleDom);
      }
      const hasChildren = Array.isArray(props.item.children) && props.item.children.length > 0;
      if (hasChildren) {
        Dom.push(slots.default?.() ?? null);
      }

      const mergedStyle = {};

      // 依次合并各个样式组
      CONTAINER_STYLE_KEYS.forEach((k) => {
        if (vnodeProps[k]?.style && typeof vnodeProps[k].style === 'object') {
          Object.assign(mergedStyle, vnodeProps[k].style);
        }
      });

      // 特殊处理一些常用属性，允许动态单位
      const layoutProps = vnodeProps.layoutProps?.style || {};
      const positionProps = vnodeProps.positionProps?.style || {};

      // 智能解析常用尺寸单位
      const dimensionProperties = [
        'width', 'height', 'top', 'left', 'right', 'bottom',
        'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'minWidth', 'maxWidth', 'minHeight', 'maxHeight'
      ];

      // 应用维度属性，支持动态单位
      Object.entries({...positionProps, ...layoutProps}).forEach(([key, value]) => {
        if (dimensionProperties.includes(key)) {
          const parsedValue = parseValueWithUnit(value);
          if (parsedValue !== undefined) {
            mergedStyle[key] = parsedValue;
          }
        } else {
          mergedStyle[key] = value;
        }
      });

      const userClass = vnodeProps.layoutProps?.props?.['className'] ?? vnodeProps.divProps?.props?.['className'] ?? '';
      const containerProps = {
        id: props.item.key,
        className: [userClass, style.DivContainer].filter(Boolean).join(' '),
        style: mergedStyle
      };

      const captureProps = whetherYouCanDrag.value ? { onClickCapture: onContainerClickCapture } : {};
      return whetherYouCanDrag.value ? (
        <VueDraggable
          v-model={props.item.children}
          group={{ name: "people", pull: true, put: true }}
          ghostClass="ghost"
          chosenClass="chosen"
          selector="selector"
          animation={200}
          sort={true}
          {...containerProps}
          {...captureProps}
        >
          {Dom}
        </VueDraggable>
      ) : (
        <div {...containerProps} {...captureProps}>
          {Dom}
        </div>
      );
    };

    const vnode = computed(() => renderComponent());

    return () => vnode.value;
  },
});

export default DlockContainer;
