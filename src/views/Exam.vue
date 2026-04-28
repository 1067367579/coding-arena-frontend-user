<template>
    <div class="exam-page">
      <section class="contest-board">
        <header class="contest-board-head">
          <div class="contest-heading">
            <span class="board-kicker">Contest Board</span>
            <h2>推荐竞赛</h2>
            <p>把竞赛状态、报名动作和赛后复盘拆开呈现，减少扫描成本。</p>
          </div>
          <div class="contest-segments" role="tablist" aria-label="竞赛状态筛选">
            <button v-for="option in options" :key="option.value" type="button" @click="selectOption(option.value)"
              :class="{ active: selectedOption === option.value }">
              <span>{{ option.label }}</span>
              <small>{{ option.value === 0 ? 'Active' : 'Archive' }}</small>
            </button>
          </div>
        </header>

        <div class="contest-filterbar">
          <el-form :inline="true" class="contest-filter-form">
            <el-form-item label="竞赛窗口" prop="datetimeRange" class="exam-navigation-box">
              <el-date-picker v-model="datetimeRange" type="datetimerange" range-separator="至"
                start-placeholder="开始时间" end-placeholder="结束时间"></el-date-picker>
            </el-form-item>
            <el-form-item class="filter-actions">
              <el-button @click="onSearch" plain type="primary">搜索</el-button>
              <el-button @click="onReset" plain type="info">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="contest-grid">
          <article class="contest-card" :class="getExamStage(exam).className" v-for="exam in examList"
            :key="exam.examId">
            <div class="contest-status-rail" aria-hidden="true">
              <span>{{ getExamStage(exam).label }}</span>
            </div>
            <figure class="contest-cover">
              <img src="@/assets/images/exam.png">
              <figcaption>{{ getExamStage(exam).meta }}</figcaption>
            </figure>
            <div class="contest-info">
              <div class="contest-title-row">
                <h3>{{ exam.title }}</h3>
                <span class="contest-signal" :class="getExamStage(exam).className">
                  {{ getExamStage(exam).signal }}
                </span>
              </div>

              <div class="contest-time-grid">
                <div>
                  <small>START</small>
                  <strong>{{ formatDateLabel(exam.startTime) }}</strong>
                  <span>{{ formatTimeLabel(exam.startTime) }}</span>
                </div>
                <div>
                  <small>END</small>
                  <strong>{{ formatDateLabel(exam.endTime) }}</strong>
                  <span>{{ formatTimeLabel(exam.endTime) }}</span>
                </div>
              </div>

              <div class="contest-card-actions">
                <template v-if="isHistoryExam(exam)">
                  <el-button class="contest-action secondary" type="primary" plain @click="togglePopover(exam.examId)">查看排名</el-button>
                  <el-button class="contest-action primary" type="primary" @click="goExam(exam)">竞赛练习</el-button>
                </template>
                <el-button class="contest-action primary" type="primary" v-else-if="isStartExam(exam)"
                  @click="goExam(exam)">开始答题</el-button>
                <el-button class="contest-action primary entry" type="primary" v-else-if="isCanEntry(exam)"
                  @click="enterExam(exam.examId)">报名参赛</el-button>
                <div class="contest-note reserved" v-else-if="isEntryAndNotStart(exam)">已锁定席位，等待开赛</div>
                <div class="contest-note closed" v-else>竞赛已经开始，报名入口已关闭</div>
              </div>
            </div>
          </article>
        </div>

        <div class="exam-page-pagination">
          <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
            v-model:current-page="params.pageNum" v-model:page-size="params.pageSize" :page-sizes="[3, 6, 9, 12]"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </section>
    </div>
  
    <el-dialog v-model="dialogVisible" width="600px" top="30vh" :show-close="true" :close-on-click-modal="false"
      :close-on-press-escape="false" class="oj-login-dialog-centor" center>
      <el-table :data="examRankList">
        <el-table-column label="排名" prop="examRank" />
        <el-table-column label="用户昵称" prop="nickName" />
        <el-table-column label="用户得分" prop="score" />
      </el-table>
      <el-pagination class="range_page" background layout="total, sizes, prev, pager, next, jumper" :total="rankTotal"
        v-model:current-page="rankParams.pageNum" v-model:page-size="rankParams.pageSize" :page-sizes="[5, 10, 15, 20]"
        @size-change="handleRankSizeChange" @current-change="handleRankCurrentChange" />
    </el-dialog>
  
  </template>
  
  <script setup>
  import { reactive, ref } from 'vue'
  import { getExamListService,enterExamService, getExamRankListService } from '@/apis/exam'
  import { getToken } from '@/utils/cookie'
  import { getUserInfoService } from '@/apis/user'
  import { ElMessage } from 'element-plus'
  import router from '@/router';
  
  //参数定义
  const datetimeRange = ref([])
  const examList = ref([]) //题目列表
  const total = ref(0)
  const selectedOption = ref(0); // 初始化选中的文本
  const options = ref([
    { label: '开放竞赛', value: 0 },
    { label: '历史复盘', value: 1 },
  ])
  const params = reactive({
    pageNum: 1,
    pageSize: 9,
    type: 0
  })
  
  //竞赛列表
  async function getExamList() {
    if (datetimeRange.value[0] instanceof Date) {
      params.startTime = formatDateTime(datetimeRange.value[0])
    }
    if (datetimeRange.value[1] instanceof Date) {
      params.endTime = formatDateTime(datetimeRange.value[1])
    }
    const result = await getExamListService(params)
    examList.value = result.rows
    total.value = result.total
  }
  getExamList()

  function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  async function selectOption(type) {
    selectedOption.value = type
    params.pageNum = 1
    params.type = type
    getExamList()
  }
  
  // 搜索/重置
  function onSearch() {
    params.pageNum = 1
    getExamList()
  }
  
  function onReset() {
    params.pageNum = 1
    params.pageSize = 9
    params.type = selectedOption.value
    params.startTime = ''
    params.endTime = ''
    datetimeRange.value.length = 0
    getExamList()
  }
  
  // 分页
  function handleSizeChange(newSize) {
    params.pageNum = 1
    getExamList()
  }
  
  function handleCurrentChange(newPage) {
    getExamList()
  }
  
  //已开赛条件判断
  function isOngoingAndUnregisteredCompetition(exam){
    const now = new Date(); //当前时间
    return new Date(exam.startTime) < now && new Date(exam.endTime) > now && !exam.enter
  }
  
  //报名 未开赛
  function isEntryAndNotStart(exam) {
    const now = new Date();
    return new Date(exam.startTime) > now && exam.enter
  }
  
  
  function isHistoryExam(exam) {
    const now = new Date();
    return new Date(exam.endTime) < now;
  }
  
  //开赛
  function isStartExam(exam) {
    const now = new Date();
    return new Date(exam.startTime) < now && new Date(exam.endTime) > now && exam.enter;
  }
  
  function isCanEntry (exam) {
    const now = new Date();
    return new Date(exam.startTime) > now && !exam.enter;
  }

  function getExamStage(exam) {
    if (isHistoryExam(exam)) {
      return {
        className: 'stage-history',
        label: '历史练习',
        signal: '复盘',
        meta: 'Archive',
      }
    }
    if (isStartExam(exam)) {
      return {
        className: 'stage-live',
        label: '进行中',
        signal: 'Live',
        meta: 'Now',
      }
    }
    if (isCanEntry(exam)) {
      return {
        className: 'stage-open',
        label: '开放报名',
        signal: 'Entry',
        meta: 'Open',
      }
    }
    if (isEntryAndNotStart(exam)) {
      return {
        className: 'stage-reserved',
        label: '已报名',
        signal: 'Seat',
        meta: 'Reserved',
      }
    }
    if (isOngoingAndUnregisteredCompetition(exam)) {
      return {
        className: 'stage-closed',
        label: '已开赛',
        signal: 'Closed',
        meta: 'Locked',
      }
    }
    return {
      className: 'stage-open',
      label: '待开放',
      signal: 'Soon',
      meta: 'Soon',
    }
  }

  function formatDateLabel(value) {
    if (!value) return '-'
    return String(value).slice(0, 10)
  }

  function formatTimeLabel(value) {
    if (!value) return '-'
    return String(value).slice(11, 16)
  }
  
  const isLogin = ref(false)
  async function checkLogin() {
    if (getToken()) {
        try {
        await getUserInfoService()
        isLogin.value = true
      } catch(error) {
        ElMessage.error(error.message);
      }
    }
  }
  
  async function enterExam(examId) {
    await checkLogin()
    if (!isLogin.value) {
      ElMessage.error('请先登录后报名参赛,谢谢')
      return
    }
    const enterExamDTO = ref({
      examId: examId
    })
    try {
      await enterExamService(enterExamDTO.value)
      ElMessage.success('您已报名成功，请按时参赛',)
      getExamList() //报名成功后刷新竞赛列表
    } catch(error) {
      ElMessage.error(error.message);
    }
  }
  
  function goExam(exam) {
    //需要后端提供一个获取竞赛中第一道题目的id接口
    router.push(`/c-oj/answer?examId=${exam.examId}&examTitle=${exam.title}&examEndTime=${exam.endTime}`)
  }
  
  const rankParams = reactive({
    examId:'',
    pageNum: 1,
    pageSize: 9,
  })
  const examRankList = ref([])
  const rankTotal = ref(0)
  
  // 分页
  function handleRankSizeChange(newSize) {
    rankParams.pageNum = 1
    getExamRankList()
  }
  
  function handleRankCurrentChange(newPage) {
    getExamRankList()
  }
  
  const dialogVisible = ref(false)
  
  async function getExamRankList() {
    const result = await getExamRankListService(rankParams)
    examRankList.value = result.rows
    rankTotal.value = result.total
  }
  
  function togglePopover(examId) {
    dialogVisible.value = true
    rankParams.examId = examId
    getExamRankList()
  }
  
  </script>
  
