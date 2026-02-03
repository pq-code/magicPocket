/**
 * ElInput 二次封装：适配低代码平台 item/children 接口
 * 从 item.props.elInputProps.children 收集参数，透传给 Element Plus ElInput
 */
import { defineComponent, computed } from 'vue';
import { ElInput } from 'element-plus';

function buildPropsFromChildren(children) {
  if (!Array.isArray(children)) return {};
  return children.reduce((acc, c) => {
    if (c.key != null) acc[c.key] = c.value;
    return acc;
  }, {});
}

export default defineComponent({
  name: 'ElInputWrapper',
  props: {
    item: { type: Object, default: () => ({}) },
    children: { type: Array, default: () => [] },
  },
  setup(props) {
    const inputProps = computed(() => {
      const group = props.item?.props?.elInputProps;
      return buildPropsFromChildren(group?.children);
    });

    return () => {
      return <ElInput {...inputProps.value} />;
    };
  },
});
