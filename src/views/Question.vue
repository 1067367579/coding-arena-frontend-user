<template>
  <div class="apple-question-page">
    <div class="page-container">
      <section class="problem-set-square">
        <div class="square-heading">
          <div>
            <span class="square-kicker">Problem Set Square</span>
            <h2>Featured Problem Sets</h2>
            <p>像挑选歌单一样选择训练主题，把今天的练习节奏交给一组精心编排的题单。</p>
          </div>
          <button class="square-link" type="button" @click="openProblemSetGallery">
            查看题单广场
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <div class="set-gallery">
          <article
            v-for="(set, index) in featuredProblemSets"
            :key="set.id"
            class="set-card"
            :class="set.gradientClass"
            :style="{ '--stagger': `${index * 55}ms` }"
            tabindex="0"
            role="button"
            @click="openProblemSet(set.id)"
            @keyup.enter="openProblemSet(set.id)"
          >
            <div class="set-card-shine"></div>
            <div class="set-card-top">
              <span>{{ set.eyebrow }}</span>
              <strong>{{ set.total }} 题</strong>
            </div>
            <div class="set-card-body">
              <h3>{{ set.title }}</h3>
              <p>{{ set.description }}</p>
            </div>
            <div class="set-card-footer">
              <span>{{ set.focus }}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </div>
          </article>
        </div>
      </section>

      <div class="content-grid">
        
        <!-- Left: Main Problem List -->
        <div class="main-column">
          <div class="floating-card problem-workbench">
            <div class="workbench-header">
              <div class="header-titles">
                <span class="kicker">Problem Set</span>
                <h1 class="title">精选题库</h1>
                <p class="subtitle">优雅地筛选题目，专注代码本身。</p>
              </div>
              <div class="progress-pill">
                <span class="value">{{ questionList.length }} / {{ total }}</span>
                <span class="label">当前结果</span>
              </div>
            </div>

            <div class="workbench-toolbar">
              <div class="search-box">
                <el-input v-model="params.keyword" placeholder="搜索题目标题或内容" class="apple-input">
                  <template #prefix>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </template>
                </el-input>
              </div>
              <div class="filter-box">
                <selector v-model="params.difficulty"></selector>
              </div>
              <div class="action-box">
                <button class="apple-btn" @click="onSearch">筛选</button>
                <button class="apple-btn-subtle" @click="onReset">重置</button>
              </div>
            </div>

            <div class="table-container">
              <el-table :data="questionList" class="apple-table" :show-header="false">
                <el-table-column width="60" align="center">
                  <template #default="{ $index }">
                    <span class="row-index">{{ (params.pageNum - 1) * params.pageSize + $index + 1 }}</span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="title" min-width="300">
                  <template #default="{ row }">
                    <div class="question-title-cell">
                      <span class="title-text">{{ row.title }}</span>
                      <span class="difficulty-pill" :class="getDifficultyClass(row.difficulty)">
                        {{ getDifficultyLabel(row.difficulty) }}
                      </span>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column width="140" align="right">
                  <template #default="{ row }">
                    <button class="solve-btn" v-if="isLogin" @click="goQuestTest(row.questionId)">
                      开始答题
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                    <span class="login-prompt" v-else>需登录</span>
                  </template>
                </el-table-column>
              </el-table>
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
          </div>
        </div>

        <!-- Right: Sidebar -->
        <div class="side-column">
          <div class="floating-card ai-insight-card">
            <div class="ai-greeting">
              <span class="ai-kicker">CodeFlow Insight</span>
              <h3>今天适合稳定推进。</h3>
              <p>保持一组高质量提交，比刷很多题更重要。</p>
            </div>

            <div class="ai-recommendation">
              <div class="recommend-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v4"></path>
                  <path d="M12 18v4"></path>
                  <path d="m4.93 4.93 2.83 2.83"></path>
                  <path d="m16.24 16.24 2.83 2.83"></path>
                  <path d="M2 12h4"></path>
                  <path d="M18 12h4"></path>
                  <path d="m4.93 19.07 2.83-2.83"></path>
                  <path d="m16.24 7.76 2.83-2.83"></path>
                </svg>
              </div>
              <div>
                <span>AI Recommendations</span>
                <strong>Strengthen your “Recursion” today</strong>
              </div>
            </div>

            <div class="goal-tracker">
              <div class="goal-copy">
                <span>Daily Solved Problems</span>
                <strong>{{ todaySolved }} / {{ dailyGoal }}</strong>
              </div>
              <div class="goal-ring" :style="{ '--progress': `${dailyProgress}deg` }">
                <span>{{ dailyProgressText }}</span>
              </div>
            </div>

            <div class="active-study-plan" v-if="activeStudyPlan">
              <span>Active Study Plan</span>
              <strong>{{ activeStudyPlan.title }}</strong>
              <p>{{ activeStudyPlan.focus }} · {{ activeStudyPlan.total }} 题</p>
              <button type="button" @click="openProblemSet(activeStudyPlan.id)">继续计划</button>
            </div>

            <div class="active-study-plan empty" v-else>
              <span>Active Study Plan</span>
              <strong>选择一张题单开始</strong>
              <p>加入计划后，这里会同步显示你的每日目标。</p>
            </div>
          </div>

          <div class="floating-card heatmap-card">
            <div class="heatmap-header">
              <div>
                <h3 class="card-title">学习足迹</h3>
                <p>近 12 周提交热度</p>
              </div>
              <div class="heatmap-today">
                <strong>{{ todayFootprint.count }}</strong>
                <span>今日 AC</span>
              </div>
            </div>
            <div class="heatmap-container">
              <div class="heatmap-months">
                <span v-for="item in heatmapMonthLabels" :key="item.key" :style="{ gridColumn: item.column }">
                  {{ item.label }}
                </span>
              </div>
              <div class="heatmap-grid">
                <div v-for="week in heatmapWeeks" :key="week.key" class="heatmap-col">
                  <div v-for="day in week.days" :key="day.date"
                       class="heatmap-cell" 
                       :class="'level-' + day.level"
                       :title="`${day.label}，AC ${day.count} 题`">
                  </div>
                </div>
              </div>
              <div class="heatmap-insight">
                <span>最近活跃：{{ activeFootprint.label }}</span>
                <strong>AC {{ activeFootprint.count }} 题</strong>
              </div>
              <div class="heatmap-legend">
                <span>少</span>
                <div class="heatmap-cell level-0"></div>
                <div class="heatmap-cell level-1"></div>
                <div class="heatmap-cell level-2"></div>
                <div class="heatmap-cell level-3"></div>
                <div class="heatmap-cell level-4"></div>
                <span>多</span>
              </div>
            </div>
          </div>

          <div class="floating-card hot-card">
            <h3 class="card-title">热门题目</h3>
            <div class="hot-list">
              <div class="hot-item" v-for="(item, index) in hotQuestionList" :key="'hot_' + index" @click="goQuestTest(item.questionId)">
                <span class="hot-rank" :class="{'top-3': index < 3}">{{ index + 1 }}</span>
                <span class="hot-title">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue"
