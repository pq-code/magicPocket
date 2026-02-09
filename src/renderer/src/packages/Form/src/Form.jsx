import { defineComponent, ref, onMounted, computed, defineExpose } from 'vue';
import { ElRow, ElForm, ElFormItem, ElCol, ElSelect, ElOption, ElInput, ElButton } from 'element-plus';
import { http } from '@renderer/api';
import useCodeConfig from '@renderer/views/draggingDragging/hooks/useCodeConfig.ts';

const FormComponent = defineComponent({
  props: {
    modelValue: { type: Object, default: () => ({}) },
    item: { type: Object, default: () => ({}) },
    children: { type: Array, default: () => [] },
  },
  emits: ['submit', 'change'],
  model: { prop: 'modelValue', event: 'update:modelValue' },
  setup(props, { emit }) {
    const { collectProps } = useCodeConfig();
    const formRef = ref(null);
    /** 表单绑定数据（与 ElForm model 同引用，仅在 key 级别更新以保持校验与聚焦） */
    const inputValue = ref({});
    let Api = '';
    const colKeys = ref(new Map());

    onMounted(() => {
      props.item.ref = formRef.value;
    });

    /** 从 itemList 同步到 inputValue（原地更新，保持引用稳定） */
    const syncModelFromNode = (rawList) => {
      if (!Array.isArray(rawList)) return;
      const keys = new Set(rawList.map((i) => i?.props?.formItemProps?.primaryKey).filter(Boolean));
      Object.keys(inputValue.value).forEach((k) => {
        if (!keys.has(k)) delete inputValue.value[k];
      });
      rawList.forEach((i) => {
        const fp = i?.props?.formItemProps;
        const key = fp?.primaryKey;
        if (!key) return;
        const v = fp?.value;
        inputValue.value[key] = v !== undefined && v !== null ? v : '';
      });
    };

    /** 根据 itemList 生成 ElForm rules（必填 + 表单项自定义 rules） */
    const buildRules = (rawList) => {
      if (!Array.isArray(rawList)) return {};
      const rules = {};
      rawList.forEach((i) => {
        const fp = i?.props?.formItemProps;
        const key = fp?.primaryKey;
        if (!key) return;
        const list = [];
        if (fp?.required) {
          list.push({
            required: true,
            message: (fp.requiredMessage || fp.label || key) + '不能为空',
            trigger: fp.trigger || 'blur',
          });
        }
        if (Array.isArray(fp?.rules) && fp.rules.length) list.push(...fp.rules);
        if (list.length) rules[key] = list;
      });
      return rules;
    };

    const submit = () => {
      formRef.value?.validate((valid) => {
        if (!valid) return;
        const formData = getFormData();
        if (Api) {
          http.post(Api, formData).then((res) => {
            emit('submit', formData);
          }).catch((err) => {
            console.error('Form submit error:', err);
          });
        } else {
          emit('submit', formData);
        }
      });
    };

    const reset = () => {
      const list = Array.isArray(props.item?.props?.formItemProps?.itemList) ? props.item.props.formItemProps.itemList : [];
      list.forEach((i) => {
        if (i?.props?.formItemProps) {
          i.props.formItemProps.value = '';
        }
      });
      syncModelFromNode(list);
    };

    /** 收集当前表单数据（供外部或提交使用） */
    const getFormData = () => ({ ...inputValue.value });

    const getColKey = (item) => {
      if (!colKeys.value.has(item)) colKeys.value.set(item, Math.random().toString(36));
      return colKeys.value.get(item);
    };

    const handleInput = (item, value) => {
      const fp = item?.props?.formItemProps;
      if (fp) fp.value = value;
      const fnEvent = item?.fnEvent;
      if (fnEvent?.onInput) {
        try {
          const fn = new Function('value', 'formData', fnEvent.onInput.value);
          fn(value, getFormData());
        } catch (e) {
          console.error('Form onInput error:', e);
        }
      }
      emit('change', getFormData());
    };

    const onChange = (item, value) => {
      const fp = item?.props?.formItemProps;
      if (fp) fp.value = value;
      const fnEvent = item?.fnEvent;
      if (fnEvent?.onChange) {
        try {
          const params = [...new Set([...(fnEvent.onChange.parameter || []), 'value', 'formData'])];
          const fn = new Function(...params, fnEvent.onChange.value);
          fn(value, getFormData());
        } catch (e) {
          console.error('Form onChange error:', e);
        }
      }
      emit('change', getFormData());
    };

    defineExpose({ getFormData, validate: () => formRef.value?.validate(), reset });

    const renderComponent = (item, formProps = {}) => {
      const colKey = getColKey(item);
      const formItem = item?.props?.formItemProps || {};
      const { isReadOnly, span, label, primaryKey, labelPosition, value, required, placeholder, options } = formItem;

      let children = null;
      const modelVal = inputValue.value[primaryKey];

      if (isReadOnly || formProps.isReadOnly) {
        children = <div class="form-readonly">{value}</div>;
      } else if (item.type === 'textarea') {
        children = (
          <ElInput
            type="textarea"
            modelValue={modelVal}
            onUpdate:modelValue={(v) => handleInput(item, v)}
            placeholder={placeholder}
            rows={3}
          />
        );
      } else if (item.type === 'select' || item.type === 'Select') {
        const opts = Array.isArray(options) && options.length > 0 ? options : [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }];
        children = (
          <ElSelect
            modelValue={modelVal}
            onUpdate:modelValue={(v) => onChange(item, v)}
            placeholder={placeholder || '请选择'}
          >
            {opts.map((opt) => (
              <ElOption key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </ElSelect>
        );
      } else {
        children = (
          <ElInput
            modelValue={modelVal}
            onUpdate:modelValue={(v) => handleInput(item, v)}
            placeholder={placeholder}
          />
        );
      }

      const colSpan = Number(span) || Number(formProps.span) || 8;
      return (
        <ElCol id={colKey} span={colSpan}>
          <ElFormItem
            id={primaryKey}
            prop={primaryKey}
            label={label}
            labelPosition={labelPosition}
            required={!!required}
          >
            {children}
          </ElFormItem>
        </ElCol>
      );
    };

    const getDefaultItemList = () => {
      // 当节点上没有配置 formItemProps 时，使用一个默认输入框，避免整块区域空白
      return [
        {
          type: 'input',
          props: {
            formItemProps: {
              primaryKey: 'defaultField',
              label: '默认字段',
              span: 8,
              value: '',
            },
          },
        },
      ];
    };

    const render = () => {
      const rawProps = props.item?.props || {};
      const vnodeProps = collectProps(rawProps);
      const rawList = Array.isArray(rawProps.formItemProps?.itemList) && rawProps.formItemProps.itemList.length > 0
        ? rawProps.formItemProps.itemList
        : getDefaultItemList();
      syncModelFromNode(rawList);

      const formRules = buildRules(rawList);
      const formProps = vnodeProps.formProps || { props: {} };
      const formRuntimeProps = formProps.props || {};
      const formStyle = formProps.style || {};
      const { api, isSubmit, isReset } = formRuntimeProps;
      Api = api;

      const formChildren = rawList.map((item) => renderComponent(item, formRuntimeProps));

      const formButtons = [
        ...(isSubmit ? [<ElButton type="primary" onClick={submit}>搜索</ElButton>] : []),
        ...(isReset ? [<ElButton onClick={reset}>重置</ElButton>] : []),
      ];
      if (formButtons.length > 0) {
        formChildren.push(
          <div key="form-actions" style={{ padding: '0 10px' }}>
            {formButtons}
          </div>
        );
      }

      return (
        <ElForm
          ref={formRef}
          model={inputValue.value}
          rules={formRules}
          style={formStyle}
        >
          <ElRow gutter={Number(formRuntimeProps.gutter) || 20}>{formChildren}</ElRow>
        </ElForm>
      );
    };

    const vnode = computed(() => render());
    return () => vnode.value;
  },
});

export default FormComponent;