<style lang="scss" scoped>
.exam-page {
  max-width: 1520px;
  margin: 0 auto 28px;
}

.contest-board {
  border: 1px solid var(--oj-line);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.9)),
    var(--oj-surface);
  box-shadow: var(--oj-shadow-sm);
  overflow: hidden;
}

.contest-board-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding: 30px 32px 22px;
  border-bottom: 1px solid var(--oj-line);
}

.contest-heading {
  min-width: 0;

  h2 {
    margin: 8px 0;
    color: var(--oj-ink);
    font-size: 28px;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: var(--oj-muted);
    font-size: 14px;
  }
}

.board-kicker {
  color: var(--oj-primary-strong);
  font-size: 13px;
  font-weight: 900;
}

.contest-segments {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--oj-line);
  border-radius: 18px;
  background: #f6f7f1;

  button {
    min-height: 52px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
    padding: 0 14px;
    border: 0;
    border-radius: 13px;
    color: var(--oj-muted);
    cursor: pointer;
    transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease;

    span {
      font-size: 14px;
      font-weight: 900;
    }

    small {
      color: var(--oj-subtle);
      font-size: 11px;
      font-weight: 800;
    }

    &.active {
      background: #fff;
      color: var(--oj-primary-strong);
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.07);

      small {
        color: var(--oj-primary);
      }
    }

    &:hover {
      transform: translateY(-1px);
    }
  }
}