import Selector from "@/components/QuestionSelector.vue"
import { getQuestionListService, getHotQuestionListService } from '@/apis/question'
import { getToken } from "@/utils/cookie"
import router from "@/router"
import { getUserInfoService } from "@/apis/user"
import { featuredProblemSets } from "@/data/problemSets"
import { getJoinedStudyPlanId, onStudyPlanChange } from "@/utils/studyPlan"

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  difficulty: '',
  keyword: ''
})
const questionList = ref([])
const total = ref(0)
const isLogin = ref(false)

const heatmapDays = createHeatmapDays()
const heatmapWeeks = Array.from({ length: 12 }, (_, weekIndex) => ({
  key: `week-${weekIndex}`,
  days: heatmapDays.slice(weekIndex * 7, weekIndex * 7 + 7)
}))
const heatmapMonthLabels = createMonthLabels(heatmapDays)
const todayFootprint = heatmapDays[heatmapDays.length - 1]
const activeFootprint = [...heatmapDays].reverse().find((item) => item.count > 0) || todayFootprint
const dailyGoal = 3
const todaySolved = computed(() => Math.min(todayFootprint.count, dailyGoal))
const dailyProgressText = computed(() => `${Math.round((todaySolved.value / dailyGoal) * 100)}%`)
const dailyProgress = computed(() => Math.round((todaySolved.value / dailyGoal) * 360))
const activeStudyPlanId = ref(getJoinedStudyPlanId())
const activeStudyPlan = computed(() => featuredProblemSets.find((item) => item.id === activeStudyPlanId.value))

