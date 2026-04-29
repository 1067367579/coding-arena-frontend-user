<template>
  <div class="oj-workspace">
    <header class="workspace-header">
      <div class="header-left">
        <button class="icon-btn back-btn" @click="goBack()" title="返回">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="divider"></div>
        <span class="exam-tag" v-if="examTitle">{{ examTitle }}</span>
        <h1 class="problem-title">{{ questionDetail.title || '题目加载中' }}</h1>
        <div class="countdown-wrap" v-if="examEndTime && new Date() < new Date(examEndTime)">
          <el-countdown @finish="handleCountdownFinish" :value="new Date(examEndTime)" format="HH:mm:ss" />
        </div>
      </div>
      
      <div class="header-right">
        <button class="submit-code-button" :class="{ running: userQuestionResultVO.pass === 3 }"
          :disabled="userQuestionResultVO.pass === 3" @click="submitQuestion">
          <span class="submit-pulse" aria-hidden="true"></span>
          <span class="submit-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </span>
          <span class="submit-label">{{ userQuestionResultVO.pass === 3 ? '判题中' : '提交代码' }}</span>
          <span class="submit-key">Run</span>
        </button>
      </div>
    </header>

    <main class="workspace-main">
      <section class="problem-panel">
        <div class="panel-header">
          <div class="tabs">
            <div class="tab active">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              题目描述
            </div>
          </div>
          <div class="nav-controls">
            <button @click="preQuestion" class="icon-btn" title="上一题">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button @click="nextQuestion" class="icon-btn" title="下一题">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div class="problem-scroll-area">
          <div class="problem-meta">
            <h2 class="problem-h2">{{ questionDetail.title }}</h2>
            <div class="meta-tags">
              <span class="difficulty" :class="`level-${questionDetail.difficulty || 1}`">
                <template v-if="questionDetail.difficulty === 1">简单</template>
                <template v-else-if="questionDetail.difficulty === 2">中等</template>
                <template v-else-if="questionDetail.difficulty === 3">困难</template>
              </span>
              <span class="meta-item">时间限制: {{ questionDetail.timeLimit || '-' }} ms</span>
              <span class="meta-item">空间限制: {{ questionDetail.spaceLimit || '-' }} 字节</span>
            </div>
          </div>
          
          <div class="html-content" v-html="questionDetail.content"></div>
        </div>
      </section>

      <section class="editor-panel">
        <div class="editor-container">
          <codeEditor ref="defaultCodeRef" @update:value="handleEditorContent" />
        </div>

        <div
          ref="consolePanelRef"
          class="console-panel"
          :class="{ 'is-expanded': userQuestionResultVO.pass !== 2, 'is-resizing': isResizingConsole }"
          :style="{ height: consolePanelHeight }"
        >
          <div
            class="console-resize-handle"
            role="separator"
            aria-orientation="horizontal"
            title="拖动调整执行结果高度"
            @pointerdown="startConsoleResize"
          >
            <span></span>
          </div>
          <div class="console-header">
            <div class="tabs">
              <div class="tab active">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="4 17 10 11 4 5"></polyline>
                  <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
                执行结果
              </div>
            </div>
            <div class="result-badge">
              <span class="badge" :class="submissionStatus.className">
                {{ submissionStatus.label }}
              </span>
            </div>
          </div>

          <div class="console-body">
            <div class="workspace-intro">
              <div>
                <span class="workspace-kicker">Test Case Workspace</span>
                <h3>样例工作区</h3>
              </div>
              <p>先确认输入输出，再提交代码。提交后这里会自动展开并展示判题结果。</p>
            </div>

            <div class="error-box" v-if="userQuestionResultVO.pass === 0 && userQuestionResultVO.exeMessage">
              <div class="error-title">异常信息</div>
              <code>{{ userQuestionResultVO.exeMessage }}</code>
            </div>

            <div class="testcases-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Sample Input</th>
                    <th>Expected Output</th>
                    <th v-if="hasExecutionRows">Actual Output</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in workspaceRows" :key="idx">
                    <td class="code-cell">{{ row.input }}</td>
                    <td class="code-cell">{{ row.output }}</td>
                    <td v-if="hasExecutionRows" class="code-cell" :class="{'is-wrong': row.output !== row.exeOutput}">
                      {{ row.exeOutput }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref } from "vue"
