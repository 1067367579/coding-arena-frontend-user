<template>
  <div class="answer-workbench">
    <header class="answer-topbar">
      <div class="answer-context">
        <span class="answer-eyebrow">{{ typeof examTitle === 'undefined' ? "精选题库" : examTitle }}</span>
        <h1>{{ questionDetail.title || '题目加载中' }}</h1>
        <el-countdown v-if="examEndTime && new Date() < new Date(examEndTime)" class="exam-time-countdown"
          @finish="handleCountdownFinish" title="距离竞赛结束还有" :value="new Date(examEndTime)" />
      </div>
      <div class="answer-actions">
        <el-button type="primary" @click="submitQuestion">提交代码</el-button>
        <button class="answer-back" @click="goBack()">返回</button>
      </div>
    </header>

    <main class="answer-grid">
      <section class="problem-panel">
        <div class="panel-toolbar">
          <span class="panel-title">题目描述</span>
          <div class="problem-nav">
            <button @click="preQuestion">
              <el-icon><ArrowLeft /></el-icon>
              上一题
            </button>
            <button @click="nextQuestion">
              下一题
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
        </div>

        <article class="problem-content">
          <div class="problem-title-row">
            <h2>{{ questionDetail.title }}</h2>
            <span class="difficulty-tag" :class="`level-${questionDetail.difficulty || 1}`">
              <template v-if="questionDetail.difficulty === 1">简单</template>
              <template v-else-if="questionDetail.difficulty === 2">中等</template>
              <template v-else-if="questionDetail.difficulty === 3">困难</template>
              <template v-else>题目</template>
            </span>
          </div>
          <div class="limit-row">
            <span>时间 {{ questionDetail.timeLimit || '-' }} ms</span>
            <span>空间 {{ questionDetail.spaceLimit || '-' }} 字节</span>
          </div>
          <div class="question-content" v-html="questionDetail.content"></div>
        </article>
      </section>

      <section class="code-panel">
        <div class="panel-toolbar code-toolbar">
          <span class="panel-title">代码编辑器</span>
          <span class="code-meta">Java · 标准输入输出</span>
        </div>
        <div class="editor-shell">
          <codeEditor ref="defaultCodeRef" @update:value="handleEditorContent" />
        </div>

        <div class="result-panel" :class="{
          failed: userQuestionResultVO.pass === 0 || userQuestionResultVO.pass === 4,
          accepted: userQuestionResultVO.pass === 1,
          pending: userQuestionResultVO.pass === 2 || userQuestionResultVO.pass === 3
        }">
          <div class="result-head">
            <span class="result-title">执行结果</span>
            <span class="result-status red" v-if="userQuestionResultVO.pass === 0">未通过</span>
            <span class="result-status success" v-if="userQuestionResultVO.pass === 1">通过</span>
            <span class="result-status warning" v-if="userQuestionResultVO.pass === 2">等待提交</span>
            <span class="result-status info" v-if="userQuestionResultVO.pass === 3">判题中</span>
            <span class="result-status red" v-if="userQuestionResultVO.pass === 4">系统错误</span>
          </div>
          <div class="error-text" v-if="userQuestionResultVO.pass === 0">
            异常信息：{{ userQuestionResultVO.exeMessage }}
          </div>
          <el-table v-if="userQuestionResultVO.userExeResultList && userQuestionResultVO.userExeResultList.length > 0"
            :data="userQuestionResultVO.userExeResultList">
            <el-table-column prop="input" label="输入" />
            <el-table-column prop="output" label="预期结果" />
            <el-table-column prop="exeOutput" label="实际输出" />
          </el-table>
        </div>
      </section>
    </main>
  </div>
