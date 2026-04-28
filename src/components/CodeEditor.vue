<template>
  <div class="code-editor-shell">
    <div class="editor-toolbar">
      <div class="window-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <el-select v-model="laguage" placeholder="java" class="language-select">
        <el-option v-for="item in languages" :key="item" :label="item" :value="item" />
      </el-select>
      <span class="file-chip">Main.java</span>
    </div>
    <div ref="editorForm" class="ace-editor">
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import ace from "ace-builds";
  import "ace-builds/src-noconflict/mode-java"
  import "ace-builds/src-noconflict/theme-one_dark"
  import "ace-builds/src-noconflict/ext-language_tools";
  
  const languages = ref([
    "java",
    // "cpp"
  ])
  
  // 创建响应式引用
  const laguage = ref('java')
  const editorForm = ref(null);
  let editor = null;
  const emit = defineEmits(['update:value']);
  
  const options = {
    theme: `ace/theme/one_dark`,
    mode: `ace/mode/java`,
    maxLines: Infinity,
    minLines: 25,
    fontSize: 15,
    showPrintMargin: false,
    highlightActiveLine: true,
    tabSize: 4,
    useSoftTabs: true,
  };
  
  // 初始化编辑器
  onMounted(() => {
    editor = ace.edit(editorForm.value, options);
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
    });
    editor.getSession().on('change', () => {
      // 当编辑器内容变化时，触发自定义事件并传递编辑器的内容
      emit('update:value', editor.getValue());
    });
  });
  
  // 销毁编辑器实例
  onBeforeUnmount(() => {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  });
  
  function setAceCode(content) {
    editor.setValue(content, -1)
  }
  
  defineExpose({
    setAceCode
  })
  </script>
  
<style lang="scss" scoped>
.code-editor-shell {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: 52px minmax(0, 1fr);
  background: #0f1720;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    #111a24;
}

.window-dots {
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ef4444;

    &:nth-child(2) {
      background: #f59e0b;
    }

    &:nth-child(3) {
      background: #22c55e;
    }
  }
}

.language-select {
  width: 118px;

  :deep(.el-select__wrapper) {
    min-height: 34px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 10px;
    background: rgba(15, 23, 32, 0.9);
    box-shadow: none;
  }

  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    color: #d8e3ea;
    font-weight: 700;
  }

  :deep(.el-select__caret) {
    color: #95a3b8;
  }
}

.file-chip {
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.12);
  color: #b8f2cd;
  font-size: 12px;
  font-weight: 800;
}

.ace-editor {
  width: 100%;
  height: 100%;
  min-height: 360px;
}

:deep(.ace_editor) {
  color: #d7e3ea;
  font-family: "SFMono-Regular", "JetBrains Mono", "Fira Code", "Menlo", "Consolas", monospace;
  line-height: 1.65;
}

:deep(.ace_gutter) {
  background: #0c131b;
  color: #667487;
  border-right: 1px solid rgba(148, 163, 184, 0.14);
}

:deep(.ace_scroller) {
  background: #111a24;
}

:deep(.ace_marker-layer .ace_active-line) {
  background: rgba(34, 197, 94, 0.09);
}

:deep(.ace_gutter-active-line) {
  background: rgba(34, 197, 94, 0.12);
}

:deep(.ace_marker-layer .ace_selection) {
  background: rgba(56, 189, 248, 0.28);
}

:deep(.ace_cursor) {
  color: #f8fafc;
}
</style>
