<template>
  <div class="code-editor-shell">
    <div class="editor-toolbar">
      <div class="window-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <div class="language-selector" ref="langSelectorRef">
        <div class="apple-dropdown-trigger" @click="langDropdownOpen = !langDropdownOpen">
          <span class="selected-lang">{{ laguage }}</span>
          <svg class="select-chevron" :class="{'is-open': langDropdownOpen}" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <transition name="dropdown-fade">
          <ul class="apple-dropdown-menu" v-if="langDropdownOpen">
            <li v-for="item in languages" :key="item" 
                class="dropdown-item" 
                :class="{'is-active': laguage === item}"
                @click="selectLanguage(item)">
              {{ item }}
              <svg v-if="laguage === item" class="check-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </li>
          </ul>
        </transition>
      </div>

      <span class="file-chip">Main.{{ laguage === 'java' ? 'java' : 'cpp' }}</span>
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

const laguage = ref('java')
const langDropdownOpen = ref(false)
const langSelectorRef = ref(null)

const editorForm = ref(null);
let editor = null;
const emit = defineEmits(['update:value']);

function selectLanguage(lang) {
  laguage.value = lang;
  langDropdownOpen.value = false;
  // TODO: Add logic to switch editor mode if cpp is added in the future
}

// Close dropdown on outside click
function handleClickOutside(event) {
  if (langSelectorRef.value && !langSelectorRef.value.contains(event.target)) {
    langDropdownOpen.value = false;
  }
}

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

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  editor = ace.edit(editorForm.value, options);
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
  });
  editor.getSession().on('change', () => {
    emit('update:value', editor.getValue());
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
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
  margin-right: 8px;

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

.language-selector {
  position: relative;
  display: inline-flex;
  align-items: center;

  .apple-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 6px 12px;
    color: #d8e3ea;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .select-chevron {
      color: #95a3b8;
      transition: transform 0.2s ease;
      
      &.is-open {
        transform: rotate(180deg);
      }
    }
  }

  .apple-dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 140px;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: rgba(20, 28, 40, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    color: #d8e3ea;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.is-active {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
    }

    .check-icon {
      color: #38bdf8;
    }
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top left;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}

.file-chip {
  height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(22, 163, 74, 0.15);
  color: #b8f2cd;
  font-size: 13px;
  font-weight: 600;
  font-family: "SFMono-Regular", "JetBrains Mono", "Fira Code", monospace;
  letter-spacing: -0.02em;
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