</template>
  
  <script setup>
  import { reactive, ref } from "vue"
  import codeEditor from "@/components/CodeEditor.vue"
  import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
  import { useRoute } from "vue-router"
  import { getQuestionDetailService, preQuestionService, nextQuestionService, getQuestionResultService } from "@/apis/question"
  import router from "@/router"
  import { examNextQuestionService, examPreQuestionService, getExamFirstQuestionService } from "@/apis/exam"
  import { ElMessage } from "element-plus"
  import { userSubmitService } from "@/apis/user"
  import { loadCode,saveCode } from "@/utils/codeStorage"
  
  function goBack() {
    router.go(-1);
  }
  const questionDetail = reactive({})
  const defaultCodeRef = ref()
  
  let questionId = useRoute().query.questionId
  let examId = useRoute().query.examId
  let examTitle = useRoute().query.examTitle
  let examEndTime = useRoute().query.examEndTime
  
  console.log('examTitle: ', examTitle)
  
  async function getQuestionDetail() {
    if (examId && (questionId == null || questionId == '')) {
      const eqrs = await getExamFirstQuestionService(examId)
      questionId = eqrs.data
      console.log('qId: ', questionId)
    }
    const res = await getQuestionDetailService(questionId)
    Object.assign(questionDetail, res.data)
    let code = loadCode(examId,questionId)
    defaultCodeRef.value.setAceCode(code == null ? questionDetail.defaultCode: code)
    // 新增：获取判题结果
    const resultRes = await getQuestionResultService(examId, questionDetail.questionId, currentTime);
    userQuestionResultVO.value = (resultRes.data.pass == 3) ? { pass: 2 } : resultRes.data; // 默认未提交状态
  }
  getQuestionDetail()
  
  async function preQuestion() {
    try {
        if (examId) {
            //竞赛中上一题的逻辑  需要提供一个竞赛中获取上一题的接口
            const res = await examPreQuestionService(examId, questionId)
            questionId = res.data
        } else {
            const res = await preQuestionService(questionId)
            questionId = res.data
        }
        getQuestionDetail()
    } catch(error) {
        ElMessage.error(error.message)
    }
  }
  
  async function nextQuestion() {
    try{ 
        if (examId) {
            //竞赛中下一题的逻辑 需要提供一个竞赛中获取下一题的接口
            const res = await examNextQuestionService(examId, questionId)
            questionId = res.data
        } else {
            const res = await nextQuestionService(questionId)
            questionId = res.data
        }
        getQuestionDetail()
    } catch(error) {
        ElMessage.error(error.message)
    }
  }
  
  function handleCountdownFinish() {
    ElMessage.info('竞赛已经结束了哦')
    router.push('/c-oj/home/exam')
  }
  
  const submitDTO = reactive({
    examId:'',
    questionId:'',
    programType: 0,
    userCode: ''
  })
  
  function handleEditorContent(content) {
    submitDTO.userCode = content
  }
  
  const userQuestionResultVO = ref({
    pass: 2,  //默认值为2，未提交代码
    exeMessage: '',
    userExeResultList: [],
  })
  
  const pollingInterval = ref(null);
  let currentTime
  let submitTime
  
  function startPolling() {
    stopPolling(); // 停止之前的轮询
    //定义最大尝试时间
    const maxPollingTime = 15000; //15s
    pollingInterval.value = setInterval(() => {
      if(Date.now()-submitTime >= maxPollingTime) {
        clearInterval(pollingInterval.value)
        handlePollingTimeout();
        return;
      }
      getQuestionResult();
    }, 1000); // 每隔1秒请求一次
  }

  function handlePollingTimeout() {
    userQuestionResultVO.value.pass = 4;
    userQuestionResultVO.value.exeMessage = "系统异常，请稍后重试";
  }
  
  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
  }
  
  async function submitQuestion() {
    submitDTO.examId = examId
    submitDTO.questionId = questionId
    try {
      //用户被拉黑之后无法执行接下来的逻辑
      await userSubmitService(submitDTO)
      currentTime = formatDateToStandard(new Date());
      submitTime = new Date();
      userQuestionResultVO.value.exeMessage = '';
      userQuestionResultVO.value.userExeResultList = [];
      userQuestionResultVO.value.pass = 3
      //提交代码之后 在本地存储中保存代码
      saveCode(examId,questionId,submitDTO.userCode);
      startPolling()
    } catch(error) {
      ElMessage.error(error.message);
    }
  }

  function formatDateToStandard(date) {
            const year = date.getFullYear();
            // 月份从0开始，需要+1后补零
            const month = String(date.getMonth() + 1).padStart(2, '0');
            // 日期补零
            const day = String(date.getDate()).padStart(2, '0');
            // 小时补零
            const hour = String(date.getHours()).padStart(2, '0');
            // 分钟补零
            const minute = String(date.getMinutes()).padStart(2, '0');
            // 秒补零
            const second = String(date.getSeconds()).padStart(2, '0');
            
            return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
        }
  
  async function getQuestionResult() {
    const res = await getQuestionResultService(submitDTO.examId, submitDTO.questionId, currentTime)
    userQuestionResultVO.value = res.data
    if (userQuestionResultVO.value.pass !== 3) {
      stopPolling();
    }
  }
  
  </script>
  
<style lang="scss" scoped>
.answer-workbench {
  min-height: 100vh;
  padding: 18px;
  background:
    radial-gradient(circle at 16% 6%, rgba(22, 163, 74, 0.12), transparent 28%),
    var(--oj-bg);
  color: var(--oj-ink);
  box-sizing: border-box;
}

