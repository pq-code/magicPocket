import { defineComponent, ref, defineExpose } from 'vue';
import { ElDrawer, ElFormItem, ElForm } from 'element-plus';

const From = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    pageJSON: {
      type: Object,
      default: () => ({})
    },
    children: {
      type: Array,
      default: () => []
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const drawer = ref(false); // 侧边栏开关

    return () => (
      <div>12323123</div>
    );
  },
});

export default From;