let stopStudyPlanListener = null
onMounted(() => {
  stopStudyPlanListener = onStudyPlanChange((planId) => {
    activeStudyPlanId.value = planId
  })
})

onUnmounted(() => {
  stopStudyPlanListener?.()
})

async function checkLogin() {
  if (getToken()) {
    try {
      await getUserInfoService()
      isLogin.value = true
    } catch (e) {}
  }
}
checkLogin()

async function getQuestionList() {
  try {
    const result = await getQuestionListService(params)
    questionList.value = result.rows
    total.value = result.total
  } catch (e) {}
}
getQuestionList()

const hotQuestionList = ref([])
async function getHotQuestionList() {
  try {
    const hotRef = await getHotQuestionListService(8)
    hotQuestionList.value = hotRef.data
  } catch (e) {}
}
getHotQuestionList()

function onSearch() {
  params.pageNum = 1
  getQuestionList()
}

function onReset() {
  params.pageNum = 1
  params.pageSize = 10
  params.difficulty = ''
  params.keyword = ''
  getQuestionList()
}

function handleCurrentChange(newPage) {
  getQuestionList()
}

function goQuestTest(questionId) {
  if (!isLogin.value) {
    router.push('/c-oj/login');
    return;
  }
  router.push(`/c-oj/answer?questionId=${questionId}`)
}

function openProblemSet(setId) {
  router.push(`/c-oj/home/problem-set/${setId}`)
}

function openProblemSetGallery() {
  router.push('/c-oj/home/problem-set-gallery')
}

function getDifficultyClass(difficulty) {
  if (difficulty === 1) return 'easy';
  if (difficulty === 2) return 'medium';
  if (difficulty === 3) return 'hard';
  return '';
}

function getDifficultyLabel(difficulty) {
  if (difficulty === 1) return '简单'
  if (difficulty === 2) return '中等'
  if (difficulty === 3) return '困难'
  return '未分级'
}

function createHeatmapDays() {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
  const today = new Date()
  return Array.from({ length: 84 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (83 - index))
    const seed = (index * 7 + date.getDate() * 3 + date.getMonth() * 11) % 10
    const count = seed < 2 ? 0 : seed < 5 ? 1 : seed < 7 ? 2 : seed < 9 ? 4 : 7
    return {
      date: date.toISOString().slice(0, 10),
      label: formatter.format(date),
      count,
      level: count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4
    }
  })
}

function createMonthLabels(days) {
  const labels = []
  let lastLabel = ''
  days.forEach((day, index) => {
    const date = new Date(day.date)
    const label = `${date.getMonth() + 1}月`
    if (label !== lastLabel && index % 7 <= 2) {
      labels.push({
        key: `${label}-${index}`,
        label,
        column: `${Math.floor(index / 7) + 1} / span 2`
      })
      lastLabel = label
    }
  })
  return labels
}
</script>

<style lang="scss" scoped>
.apple-question-page {
  padding: 40px 0 80px;
  width: 100%;
}

.page-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
}

.problem-set-square {
  margin-bottom: clamp(28px, 5vw, 48px);
  animation: cf-slide-fade-up 360ms var(--motion-spring-soft) both;
}

.square-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;

  .square-kicker {
    color: var(--oj-muted);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    margin: 8px 0 8px;
    color: var(--oj-ink);
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 850;
    line-height: 1.06;
    letter-spacing: -0.02em;
  }

  p {
    max-width: 620px;
    margin: 0;
    color: var(--oj-muted);
    font-size: 15px;
    line-height: 1.7;
  }
}

