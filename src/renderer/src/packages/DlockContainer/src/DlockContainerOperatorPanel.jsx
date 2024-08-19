import { defineComponent, ref, watch, onMounted } from "vue";
import "./style/index.less";
import CodeHighlight from "@renderer/packages/CodeHighlight/src/CodeHighlight.jsx";

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
} from "element-plus";
import { options } from "less";

const DlockContainerOperatorPanel = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },
    item: {
      type: Object,
      default: () => {},
    },
  },
  model: {
    prop: "modelValue",
    event: "update:modelValue",
  },
  setup(props, { emit }) {
    const CodeHighlightRef = ref();
    const draggingDraggingRRef = ref();

    const activeIndex = ref("1");
    const activeNames = ref(["1", "2", "3", "4", "5"]);

    const predefineColors = ref([
      "#ff4500",
      "#ff8c00",
      "#ffd700",
      "#90ee90",
      "#00ced1",
      "#1e90ff",
      "#c71585",
      "rgba(255, 69, 0, 0.68)",
      "rgb(255, 120, 0)",
      "hsv(51, 100, 98)",
      "hsva(120, 40, 94, 0.5)",
      "hsl(181, 100%, 37%)",
      "hsla(209, 100%, 56%, 0.73)",
      "#c7158577",
    ]);

    const cssCode = ref([
      "position: absolute;",
      "left: 209px;",
      "top: 154px;",
      "width: 161px;",
      "height: 146px;",
      "transform: rotate(0deg);",
      "border-radius: 18px;",
      "opacity: 1;",
      "background: #D8D8D8;",
    ]);

    // 当前操作对象
    // const currentObject = computed(() => {
    //   debugger
    //   return props.item
    // });

    watch(
      () => props.item,
      (newValue, oldValue) => {
        console.log(newValue, oldValue);
      }
    );

    const handleChange = () => {};
    const handleSelect = (e) => {
      console.log(e)
      activeIndex.value = e
    };

    const RenderEngine = () => {};
    const init = () => {};

    onMounted(() => {
      // 开启鼠标移动监听
      console.log(draggingDraggingRRef.value, CodeHighlightRef.value);
      draggingDraggingRRef.value.addEventListener("mouseleave", function () {
        CodeHighlightRef.value.uncheck();
      });
    });

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
            {activeIndex.value == "1" ? (
              <ElCollapse vModel={activeNames.value} onChange={handleChange}>
                <ElCollapseItem title="布局">
                  <div className="layout">
                    <div className="layoutItem">
                      <span className="layoutItem-title">水平</span>
                      <ElSegmented
                        vModel={props.item.props.levelLayout}
                        size="small"
                        options={["左", "中", "右", "两端"]}
                      />
                    </div>
                    <div className="layoutItem">
                      <span className="layoutItem-title">垂直</span>
                      <ElSegmented
                        vModel={props.item.props.verticalLayout}
                        size="small"
                        options={["左", "中", "右", "两端"]}
                      />
                    </div>
                    <div className="layoutItem">
                      <span className="layoutItem-title">间距</span>
                      <ElInput vModel={props.item.props.spacing} size="small" />
                    </div>
                  </div>
                </ElCollapseItem>

                <ElCollapseItem title="宽高">
                  <div className="layout">
                    <div className="layoutItem">
                      <span className="layoutItem-title">宽度</span>
                      <div style={{ display: "flex" }}>
                        <ElInput vModel={props.item.props.width} size="small" />
                        <ElSegmented
                          style={{ "margin-left": "10px" }}
                          vModel={props.item.props.width}
                          size="small"
                          options={["自适应"]}
                        />
                      </div>
                    </div>
                    <div className="layoutItem">
                      <span className="layoutItem-title">高度</span>
                      <div style={{ display: "flex" }}>
                        <ElInput
                          vModel={props.item.props.height}
                          size="small"
                        />
                        <ElSegmented
                          style={{ "margin-left": "10px" }}
                          vModel={props.item.props.height}
                          size="small"
                          options={["自适应"]}
                        />
                      </div>
                    </div>
                  </div>
                </ElCollapseItem>

                <ElCollapseItem title="样式">
                  <div className="layout">
                    <div
                      className="layoutItem"
                      style={{
                        display: "flex",
                        "align-items": "flex-start",
                        "flex-direction": "column",
                      }}
                    >
                      <span className="layoutItem-title">标题</span>
                      <div
                        style={{
                          width: "100%",
                          display: "grid",
                          "grid-template-columns": "1fr",
                          "grid-row-gap": "10px",
                        }}
                      >
                        <ElInput vModel={props.item.props.title} size="small" />
                        <ElSelect
                          vModel={props.item.props.spacing}
                          placeholder="Select"
                          size="small"
                        >
                          {[{}, {}].map((e) => [<ElOption></ElOption>])}
                        </ElSelect>
                        <div
                          style={{
                            display: "grid",
                            "grid-template-columns": "1fr 1fr",
                            "grid-column-gap": "10px",
                            "grid-row-gap": "10px",
                          }}
                        >
                          <ElInput
                            vModel={props.item.props.spacing}
                            size="small"
                          />
                          <ElInput
                            vModel={props.item.props.spacing}
                            size="small"
                          />
                          <ElInput
                            vModel={props.item.props.spacing}
                            size="small"
                          />
                          <ElInput
                            vModel={props.item.props.spacing}
                            size="small"
                          />
                          <ElInput
                            vModel={props.item.props.spacing}
                            size="small"
                          />
                          <ElInput
                            vModel={props.item.props.spacing}
                            size="small"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="layoutItem"
                      style={{
                        display: "flex",
                        "align-items": "flex-start",
                        "flex-direction": "column",
                      }}
                    >
                      <span className="layoutItem-title">填充</span>
                      <ElInput
                        vModel={props.item.props.spacing}
                        class="w-50 m-2"
                        placeholder=""
                        size="small"
                        v-slots={{
                          prepend: () => (
                            <ElColorPicker
                              vModel={props.item.props.spacing}
                              size="small"
                              show-alpha
                              predefine={predefineColors.value}
                            />
                          ),
                        }}
                      ></ElInput>
                    </div>

                    <div
                      className="layoutItem"
                      style={{
                        display: "flex",
                        "align-items": "flex-start",
                        "flex-direction": "column",
                      }}
                    >
                      <span className="layoutItem-title">描边</span>
                      <div
                        style={{
                          width: "100%",
                          display: "grid",
                          "grid-template-columns": "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <ElSelect
                          vModel={props.item.props.spacing}
                          placeholder="Select"
                          size="small"
                        >
                          {[{}, {}].map((e) => [<ElOption></ElOption>])}
                        </ElSelect>
                        <ElInput
                          vModel={props.item.props.spacing}
                          size="small"
                        />
                      </div>
                      <ElInput
                        style={{ "margin-top": "10px" }}
                        vModel={props.item.props.spacing}
                        size="small"
                      />
                    </div>

                    <div
                      className="layoutItem"
                      style={{
                        display: "flex",
                        "align-items": "flex-start",
                        "flex-direction": "column",
                      }}
                    >
                      <span className="layoutItem-title">代码</span>
                      <CodeHighlight
                        ref={CodeHighlightRef}
                        language="javascript"
                        code={cssCode.value}
                      ></CodeHighlight>
                    </div>
                  </div>
                </ElCollapseItem>
              </ElCollapse>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    );
  },
});

export default DlockContainerOperatorPanel;
