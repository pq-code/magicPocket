
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const QuillCodeEditor = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    listData: {
      type: Array,
      default: () => []
    }
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const state = reactive({
        content: '',
        title: '',
        img: [],
        sortShow: false,
        note_type: '美食'
    })

    return () => (
      <div style={{ width: '100%', height: '650px' }}>
        <QuillEditor
          vModel={props.modelValue} theme="snow"
          placeholder="JSON数据内容..."
          contentType="html"
        ></QuillEditor>
      </div>
    )
  }
});

export default QuillCodeEditor;
