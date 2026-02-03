/**
 * ElSwitch 二次封装：适配低代码平台 item/children 接口
 */
import { defineComponent, computed } from 'vue';
import { ElSwitch } from 'element-plus';

function buildPropsFromChildren(children) {
  if (!Array.isArray(children)) return {};
  return children.reduce((acc, c) => {
    if (c.key != null) acc[c.key] = c.value;
    return acc;
  }, {});
}

export default defineComponent({
  name: 'ElSwitchWrapper',
  props: {
    item: { type: Object, default: () => ({}) },
    children: { type: Array, default: () => [] },
  },
  setup(props) {
    const switchProps = computed(() => {
      const group = props.item?.props?.elSwitchProps;
      return buildPropsFromChildren(group?.children);
    });

    return () => <ElSwitch {...switchProps.value} />;
  },
});
