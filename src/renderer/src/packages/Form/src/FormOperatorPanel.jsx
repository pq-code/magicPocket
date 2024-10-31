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

    const addFormItem = () => {
      console.log(props.item.children)
      props.item.children.push(
        {
            "componentName": "输入框",
            "type": "input",
            "icon": "",
            "group": "基础组件",
            "npm": {
                "exportName": "ElInput",
                "package": "element-plus",
                "destructuring": true
            },
            "props": {
                "formItemProps": {
                    "primaryKey": "760",
                    "label": "表单项",
                    "size": "medium",
                    "device": "desktop",
                    "fullWidth": true
                },
                "placeholder": "请输入"
            }
        }
       )
    };

    const modulePanel = () => {
      return (
        <div>
          <ElCollapseItem title="表单属性">
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
                vModel={props.item.props.span}
                v-slots={{
                  append: () => (
                    <span>列</span>
                  )
                }}
              />
              </div>

            <div className="layoutItem">
              <span className="layoutItem-title">间距</span>
              <ElInput
                size="small"
                vModel={props.item.props.gutter}
                v-slots={{
                  append: () => (
                    <span>间距</span>
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
            <div style={{ 'display': 'flex', 'justify-content': 'space-around'}}>
              <span className="layoutItem-title">lebel</span>
              <span className="layoutItem-title">value</span>
           </div>
        <div className="layout">
          <div className="layoutItem">
            <div className="layoutItem-colm" >
              {
                props.item.children.map((e, i) => {
                  return (
                    <div key={i} style={{ 'display': 'flex', marginBottom: '5px' }}>
                      <ElInput
                        size="small"
                        vModel={e.props.formItemProps.label}
                        placeholder="lebel"
                      />
                      <ElInput
                        size="small"
                        vModel={e.props.formItemProps.value}
                        placeholder="value"
                      />
                    </div>
                  );
                })
                  }
                  <ElButton type="text"  size="small" onClick={addFormItem}>添加</ElButton>
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
