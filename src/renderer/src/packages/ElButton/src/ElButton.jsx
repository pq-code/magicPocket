/**
 * ElButton 二次封装：适配低代码平台 item/children 接口
 * 从 item.props.elButtonProps.children 收集参数，透传给 Element Plus ElButton
 */
import { defineComponent, computed } from 'vue';
import { ElButton } from 'element-plus';

function buildPropsFromChildren(children) {
  if (!Array.isArray(children)) return {};
  return children.reduce((acc, c) => {
    if (c.key != null) acc[c.key] = c.value;
    return acc;
  }, {});
}

export default defineComponent({
  name: 'ElButtonWrapper',
  props: {
    item: { type: Object, default: () => ({}) },
    children: { type: Array, default: () => [] },
  },
  setup(props) {
    const buttonProps = computed(() => {
      const group = props.item?.props?.elButtonProps;
      const children = group?.children;
      return buildPropsFromChildren(children);
    });

    const slotContent = computed(() => {
      const text = buttonProps.value.text ?? buttonProps.value.content ?? '按钮';
      return text;
    });

    return () => {
      const { text, content, ...rest } = buttonProps.value;
      return (
        <ElButton {...rest}>
          {slotContent.value}
        </ElButton>
      );
    };
  },
});
