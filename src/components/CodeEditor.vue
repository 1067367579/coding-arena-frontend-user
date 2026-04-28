<template>
    <el-select v-model="laguage" placeholder="java" class="language-select">
      <el-option v-for="item in languages" :key="item" :label="item" :value="item" />
    </el-select>
    <div ref="editorForm" class="ace-editor">
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import ace from "ace-builds";
  import "ace-builds/src-noconflict/mode-java"
  import "ace-builds/src-noconflict/theme-eclipse"
  import "ace-builds/src-noconflict/ext-language_tools";
  
  const languages = ref([
    "java",
    // "cpp"
  ])
  
  // 创建响应式引用
  const laguage = ref('')
  const editorForm = ref(null);
  let editor = null;
  const emit = defineEmits(['update:value']);
  
  const options = {
    theme: `ace/theme/eclipse`,
    mode: `ace/mode/java`,
    maxLines: Infinity,
    minLines: 25,
    fontSize: 15,
  };
  
  // 初始化编辑器
  onMounted(() => {
    editor = ace.edit(editorForm.value, options);
    editor.setOptions({
      enableBasicAutocompletion: true,
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
    editor.setValue(content)
  }
  
  defineExpose({
    setAceCode
  })
  </script>
  
  <style lang="scss" scoped>
.language-select {
  width: 112px;
  margin: 12px 0 10px 14px;
}

.ace-editor {
  width: 100%;
  height: calc(100% - 62px);
  min-height: 360px;
}
  </style>