import codeEditor from "@/components/CodeEditor.vue"
import { useRoute } from "vue-router"
import { getQuestionDetailService, preQuestionService, nextQuestionService, getQuestionResultService } from "@/apis/question"
import router from "@/router"
import { examNextQuestionService, examPreQuestionService, getExamFirstQuestionService } from "@/apis/exam"
import { ElMessage } from "element-plus"
import { userSubmitService } from "@/apis/user"
import { loadCode, saveCode } from "@/utils/codeStorage"

function goBack() {
  router.go(-1);
}

const questionDetail = reactive({})
const defaultCodeRef = ref()

let questionId = useRoute().query.questionId
let examId = useRoute().query.examId
let examTitle = useRoute().query.examTitle
let examEndTime = useRoute().query.examEndTime

async function getQuestionDetail() {
  if (examId && (questionId == null || questionId == '')) {
    const eqrs = await getExamFirstQuestionService(examId)
    questionId = eqrs.data
  }
  const res = await getQuestionDetailService(questionId)
  Object.assign(questionDetail, res.data)
  let code = loadCode(examId, questionId)
  defaultCodeRef.value.setAceCode(code == null ? questionDetail.defaultCode : code)
  
  if(currentTime) {
    const resultRes = await getQuestionResultService(examId, questionDetail.questionId, currentTime);
    userQuestionResultVO.value = (resultRes.data.pass == 3) ? { pass: 2 } : resultRes.data;
  }
}
getQuestionDetail()

