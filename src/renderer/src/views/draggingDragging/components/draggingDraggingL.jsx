import { defineComponent, ref, watch, onMounted } from 'vue';
import componentContainer from './componentContainer'
import LayerTree from './LayerTree.jsx'
import { Search } from '@element-plus/icons-vue'
import { componentList } from "@renderer/components/materialArea/materialArea"
import { useMaterialsStore } from '@renderer/stores/materials/useMaterialsStore'
import { ElCollapse, ElCollapseItem, ElInput, ElTabs, ElTabPane } from 'element-plus';

const draggingDraggingL = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: () => {}
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  setup(props, { emit }) {
    let activeNames = ref([0, 1])
    const inputValue = ref('') // 搜索关键词
    const componentItemList = ref({})
    const handleChange = () => {}
    const materialsStore = useMaterialsStore()
    const isInitializing = ref(true)

    /**
     * 计算简单搜索匹配权重：
     * - 组件名/类型命中 > description 命中
     * - 同等命中时，platform > local > builtin
     */
    const getSourceWeight = (source) => {
      if (source === 'platform') return 3
      if (source === 'local') return 2
      if (source === 'builtin') return 1
      return 0
    }

    const getMatchScore = (item, keyword) => {
      if (!keyword) return 0
      const k = keyword.toLowerCase()
      let score = 0
      const name = (item.componentName || '').toLowerCase()
      const type = (item.type || '').toLowerCase()
      const desc = (item.description || '').toLowerCase()

      if (name === k || type === k) {
        score += 100
      } else {
        if (name.includes(k)) score += 60
        if (type.includes(k)) score += 40
      }
      if (desc && desc.includes(k)) score += 20

      score += getSourceWeight(item.materialSource) * 5
      if (typeof item.usageCount === 'number') {
        score += Math.min(item.usageCount, 100) / 10
      }
      return score
    }

    const init = () => {
      const list = componentList.value || []
      const map = new Map()
      list.forEach((element) => {
        const group = element.group || '未分组'
        if (!map.has(group)) {
          map.set(group, [{ ...element, key: element.type + Math.random().toString(36) }])
        } else {
          const arr = map.get(group)
          arr.push({ ...element, key: element.type + Math.random().toString(36) })
        }
      })
      componentItemList.value = Object.fromEntries(map)
      // 默认展开全部分组，确保 Backtop 等 Element 组可见
      activeNames.value = Object.keys(componentItemList.value).map((_, i) => i)
      isInitializing.value = false
    }

    onMounted(async () => {
      // 先显示静态组件，再尝试从物料平台拉取
      init()
      try {
        await materialsStore.loginAndFetch()
        // 拉取成功后重新初始化（componentList 会自动响应式更新）
      } catch (e) {
        console.warn('物料平台登录/拉取失败，使用静态物料:', e)
      }
    })
    watch(componentList, init, { deep: true })

    const activeTab = ref('materials')

    const renderMaterialsTab = () => (
      <div className='draggingDraggingL-main'>
        <ElInput
          v-model={inputValue.value}
          placeholder="搜索组件库（按名称 / 类型 / 描述）"
          suffix-icon={Search}
        />
        <div className='draggingDraggingL-container'>
          <ElCollapse vModel={activeNames} onChange={handleChange}>
            {
              Object.keys(componentItemList.value).map((key, index) => {
                const list = componentItemList.value[key] || []
                const keyword = (inputValue.value || '').trim().toLowerCase()
                // 过滤 + 简单排序
                const enhanced = list
                  .map((item) => ({
                    ...item,
                    __score: getMatchScore(item, keyword),
                  }))
                  .filter((item) => !keyword || item.__score > 0)
                  .sort((a, b) => b.__score - a.__score)
                  .map(({ __score, ...rest }) => rest)

                if (!enhanced.length) return null

                return (
                  <ElCollapseItem title={key} name={index}>
                    <componentContainer componentList={enhanced}></componentContainer>
                  </ElCollapseItem>
                )
              })
            }
          </ElCollapse>
        </div>
      </div>
    )

    const renderLayerTab = () => (
      <div className='draggingDraggingL-main'>
        <LayerTree />
      </div>
    )

    return () => (
      <div className='draggingDraggingL'>
        <ElTabs v-model={activeTab.value} type="card">
          <ElTabPane label="组件库" name="materials">
            <div className='draggingDraggingL-title'>组件库</div>
            {renderMaterialsTab()}
          </ElTabPane>
          <ElTabPane label="图层" name="layers">
            <div className='draggingDraggingL-title'>图层</div>
            {renderLayerTab()}
          </ElTabPane>
        </ElTabs>
      </div>
    );
  },
});

export default draggingDraggingL;
