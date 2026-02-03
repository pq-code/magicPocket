/**
 * ElDivider 二次封装：适配低代码平台 item/children 接口
 */
import { defineComponent, computed } from 'vue';
import { ElDivider } from 'element-plus';

function buildPropsFromChildren(children) {
  if (!Array.isArray(children)) return {};
  return children.reduce((acc, c) => {
    if (c.key != null) acc[c.key] = c.value;
    return acc;
  }, {});
}

export default defineComponent({
  name: 'ElDividerWrapper',
  props: {
    item: { type: Object, default: () => ({}) },
    children: { type: Array, default: () => [] },
  },
  setup(props) {
    const dividerProps = computed(() => {
      const group = props.item?.props?.elDividerProps;
      const raw = buildPropsFromChildren(group?.children);
      const { content, ...rest } = raw;
      return rest;
    });

    const dividerContent = computed(() => {
      const group = props.item?.props?.elDividerProps;
      const raw = buildPropsFromChildren(group?.children);
      return raw.content ?? '';
    });

    return () => {
      const content = dividerContent.value;
      return content ? (
        <ElDivider {...dividerProps.value}>{content}</ElDivider>
      ) : (
        <ElDivider {...dividerProps.value} />
      );
    };
  },
});
