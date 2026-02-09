/**
 * 页面 JSON 结构编辑弹窗（独立组件）
 * 非受控：打开时只赋初值，编辑过程不写回 Vue 状态，应用时从 editorRef.getValue() 读取，避免输入导致重渲染/卡死
 */
import { defineComponent, ref, watch } from 'vue';
import { ElDialog, ElButton, ElMessage } from 'element-plus';
import MonacoEditor from '@renderer/internal/CodeEditor/src/MonacoEditor.jsx';

export default defineComponent({
  name: 'PageJsonDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    /** 打开时传入的初始 JSON 字符串（仅打开时同步一次，编辑过程不回流） */
    initialJson: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'apply'],
  setup(props, { emit }) {
    const editorRef = ref(null);
    /** 仅打开弹窗时同步一次，之后不再更新，避免输入触发 watch(setValue) 和大 JSON 卡顿 */
    const initialValueForEditor = ref('');

    watch(
      () => [props.modelValue, props.initialJson],
      ([visible, initial]) => {
        if (visible && typeof initial === 'string') {
          initialValueForEditor.value = initial;
        }
      },
      { immediate: true }
    );

    const handleClose = () => emit('update:modelValue', false);

    /** 判断是否为页面根（type 兼容 'page'/'Page'，children 可缺省则补 []） */
    const isPageRoot = (o) => o && typeof o === 'object' && String(o.type).toLowerCase() === 'page';

    /** 从多种常见形状中解析出 PageRoot，并保证 children 为数组 */
    const extractPageRoot = (obj) => {
      if (!obj || typeof obj !== 'object') return null;

      const ensureChildren = (root) => {
        if (!Array.isArray(root.children)) root.children = [];
        return root;
      };

      // 1) 根即 page（本应用默认：打开弹窗时的 JSON）
      if (isPageRoot(obj)) return ensureChildren(obj);

      // 2) 放在 data / page / root 下（常见包装）
      const cand = obj.data ?? obj.page ?? obj.root ?? obj.schema;
      if (cand && isPageRoot(cand)) return ensureChildren(cand);

      // 3) 阿里 lowcode-engine 协议：componentsTree[0] 为页面树
      const tree = obj.componentsTree ?? obj.components;
      if (Array.isArray(tree) && tree.length > 0) {
        const first = tree[0];
        if (first && typeof first === 'object') {
          if (isPageRoot(first)) return ensureChildren(first);
          // 无 type:page 时也当作页面根用，只保证 children 为数组
          if (!Array.isArray(first.children)) first.children = [];
          first.type = first.type || 'page';
          return first;
        }
      }

      // 4) 单 key 且值为对象（如 { "value": { type, children } }）
      const keys = Object.keys(obj);
      if (keys.length === 1) {
        const val = obj[keys[0]];
        if (val && typeof val === 'object' && isPageRoot(val)) return ensureChildren(val);
      }

      return null;
    };

    const handleApply = () => {
      const raw = editorRef.value?.getValue?.() ?? '';
      try {
        const obj = JSON.parse(raw || '{}');
        const pageRoot = extractPageRoot(obj);
        if (!pageRoot) {
          ElMessage.error('JSON 结构不合法：需包含页面根（type 为 page、children 为数组）。支持：根即 page；或放在 data/page/root/schema 下；或 componentsTree[0]（阿里协议）');
          return;
        }
        if (!Array.isArray(pageRoot.children)) pageRoot.children = [];
        emit('apply', pageRoot);
        emit('update:modelValue', false);
        ElMessage.success('已应用页面 JSON');
      } catch (e) {
        ElMessage.error('JSON 解析失败，请检查格式');
      }
    };

    return () => (
      <ElDialog
        modelValue={props.modelValue}
        onUpdate:modelValue={(v) => emit('update:modelValue', v)}
        title="页面JSON结构"
        width="800"
        v-slots={{
          footer: () => (
            <span class="dialog-footer">
              <ElButton onClick={handleClose}>取消</ElButton>
              <ElButton type="primary" onClick={handleApply}>应用</ElButton>
            </span>
          ),
        }}
      >
        <div
          class="page-json-dialog-body"
          style={{
            height: '700px',
            overflow: 'auto',
            padding: '10px',
            userSelect: 'text',
            WebkitUserSelect: 'text',
          }}
        >
          <MonacoEditor
            ref={editorRef}
            filename="page.json"
            modelValue={initialValueForEditor.value}
            onSave={handleApply}
          />
        </div>
      </ElDialog>
    );
  },
});