.answer-topbar {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 22px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--oj-line);
  border-radius: 18px;
  box-shadow: var(--oj-shadow-sm);
}

.answer-context {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.answer-eyebrow {
  color: var(--oj-primary-strong);
  background: var(--oj-primary-soft);
  border: 1px solid rgba(22, 131, 74, 0.14);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.exam-time-countdown {
  padding-left: 18px;
  border-left: 1px solid var(--oj-line);
}

.answer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.answer-back {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--oj-line);
  border-radius: 999px;
  background: #fff;
  color: var(--oj-muted);
  cursor: pointer;
}

.answer-grid {
  display: grid;
  grid-template-columns: minmax(360px, 42%) minmax(460px, 1fr);
  gap: 14px;
  height: calc(100vh - 112px);
  margin-top: 14px;
}

.problem-panel,
.code-panel {
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--oj-line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--oj-shadow-sm);
}

.code-panel {
  display: grid;
  grid-template-rows: 58px minmax(320px, 1fr) minmax(164px, 25vh);
  background: #111a24;
}

.panel-toolbar {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid var(--oj-line);
  background: #fff;
}

.panel-title {
  font-size: 15px;
  font-weight: 800;
}

.problem-nav {
  display: flex;
  align-items: center;
  gap: 8px;

  button {
    height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--oj-line);
    border-radius: 999px;
    background: #fff;
    color: var(--oj-ink);
    cursor: pointer;
    padding: 0 12px;

    &:hover {
      border-color: rgba(22, 131, 74, 0.24);
      color: var(--oj-primary-strong);
      background: var(--oj-primary-soft);
    }
  }
}

.code-toolbar {
  border-bottom-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(90deg, rgba(22, 163, 74, 0.16), rgba(17, 26, 36, 0)),
    #111a24;

  .panel-title {
    color: #f8fafc;
  }
}

.code-meta {
  color: #95a3b8;
  font-size: 13px;
}

.problem-content {
  height: calc(100% - 58px);
  overflow: auto;
  padding: 26px;
  box-sizing: border-box;
}

.problem-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  h2 {
    margin: 0;
    font-size: 28px;
    line-height: 1.25;
  }
}

.difficulty-tag {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 800;

  &.level-1 {
    color: var(--oj-primary-strong);
    background: var(--oj-primary-soft);
  }

  &.level-2 {
    color: #9a5b00;
    background: #fff4d7;
  }

  &.level-3 {
    color: #b91c1c;
    background: #fee2e2;
  }
}

.limit-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0 24px;

  span {
    padding: 8px 10px;
    border: 1px solid var(--oj-line);
    border-radius: 10px;
    color: var(--oj-muted);
    background: #fafaf8;
    font-size: 13px;
  }
}

.question-content {
  color: #263128;
  font-size: 16px;
  line-height: 1.75;

  :deep(pre) {
    padding: 16px;
    border-radius: 12px;
    background: #101b15;
    color: #d9fbe7;
    overflow: auto;
  }
}

.editor-shell {
  min-height: 0;
  overflow: hidden;
  background: #111a24;
}

.result-panel {
  min-height: 0;
  overflow: auto;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  background: #f9faf7;
  padding: 16px 18px;
  box-sizing: border-box;

  &.accepted {
    border-top-color: rgba(22, 131, 74, 0.28);
  }

  &.failed {
    border-top-color: rgba(220, 38, 38, 0.28);
  }
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.result-title {
  font-size: 15px;
  font-weight: 800;
}

.result-status {
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 800;

  &.red {
    color: #b91c1c;
    background: #fee2e2;
  }

  &.success {
    color: var(--oj-primary-strong);
    background: var(--oj-primary-soft);
  }

  &.warning {
    color: #9a5b00;
    background: #fff4d7;
  }

  &.info {
    color: #1d4ed8;
    background: #dbeafe;
  }
}

.error-text {
  padding: 10px 12px;
  margin-bottom: 12px;
  border-left: 3px solid #dc2626;
  border-radius: 10px;
  background: #fff1f2;
  color: #991b1b;
  font-size: 14px;
}

@media (max-width: 980px) {
  .answer-workbench {
    padding: 12px;
  }

  .answer-topbar {
    height: auto;
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }

  .answer-context {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;

    h1 {
      white-space: normal;
    }
  }

  .exam-time-countdown {
    padding-left: 0;
    border-left: 0;
  }

  .answer-grid {
    grid-template-columns: 1fr;
    height: auto;
  }

  .problem-panel {
    height: 56vh;
  }

  .code-panel {
    min-height: 720px;
  }
}
</style>