.contest-filterbar {
  padding: 20px 32px 8px;
}

.contest-filter-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;

  :deep(.el-form-item) {
    margin: 0;
  }

  :deep(.el-form-item__label) {
    height: 40px;
    align-items: center;
  }

  :deep(.el-date-editor) {
    width: 420px;
    max-width: 100%;
  }
}

.filter-actions {
  margin-left: auto !important;
}

.contest-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  padding: 20px 32px 28px;
}

.contest-card {
  position: relative;
  min-height: 252px;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 20px;
  padding: 18px 18px 18px 24px;
  border: 1px solid var(--oj-line);
  border-radius: 22px;
  background: #fbfbf8;
  overflow: hidden;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 5px;
    background: var(--stage-color, var(--oj-primary));
  }

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(22, 131, 74, 0.18);
    background: #fff;
    box-shadow: 0 18px 42px rgba(17, 24, 39, 0.08);
  }

  &.stage-open {
    --stage-color: #16a34a;
    --stage-soft: #e8f5ec;
    --stage-text: #0f6f3b;
  }

  &.stage-live {
    --stage-color: var(--oj-primary);
    --stage-soft: var(--oj-primary-soft);
    --stage-text: var(--oj-primary-strong);
  }

  &.stage-reserved {
    --stage-color: #f59e0b;
    --stage-soft: #fff4d6;
    --stage-text: #9a5b00;
  }

  &.stage-history {
    --stage-color: #64748b;
    --stage-soft: #eef2f6;
    --stage-text: #475569;
  }

  &.stage-closed {
    --stage-color: #dc2626;
    --stage-soft: #fee2e2;
    --stage-text: #b91c1c;
  }
}