async function preQuestion() {
  try {
    if (examId) {
      const res = await examPreQuestionService(examId, questionId)
      questionId = res.data
    } else {
      const res = await preQuestionService(questionId)
      questionId = res.data
    }
    getQuestionDetail()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function nextQuestion() {
  try {
    if (examId) {
      const res = await examNextQuestionService(examId, questionId)
      questionId = res.data
    } else {
      const res = await nextQuestionService(questionId)
      questionId = res.data
    }
    getQuestionDetail()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

function handleCountdownFinish() {
  ElMessage.info('竞赛已经结束了哦')
  router.push('/c-oj/home/exam')
}

const submitDTO = reactive({
  examId: '',
  questionId: '',
  programType: 0,
  userCode: ''
})

function handleEditorContent(content) {
  submitDTO.userCode = content
}

const userQuestionResultVO = ref({
  pass: 2,
  exeMessage: '',
  userExeResultList: [],
})

const hasExecutionRows = computed(() => {
  return userQuestionResultVO.value.userExeResultList && userQuestionResultVO.value.userExeResultList.length > 0
})

const workspaceRows = computed(() => {
  if (hasExecutionRows.value) return userQuestionResultVO.value.userExeResultList
  return [
    {
      input: '2 7 11 15, target = 9',
      output: '0 1',
      exeOutput: ''
    }
  ]
})

const submissionStatus = computed(() => {
  if (userQuestionResultVO.value.pass === 0) return { label: '解答错误', className: 'red' }
  if (userQuestionResultVO.value.pass === 1) return { label: '通过', className: 'green' }
  if (userQuestionResultVO.value.pass === 3) return { label: '判题中...', className: 'blue' }
  if (userQuestionResultVO.value.pass === 4) return { label: '系统错误', className: 'red' }
  return { label: 'Pending Submission', className: 'neutral' }
})

const consolePanelRef = ref(null)
const consoleHeight = ref(220)
const isResizingConsole = ref(false)

const consolePanelHeight = computed(() => {
  return `${consoleHeight.value}px`
})

function startConsoleResize(event) {
  event.preventDefault()
  isResizingConsole.value = true
  document.body.classList.add('console-resizing')
  window.addEventListener('pointermove', resizeConsole)
  window.addEventListener('pointerup', stopConsoleResize)
}

function resizeConsole(event) {
  const editorPanel = consolePanelRef.value?.closest('.editor-panel')
  if (!editorPanel) return

  const rect = editorPanel.getBoundingClientRect()
  const nextHeight = rect.bottom - event.clientY
  consoleHeight.value = clampConsoleHeight(nextHeight, rect)
}

function stopConsoleResize() {
  isResizingConsole.value = false
  document.body.classList.remove('console-resizing')
  window.removeEventListener('pointermove', resizeConsole)
  window.removeEventListener('pointerup', stopConsoleResize)
}

onBeforeUnmount(() => {
  stopConsoleResize()
})

function clampConsoleHeight(height, editorRect) {
  const rect = editorRect || consolePanelRef.value?.closest('.editor-panel')?.getBoundingClientRect()
  const available = rect?.height || window.innerHeight * 0.6
  const minHeight = window.innerWidth <= 768 ? 150 : 180
  const maxHeight = Math.max(minHeight, available - 140)
  return Math.round(Math.min(Math.max(height, minHeight), maxHeight))
}

async function revealConsoleResult() {
  await nextTick()
  const panel = consolePanelRef.value
  if (!panel) return

  const header = panel.querySelector('.console-header')
  const body = panel.querySelector('.console-body')
  const empty = panel.querySelector('.console-empty')
  const contentHeight = (header?.offsetHeight || 40)
    + (body?.scrollHeight || empty?.scrollHeight || 96)
    + 34
  consoleHeight.value = clampConsoleHeight(contentHeight)
  requestAnimationFrame(() => {
    body?.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

const pollingInterval = ref(null);
let currentTime
let submitTime

function startPolling() {
  stopPolling();
  const maxPollingTime = 15000;
  pollingInterval.value = setInterval(() => {
    if (Date.now() - submitTime >= maxPollingTime) {
      clearInterval(pollingInterval.value)
      handlePollingTimeout();
      return;
    }
    getQuestionResult();
  }, 1000);
}

function handlePollingTimeout() {
  userQuestionResultVO.value.pass = 4;
  userQuestionResultVO.value.exeMessage = "系统异常，请稍后重试或联系管理员";
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
}

async function submitQuestion() {
  submitDTO.examId = examId || 0; // fallback if no examId
  submitDTO.questionId = questionId;
  try {
    await userSubmitService(submitDTO)
    currentTime = formatDateToStandard(new Date());
    submitTime = new Date();
    userQuestionResultVO.value.exeMessage = '';
    userQuestionResultVO.value.userExeResultList = [];
    userQuestionResultVO.value.pass = 3;
    consoleHeight.value = clampConsoleHeight(220);
    saveCode(examId, questionId, submitDTO.userCode);
    startPolling()
  } catch (error) {
    ElMessage.error(error.message);
  }
}

function formatDateToStandard(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

async function getQuestionResult() {
  const res = await getQuestionResultService(submitDTO.examId, submitDTO.questionId, currentTime)
  userQuestionResultVO.value = res.data
  if (userQuestionResultVO.value.pass !== 3) {
    stopPolling();
    revealConsoleResult();
  }
}
</script>

<style lang="scss" scoped>
.oj-workspace {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #f0f0f0; /* pragmatic background */
  color: #262626;
  overflow: hidden;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 100%;

    .back-btn {
      color: #595959;
      &:hover { color: #1a1a1a; background: #f0f0f0; }
    }

    .divider {
      width: 1px;
      height: 16px;
      background: #e5e5e5;
    }

    .exam-tag {
      font-size: 13px;
      font-weight: 600;
      color: #1890ff;
      background: #e6f7ff;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .problem-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0;
      color: #262626;
    }

    .countdown-wrap {
      margin-left: 12px;
      padding-left: 12px;
      border-left: 1px solid #e5e5e5;
      
      :deep(.el-statistic__content) {
        font-size: 14px;
        font-family: monospace;
        color: #cf1322;
        font-weight: 600;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;

    .submit-code-button {
      --submit-base: #16a34a;
      --submit-deep: #0f6f3b;
      position: relative;
      min-width: 138px;
      height: 38px;
      display: inline-grid;
      grid-template-columns: 24px auto 32px;
      align-items: center;
      gap: 8px;
      padding: 0 8px 0 10px;
      border: 0;
      border-radius: 12px;
      color: #fff;
      cursor: pointer;
      overflow: hidden;
      background:
        radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.28), transparent 34%),
        linear-gradient(135deg, var(--submit-base), var(--submit-deep));
      box-shadow:
        0 8px 16px rgba(15, 111, 59, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.22);
      isolation: isolate;
      transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;

      &::before {
        content: "";
        position: absolute;
        inset: -40% auto -40% -70%;
        width: 56%;
        transform: rotate(18deg);
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.36), transparent);
        transition: left 540ms ease;
        z-index: -1;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow:
          0 12px 24px rgba(15, 111, 59, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.24);

        &::before {
          left: 118%;
        }

        .submit-icon {
          transform: translateY(-1px) rotate(-8deg);
          background: rgba(255, 255, 255, 0.25);
        }
      }

      &:active {
        transform: translateY(1px) scale(0.98);
        filter: saturate(1.08);
      }

      &:disabled {
        cursor: progress;
        opacity: 0.9;
      }

      &.running {
        animation: submit-breath 1.15s ease-in-out infinite;

        .submit-pulse {
          opacity: 1;
          animation: submit-ring 1.2s ease-out infinite;
        }

        .submit-icon {
          animation: submit-float 880ms ease-in-out infinite;
        }
      }

      .submit-pulse {
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(255, 255, 255, 0.38);
        border-radius: 10px;
        opacity: 0;
        pointer-events: none;
      }

      .submit-icon {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.18);
        transition: transform 180ms ease, background 180ms ease;
      }

      .submit-label {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0;
        white-space: nowrap;
      }

      .submit-key {
        height: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: rgba(8, 55, 31, 0.26);
        color: rgba(255, 255, 255, 0.84);
        font-size: 11px;
        font-weight: 800;
      }
    }
  }
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #8c8c8c;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #262626;
  }
}

.workspace-main {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  gap: 8px;
  padding: 8px;
  overflow: hidden;
}

/* Panel Common */
.problem-panel,
.editor-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  min-width: 0;
}

.problem-panel {
  flex: 1;
  flex-basis: 50%;
  max-width: 50%;
}

.editor-panel {
  flex: 1;
  min-height: 0;
}

.panel-header, .console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 12px;
}

.tabs {
  display: flex;
  height: 100%;

  .tab {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 500;
    color: #595959;
    position: relative;

    &.active {
      color: #262626;
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: #1890ff;
      }
    }
  }
}

.nav-controls {
  display: flex;
  gap: 4px;
}

/* Problem Area */
.problem-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.problem-meta {
  margin-bottom: 24px;
  
  .problem-h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px 0;
    line-height: 1.4;
  }

  .meta-tags {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;

    .difficulty {
      height: 24px;
      display: inline-flex;
      align-items: center;
      padding: 0 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;

      &.level-1 { background: #248A3D; color: #fff; border: 1px solid #1F7A35; }
      &.level-2 { background: #C65D00; color: #fff; border: 1px solid #A84F00; }
      &.level-3 { background: #D70015; color: #fff; border: 1px solid #B80012; }
    }

    .meta-item {
      color: #8c8c8c;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }
}

.html-content {
  font-size: 14px;
  line-height: 1.6;
  color: #262626;

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(pre) {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 13px;
    border: 1px solid #e5e5e5;
  }
  
  :deep(code) {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 13px;
    color: #c41d7f;
  }
}

/* Editor Area */
.editor-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Console Panel */
.console-panel {
  position: relative;
  z-index: 10;
  border-top: 1px solid #e5e5e5;
  background: #fff;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  min-height: 46px;
  max-height: calc(100% - 180px);
  overflow: hidden;

  &.is-expanded {
    min-height: 160px;
  }

  &.is-resizing {
    transition: none;

    .console-resize-handle {
      opacity: 1;
    }
  }
}

.console-resize-handle {
  position: absolute;
  top: -6px;
  left: 0;
  right: 0;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: row-resize;
  opacity: 0.42;
  z-index: 3;
  touch-action: none;
  transition: opacity 0.18s ease;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 5px;
    height: 1px;
    background: transparent;
    transition: background 0.18s ease;
  }

  span {
    width: 44px;
    height: 4px;
    border-radius: 999px;
    background: #c8d0d8;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  }

  &:hover,
  &:focus-visible {
    opacity: 1;

    &::before {
      background: #0f7a43;
    }

    span {
      background: #0f7a43;
    }
  }
}

:global(body.console-resizing) {
  cursor: row-resize;
  user-select: none;
}

.result-badge {
  .badge {
    font-size: 12px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 999px;

    &.neutral { background: #edf4ff; color: #2d5f96; border: 1px solid #c9ddf6; }
    &.red { background: #D70015; color: #fff; border: 1px solid #B80012; }
    &.green { background: #248A3D; color: #fff; border: 1px solid #1F7A35; }
    &.blue { background: #007AFF; color: #fff; border: 1px solid #0064D2; }
  }
}

.console-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
  padding: 16px;
  background: #fafafa;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.workspace-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #e7eef8;
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(0, 122, 255, 0.06), rgba(52, 199, 89, 0.05)),
    #fff;

  .workspace-kicker {
    display: block;
    color: #6c7889;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  h3 {
    margin: 0;
    color: #1d1d1f;
    font-size: 15px;
    font-weight: 800;
  }

  p {
    max-width: 360px;
    margin: 0;
    color: #6c7889;
    font-size: 12px;
    line-height: 1.6;
    text-align: right;
  }
}

.error-box {
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 6px;
  padding: 12px;
  
  .error-title {
    color: #cf1322;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
  }

  code {
    display: block;
    font-family: monospace;
    font-size: 13px;
    color: #a8071a;
    white-space: pre-wrap;
  }
}

.testcases-wrap {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  overflow: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  border-radius: 14px;
  border-style: hidden; /* hide outer border */
  box-shadow: 0 0 0 1px #e5e5e5;

  th, td {
    padding: 14px 16px;
    border: 1px solid #e5e5e5;
    font-size: 13px;
    vertical-align: top;
  }

  th {
    background: #f6f8fb;
    color: #596575;
    font-weight: 800;
    letter-spacing: 0.01em;
  }

  .code-cell {
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
    color: #262626;
    background: #fff;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;

    &.is-wrong {
      color: #cf1322;
      background: #fff1f0;
      font-weight: 600;
    }
  }
}

@keyframes submit-breath {
  0%,
  100% {
    box-shadow:
      0 8px 16px rgba(15, 111, 59, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }

  50% {
    box-shadow:
      0 12px 28px rgba(15, 111, 59, 0.32),
      inset 0 1px 0 rgba(255, 255, 255, 0.26);
  }
}

@keyframes submit-ring {
  0% {
    transform: scale(0.96);
    opacity: 0.58;
  }

  100% {
    transform: scale(1.18);
    opacity: 0;
  }
}

@keyframes submit-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .oj-workspace {
    height: 100dvh;
  }

  .workspace-main {
    flex-direction: column;
    overflow-y: auto;
  }

  .problem-panel {
    max-width: 100%;
    flex: 0 0 auto;
    height: min(42dvh, 360px);
  }

  .editor-panel {
    flex: 0 0 auto;
    height: min(70dvh, 620px);
    min-height: 460px;
  }

  .console-panel {
    max-height: calc(100% - 120px);
  }

  .data-table {
    min-width: 520px;
  }

  .workspace-intro {
    flex-direction: column;

    p {
      max-width: none;
      text-align: left;
    }
  }
}
</style>
