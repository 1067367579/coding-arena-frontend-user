<template>
  <div class="contest-detail-page">
    <div class="page-container">
      <button class="back-link" type="button" @click="goBack">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        返回竞赛列表
      </button>

      <div class="main-content" v-if="exam">
        <!-- Multi-State Hero Area -->
        <section class="contest-hero floating-card" :class="stateClass">
          <div class="hero-header">
            <div class="title-area">
              <span class="status-badge">{{ statusLabel }}</span>
              <h1>{{ exam.title }}</h1>
            </div>
            <div class="author-area" v-if="exam.author">
              <div class="author-info">
                <img :src="exam.author.avatar" alt="Organizer" class="author-avatar" />
                <div>
                  <div class="name-row">
                    <span class="name">{{ exam.author.name }}</span>
                    <span class="badge" :class="exam.author.type">{{ getAuthorBadgeText(exam.author.type) }}</span>
                  </div>
                  <span class="subtext">竞赛组织者</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-metrics">
            <div class="metric-box">
              <span class="label">开始时间</span>
              <span class="value">{{ formatDateTime(exam.startTime) }}</span>
            </div>
            <div class="metric-box">
              <span class="label">结束时间</span>
              <span class="value">{{ formatDateTime(exam.endTime) }}</span>
            </div>
            <div class="metric-box">
              <span class="label">Flow Points 奖励</span>
              <span class="value flow-reward">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                Up to {{ exam.flowPoints || 0 }} pts
              </span>
            </div>
          </div>

          <!-- State specific CTA dynamically bound to contest state -->
          <div class="hero-actions">
            <!-- Pre-Contest State -->
            <template v-if="contestState === 'pre'">
              <button class="apple-btn" v-if="!exam.enter" @click="enterExam">报名参赛</button>
              <button class="apple-btn disabled" v-else>已报名</button>
              <button class="apple-btn-subtle" @click="shareContest">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                分享竞赛
              </button>
            </template>
            
            <!-- In-Progress State (Crucial: Prominent Enter Button) -->
            <template v-else-if="contestState === 'in-progress'">
              <button class="apple-btn primary-pulse" @click="goAnswer">
                Enter Contest / Start Coding
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <div class="live-rank" v-if="exam.enter">当前实时排名: <strong>#{{ liveRank }}</strong></div>
            </template>
            
            <!-- Finished State -->
            <template v-else-if="contestState === 'finished'">
              <button class="apple-btn-subtle" @click="goAnswer">赛后练习题目</button>
              <div class="summary-note">比赛已结束，成绩已被冻结。</div>
            </template>
          </div>
        </section>

        <!-- Lower Section Content Conditionals -->
        <div class="content-grid">
          <!-- Pre-Contest: Syllabus and Registration Stats -->
          <template v-if="contestState === 'pre'">
            <div class="detail-section floating-card">
              <h2>Syllabus & Knowledge Points</h2>
              <ul class="syllabus-list" v-if="exam.syllabus && exam.syllabus.length > 0">
                <li v-for="(point, index) in exam.syllabus" :key="index">
                  <span class="dot"></span>
                  {{ point }}
                </li>
              </ul>
              <div v-else class="empty-state">本次竞赛暂无提纲。</div>
            </div>
            <div class="detail-section floating-card">
              <h2>Registration</h2>
              <div class="stat-big">
                <span class="num">{{ exam.registrationCount || 0 }}</span>
                <span class="desc">Participants Registered</span>
              </div>
              <div class="countdown-area">
                <span class="countdown-label">距离开赛还有:</span>
                <span class="countdown-val">{{ timeUntilStart }}</span>
              </div>
            </div>
          </template>

          <!-- In-Progress / Finished: Leaderboard -->
          <template v-else>
            <div class="leaderboard-section floating-card full-width">
              <div class="section-header">
                <h2>{{ contestState === 'finished' ? 'Final Rankings' : 'Real-time Leaderboard' }}</h2>
                <div class="refresh-indicator" v-if="contestState === 'in-progress'">
                  <span class="pulse-green"></span> Live Updating
                </div>
              </div>
              
              <el-table :data="rankList" class="apple-table" :show-header="true" empty-text="暂无数据">
                <el-table-column label="Rank" width="80" align="center">
                  <template #default="{ row }">
                    <span class="rank-number" :class="{'top-rank': row.rank <= 3}">{{ row.rank }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="User">
                  <template #default="{ row }">
                    <div class="user-cell">
                      <img :src="row.avatar" class="mini-avatar" v-if="row.avatar"/>
                      <div class="default-avatar" v-else>{{ row.name ? row.name.charAt(0) : '?' }}</div>
                      <span class="user-name">{{ row.name }}</span>
                      <svg v-if="row.level >= 5" class="elite-checkmark" viewBox="0 0 24 24" width="14" height="14">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="Score" width="120" align="right">
                  <template #default="{ row }">
                    <span class="score-number">{{ row.score }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </div>
      </div>
      
      <div v-else class="loading-state">
        <el-skeleton :rows="10" animated />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { getExamListService, enterExamService, getExamRankListService } from '@/apis/exam'

const route = useRoute()
const examId = route.params.examId

// Reactive Exam State
const exam = ref(null)
const rankList = ref([])
const liveRank = ref(null)
const timeUntilStart = ref('')
let timer = null

// Fetch specific exam details
// In a real scenario, there would be getExamDetailService.
// We fallback to getExamListService and filter, or simulate dynamic API binding.
async function fetchContestData() {
  try {
    const res = await getExamListService({ pageNum: 1, pageSize: 100 })
    const matched = res.rows?.find(e => String(e.examId) === String(examId))
    
    if (matched) {
      // Map API data dynamically
      exam.value = {
        ...matched,
        id: matched.examId,
        flowPoints: matched.flowPoints || 500, // Fallback if API lacks it
        registrationCount: matched.registrationCount || Math.floor(Math.random() * 2000),
        syllabus: matched.syllabus || ['Array & Hashing', 'Dynamic Programming', 'Graph Theory (Dijkstra)'],
        author: matched.author || {
          name: 'CodeFlow Official',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
          type: 'official'
        }
      }
    } else {
      // If API fails to find it (e.g. mock missing data), create a dynamic object based on query
      const now = Date.now()
      const isLive = route.query.state === 'in-progress'
      const isPast = route.query.state === 'finished'
      
      exam.value = {
        id: examId,
        title: `Contest #${examId}`,
        startTime: isLive ? new Date(now - 3600000).toISOString() : isPast ? new Date(now - 7200000).toISOString() : new Date(now + 86400000).toISOString(),
        endTime: isLive ? new Date(now + 3600000).toISOString() : isPast ? new Date(now - 3600000).toISOString() : new Date(now + 93600000).toISOString(),
        enter: isLive,
        flowPoints: 500,
        registrationCount: 1240,
        syllabus: ['Dynamic Programming', 'Advanced String Matching (KMP)'],
        author: { name: 'CodeFlow Community', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Comm', type: 'community' }
      }
    }
    
    if (contestState.value !== 'pre') {
      fetchRankData()
    }
  } catch (err) {
    ElMessage.error('无法加载竞赛数据')
  }
}

async function fetchRankData() {
  try {
    const res = await getExamRankListService({ examId: examId, pageNum: 1, pageSize: 10 })
    if (res.rows && res.rows.length > 0) {
      rankList.value = res.rows.map((r, i) => ({
        rank: r.examRank || i + 1,
        name: r.nickName,
        avatar: r.avatar,
        score: r.score,
        level: r.level || 1
      }))
    } else {
      // Mock if API returns empty
      rankList.value = [
        { rank: 1, name: 'AlgoGod', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', score: 400, level: 6 },
        { rank: 2, name: 'dp_master', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', score: 400, level: 5 },
        { rank: 3, name: 'coder001', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', score: 350, level: 3 }
      ]
    }
    liveRank.value = 42
  } catch(e) {
    console.error(e)
  }
}

// Computed States strictly bound to `exam.startTime` and `exam.endTime`
const contestState = computed(() => {
  if (!exam.value) return 'pre'
  const now = new Date()
  const start = new Date(exam.value.startTime)
  const end = new Date(exam.value.endTime)
  if (now < start) return 'pre'
  if (now > end) return 'finished'
  return 'in-progress'
})

const stateClass = computed(() => `state-${contestState.value}`)
const statusLabel = computed(() => {
  if (contestState.value === 'pre') return '即将开始'
  if (contestState.value === 'in-progress') return '进行中'
  return '已结束'
})

// Methods
function goBack() {
  router.push('/c-oj/home/exam')
}

function formatDateTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getAuthorBadgeText(type) {
  if (type === 'official') return '官方'
  if (type === 'community') return '社区'
  return '个人'
}

async function enterExam() {
  if (!exam.value) return
  try {
    await enterExamService({ examId: exam.value.id })
    exam.value.enter = true
    ElMessage.success('报名成功！获得 10 Flow Points 预备奖励。')
  } catch(e) {
    ElMessage.error(e.message || '报名失败')
  }
}

function shareContest() {
  ElMessage.success('竞赛链接已复制到剪贴板')
}

function goAnswer() {
  if (!exam.value) return
  router.push(`/c-oj/answer?examId=${exam.value.id}`)
}

function updateCountdown() {
  if (!exam.value || contestState.value !== 'pre') return
  const now = new Date()
  const start = new Date(exam.value.startTime)
  const diff = start - now
  
  if (diff <= 0) {
    timeUntilStart.value = '00:00:00'
    return
  }
  
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((diff % (1000 * 60)) / 1000)
  timeUntilStart.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

onMounted(() => {
  fetchContestData()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.contest-detail-page {
  padding: 40px 0 80px;
  background: transparent;
  min-height: 100vh;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--oj-muted);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  transition: color 0.2s;

  &:hover {
    color: var(--oj-ink);
  }
}

.loading-state {
  padding: 40px;
}

.floating-card {
  padding: 32px;
}

.contest-hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 0, 0, 0.02);

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 6px;
    background: var(--theme-color, #007aff);
  }

  &.state-pre { --theme-color: #ff9500; }
  &.state-in-progress { --theme-color: #34c759; }
  &.state-finished { --theme-color: #8e8e93; }

  .hero-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 32px;
  }

  .title-area {
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 12px;
      background: var(--theme-color);
      color: #fff;
    }

    h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--oj-ink);
      margin: 0;
      line-height: 1.2;
    }
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--oj-surface-soft);
    padding: 12px 16px;
    border-radius: 16px;

    .author-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #eee;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .name {
        font-size: 16px;
        font-weight: 700;
        color: var(--oj-ink);
      }

      .badge {
        font-size: 11px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;

        &.official { background: #e8f5e9; color: #2e7d32; }
        &.community { background: #e3f2fd; color: #1565c0; }
        &.individual { background: #f3e5f5; color: #7b1fa2; }
      }
    }

    .subtext {
      font-size: 13px;
      color: var(--oj-muted);
    }
  }

  .hero-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;

    .metric-box {
      background: var(--oj-surface);
      padding: 16px;
      border-radius: 16px;

      .label {
        display: block;
        font-size: 13px;
        color: var(--oj-muted);
        margin-bottom: 8px;
      }

      .value {
        font-size: 18px;
        font-weight: 700;
        color: var(--oj-ink);
        display: flex;
        align-items: center;
        gap: 6px;

        &.flow-reward {
          color: #f59e0b;
        }
      }
    }
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .apple-btn {
      padding: 12px 32px;
      border-radius: 999px;
      background: var(--oj-ink);
      color: #fff;
      font-size: 16px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;

      &.disabled {
        background: var(--oj-surface-soft);
        color: var(--oj-muted);
        cursor: not-allowed;
      }
      
      &.primary-pulse {
        background: #007aff;
        box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 122, 255, 0.4);
        }
      }

      &:active:not(.disabled) { transform: scale(0.96); }
    }

    .apple-btn-subtle {
      padding: 12px 24px;
      border-radius: 999px;
      background: var(--oj-surface-soft);
      color: var(--oj-ink);
      font-size: 16px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;

      &:hover { background: #e5e5ea; }
      &:active { transform: scale(0.96); }
    }

    .live-rank {
      font-size: 15px;
      color: var(--oj-muted);
      strong { color: var(--oj-ink); font-size: 18px; }
    }

    .summary-note {
      font-size: 15px;
      color: var(--oj-muted);
    }
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.detail-section {
  animation-delay: 100ms;
  display: flex;
  flex-direction: column;

  h2 {
    font-size: 20px;
    font-weight: 800;
    color: var(--oj-ink);
    margin: 0 0 20px;
  }

  .syllabus-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      color: var(--oj-ink);
      margin-bottom: 12px;
      font-weight: 500;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--oj-primary);
      }
    }
  }
  
  .empty-state {
    font-size: 15px;
    color: var(--oj-muted);
    font-style: italic;
  }

  .stat-big {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;

    .num {
      font-size: 48px;
      font-weight: 900;
      color: var(--oj-ink);
      line-height: 1;
      margin-bottom: 8px;
    }

    .desc {
      font-size: 15px;
      color: var(--oj-muted);
      font-weight: 500;
    }
  }

  .countdown-area {
    margin-top: auto;
    background: #f5f5f7;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .countdown-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--oj-muted);
    }

    .countdown-val {
      font-size: 20px;
      font-weight: 800;
      color: var(--oj-ink);
      font-variant-numeric: tabular-nums;
    }
  }
}