.contest-status-rail {
  position: absolute;
  top: 18px;
  right: 18px;

  span {
    display: inline-grid;
    place-items: center;
    min-width: 76px;
    height: 30px;
    padding: 0 10px;
    border-radius: 9px;
    background: var(--stage-soft);
    color: var(--stage-text);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0;
  }
}

.contest-cover {
  align-self: stretch;
  min-width: 0;
  margin: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #101b15;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    min-height: 188px;
    object-fit: cover;
    opacity: 0.84;
  }

  figcaption {
    position: absolute;
    left: 10px;
    bottom: 10px;
    padding: 5px 8px;
    border-radius: 8px;
    background: rgba(15, 23, 32, 0.68);
    color: #fff;
    font-size: 11px;
    font-weight: 900;
    backdrop-filter: blur(8px);
  }
}

.contest-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}

.contest-title-row {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;

  h3 {
    min-width: 0;
    margin: 0;
    color: var(--oj-ink);
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
  }
}

.contest-signal {
  flex-shrink: 0;
  min-width: 44px;
  height: 24px;
  display: inline-grid;
  place-items: center;
  border-radius: 7px;
  color: var(--stage-text);
  background: linear-gradient(135deg, var(--stage-soft), #fff);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.contest-time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;

  div {
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--oj-line);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.72);
  }

  small,
  strong,
  span {
    display: block;
  }

  small {
    color: var(--oj-subtle);
    font-size: 10px;
    font-weight: 900;
  }

  strong {
    margin-top: 4px;
    color: var(--oj-ink);
    font-size: 14px;
  }

  span {
    margin-top: 2px;
    color: var(--oj-muted);
    font-size: 13px;
  }
}

.contest-card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;

  .contest-action {
    min-width: 108px;
    height: 42px;
    font-weight: 900;
  }

  .contest-action.secondary {
    background: #fff;
    border-color: var(--oj-line);
    color: var(--stage-text);
  }
}

.contest-note {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;

  &.reserved {
    background: #fff4d6;
    color: #9a5b00;
  }

  &.closed {
    background: #f3f4ef;
    color: var(--oj-muted);
  }
}

.exam-page-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 0 32px 32px;
}

.range_page {
  margin-top: 18px;
  justify-content: flex-end;
}

@media (max-width: 1280px) {
  .contest-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .contest-board-head {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .contest-filter-form {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-actions {
    margin-left: 0 !important;
  }

  .contest-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .contest-board-head,
  .contest-filterbar,
  .contest-grid {
    padding-left: 18px;
    padding-right: 18px;
  }

  .contest-segments {
    grid-template-columns: 1fr;
  }

  .contest-card {
    grid-template-columns: 1fr;
  }

  .contest-cover img {
    height: 170px;
  }
}
</style>
