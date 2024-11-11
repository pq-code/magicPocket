import { defineComponent, ref, watch, nextTick, computed } from 'vue';
import PageContainer from '@renderer/packages/PageContainer/src/PageContainer.jsx'
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts'
import { storeToRefs } from 'pinia'

const DlockContainer = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { }
    },
    item: {
      type: Object,
      default: () => { }
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
  setup(props, { emit ,slots}) {
    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store);

    /**
     * 点击容器函数
     * 标记选中对象，提供选中对象进行编辑
     * @param e 事件对象
     * @returns 无返回值
     */
    const clickContainer = (e) => {
      e.stopPropagation()
      // 如果选中的对象不为空，则清除选中对象的高亮标记
      if (currentOperatingObject.value && JSON.stringify(currentOperatingObject.value) !== '{}') {
        document.getElementById(currentOperatingObject.value.key).classList.remove('selected-highlighted');
      }
      currentOperatingObject.value = props.item
      e.currentTarget?.classList.add('selected-highlighted');
    }

    /**
     * 处理鼠标进入事件
     *
     * @param e 事件对象
     */
    function handleMouseEnter(e) {
      if (!e.currentTarget?.classList.contains('selected-highlighted')) {
        e.currentTarget?.classList.add('hover-highlighted');
      }
    }

    // 字符串处理函数 + px
    const processStringAddPx = computed(() => {
      return (str) => {
        // 检查字符串中是否包含逗号或空格
        if (/[, ]/.test(str)) {
          // 使用正则表达式拆分字符串并过滤掉空字符串
          const strArray = str.split(/[, ]+/).filter(Boolean);
          // 处理每个元素，添加单位 px 如果没有单位
          const processedArray = strArray.map(item => {
            return /(px|rem|%|em)$/.test(item) ? item : `${item}px`;
          });
          // 返回处理后的数组，如果数组为空则返回默认值 '23px'
          return processedArray.length ? processedArray.join(' ') : '23px';
        }
        // 如果字符串中没有逗号或空格，直接处理并返回
        return /(px|rem|%|em)$/.test(str) ? str : `${str}px`
      }
    })

    /**
     * 处理鼠标离开事件
     *
     * @param e 事件对象
     */
    function handleMouseLeave(e) {
      e.currentTarget?.classList.remove('hover-highlighted');
    }

    const divProps = computed(() => {
      let value = {}
      props.item.props?.divProps?.children.forEach(item => {
        value[item.key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()] = item.value
      })
      if (props.item.props?.divProps) {
        props.item.props.divProps['style'] = {
          'text-align': value['text-align'],
          'font-size': processStringAddPx.value(value['font-size']),
          'font-weight': value['font-weight'],
          'margin': processStringAddPx.value(value['margin']) || '10px 0px',
          'padding': processStringAddPx.value(value['padding']) || '0px',
          'display': value['display']
        }
      }
      return value
    })

    // 标题属性
    const titleProps = computed(() => {
      let value = {}
      props.item.props?.titleProps?.children.forEach(item => {
        value[item.key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()] = item.value
      })
      if (value.title) {
        props.item.props.titleProps['style'] = {
          'text-align': value['text-align'],
          'font-size': processStringAddPx.value(value['font-size'] || '23px'),
          'font-weight': value['font-weight'],
          'margin': processStringAddPx.value(value['margin']) || '10px 0px',
          'padding': processStringAddPx.value(value['padding']) || '0px',
        }
      }
      return value
    })

    /**
     * 渲染节点
     *
     * @param e 事件对象
     */
    const renderComponent = () => {
      // 子级内容
      const Dom = [
        <PageContainer pageJSON={props.item} children={props.children}
          className={divProps.value['class-name']}
          style={props.item.props?.divProps?.style || {}}>
            { slots }
          </PageContainer>
      ];
      // 标题
      if (titleProps.value.title) {
        let titleDom = (
          <div className={titleProps.value['class-name']} style={props.item.props.titleProps['style'] || {}} >
            {titleProps.value.title}
          </div>
        );
        Dom.unshift(titleDom)
      }
      return (
        <div
          id={props.item.key}
          key={props.item.key}
          className={props.item.props?.className}
          style={props.item.props?.style}
          onClick={clickContainer}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
        >
          {Dom.filter(Boolean)}
        </div>
      )
    }

    const vnode = computed(() => {
      return renderComponent()
    })

    return () => (
      vnode.value
    );
  },
});

export default DlockContainer;