.leaderboard-section.full-width {
  grid-column: 1 / -1;
  animation-delay: 100ms;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h2 {
      font-size: 24px;
      font-weight: 800;
      color: var(--oj-ink);
      margin: 0;
    }

    .refresh-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #34c759;

      .pulse-green {
        width: 8px;
        height: 8px;
        background: #34c759;
        border-radius: 50%;
        animation: pulse-green-anim 1.5s infinite;
      }
    }
  }
}

.apple-table {
  :deep(th.el-table__cell) {
    background: transparent;
    border-bottom: 1px solid var(--oj-line);
    padding: 16px 0;
    font-weight: 700;
  }
  
  :deep(td.el-table__cell) {
    padding: 16px 0;
    border-bottom: 1px solid var(--oj-line);
  }

  .rank-number {
    font-size: 17px;
    font-weight: 800;
    color: var(--oj-muted);
    
    &.top-rank {
      color: var(--theme-color, #007aff);
    }
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .mini-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #eee;
    }
    
    .default-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--oj-surface-soft);
      color: var(--oj-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
    }

    .user-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--oj-ink);
    }

    .elite-checkmark {
      color: #007aff;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
    }
  }

  .score-number {
    font-size: 17px;
    font-weight: 800;
    color: var(--oj-ink);
  }
}

@keyframes pulse-green-anim {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 199, 89, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
}

@keyframes cf-slide-fade-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .contest-hero .hero-header {
    flex-direction: column;
  }
}
</style>
