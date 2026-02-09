import { defineComponent, ref, computed, onMounted } from 'vue';
import RenderEngine from '@renderer/internal/RenderEngine/src/RenderEngine.jsx';
import { buildUUID } from "@renderer/utils";
import { ElButton, ElDialog, ElTooltip, ElTabs, ElTabPane, ElMessage } from 'element-plus';
import { useDraggingDraggingStore } from '@renderer/stores/draggingDragging/useDraggingDraggingStore.ts';
import { storeToRefs } from 'pinia';
import MonacoEditor from '@renderer/internal/CodeEditor/src/MonacoEditor.jsx';
import PageJsonDialog from './PageJsonDialog.jsx';
import useCanvasOperation from '../hooks/useCanvasOperation';

const draggingDraggingMain = defineComponent({
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
  emits: ['saved'],
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    const store = useDraggingDraggingStore();
    const { pageJSON, currentOperatingObject } = storeToRefs(store); // 页面数据
    const { addHistoryOperatingObject } = useCanvasOperation();

    const rootJSON = ref(props.modelValue);
    const dialogVisible = ref(false);
    const pageConfigVisible = ref(false);
    /** 仅打开弹窗时写入一次，供 PageJsonDialog 初始值，编辑过程不回流避免整页重渲染卡死 */
    const initialPageJsonString = ref('');
    /** 页面脚本（Vue setup 风格，与组件一起生成完整页面代码时使用） */
    const pageScriptCode = ref('');
    /** 页面样式文件内容 */
    const cssCode = ref('');

    const renderRootVnode = computed(() => (
      <RenderEngine />
    ));

    onMounted(() => {
      // 初始化操作
    });

    const handleOpenDialog = () => {
      // 编辑用：完整 pageJSON（含控制器所需 xxxProps 等）；渲染用可仅保留结构+数据，应用时会做容错并依赖控制器 normalize 补全
      initialPageJsonString.value = JSON.stringify(pageJSON.value, null, 2);
      dialogVisible.value = true;
    };

    const handleApplyPageJson = (obj) => {
      pageJSON.value = obj;
      currentOperatingObject.value = null;
      addHistoryOperatingObject();
      emit('saved');
    };

    const ensurePageStyleEl = () => {
      let el = document.querySelector('style[data-lowcode-page-style]');
      if (!el) {
        el = document.createElement('style');
        el.setAttribute('data-lowcode-page-style', 'true');
        document.head.appendChild(el);
      }
      return el;
    };

    const handleOpenPageConfig = () => {
      // 两个「文件」：页面脚本（Vue setup）+ 页面样式
      const rawScript = pageJSON.value.script ?? pageJSON.value.hooks?.onMounted ?? '';
      pageScriptCode.value =
        rawScript ||
        `// 页面脚本 (Vue setup 风格，原生 JS)
// 生成代码时会与画布组件合并为完整页面；此处可注册生命周期、访问 refs
onMounted(() => {
  console.log('page mounted', pageJSON);
});

onBeforeUnmount(() => {
  console.log('page will unmount');
});
`;
      const rawCss = pageJSON.value.css || '';
      cssCode.value =
        rawCss ||
        `/* page.css - 当前低代码页面的样式，生成代码时对应独立样式文件 */
.PageContainer {
  /* background: #f5f7ff; */
}
`;
      pageConfigVisible.value = true;
    };

    const handleSavePageConfig = () => {
      const target = pageJSON.value;
      target.script = pageScriptCode.value;
      target.css = cssCode.value;
      // 立即应用 CSS 到页面
      const el = ensurePageStyleEl();
      el.innerHTML = cssCode.value || '';
      pageConfigVisible.value = false;
      // 通知父级：重新执行页面脚本并应用样式，使本次修改立即生效
      emit('saved');
    };

     // 取消选中
     const clickContainer = (e) => {
      e.stopPropagation();
      currentOperatingObject.value = null;
     };

    return () => (
      <div className='draggingDraggingMain' onClick={clickContainer}>
        <div className='connections'>
          <dvi className="connectionsItem">
            <ElTooltip
              class="box-item"
              effect="dark"
              content="页面JSON结构"
              placement="top-start"
            >
              <ElButton text='primary' onClick={handleOpenDialog}>
                <i style={{ color: 'rgb(0 0 0)',fontSize: '23px' }} className='iconfont icon-shezhi4'></i>
              </ElButton>
            </ElTooltip>
          </dvi>

          <dvi className="connectionsItem">
            <ElTooltip
              class="box-item"
              effect="dark"
              content="页面文件（脚本 & 样式）"
              placement="top-start"
            >
              <ElButton text='primary' onClick={handleOpenPageConfig}>
                <i style={{ color: 'rgb(0 0 0)',fontSize: '23px' }} className='iconfont icon-connections'></i>
              </ElButton>
            </ElTooltip>
          </dvi>
        </div>
        {renderRootVnode.value}
        <PageJsonDialog
          modelValue={dialogVisible.value}
          onUpdate:modelValue={(v) => (dialogVisible.value = v)}
          initialJson={initialPageJsonString.value}
          onApply={handleApplyPageJson}
        />
        <ElDialog
          vModel={pageConfigVisible.value}
          title="页面文件（脚本 & 样式）"
          width="800"
          class="page-config-dialog"
          v-slots={{
            footer: () => (
              <span class="dialog-footer">
                <el-button onClick={() => (pageConfigVisible.value = false)}>取消</el-button>
                <el-button type="primary" onClick={handleSavePageConfig}>保存</el-button>
              </span>
            ),
          }}
        >
          <ElTabs modelValue="script">
            <ElTabPane label="页面脚本 (Vue setup)" name="script">
              <div style={{ height: '320px' }}>
                <MonacoEditor
                  filename="page-setup.js"
                  modelValue={pageScriptCode.value}
                  onUpdate:modelValue={(val) => (pageScriptCode.value = val)}
                  onSave={handleSavePageConfig}
                />
              </div>
            </ElTabPane>
            <ElTabPane label="页面样式" name="css">
              <div style={{ height: '320px' }}>
                <MonacoEditor
                  filename="page.css"
                  modelValue={cssCode.value}
                  onUpdate:modelValue={(val) => (cssCode.value = val)}
                  onSave={handleSavePageConfig}
                />
              </div>
            </ElTabPane>
          </ElTabs>
        </ElDialog>
      </div>
    );
  },
});

export default draggingDraggingMain;
