import { defineComponent, ref, computed, watch, onMounted, onUnmounted, nextTick, defineExpose } from 'vue';
import '../style/index.less';

const MonacoEditor = defineComponent({
  name: 'MonacoEditor',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    filename: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const editorRef = ref(null);
    const monacoEditor = ref(null);
    const isEditorReady = ref(false);
    const isUpdatingFromProp = ref(false);

    // Language mapping for Monaco Editor
    const getMonacoLanguage = (filename) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      const map = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        vue: 'html', // Monaco doesn't have Vue language, use HTML
        json: 'json',
        css: 'css',
        less: 'css',
        scss: 'scss',
        sass: 'sass'
      };
      return map[ext] || 'plaintext';
    };

    const detectedLanguage = computed(() => {
      if (props.language) return props.language;
      return getMonacoLanguage(props.filename);
    });

    // Initialize Monaco Editor
    const initMonacoEditor = async () => {
      try {
        // Ensure DOM is ready
        await nextTick();

        if (!editorRef.value) {
          console.warn('Editor container not ready, delaying initialization...');
          setTimeout(initMonacoEditor, 100);
          return;
        }

        // Dynamically import Monaco Editor to avoid build issues
        const monaco = await import('monaco-editor');

        // Configure Monaco Editor with conservative performance settings
        const editor = monaco.editor.create(editorRef.value, {
          value: props.modelValue || '',
          language: detectedLanguage.value,
          theme: 'vs', // Use light theme by default
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: 2,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          lineNumbers: 'on',
          renderWhitespace: 'none',
          renderControlCharacters: false,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontWeight: 'normal',
          // Conservative performance settings to avoid freezing
          smoothScrolling: false, // Disabled to reduce overhead
          mouseWheelZoom: false,
          mouseWheelScrollSensitivity: 1,
          fastScrollSensitivity: 1,
          autoIndent: 'advanced',
          dragAndDrop: false, // Disabled to reduce complexity
          formatOnPaste: false,
          formatOnType: false,
          autoClosingBrackets: 'beforeWhitespace',
          autoSurround: 'languageDefined',
          occurrencesHighlight: false,
          selectionHighlight: false,
          scrollPredominantAxis: true,
          multiCursorMergeOverlappingSelections: true,
          // Additional performance settings
          bracketPairColorization: { enabled: false },
          guides: { bracketPairs: false },
          suggest: { showClasses: false },
          hover: { enabled: false },
          parameterHints: { enabled: false },
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
        });

        monacoEditor.value = editor;

        // Listen for content changes with conservative debouncing
        let updateTimeout;
        const handleChange = () => {
          // Clear previous timeout
          if (updateTimeout) {
            clearTimeout(updateTimeout);
          }

          // Set new timeout with longer delay to avoid frequent updates
          updateTimeout = setTimeout(() => {
            if (isUpdatingFromProp.value) {
              // Skip emitting if we're updating from prop to avoid loops
              isUpdatingFromProp.value = false;
              return;
            }

            const newValue = editor.getValue();
            if (newValue !== props.modelValue) {
              // Only emit if the value has actually changed
              emit('update:modelValue', newValue);
            }
          }, 200); // Increased debounce to 200ms to reduce frequency
        };

        // Attach the change listener
        const changeListener = editor.onDidChangeModelContent(handleChange);

        // Handle keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          emit('save');
        });

        // Comment toggle shortcut
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
          editor.trigger('keyboard', 'editor.action.commentLine');
        });

        // Store listener for cleanup
        if (!monacoEditor.value._disposables) {
          monacoEditor.value._disposables = [];
        }
        monacoEditor.value._disposables.push(changeListener);

        isEditorReady.value = true;

        // Log successful initialization
        console.log('Monaco Editor initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Monaco Editor:', error);
      }
    };

    // Watch for modelValue changes from parent, but only after editor is ready
    let propWatchInitialized = false;

    const updateEditorValue = (newValue) => {
      if (monacoEditor.value && isEditorReady.value) {
        const currentValue = monacoEditor.value.getValue();
        if (currentValue !== newValue) {
          isUpdatingFromProp.value = true;
          monacoEditor.value.setValue(newValue || '');
          // Reset the flag after a delay to prevent loop
          setTimeout(() => {
            isUpdatingFromProp.value = false;
          }, 100);
        }
      }
    };

    // Watch for language changes with safety checks
    watch(detectedLanguage, async (newLang) => {
      if (monacoEditor.value && isEditorReady.value) {
        try {
          // Small delay to ensure editor is stable
          setTimeout(() => {
            if (monacoEditor.value && monacoEditor.value.getModel) {
              const model = monacoEditor.value.getModel();
              if (model && model.getLanguageId() !== newLang) {
                model.setLanguage(newLang);
              }
            }
          }, 100);
        } catch (error) {
          console.error('Failed to change Monaco Editor language:', error);
        }
      }
    }, { flush: 'post' }); // Execute after DOM updates

    // Watch for modelValue changes from parent
    watch(
      () => props.modelValue,
      (newValue) => {
        // Only update if editor is ready and value actually differs
        if (monacoEditor.value && isEditorReady.value) {
          const currentValue = monacoEditor.value.getValue();
          if (currentValue !== newValue) {
            isUpdatingFromProp.value = true;
            monacoEditor.value.setValue(newValue || '');
            // Reset the flag after a delay to prevent loop
            setTimeout(() => {
              isUpdatingFromProp.value = false;
            }, 50);
          }
        }
      },
      { immediate: true, flush: 'post' } // Execute after DOM updates
    );

    onMounted(() => {
      // Initialize after a tick to ensure DOM is ready
      nextTick(() => {
        initMonacoEditor();
      });
    });

    onUnmounted(() => {
      // Clean up resources properly
      if (monacoEditor.value) {
        // Dispose all stored disposables
        if (monacoEditor.value._disposables) {
          monacoEditor.value._disposables.forEach(disposable => {
            if (disposable && typeof disposable.dispose === 'function') {
              try {
                disposable.dispose();
              } catch (e) {
                console.warn('Error disposing editor resource:', e);
              }
            }
          });
          monacoEditor.value._disposables = [];
        }

        // Dispose the editor
        try {
          monacoEditor.value.dispose();
        } catch (e) {
          console.warn('Error disposing editor:', e);
        }
        monacoEditor.value = null;
      }

      console.log('Monaco Editor disposed successfully');
    });

    defineExpose({
      getValue: () => monacoEditor.value?.getValue?.() ?? '',
    });

    return () => (
      <div class="monaco-editor-container">
        {!isEditorReady.value && (
          <div class="editor-loading">
            Loading editor...
          </div>
        )}
        <div
          ref={editorRef}
          style={{
            height: '100%',
            width: '100%',
            display: isEditorReady.value ? 'block' : 'none'
          }}
        />
      </div>
    );
  },
});

export default MonacoEditor;