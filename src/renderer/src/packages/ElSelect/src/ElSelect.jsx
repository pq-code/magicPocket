/**
 * ElSelect 二次封装：适配低代码平台 item/children 接口
 * 从 item.props.elSelectProps.children 收集参数，透传给 Element Plus ElSelect
 */
import { defineComponent, computed } from 'vue';
import { ElSelect, ElOption } from 'element-plus';

function buildPropsFromChildren(children) {
  if (!Array.isArray(children)) return {};
  return children.reduce((acc, c) => {
    if (c.key != null) acc[c.key] = c.value;
    return acc;
  }, {});
}

function parseOptions(opts) {
  if (!opts) return [];
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      const arr = JSON.parse(opts);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return opts.split(',').map((s) => ({ label: s.trim(), value: s.trim() }));
    }
  }
  return [];
}

export default defineComponent({
  name: 'ElSelectWrapper',
  props: {
    item: { type: Object, default: () => ({}) },
    children: { type: Array, default: () => [] },
  },
  setup(props) {
    const selectProps = computed(() => {
      const group = props.item?.props?.elSelectProps;
      const raw = buildPropsFromChildren(group?.children);
      const { options, ...rest } = raw;
      return rest;
    });

    const options = computed(() => {
      const group = props.item?.props?.elSelectProps;
      const raw = buildPropsFromChildren(group?.children);
      return parseOptions(raw.options);
    });

    return () => {
      const opts = options.value.length
        ? options.value
        : [
            { label: '选项一', value: '1' },
            { label: '选项二', value: '2' },
            { label: '选项三', value: '3' },
          ];
      return (
        <ElSelect {...selectProps.value} style={{ width: '100%' }}>
          {opts.map((o) => (
            <ElOption key={o.value} label={o.label} value={o.value} />
          ))}
        </ElSelect>
      );
    };
  },
});