.square-link {
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  border-radius: 999px;
  color: #fff;
  background: #1d1d1f;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.12);
  transition:
    transform var(--motion-mid) var(--motion-spring),
    box-shadow var(--motion-mid) var(--motion-spring-soft),
    background var(--motion-fast) var(--motion-spring-soft);

  &:hover {
    transform: translateY(-2px);
    background: #000;
    box-shadow: 0 22px 42px rgba(0, 0, 0, 0.18);
  }
}

.set-gallery {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.set-card {
  position: relative;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  border-radius: 16px;
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 18px 42px rgba(29, 29, 31, 0.13);
  isolation: isolate;
  animation: cf-slide-fade-up 360ms var(--motion-spring-soft) both;
  animation-delay: var(--stagger);
  transform-origin: center bottom;
  transition:
    transform var(--motion-mid) var(--motion-spring),
    box-shadow var(--motion-mid) var(--motion-spring-soft),
    filter var(--motion-mid) var(--motion-spring-soft);
  will-change: transform, filter;

  &:hover,
  &:focus-visible {
    transform: scale(1.05) translateY(-4px);
    box-shadow: 0 30px 64px rgba(29, 29, 31, 0.22);
    filter: saturate(1.05);
  }

  &:focus-visible {
    outline: 3px solid rgba(0, 122, 255, 0.28);
    outline-offset: 4px;
  }

  &.from-emerald-to-teal {
    background:
      radial-gradient(circle at 78% 12%, rgba(255, 255, 255, 0.38), transparent 28%),
      linear-gradient(135deg, #0f9f6e 0%, #05a7a0 100%);
  }

  &.from-sky-to-indigo {
    background:
      radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.34), transparent 30%),
      linear-gradient(135deg, #0a84ff 0%, #4554d8 100%);
  }

  &.from-indigo-to-violet {
    background:
      radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.32), transparent 28%),
      linear-gradient(135deg, #3f46d8 0%, #8d3ed6 100%);
  }

  &.from-amber-to-rose {
    background:
      radial-gradient(circle at 76% 16%, rgba(255, 255, 255, 0.36), transparent 28%),
      linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%);
  }
}

.set-card-shine {
  position: absolute;
  inset: 1px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  pointer-events: none;
  z-index: -1;
}

.set-card-top,
.set-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.set-card-top {
  span {
    color: rgba(255, 255, 255, 0.72);
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    padding: 5px 9px;
    border-radius: 999px;
    color: #fff;
    background: rgba(255, 255, 255, 0.18);
    font-size: 12px;
    font-weight: 850;
    backdrop-filter: blur(14px);
  }
}

.set-card-body {
  h3 {
    margin: 0 0 10px;
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 900;
    line-height: 1.04;
    letter-spacing: -0.03em;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.58;
  }
}

.set-card-footer {
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  font-weight: 800;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 30%);
  gap: 32px;
  align-items: start;
}

.content-grid > * {
  animation: cf-slide-fade-up 360ms var(--motion-spring-soft) both;
}

.content-grid > *:nth-child(2) {
  animation-delay: 80ms;
}

