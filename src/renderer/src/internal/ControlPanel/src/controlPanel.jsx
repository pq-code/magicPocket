/**
 * 控制面板：根据选中节点的 props 结构动态渲染配置项
 * 组件 Tab：渲染配置分组（xxxProps）；样式、高级 Tab 待实现
 * 选中节点时会用当前 meta 补全节点缺失的配置项，保证新字段（圆角、宽高、阴影、flex 等）能显示
 */
import { defineComponent, ref, watch, defineAsyncComponent, Suspense, nextTick } from "vue";
import { ElTabs, ElTabPane, ElCollapse, ElCollapseItem } from "element-plus";
import { isConfigPropsKey } from "@renderer/type/config-item-schema";
import { componentMap } from "@renderer/components/materialArea/materialArea";
import { materialComponents } from "@renderer/packages/material";
import PropsItem from "../components/PropsItem.jsx";
import style from "../style/index.module.less";

/** 用 meta 补全节点 props：按 meta 顺序展示配置项，保留节点已有值 */
function normalizeNodePropsFromMeta(node, meta) {
  if (!node?.props || !meta?.props) return;
  const nodeProps = node.props;
  Object.keys(meta.props).forEach((groupKey) => {
    const metaGroup = meta.props[groupKey];
    if (!metaGroup?.children || !Array.isArray(metaGroup.children)) return;

    // 获取节点中已有的组配置，如果不存在则初始化为空对象
    let nodeGroup = nodeProps[groupKey] || {};

    // 确保节点组有一个 children 数组
    const nodeChildren = nodeGroup.children || [];

    // 将已有的子项转换为键值对映射，只取值部分
    const valueByKey = Object.fromEntries(
      nodeChildren.map((c) => [c.key, c.value])
    );

    // 构建下一版的组配置，保持 meta 的结构但使用节点的实际值
    // 保留 meta 中的完整属性，不仅仅是值
    const nextGroup = {
      title: nodeGroup?.title ?? metaGroup.title,
      children: metaGroup.children.map((c) => ({
        ...c,  // 保留 meta 中的完整配置，包括 type、label 等
        value: valueByKey[c.key] !== undefined ? valueByKey[c.key] : (c.value ?? ""),
      })),
      style: nodeGroup?.style ?? metaGroup.style ?? {},
    };

    // 保留节点上已有但 meta 未参与归一化的字段（如 formItemProps.itemList、component），避免点击选中时表单被重置为默认
    if (nodeGroup && typeof nodeGroup === "object") {
      ["itemList", "component"].forEach((preserveKey) => {
        if (nodeGroup[preserveKey] !== undefined) nextGroup[preserveKey] = nodeGroup[preserveKey];
      });
    }

    // 确保 nextGroup 是一个有效的对象
    nodeProps[groupKey] = nextGroup;
  });
}

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
    const activeTabName = ref("props");
    const activeNamesProps = ref([]);  // 默认为空数组，不展开任何面板
    const activeNamesStyle = ref([]);  // 默认为空数组，不展开任何面板
    const handleSelect = () => {};

    const getPropsGroupKeys = (item, styleOnly) => {
      const itemProps = item?.props || {};
      return Object.keys(itemProps).filter((key) => {
        if (!isConfigPropsKey(key)) return false;
        const group = itemProps[key];
        if (!group || typeof group !== "object") return false;
        const isStyle = group.children?.some((c) => typeof c?.key === "string" && c.key.startsWith("cs"));
        return styleOnly ? isStyle : !isStyle;
      });
    };

    // 创建一个键来标识当前项，用于强制更新
    const itemKey = ref(props.item?.key || '');
    const currentItemRef = ref(props.item);

    // 只按「选中节点 key」响应，不要 deep，否则 normalizeNodePropsFromMeta 会改写节点导致 watch 再次触发 → 递归更新卡死
    watch(
      () => props.item?.key,
      async (key) => {
        const newItem = props.item;
        if (!newItem) {
          itemKey.value = '';
          currentItemRef.value = null;
          return;
        }

        const keyChanged = key !== itemKey.value;
        if (keyChanged) {
          itemKey.value = key;
          currentItemRef.value = newItem;
        }

        const meta = materialComponents.find((m) => m.type === newItem.type) ?? componentMap.value?.[newItem.type];
        if (meta) {
          normalizeNodePropsFromMeta(newItem, meta);
          await nextTick();
        }

        if (keyChanged) {
          const allPropsGroupKeys = getPropsGroupKeys(newItem, false);
          const allStyleGroupKeys = getPropsGroupKeys(newItem, true);
          activeNamesProps.value = allPropsGroupKeys.length > 0 ? allPropsGroupKeys : [];
          activeNamesStyle.value = allStyleGroupKeys.length > 0 ? allStyleGroupKeys : [];
        }
      },
      { immediate: true }
    );

    /**
     * 判断分组是否为「样式分组」
     * 规则：children 中存在 key 以 cs 开头（如 csfontSize/csmargin）
     */
    const isStyleGroup = (group) => {
      if (!group || typeof group !== "object" || !Array.isArray(group.children)) return false;
      return group.children.some((child) => typeof child?.key === "string" && child.key.startsWith("cs"));
    };

    /**
     * 布局分组按 display 过滤：只显示与当前布局方式匹配的配置项（showWhen: all | flex | grid | flexGrid）
     */
    const getLayoutFilteredChildren = (group) => {
      if (!group?.children || !Array.isArray(group.children)) return group?.children;
      const display = group.children.find((c) => c?.key === "display")?.value ?? "";
      const show = (child) => {
        const when = child?.showWhen;
        if (!when || when === "all") return true;
        if (when === "flex") return display === "flex";
        if (when === "grid") return display === "grid";
        if (when === "flexGrid") return display === "flex" || display === "grid";
        return true;
      };
      return group.children.filter(show);
    };

    /**
     * 渲染「组件」Tab：遍历 props 中的配置分组（key 以 Props 结尾，且不是样式分组）
     * 每个分组渲染 ElCollapseItem，内有 PropsItem 或自定义 AsyncPanel；layoutProps 按 display 过滤子项
     */
    const renderPropsPanel = (item) => {
      const itemProps = item?.props || {};
      const children = [];

      Object.keys(itemProps).forEach((key) => {
        if (!isConfigPropsKey(key)) return;

        const group = itemProps[key];
        if (!group || typeof group !== "object") return;
        // 样式分组交给样式 Tab 处理
        if (isStyleGroup(group)) return;

        const AsyncPanel = group.component ? createAsyncPanel(group.component) : null;
        const listToRender = key === "layoutProps" ? getLayoutFilteredChildren(group) : group.children;

        // 使用唯一键，包含节点 key 和组 key，确保切换组件时正确更新
        const collapseItemKey = `${item.key}-${key}`;

        // 确保有子项或者有异步面板才渲染
        const hasContent = (listToRender && listToRender.length > 0) || AsyncPanel;

        if (hasContent) {
          children.push(
            <ElCollapseItem key={collapseItemKey} name={key} title={group.title || key}>
              {listToRender && listToRender.length > 0 ? <PropsItem item={listToRender} /> : null}
              {AsyncPanel ? (
                <Suspense>
                  <AsyncPanel item={item} />
                </Suspense>
              ) : null}
            </ElCollapseItem>
          );
        }
      });

      if (children.length === 0) {
        return (
          <div class={style.controlPanelPlaceholder}>
            该组件暂无可配置项，或在 meta.props 中配置 xxxProps 分组
          </div>
        );
      }
      return (
        <ElCollapse v-model={activeNamesProps.value} class={style.controlPanelCollapse}>
          {children}
        </ElCollapse>
      );
    };

    /** 样式 Tab：渲染所有包含 cs* 样式字段的分组 */
    const renderStylePanel = (item) => {
      const itemProps = item?.props || {};
      const children = [];

      Object.keys(itemProps).forEach((key) => {
        if (!isConfigPropsKey(key)) return;
        const group = itemProps[key];
        if (!group || typeof group !== "object") return;
        if (!isStyleGroup(group)) return;

        // 使用唯一键，包含节点 key 和组 key，确保切换组件时正确更新
        const collapseItemKey = `${item.key}-${key}`;

        // 检查是否有子项需要渲染
        const hasChildren = group.children && group.children.length > 0;

        if (hasChildren) {
          children.push(
            <ElCollapseItem key={collapseItemKey} name={key} title={group.title || key}>
              <PropsItem item={group.children} />
            </ElCollapseItem>
          );
        }
      });

      if (children.length === 0) {
        return (
          <div class={style.controlPanelPlaceholder}>
            当前组件暂无可编辑样式字段（需在 meta.props 中配置带 cs* key 的分组）
          </div>
        );
      }
      return (
        <ElCollapse v-model={activeNamesStyle.value} class={style.controlPanelCollapse}>
          {children}
        </ElCollapse>
      );
    };

    /** 高级 Tab：占位，待实现 */
    const renderSeniorPanel = () => (
      <div class={style.controlPanelPlaceholder}>高级配置待实现</div>
    );

    /**
     * 根据 Tab 索引渲染对应内容
     */
    const renderTabContent = (index) => {
      const panels = [
        () => renderPropsPanel(currentItemRef.value),
        () => renderStylePanel(currentItemRef.value),
        renderSeniorPanel,
      ];
      const fn = panels[index];
      return fn ? fn() : null;
    };

    return () => (
      <div class={style.controlPanel}>
        <ElTabs v-model={activeTabName.value} type="card" onTab-click={handleSelect}>
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

