<template>
  <div class="apple-exam-page">
    <!-- Compact Hero Section (Horizontal Banner) -->
    <header class="compact-hero">
      <div class="hero-container">
        <div class="hero-content">
          <span class="kicker">Contest Board</span>
          <h1 class="title">推荐竞赛</h1>
          <p class="subtitle">实时掌握竞赛状态，与全球顶尖极客同台竞技。</p>
        </div>
        
        <div class="hero-actions">
          <div class="segment-control">
            <button v-for="option in options" :key="option.value" 
              class="segment-btn"
              :class="{ 'is-active': selectedOption === option.value }"
              @click="selectOption(option.value)"
            >
              <span class="segment-label">{{ option.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="page-container">
      <!-- Main Area (Grid) -->
      <main class="board-section">
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
          <!-- Entire card is clickable -->
          <article 
            class="floating-card contest-card" 
            :class="getExamStage(exam).className" 
            v-for="exam in examList" 
            :key="exam.examId"
            @click="goExam(exam)"
          >
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

              <!-- Visual Action Row (Not interactive individually to avoid click conflicts) -->
              <div class="action-row">
                <div class="visual-btn" v-if="isHistoryExam(exam)">查看详情</div>
                <div class="visual-btn primary" v-else-if="isStartExam(exam)">进入竞赛空间</div>
                <div class="visual-btn primary" v-else-if="isCanEntry(exam)">查看报名信息</div>
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
      </main>

      <!-- Sidebar Area (Hall of Fame rigidly on the right) -->
      <aside class="sidebar-section">
        <div class="floating-card hall-of-fame-card">
          <div class="card-header">
            <span class="kicker">Hall of Fame</span>
            <h3>Top Competitors</h3>
            <p>基于竞赛参与度和表现分数的综合排名。</p>
          </div>
          
          <div class="competitor-list">
            <div class="competitor-item" v-for="(user, index) in topCompetitors.slice(0, 10)" :key="index">
              <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <img :src="user.avatar" class="user-avatar" />
              <div class="user-info">
                <div class="name-row">
                  <span class="name">{{ user.name }}</span>
                  <!-- Metallic checkmark for Elite users (Level 5 & 6) -->
                  <svg v-if="user.level >= 5" class="elite-checkmark" viewBox="0 0 24 24" width="14" height="14" title="Elite User">
                    <defs>
                      <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#fff3b0;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#aa7c11;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#metallic)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span class="level-badge" :class="'level-' + user.level">Lv. {{ user.level }}</span>
              </div>
              <div class="score-info">
                <span class="score">{{ user.score }}</span>
                <span class="label">{{ user.participations }} Contests</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { getExamListService } from '@/apis/exam'
import { getToken } from '@/utils/cookie'
import { getUserInfoService } from '@/apis/user'
import router from '@/router';

// Mocked Top Competitors (Strictly Top 10)
const topCompetitors = ref([
  { name: 'AlgoMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', score: 9850, participations: 124, level: 6 },
  { name: 'dp_is_easy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B', score: 8720, participations: 98, level: 5 },
  { name: 'CodeNinja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C', score: 7640, participations: 85, level: 4 },
  { name: 'ArraySolver', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D', score: 6500, participations: 62, level: 4 },
  { name: 'graph_fan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=E', score: 5430, participations: 45, level: 3 },
  { name: 'MathGenius', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=F', score: 5120, participations: 41, level: 3 },
  { name: 'StringMatcher', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=G', score: 4890, participations: 38, level: 3 },
  { name: 'TreeTraversal', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=H', score: 4550, participations: 35, level: 2 },
  { name: 'BitHacker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=I', score: 4210, participations: 32, level: 2 },
  { name: 'GreedyCoder', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=J', score: 3950, participations: 28, level: 2 },
  // Extra elements to prove limit works:
  { name: 'Overflow', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=K', score: 3000, participations: 20, level: 1 }
])

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
checkLogin()

function goExam(exam) {
  // Routes directly to ContestDetail regardless of state
  router.push(`/c-oj/home/exam/${exam.examId}`)
}
</script>

<style lang="scss" scoped>
.apple-exam-page {
  padding: 0 0 80px;
  background: transparent;
  min-height: 100vh;
}

/* Compact Horizontal Hero */
.compact-hero {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 24px 0;
  margin-bottom: 32px;
}

.hero-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.hero-content {
  .kicker {
    font-size: 12px;
    font-weight: 800;
    color: var(--oj-primary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .title {
    font-size: 28px;
    font-weight: 800;
    color: var(--oj-ink);
    margin: 4px 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .subtitle {
    font-size: 14px;
    color: var(--oj-muted);
    margin: 0;
    line-height: 1.4;
  }
}

.segment-control {
  display: flex;
  background: var(--oj-surface-soft);
  padding: 4px;
  border-radius: 12px;

  .segment-btn {
    padding: 8px 20px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: var(--oj-subtle);
    transition: all 0.2s ease;

    &.is-active {
      background: #fff;
      color: var(--oj-ink);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }
}

/* Page Container Grid */
.page-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: minmax(0, 70%) minmax(300px, 30%);
  gap: 32px;
  align-items: start;
}

@media (max-width: 1024px) {
  .page-container {
    grid-template-columns: 1fr;
  }
}

/* Main Board Section */
.board-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);

  .date-picker-wrap {
    flex: 1;
    min-width: 280px;
  }
  
  .action-wrap {
    display: flex;
    gap: 8px;
  }

  .apple-date-picker {
    :deep(.el-input__wrapper) {
      box-shadow: none !important;
      background: var(--oj-surface-soft) !important;
      border-radius: 10px;
      height: 40px;
    }
  }

  .apple-btn, .apple-btn-subtle {
    height: 40px;
    padding: 0 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .apple-btn {
    background: var(--oj-ink);
    color: #fff;
    &:active { transform: scale(0.96); }
  }

  .apple-btn-subtle {
    background: var(--oj-surface-soft);
    color: var(--oj-ink);
    &:hover { background: rgba(0, 0, 0, 0.04); }
  }
}

/* High-Density Grid */
.contest-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .contest-grid {
    grid-template-columns: 1fr;
  }
}

/* Completely Clickable Contest Card */
.contest-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
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
    top: 16px; right: 16px;
    z-index: 10;
    
    span {
      padding: 4px 10px;
      background: var(--stage-bg);
      color: var(--stage-text);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      backdrop-filter: blur(8px);
    }
  }

  .card-cover {
    height: 120px; /* More compact */
    position: relative;
    overflow: hidden;

    img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .cover-overlay {
      position: absolute;
      bottom: 12px; left: 12px;
      
      .meta-tag {
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        backdrop-filter: blur(8px);
      }
    }
  }

  &:hover .card-cover img {
    transform: scale(1.05);
  }

  .card-content {
    padding: 16px; /* Tighter padding */
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 12px; /* Tighter gap */
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;

    .card-title {
      font-size: 18px; /* Slightly smaller */
      font-weight: 700;
      color: var(--oj-ink);
      margin: 0;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .signal-dot {
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 800;
      color: var(--stage-text);
      background: var(--stage-bg);
      padding: 3px 6px;
      border-radius: 6px;
      text-transform: uppercase;
    }
  }

  .time-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px; /* Tighter gap */
    
    .time-block {
      background: #f5f5f7;
      padding: 10px 12px;
      border-radius: 12px;

      .time-label {
        font-size: 10px;
        font-weight: 800;
        color: var(--oj-subtle);
        margin-bottom: 2px;
        display: block;
      }
      
      .time-date {
        font-size: 14px;
        font-weight: 700;
        color: var(--oj-ink);
        display: block;
      }

      .time-hour {
        font-size: 12px;
        color: var(--oj-muted);
        display: block;
        line-height: 1.1;
      }
    }
  }

  .action-row {
    margin-top: auto;
    display: flex;
    
    .visual-btn, .status-note {
      width: 100%;
      text-align: center;
      padding: 10px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .visual-btn {
      background: var(--oj-surface-soft);
      color: var(--oj-ink);
      
      &.primary {
        background: var(--oj-ink);
        color: #fff;
      }
    }

    .status-note {
      font-weight: 500;
      &.reserved { background: var(--oj-accent-soft); color: #B26800; }
      &.closed { background: #f5f5f7; color: var(--oj-muted); }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

/* Hall of Fame Sidebar Styles */
.sidebar-section {
  display: flex;
  flex-direction: column;
}

.hall-of-fame-card {
  position: sticky;
  top: 100px;
  padding: 24px;
  
  .card-header {
    margin-bottom: 24px;
    
    .kicker {
      font-size: 12px;
      font-weight: 800;
      color: var(--oj-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    h3 {
      font-size: 20px;
      font-weight: 800;
      color: var(--oj-ink);
      margin: 6px 0 8px;
      line-height: 1.2;
    }
    
    p {
      font-size: 13px;
      color: var(--oj-muted);
      margin: 0;
      line-height: 1.5;
    }
  }
}

.competitor-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.competitor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(0, 122, 255, 0.04);
  }
  
  .rank-badge {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 13px;
    font-weight: 800;
    color: var(--oj-muted);
    background: #f5f5f7;
    
    &.rank-1 { background: linear-gradient(135deg, #ffe08a, #ffb340); color: #6e4a00; }
    &.rank-2 { background: linear-gradient(135deg, #eef2f7, #c9d2df); color: #4c5661; }
    &.rank-3 { background: linear-gradient(135deg, #ffd2a1, #c87435); color: #6c3d18; }
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #eee;
  }
  
  .user-info {
    flex: 1;
    min-width: 0;
    line-height: 1.2;
    
    .name-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
      
      .name {
        font-size: 14px;
        font-weight: 700;
        color: var(--oj-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .elite-checkmark {
        flex-shrink: 0;
        filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.4));
      }
    }
    
    .level-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f0f0f0;
      color: #666;
      display: inline-block;
      
      &.level-5, &.level-6 {
        background: linear-gradient(135deg, #ffeed3, #ffc774);
        color: #8c5a00;
      }
    }
  }
  
  .score-info {
    text-align: right;
    line-height: 1.2;
    
    .score {
      display: block;
      font-size: 15px;
      font-weight: 800;
      color: var(--oj-ink);
      margin-bottom: 2px;
    }
    
    .label {
      font-size: 11px;
      color: var(--oj-muted);
      font-weight: 600;
      display: block;
    }
  }
}
</style>
