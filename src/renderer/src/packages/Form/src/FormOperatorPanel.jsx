import { defineComponent, ref, watch, onMounted } from "vue";

import CodeHighlight from "@renderer/packages/CodeHighlight/src/CodeHighlight.jsx";
import { humpToUnderline } from '@renderer/utils/index'
import {
  ElMenu,
  ElMenuItem,
  ElCollapse,
  ElCollapseItem,
  ElInput,
  ElSwitch,
  ElButton,
  ElSegmented,
  ElOption,
  ElSelect,
} from "element-plus";


const FormOperatorPanel = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => { },
    },
    item: {
      type: Object,
      default: () => { },
    },
  },
  model: {
    prop: "modelValue",
    event: "update:modelValue",
  },
  setup(props, { emit }) {
    const styleOptions = ref({
    });// 样式
    const draggingDraggingRRef = ref()
    const activeIndex = ref("1");
    const activeNames = ref(["1", "2", "3", "4", "5"]);


    const handleChange = () => { };
    const handleSelect = (e) => {
      console.log(e);
      activeIndex.value = e;
    };

    const RenderEngine = () => { };
    const init = () => { };

    onMounted(() => {
    });

    const modulePanel = () => {
      return (
        <div>
          <ElCollapseItem title="属性">
        <div className="layout">
          <div className="layoutItem">
            <span className="layoutItem-title">只读状态</span>
            <ElSegmented
              vModel={props.item.props.readOnly}
              size="small"
              options={[true, false]}
            />
            </div>
            <div className="layoutItem">
            <span className="layoutItem-title">列布局</span>
            <ElInput
              size="small"
              v-slots={{
                append: () => (
                  <span>列</span>
                )
              }}
            />
            </div>

            <div className="layoutItem">
            <span className="layoutItem-title">标签长度</span>
            <ElInput
                size="small"
                v-slots={{
                  append: () => (
                    <span>px</span>
                  )
                }}
            />
            </div>

            <div className="layoutItem">
            <span className="layoutItem-title">尺寸控制</span>
            <ElSegmented
              vModel={props.item.props.levelLayout}
              size="small"
              options={["large", "default","small"]}
            />
            </div>
        </div>
          </ElCollapseItem>

      <ElCollapseItem title="表单项">
        <div className="layout">
          <div className="layoutItem">
            <span className="layoutItem-title">表单项</span>
            <div className="layoutItem-colm">
              {
                props.item.children.map((e, i) => {
                  return (
                    <div key={i}>
                      <ElInput
                        size="small"
                        v-model={e.props.label}
                        placeholder="请输入标签"
                      />
                      <ElInput
                        size="small"
                        v-model={e.props.label}
                        placeholder="请输入标签"
                      />
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </ElCollapseItem>
        </div>
      );
    };

    const stylePanel = () => {
      return (
        <ElCollapseItem title="布局">
          <div className="layout">
            <div className="layoutItem">
              
            </div>
          </div>
        </ElCollapseItem>
      );
    };

    return () => (
      <div className="draggingDraggingR">
        <ElMenu
          default-active={activeIndex.value}
          mode="horizontal"
          onSelect={handleSelect}
        >
          <ElMenuItem index="1" style={{ width: "33.3%" }}>
            组件
          </ElMenuItem>
          <ElMenuItem index="2" style={{ width: "33.3%" }}>
            样式
          </ElMenuItem>
          <ElMenuItem index="3" style={{ width: "33.3%" }}>
            高级
          </ElMenuItem>
        </ElMenu>
        <div className="draggingDraggingR-content">
          <div
            ref={draggingDraggingRRef}
            className="draggingDraggingR-content-list"
          >
            <ElCollapse vModel={activeNames.value} onChange={handleChange}>
              {activeIndex.value == "1" ? modulePanel() : activeIndex.value == "2" ? stylePanel() : seniorPanel()}
            </ElCollapse>
          </div>
        </div>
      </div>
    );
  },
});

export default FormOperatorPanel;
