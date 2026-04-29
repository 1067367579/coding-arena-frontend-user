<template>
  <div class="apple-selector" ref="selectorRef">
    <button class="selector-trigger" @click="isOpen = !isOpen" :class="{ 'is-open': isOpen }">
      <span class="selected-label">{{ selectedLabel }}</span>
      <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <div class="selector-dropdown" v-if="isOpen">
      <div class="dropdown-list">
        <button 
          v-for="item in difficultyList" 
          :key="item.difficulty"
          class="dropdown-item"
          :class="{ 'is-active': modelValue === item.difficulty }"
          @click="selectItem(item)"
        >
          <span class="item-label" :class="`level-${item.difficulty}`">{{ item.difficultyName }}</span>
          <svg v-if="modelValue === item.difficulty" class="check-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const selectorRef = ref(null)

const difficultyList = reactive([
  {
    "difficulty": 1,
    "difficultyName": "简单",
  },
  {
    "difficulty": 2,
    "difficultyName": "中等",
  },
  {
    "difficulty": 3,
    "difficultyName": "困难",
  }
])

const selectedLabel = computed(() => {
  if (!props.modelValue) return '选择难度'
  const found = difficultyList.find(i => i.difficulty === props.modelValue)
  return found ? found.difficultyName : '选择难度'
})

function selectItem(item) {
  emit('update:modelValue', item.difficulty)
  emit('change', item.difficulty)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (selectorRef.value && !selectorRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.apple-selector {
  position: relative;
  display: inline-block;
  min-width: 140px;
}

.selector-trigger {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--oj-surface-soft);
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--oj-ink);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  &.is-open {
    background: var(--oj-surface);
    border-color: var(--oj-primary);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    
    .chevron {
      transform: rotate(180deg);
    }
  }

  .chevron {
    color: var(--oj-muted);
    transition: transform 0.2s;
  }
}

.selector-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  min-width: max-content;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 6px;
  z-index: 100;
  animation: dropdown-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--oj-ink);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &.is-active {
    background: var(--oj-primary-soft);
    color: var(--oj-primary-strong);
  }

  .item-label {
    height: 22px;
    min-width: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;

    &.level-1 {
      color: #257653;
      background: #eaf7f1;
      border: 1px solid #caebdc;
    }

    &.level-2 {
      color: #8b641f;
      background: #fff5df;
      border: 1px solid #f3dfb6;
    }

    &.level-3 {
      color: #9a4b4b;
      background: #fff0f0;
      border: 1px solid #f0cdcd;
    }
  }

  .check-icon {
    color: var(--oj-primary);
  }
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
