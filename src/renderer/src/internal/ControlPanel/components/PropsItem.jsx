import { defineComponent, ref } from "vue";

// 引入CSS模块
import style from "../style/index.module.less";

import { ElInput, ElInputNumber, ElSwitch, ElSegmented, ElColorPicker } from "element-plus";

const PropsItem = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },
    item: {
      type: Array,
      default: () => [],
    },
  },
  model: {
    prop: "modelValue",
    event: "update:modelValue",
  },
  setup(props) {
    const propsItemRef = ref(null);

    const TypeRender = (item) => {
      // 确保 item 有 type 属性；兼容历史/精简数据中的 text、string 等
      let type = item.type || 'input';
      if (['text', 'string'].includes(type)) type = 'input';

      switch (type) {
        case "input":
          return (
            <ElInput
              size="small"
              v-model={item.value}
              placeholder={item.placeholder}
              onInput={(val) => item.value = val}
              v-slots={{
                append: item.rightText && <span>{item.rightText}</span>,
              }}
            />
          );
        case "segmented":
          return <ElSegmented size="small" v-model={item.value} options={item.options || []} />;
        case "number":
          return <ElInputNumber size="small" v-model={item.value} />;
        case "boolean":
          return <ElSwitch v-model={item.value} />;
        case "color":
          return (
            <ElColorPicker
              v-model={item.value}
              show-alpha
              size="small"
            />
          );
        default:
          // 在开发环境输出调试信息
          console.warn('Unknown property type:', item);
          return <div class="props-item-unknown">暂无该类型: {type}</div>;
      }
    };
    return () => {
      // 始终使用最新的 props.item，避免 layoutProps 过滤后列表不更新
      const list = Array.isArray(props.item) ? props.item : [];
      return (
        <div className={style.propsItem} ref={propsItemRef.value}>
          {list.map((e) => (
            <div
              key={e.key || e.label}
              className={
                e.label?.length > 10 ? style.longPropsItemItem : e.longInput ? style.longPropsItemItem : style.shortPropsItemItem
              }
            >
              <span className={style.propsItemItemTitle}>{e.label}</span>
              {TypeRender(e)}
            </div>
          ))}
        </div>
      );
    };
  },
});

export default PropsItem;

