import { defineComponent, ref, watch, onMounted } from "vue";

// 引入CSS模块
import style from '../style/index.module.less';

import {
  ElInput,
  ElInputNumber,
  ElSwitch,
  ElSegmented,
} from "element-plus";


const DlockContainerOperatorPanel = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { },
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
  setup(props, { emit }) {
    const propsItemRef = ref(null);
    const TypeRender = (item) => {
      switch (item.type) {
        case "input":
          return (<ElInput size="small" v-model={item.value}
            v-slots={{
              append: item.rightText && (
                <span>{item.rightText}</span>
              )
            }}/>);
        case "segmented":
          return (<ElSegmented size="small" v-model={item.value} options={item.options || []} />);
        case "number":
          return (<ElInputNumber size="small" v-model={item.value} />);
        case "boolean":
          return (<ElSwitch v-model={item.value} />);
        default:
          return <div class="props-item-unknown">暂无该类型</div>;
      }
    };
    const list = Array.isArray(props.item) ? props.item : [];
    return () => (
      <div className={style.propsItem} ref={propsItemRef.value}>
        {list.map(e => (
          <div key={e.key || e.label} className={e.label?.length > 10 ? style.longPropsItemItem : e.longInput ? style.longPropsItemItem : style.shortPropsItemItem}>
            <span className={style.propsItemItemTitle}>{e.label}</span>
            {TypeRender(e)}
          </div>
        ))}
      </div>
    );
  },
});

export default DlockContainerOperatorPanel;
