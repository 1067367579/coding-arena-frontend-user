<template>
  <div class="apple-exam-page">
    <div class="page-container">
      <section class="board-section">
        <header class="board-header">
          <div class="header-titles">
            <span class="kicker">Contest Board</span>
            <h1 class="title">推荐竞赛</h1>
            <p class="subtitle">把竞赛状态、报名动作和赛后复盘拆开呈现，减少扫描成本。</p>
          </div>
          
          <div class="segment-control">
            <button v-for="option in options" :key="option.value" 
              class="segment-btn"
              :class="{ 'is-active': selectedOption === option.value }"
              @click="selectOption(option.value)"
            >
              <span class="segment-label">{{ option.label }}</span>
              <span class="segment-meta">{{ option.value === 0 ? 'Active' : 'Archive' }}</span>
            </button>
          </div>
        </header>

        <div class="filter-toolbar">
          <div class="date-picker-wrap">
            <el-date-picker 
              v-model="datetimeRange" 
              type="datetimerange" 
              range-separator="至"
              start-placeholder="开始时间" 
              end-placeholder="结束时间"
              class="apple-date-picker"
            />
          </div>
          <div class="action-wrap">
            <button class="apple-btn" @click="onSearch">筛选</button>
            <button class="apple-btn-subtle" @click="onReset">重置</button>
          </div>
        </div>

        <div class="contest-grid">
          <article class="floating-card contest-card" :class="getExamStage(exam).className" v-for="exam in examList" :key="exam.examId">
            <div class="status-badge">
              <span>{{ getExamStage(exam).label }}</span>
            </div>
            
            <div class="card-cover">
              <img src="@/assets/images/exam.png" alt="Exam Cover">
              <div class="cover-overlay">
                <span class="meta-tag">{{ getExamStage(exam).meta }}</span>
              </div>
            </div>
            
            <div class="card-content">
              <div class="title-row">
                <h3 class="card-title">{{ exam.title }}</h3>
                <span class="signal-dot">{{ getExamStage(exam).signal }}</span>
              </div>

              <div class="time-grid">
                <div class="time-block">
                  <span class="time-label">START</span>
                  <span class="time-date">{{ formatDateLabel(exam.startTime) }}</span>
                  <span class="time-hour">{{ formatTimeLabel(exam.startTime) }}</span>
                </div>
                <div class="time-block">
                  <span class="time-label">END</span>
                  <span class="time-date">{{ formatDateLabel(exam.endTime) }}</span>
                  <span class="time-hour">{{ formatTimeLabel(exam.endTime) }}</span>
                </div>
              </div>

              <div class="action-row">
                <template v-if="isHistoryExam(exam)">
                  <button class="apple-btn-subtle" @click="togglePopover(exam.examId)">查看排名</button>
                  <button class="apple-btn" @click="goExam(exam)">竞赛练习</button>
                </template>
                <button class="apple-btn" v-else-if="isStartExam(exam)" @click="goExam(exam)">开始答题</button>
                <button class="apple-btn" v-else-if="isCanEntry(exam)" @click="enterExam(exam.examId)">报名参赛</button>
                <div class="status-note reserved" v-else-if="isEntryAndNotStart(exam)">已锁定席位，等待开赛</div>
                <div class="status-note closed" v-else>竞赛已经开始，报名入口已关闭</div>
              </div>
            </div>
          </article>
        </div>

        <div class="pagination-container">
          <el-pagination 
            background 
            layout="prev, pager, next" 
            :total="total"
            v-model:current-page="params.pageNum" 
            v-model:page-size="params.pageSize" 
            @current-change="handleCurrentChange"
            class="apple-pagination" 
          />
        </div>
      </section>
    </div>
  
    <el-dialog v-model="dialogVisible" title="排行榜" width="600px" top="20vh" center class="apple-dialog">
      <el-table :data="examRankList" class="apple-table" :show-header="true">
        <el-table-column label="排名" prop="examRank" width="80" align="center">
          <template #default="{ row }">
            <span class="rank-number" :class="{'top-rank': row.examRank <= 3}">{{ row.examRank }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户昵称" prop="nickName">
          <template #default="{ row }">
            <span class="rank-name">{{ row.nickName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="得分" prop="score" width="120" align="right">
          <template #default="{ row }">
            <span class="rank-score">{{ row.score }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination 
          background 
          layout="prev, pager, next" 
          :total="rankTotal"
          v-model:current-page="rankParams.pageNum" 
          v-model:page-size="rankParams.pageSize"
          @current-change="handleRankCurrentChange" 
          class="apple-pagination" 
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { getExamListService, enterExamService, getExamRankListService } from '@/apis/exam'
import { getToken } from '@/utils/cookie'
import { getUserInfoService } from '@/apis/user'
import { ElMessage } from 'element-plus'
import router from '@/router';

const datetimeRange = ref([])
const examList = ref([])
const total = ref(0)
const selectedOption = ref(0)
const options = ref([
  { label: '开放竞赛', value: 0 },
  { label: '历史复盘', value: 1 },
])
const params = reactive({
  pageNum: 1,
  pageSize: 9,
  type: 0
})

async function getExamList() {
  if (datetimeRange.value && datetimeRange.value[0] instanceof Date) {
    params.startTime = formatDateTime(datetimeRange.value[0])
  } else {
    params.startTime = ''
  }
  if (datetimeRange.value && datetimeRange.value[1] instanceof Date) {
    params.endTime = formatDateTime(datetimeRange.value[1])
  } else {
    params.endTime = ''
  }
  try {
    const result = await getExamListService(params)
    examList.value = result.rows
    total.value = result.total
  } catch (e) {}
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

function selectOption(type) {
  selectedOption.value = type
  params.pageNum = 1
  params.type = type
  getExamList()
}

function onSearch() {
  params.pageNum = 1
  getExamList()
}

function onReset() {
  params.pageNum = 1
  params.pageSize = 9
  params.type = selectedOption.value
  datetimeRange.value = []
  params.startTime = ''
  params.endTime = ''
  getExamList()
}

function handleCurrentChange(newPage) {
  getExamList()
}

function isOngoingAndUnregisteredCompetition(exam) {
  const now = new Date();
  return new Date(exam.startTime) < now && new Date(exam.endTime) > now && !exam.enter
}

function isEntryAndNotStart(exam) {
  const now = new Date();
  return new Date(exam.startTime) > now && exam.enter
}

function isHistoryExam(exam) {
  const now = new Date();
  return new Date(exam.endTime) < now;
}

function isStartExam(exam) {
  const now = new Date();
  return new Date(exam.startTime) < now && new Date(exam.endTime) > now && exam.enter;
}

function isCanEntry(exam) {
  const now = new Date();
  return new Date(exam.startTime) > now && !exam.enter;
}

function getExamStage(exam) {
  if (isHistoryExam(exam)) return { className: 'stage-history', label: '历史练习', signal: '复盘', meta: 'Archive' }
  if (isStartExam(exam)) return { className: 'stage-live', label: '进行中', signal: 'Live', meta: 'Now' }
  if (isCanEntry(exam)) return { className: 'stage-open', label: '开放报名', signal: 'Entry', meta: 'Open' }
  if (isEntryAndNotStart(exam)) return { className: 'stage-reserved', label: '已报名', signal: 'Seat', meta: 'Reserved' }
  if (isOngoingAndUnregisteredCompetition(exam)) return { className: 'stage-closed', label: '已开赛', signal: 'Closed', meta: 'Locked' }
  return { className: 'stage-open', label: '待开放', signal: 'Soon', meta: 'Soon' }
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
      console.error(error)
    }
  }
}

async function enterExam(examId) {
  await checkLogin()
  if (!isLogin.value) {
    router.push('/c-oj/login');
    return
  }
  const enterExamDTO = { examId: examId }
  try {
    await enterExamService(enterExamDTO)
    ElMessage.success('报名成功，请按时参赛')
    getExamList()
  } catch(error) {
    ElMessage.error(error.message || '报名失败');
  }
}

function goExam(exam) {
  router.push(`/c-oj/answer?examId=${exam.examId}&examTitle=${exam.title}&examEndTime=${exam.endTime}`)
}

const rankParams = reactive({
  examId: '',
  pageNum: 1,
  pageSize: 10,
})
const examRankList = ref([])
const rankTotal = ref(0)
const dialogVisible = ref(false)

function handleRankCurrentChange(newPage) {
  getExamRankList()
}

async function getExamRankList() {
  try {
    const result = await getExamRankListService(rankParams)
    examRankList.value = result.rows
    rankTotal.value = result.total
  } catch (e) {}
}

function togglePopover(examId) {
  dialogVisible.value = true
  rankParams.examId = examId
  rankParams.pageNum = 1
  getExamRankList()
}
</script>

<style lang="scss" scoped>
.apple-exam-page {
  padding: 40px 0 80px;
}

.page-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.board-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 24px;

  .header-titles {
    .kicker {
      font-size: 13px;
      font-weight: 600;
      color: var(--oj-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .title {
      font-size: 40px;
      font-weight: 700;
      color: var(--oj-ink);
      margin: 8px 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 17px;
      color: var(--oj-muted);
      margin: 0;
    }
  }

  .segment-control {
    display: flex;
    background: var(--oj-surface-soft);
    padding: 6px;
    border-radius: 16px;
    gap: 4px;

    .segment-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 8px 24px;
      border-radius: 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;

      .segment-label {
        font-size: 15px;
        font-weight: 600;
        color: var(--oj-subtle);
        transition: color 0.2s;
      }
      
      .segment-meta {
        font-size: 12px;
        color: var(--oj-subtle);
        opacity: 0.8;
      }

      &.is-active {
        background: var(--oj-surface);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        .segment-label { color: var(--oj-ink); }
        .segment-meta { color: var(--oj-primary); }
      }
    }
  }
}

.filter-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  background: var(--oj-surface);
  padding: 16px 24px;
  border-radius: 20px;
  box-shadow: var(--oj-shadow-sm);

  .date-picker-wrap {
    flex: 1;
    min-width: 320px;
  }
  
  .action-wrap {
    display: flex;
    gap: 12px;
  }

  .apple-date-picker {
    :deep(.el-input__wrapper) {
      box-shadow: none !important;
      background: var(--oj-surface-soft) !important;
      border-radius: 12px;
      height: 44px;
    }
  }

  .apple-btn {
    height: 44px;
    padding: 0 24px;
    border-radius: 12px;
    background: var(--oj-ink);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: transform 0.1s ease, opacity 0.2s ease;
    
    &:active { transform: scale(0.95); }
  }

  .apple-btn-subtle {
    height: 44px;
    padding: 0 24px;
    border-radius: 12px;
    background: var(--oj-surface-soft);
    color: var(--oj-ink);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background 0.2s, transform 0.1s ease;

    &:hover { background: rgba(0, 0, 0, 0.04); }
    &:active { transform: scale(0.95); }
  }
}

.contest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
}

.contest-card {
  display: flex;
  flex-direction: column;
  background: var(--oj-surface);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--stage-color, var(--oj-primary));
    z-index: 2;
  }

  &.stage-open { --stage-color: var(--oj-success); --stage-bg: rgba(52, 199, 89, 0.1); --stage-text: #248A3D; }
  &.stage-live { --stage-color: var(--oj-primary); --stage-bg: rgba(0, 122, 255, 0.1); --stage-text: var(--oj-primary-strong); }
  &.stage-reserved { --stage-color: var(--oj-accent); --stage-bg: rgba(255, 149, 0, 0.1); --stage-text: #B26800; }
  &.stage-history { --stage-color: var(--oj-muted); --stage-bg: rgba(134, 134, 139, 0.1); --stage-text: #424245; }
  &.stage-closed { --stage-color: var(--oj-danger); --stage-bg: rgba(255, 59, 48, 0.1); --stage-text: #CC2F26; }

  .status-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    
    span {
      padding: 6px 12px;
      background: var(--stage-bg);
      color: var(--stage-text);
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      backdrop-filter: blur(8px);
    }
  }

  .card-cover {
    height: 180px;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .cover-overlay {
      position: absolute;
      bottom: 16px;
      left: 16px;
      
      .meta-tag {
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        backdrop-filter: blur(8px);
      }
    }
  }

  &:hover .card-cover img {
    transform: scale(1.05);
  }

  .card-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 20px;
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;

    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--oj-ink);
      margin: 0;
      line-height: 1.3;
    }

    .signal-dot {
      font-size: 12px;
      font-weight: 700;
      color: var(--stage-text);
      background: var(--stage-bg);
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }
  }

  .time-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    
    .time-block {
      background: var(--oj-surface-soft);
      padding: 12px 16px;
      border-radius: 16px;

      .time-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--oj-subtle);
        margin-bottom: 4px;
        display: block;
      }
      
      .time-date {
        font-size: 15px;
        font-weight: 600;
        color: var(--oj-ink);
        display: block;
      }

      .time-hour {
        font-size: 13px;
        color: var(--oj-muted);
        display: block;
        margin-top: 2px;
      }
    }
  }

  .action-row {
    margin-top: auto;
    display: flex;
    gap: 12px;

    .apple-btn, .apple-btn-subtle {
      flex: 1;
      height: 44px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      &:active { transform: scale(0.96); }
    }

    .apple-btn {
      background: var(--oj-ink);
      color: #fff;
    }

    .apple-btn-subtle {
      background: var(--oj-surface-soft);
      color: var(--oj-ink);
      &:hover { background: rgba(0, 0, 0, 0.04); }
    }

    .status-note {
      flex: 1;
      text-align: center;
      padding: 12px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 500;
      
      &.reserved {
        background: var(--oj-accent-soft);
        color: #B26800;
      }
      
      &.closed {
        background: var(--oj-surface-soft);
        color: var(--oj-muted);
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* Dialog Styles */
.apple-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    overflow: hidden;
  }
}

.apple-table {
  :deep(th.el-table__cell) {
    background: transparent;
    border-bottom: 1px solid var(--oj-line);
    padding: 16px 0;
  }
  
  :deep(td.el-table__cell) {
    padding: 16px 0;
    border-bottom: 1px solid var(--oj-line);
  }

  .rank-number {
    font-size: 17px;
    font-weight: 700;
    color: var(--oj-muted);
    
    &.top-rank {
      color: var(--oj-primary);
    }
  }

  .rank-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--oj-ink);
  }

  .rank-score {
    font-size: 17px;
    font-weight: 600;
    color: var(--oj-ink);
  }
}

@media (max-width: 768px) {
  .board-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
    
    .date-picker-wrap {
      min-width: 100%;
    }
  }
}
</style>