/* Left Column */
.problem-workbench {
  padding: clamp(24px, 4vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.workbench-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-titles {
    .kicker {
      font-size: 13px;
      font-weight: 600;
      color: var(--oj-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .title {
      font-size: 32px;
      font-weight: 700;
      color: var(--oj-ink);
      margin: 8px 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 15px;
      color: var(--oj-muted);
      margin: 0;
    }
  }

  .progress-pill {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    background: var(--oj-surface-soft);
    padding: 12px 20px;
    border-radius: 20px;

    .value {
      font-size: 20px;
      font-weight: 600;
      color: var(--oj-ink);
    }
    .label {
      font-size: 12px;
      color: var(--oj-muted);
      margin-top: 2px;
    }
  }
}

.workbench-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  background: rgba(0, 0, 0, 0.035);
  border: 1px solid rgba(0, 0, 0, 0.01);
  padding: 12px;
  border-radius: 20px;

  .search-box {
    flex: 1 1 260px;
    min-width: min(100%, 220px);
  }
  .filter-box {
    flex: 0 1 140px;
  }
  .action-box {
    display: flex;
    gap: 8px;
  }

  .apple-input {
    :deep(.el-input__wrapper) {
      background: #fff !important;
      box-shadow: none !important;
      border: 1px solid transparent !important;
      border-radius: 16px !important;
      height: 40px;
      padding-left: 14px;
      padding-right: 16px;
      transition:
        background var(--motion-mid) var(--motion-spring-soft),
        box-shadow var(--motion-mid) var(--motion-spring-soft),
        border-color var(--motion-mid) var(--motion-spring-soft),
        transform var(--motion-mid) var(--motion-spring);
    }

    :deep(.el-input__wrapper:hover) {
      background: #fbfcff !important;
    }

    :deep(.el-input__wrapper.is-focus) {
      background: #fff !important;
      border-color: rgba(46, 144, 250, 0.18) !important;
      box-shadow:
        0 0 0 4px rgba(46, 144, 250, 0.11),
        0 10px 24px rgba(46, 144, 250, 0.08) !important;
      transform: translateY(-1px);
    }

    :deep(.el-input__prefix) {
      margin-right: 12px;
      color: var(--oj-subtle);
      transition: color 0.22s ease;
    }

    :deep(.el-input__wrapper.is-focus .el-input__prefix) {
      color: var(--oj-primary);
    }

    :deep(.el-input__inner) {
      padding-left: 2px;
      font-weight: 500;
    }
  }

  .apple-btn {
    height: 40px;
    padding: 0 20px;
    border-radius: 12px;
    background: var(--oj-ink);
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .apple-btn-subtle {
    height: 40px;
    padding: 0 20px;
    border-radius: 12px;
    background: transparent;
    color: var(--oj-ink);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    &:hover {
      background: var(--oj-line);
    }
  }
}

.problem-workbench:has(.el-input__wrapper.is-focus) {
  .workbench-header,
  .pagination-container {
    opacity: 0.64;
    filter: saturate(0.82) blur(0.2px);
    transform: scale(0.995);
  }

  .table-container {
    filter: saturate(0.88);
  }
}

.problem-workbench .workbench-header,
.problem-workbench .pagination-container,
.problem-workbench .table-container {
  transition:
    opacity var(--motion-mid) var(--motion-spring-soft),
    filter var(--motion-mid) var(--motion-spring-soft),
    transform var(--motion-mid) var(--motion-spring);
}

.table-container {
  margin-top: 8px;

  .apple-table {
    :deep(.el-table__row) {
      opacity: 0;
      animation: cf-slide-fade-left 340ms var(--motion-spring-soft) both;
      animation-delay: calc(var(--row-index, 0) * 52ms);
      will-change: transform, opacity;
    }

    :deep(.el-table__row:nth-child(1)) { --row-index: 0; }
    :deep(.el-table__row:nth-child(2)) { --row-index: 1; }
    :deep(.el-table__row:nth-child(3)) { --row-index: 2; }
    :deep(.el-table__row:nth-child(4)) { --row-index: 3; }
    :deep(.el-table__row:nth-child(5)) { --row-index: 4; }
    :deep(.el-table__row:nth-child(6)) { --row-index: 5; }
    :deep(.el-table__row:nth-child(7)) { --row-index: 6; }
    :deep(.el-table__row:nth-child(8)) { --row-index: 7; }
    :deep(.el-table__row:nth-child(9)) { --row-index: 8; }
    :deep(.el-table__row:nth-child(10)) { --row-index: 9; }

    :deep(td.el-table__cell) {
      padding: 24px 0 !important;
      border-bottom: 1px solid var(--oj-line) !important;
      background: transparent !important;
    }
    :deep(.el-table__row:last-child td.el-table__cell) {
      border-bottom: none !important;
    }
    :deep(.el-table__row:hover td.el-table__cell) {
      background: rgba(0, 122, 255, 0.035) !important;
    }
  }

  .row-index {
    font-size: 15px;
    font-weight: 500;
    color: var(--oj-subtle);
  }

  .question-title-cell {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;

    .title-text {
      font-size: 17px;
      font-weight: 500;
      color: var(--oj-ink);
    }

    .difficulty-pill {
      min-width: 48px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0;
      border: 1px solid transparent;

      &.easy {
        color: #fff;
        background: #248A3D;
        border-color: #1F7A35;
      }

      &.medium {
        color: #fff;
        background: #C65D00;
        border-color: #A84F00;
      }

      &.hard {
        color: #fff;
        background: #D70015;
        border-color: #B80012;
      }
    }
  }

  .solve-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--oj-primary);
    font-size: 15px;
    font-weight: 500;
    background: transparent;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 16px;
    transition:
      transform var(--motion-mid) var(--motion-spring),
      background var(--motion-fast) var(--motion-spring-soft),
      color var(--motion-fast) var(--motion-spring-soft);

    svg {
      transition: transform 0.2s;
    }

    &:hover {
      transform: translateY(-2px);
      background: var(--oj-primary-soft);
      svg {
        transform: translateX(4px);
      }
    }
  }

  .login-prompt {
    font-size: 14px;
    color: var(--oj-subtle);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* Right Column */
.side-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.side-column > .floating-card {
  animation: cf-slide-fade-left 360ms var(--motion-spring-soft) both;
}

.side-column > .floating-card:nth-child(1) { animation-delay: 120ms; }
.side-column > .floating-card:nth-child(2) { animation-delay: 180ms; }
.side-column > .floating-card:nth-child(3) { animation-delay: 240ms; }

.ai-insight-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(242, 248, 255, 0.9)),
    var(--oj-surface);
  border: 1px solid rgba(46, 144, 250, 0.08);
}

.ai-greeting {
  .ai-kicker {
    color: #6c7889;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  h3 {
    margin: 8px 0 6px;
    color: var(--oj-ink);
    font-size: 20px;
    font-weight: 800;
    line-height: 1.25;
  }

  p {
    margin: 0;
    color: var(--oj-muted);
    font-size: 13px;
    line-height: 1.55;
  }
}

.ai-recommendation {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: rgba(0, 122, 255, 0.07);

  .recommend-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: #007AFF;
    background: #fff;
    box-shadow: 0 8px 20px rgba(0, 122, 255, 0.1);
  }

  span,
  strong {
    display: block;
  }

  span {
    color: #6c7889;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
  }

  strong {
    margin-top: 3px;
    color: var(--oj-ink);
    font-size: 13px;
    line-height: 1.35;
  }
}

