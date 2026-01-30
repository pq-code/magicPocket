import { defineComponent, PropType, Teleport, Transition } from 'vue'
import type { AgentSettings } from './types'

export type { AgentSettings }

export default defineComponent({
  name: 'FloatingChatAgentConfig',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    activeTab: {
      type: String as PropType<'agent'>,
      required: true,
    },
    settings: {
      type: Object as PropType<AgentSettings>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onTabChange: {
      type: Function as PropType<(tab: 'agent') => void>,
      required: true,
    },
    onSettingsUpdate: {
      type: Function as PropType<(key: keyof AgentSettings, value: boolean) => void>,
      required: true,
    },
  },
  setup(props) {
    const onMaskClick = (e: MouseEvent) => {
      if (e.target === e.currentTarget) props.onClose()
    }
    return () => (
      <Teleport to="body">
        <Transition name="agent-config-fade">
          <div
            class="floating-chat__agent-config-mask"
            style={{ display: props.visible ? 'flex' : 'none' }}
            onClick={onMaskClick}
          >
            <div class="floating-chat__agent-config" onClick={(e) => e.stopPropagation()}>
              <div class="floating-chat__agent-config-side">
                <div
                  class={[
                    'floating-chat__agent-config-nav-item',
                    props.activeTab === 'agent' && 'is-active',
                  ]}
                  onClick={() => props.onTabChange('agent')}
                >
                  Agent 设置
                </div>
              </div>
              <div class="floating-chat__agent-config-main">
                <div class="floating-chat__agent-config-header">
                  <span class="floating-chat__agent-config-title">
                    {props.activeTab === 'agent' ? 'Agent 设置' : '标题'}
                  </span>
                  <button
                    type="button"
                    class="floating-chat__agent-config-close"
                    aria-label="关闭"
                    title="关闭"
                    onClick={props.onClose}
                  >
                    <i class="iconfont icon-guanbi" />
                  </button>
                </div>
                <div class="floating-chat__agent-config-content">
                  {props.activeTab === 'agent' && (
                    <div class="floating-chat__agent-config-section">
                      <div class="floating-chat__agent-config-row">
                        <span class="floating-chat__agent-config-label">系统通知</span>
                        <span class="floating-chat__agent-config-desc">
                          Agent 完成或需要关注时显示系统通知
                        </span>
                        <label class="floating-chat__agent-config-toggle">
                          <input
                            type="checkbox"
                            checked={props.settings.systemNotify}
                            onChange={(e) =>
                              props.onSettingsUpdate(
                                'systemNotify',
                                (e.target as HTMLInputElement).checked
                              )
                            }
                          />
                          <span class="floating-chat__agent-config-switch" />
                        </label>
                      </div>
                      <div class="floating-chat__agent-config-row">
                        <span class="floating-chat__agent-config-label">完成提示音</span>
                        <span class="floating-chat__agent-config-desc">
                          Agent 回复结束时播放提示音
                        </span>
                        <label class="floating-chat__agent-config-toggle">
                          <input
                            type="checkbox"
                            checked={props.settings.completionSound}
                            onChange={(e) =>
                              props.onSettingsUpdate(
                                'completionSound',
                                (e.target as HTMLInputElement).checked
                              )
                            }
                          />
                          <span class="floating-chat__agent-config-switch" />
                        </label>
                      </div>
                      <div class="floating-chat__agent-config-row">
                        <span class="floating-chat__agent-config-label">自动展开回复</span>
                        <span class="floating-chat__agent-config-desc">收到回复时自动展开内容</span>
                        <label class="floating-chat__agent-config-toggle">
                          <input
                            type="checkbox"
                            checked={props.settings.autoExpandReply}
                            onChange={(e) =>
                              props.onSettingsUpdate(
                                'autoExpandReply',
                                (e.target as HTMLInputElement).checked
                              )
                            }
                          />
                          <span class="floating-chat__agent-config-switch" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    )
  },
})
