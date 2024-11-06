import { defineComponent, ref, watch, onMounted } from "vue";
import FormItemEdit from "../components/FormItemEdit.jsx";

import {
  ElMenu,
  ElMenuItem,
  ElCollapse,
  ElCollapseItem,
  ElInput,
  ElButton,
  ElSegmented,
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
    const CodeHighlightRef = ref()
    const styleOptions = ref({
    });// 样式
    const draggingDraggingRRef = ref()
    const activeIndex = ref("1");
    const activeNames = ref(["1", "2", "3", "4", "5"]);
    const FormItemEditRef = ref(null)

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

    const editFormItem = (item) => {
      console.log(FormItemEditRef.value)
      FormItemEditRef.value.openDrawer(item)
    }

    const deleteFormItem = (i) => {
      props.item.children.splice(i, 1)
    }
    // 组件面板
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
                  options={["large", "default", "small"]}
                />
              </div>

              <div className="layoutItem">
                <span className="layoutItem-title">对其方式</span>
                <ElSegmented
                  vModel={props.item.props.levelLayout}
                  size="small"
                  options={["左", "顶", "右"]}
                />
              </div>

              <div className="layoutItem">
                <span className="layoutItem-title">尺寸控制</span>
                <ElSegmented
                  vModel={props.item.props.levelLayout}
                  size="small"
                  options={["large", "default", "small"]}
                />
              </div>
            </div>
          </ElCollapseItem>

          <ElCollapseItem title="表单项">
            <div style={{ 'display': 'flex', 'justify-content': 'space-around' }}>
              <span className="layoutItem-title">lebel</span>
              <span className="layoutItem-title">value</span>
            </div>
            <div className="layout">
              <div className="layoutItem">
                <div className="layoutItem-colm" >
                  {
                    props.item.children.map((e, i) => {
                      return (
                        <div key={i} style={{ 'display': 'grid', 'grid-template-columns': '30px 1fr 1fr 30px', 'grid-column-gap': '10px', marginBottom: '5px', cursor: 'pointer' }}>
                          <i className='iconfont icon-bianji' onClick={() => editFormItem(e)}></i>
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
                          <i className='iconfont icon-lajitong5 ' style={{ cursor: 'pointer' }} onClick={() => deleteFormItem(i)}></i>
                        </div>
                      );
                    })
                  }
                  <ElButton type="text" size="small" onClick={addFormItem}>添加</ElButton>
                </div>
              </div>
            </div>
          </ElCollapseItem>
        </div>
      );
    };
    // 样式面板
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
    // 高级面板
    const seniorPanel = () => {
      return (
        <div>
          <ElCollapseItem title="查询功能">
            <div className="layout">
              <div className="layoutItem">
                <span className="layoutItem-title">是否有查询和重置</span>
                <ElSegmented
                  vModel={props.item.props.readOnly}
                  size="small"
                  options={[true, false]}
                />
              </div>

              <div className="layoutItem">
                <span className="layoutItem-title">按钮位置</span>
                <ElSegmented
                  vModel={props.item.props.readOnly}
                  size="small"
                  options={["右", '下']}
                />
              </div>

              <span className="layoutItem-title">接口地址</span>
              <div className="layoutItem">
                <ElInput
                  size="small"
                  vModel={props.item.props.gutter}
                  v-slots={{
                    append: () => (
                      <span>url</span>
                    )
                  }}
                />
              </div>

              <div className="layoutItem">
              <span className="layoutItem-title">页面渲染完查询</span>
                <ElSegmented
                  vModel={props.item.props.readOnly}
                  size="small"
                  options={[true, false]}
                />
              </div>
            </div>
          </ElCollapseItem>

          <ElCollapseItem title="JSON数据配置">
            <div className="layout">
              <div className="layoutItem">
                <span className="layoutItem-title">数据编辑</span>
                <ElButton>数据编辑</ElButton>
              </div>
              <div className="layoutItem">
                <span className="layoutItem-title">页面初始化完成</span>
                <ElButton>事件添加</ElButton>
              </div>
            </div>
          </ElCollapseItem>
        </div>
      );

    }

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
        <FormItemEdit ref={FormItemEditRef}></FormItemEdit>
      </div>
    );
  },
});

export default FormOperatorPanel;