.goal-tracker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 2px;

  .goal-copy {
    span,
    strong {
      display: block;
    }

    span {
      color: var(--oj-muted);
      font-size: 12px;
      font-weight: 700;
    }

    strong {
      margin-top: 4px;
      color: var(--oj-ink);
      font-size: 22px;
      font-weight: 800;
    }
  }

  .goal-ring {
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background:
      conic-gradient(#007AFF var(--progress), #edf2f7 0deg);
    position: relative;

    &::after {
      content: "";
      position: absolute;
      inset: 7px;
      border-radius: 50%;
      background: #fff;
    }

    span {
      position: relative;
      z-index: 1;
      color: var(--oj-ink);
      font-size: 12px;
      font-weight: 800;
    }
  }
}

.active-study-plan {
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(0, 122, 255, 0.1);

  span,
  strong,
  p {
    display: block;
  }

  span {
    color: #6c7889;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  strong {
    margin-top: 7px;
    color: var(--oj-ink);
    font-size: 16px;
    font-weight: 850;
  }

  p {
    margin: 5px 0 14px;
    color: var(--oj-muted);
    font-size: 12px;
    line-height: 1.45;
  }

  button {
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    color: #fff;
    background: var(--oj-primary);
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  &.empty {
    background: rgba(255, 255, 255, 0.58);
  }
}

.training-card {
  padding: 32px;
  background: linear-gradient(145deg, var(--oj-surface), var(--oj-surface-soft));
  
  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: var(--oj-primary-soft);
    color: var(--oj-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .side-title {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--oj-muted);
    text-transform: uppercase;
  }

  .side-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--oj-ink);
    margin: 8px 0;
  }

  .side-desc {
    font-size: 14px;
    line-height: 1.5;
    color: var(--oj-muted);
    margin: 0;
  }
}

