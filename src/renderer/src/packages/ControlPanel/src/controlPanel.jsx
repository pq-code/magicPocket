/**
 * 控制面板：根据选中节点的 props 结构动态渲染配置项
 * 组件 Tab：渲染配置分组（xxxProps）；样式、高级 Tab 待实现
 */
import { defineComponent, ref, defineAsyncComponent, Suspense } from "vue";
import {
  ElTabs,
  ElTabPane,
  ElCollapseItem,
} from "element-plus";
import { isConfigPropsKey } from "@renderer/type/config-item-schema";
import PropsItem from "../components/PropsItem.jsx";
import style from "../style/index.module.less";

/**
 * 创建异步加载的自定义配置面板组件
 * @param {string} url - 组件路径，如 packages/Form/components/FormItemConfig.jsx
 */
const createAsyncPanel = (url) => {
  return defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ `../../../${url}`),
    delay: 200,
  });
};

const ControlPanel = defineComponent({
  name: "ControlPanel",
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    /** 当前选中的画布节点 */
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  model: {
    prop: "modelValue",
    event: "update:modelValue",
  },
  setup(props) {
    const activeTabName = ref('props');
    const handleSelect = () => {};

    /**
     * 渲染「组件」Tab：遍历 props 中的配置分组（key 以 Props 结尾）
     * 每个分组渲染 ElCollapseItem，内有 PropsItem 或自定义 AsyncPanel
     */
    const renderPropsPanel = (item) => {
      const itemProps = item?.props || {};
      const children = [];

      Object.keys(itemProps).forEach((key) => {
        if (!isConfigPropsKey(key)) return;

        const group = itemProps[key];
        if (!group || typeof group !== 'object') return;

        const AsyncPanel = group.component
          ? createAsyncPanel(group.component)
          : null;

        children.push(
          <ElCollapseItem key={key} title={group.title || key}>
            {group.children ? (
              <PropsItem item={group.children} />
            ) : null}
            {AsyncPanel ? (
              <Suspense>
                <AsyncPanel item={props.item} />
              </Suspense>
            ) : null}
          </ElCollapseItem>
        );
      });

      if (children.length === 0) {
        return (
          <div class={style.controlPanelPlaceholder}>
            该组件暂无可配置项，或在 meta.props 中配置 xxxProps 分组
          </div>
        );
      }
      return <div>{children}</div>;
    };

    /** 样式 Tab：占位，待实现 */
    const renderStylePanel = () => <div class={style.controlPanelPlaceholder}>样式配置待实现</div>;

    /** 高级 Tab：占位，待实现 */
    const renderSeniorPanel = () => <div class={style.controlPanelPlaceholder}>高级配置待实现</div>;

    /**
     * 根据 Tab 索引渲染对应内容
     */
    const renderTabContent = (index) => {
      const panels = [
        () => renderPropsPanel(props.item),
        renderStylePanel,
        renderSeniorPanel,
      ];
      const fn = panels[index];
      return fn ? fn() : null;
    };

    return () => (
      <div class={style.controlPanel}>
        <ElTabs
          v-model={activeTabName.value}
          type="card"
          onTab-click={handleSelect}
        >
          <ElTabPane label="组件" name="props">
            {renderTabContent(0)}
          </ElTabPane>
          <ElTabPane label="样式" name="style">
            {renderTabContent(1)}
          </ElTabPane>
          <ElTabPane label="高级" name="senior">
            {renderTabContent(2)}
          </ElTabPane>
        </ElTabs>
      </div>
    );
  },
});

export default ControlPanel;