.heatmap-card {
  margin-bottom: 24px;
  padding: 24px;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;

  .card-title {
    margin: 0;
  }

  p {
    margin: 6px 0 0;
    color: var(--oj-muted);
    font-size: 13px;
  }
}

.heatmap-today {
  min-width: 72px;
  padding: 10px 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--oj-primary-soft), #fff);
  text-align: right;

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--oj-primary-strong);
    font-size: 20px;
    line-height: 1;
  }

  span {
    margin-top: 4px;
    color: var(--oj-muted);
    font-size: 11px;
    font-weight: 700;
  }
}

.heatmap-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.heatmap-months {
  display: grid;
  grid-template-columns: repeat(12, 13px);
  gap: 4px;
  padding-left: 1px;
  color: var(--oj-subtle);
  font-size: 10px;
  font-weight: 800;
}

.heatmap-grid {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
}

.heatmap-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.heatmap-cell {
  width: 13px;
  height: 13px;
  border-radius: 4px;
  background-color: #ebedf0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &.level-0 { background-color: #ebedf0; }
  &.level-1 { background-color: #9be9a8; }
  &.level-2 { background-color: #40c463; }
  &.level-3 { background-color: #30a14e; }
  &.level-4 { background-color: #216e39; }

  &:hover {
    transform: translateY(-1px) scale(1.12);
    box-shadow: 0 0 0 2px rgba(22, 131, 74, 0.16);
  }
}

.heatmap-insight {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--oj-surface-soft);
  color: var(--oj-muted);
  font-size: 12px;

  strong {
    color: var(--oj-primary-strong);
    white-space: nowrap;
  }
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  font-size: 12px;
  color: var(--oj-muted);

  span {
    margin: 0 4px;
  }
}

.hot-card {
  padding: 32px;

  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--oj-ink);
    margin: 0 0 24px 0;
  }

  .hot-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .hot-item {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px;
    border-radius: 12px;
    transition:
      transform var(--motion-mid) var(--motion-spring),
      background var(--motion-fast) var(--motion-spring-soft);
    margin: -8px;

    &:hover {
      transform: translateX(4px);
      background: var(--oj-surface-soft);
    }

    .hot-rank {
      width: 24px;
      font-size: 15px;
      font-weight: 600;
      color: var(--oj-subtle);
      text-align: center;

      &.top-3 {
        color: var(--oj-primary);
      }
    }

    .hot-title {
      font-size: 15px;
      color: var(--oj-ink);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

@media (max-width: 1024px) {
  .set-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .problem-workbench {
    padding: 24px;
  }
}

@media (max-width: 720px) {
  .apple-question-page {
    padding: 24px 0 56px;
  }

  .page-container {
    padding: 0 12px;
  }

  .square-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .square-link {
    width: 100%;
  }

  .set-gallery {
    grid-template-columns: 1fr;
  }

  .set-card {
    min-height: 220px;
  }

  .problem-workbench {
    gap: 24px;
    padding: 20px;
  }

  .workbench-header {
    flex-direction: column;
    gap: 18px;

    .progress-pill {
      align-items: flex-start;
      width: 100%;
    }
  }

  .workbench-toolbar {
    gap: 10px;
    border-radius: 18px;

    .search-box,
    .filter-box,
    .action-box {
      width: 100%;
      flex-basis: 100%;
    }

    .action-box {
      .apple-btn,
      .apple-btn-subtle {
        flex: 1;
      }
    }
  }

  .side-column {
    display: flex;
  }

  .table-container {
    overflow-x: hidden;

    .apple-table {
      :deep(.el-table__cell) {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
    }

    .question-title-cell {
      gap: 8px;

      .title-text {
        max-width: 100%;
        font-size: 16px;
      }
    }

    .solve-btn {
      padding: 8px 6px;
      font-size: 14px;
    }
  }
}
</style>
