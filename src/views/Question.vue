<template>
  <div class="apple-question-page">
    <div class="page-container">
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
import { reactive, ref } from "vue"
import Selector from "@/components/QuestionSelector.vue"
import { getQuestionListService, getHotQuestionListService } from '@/apis/question'
import { getToken } from "@/utils/cookie"
import router from "@/router"
import { getUserInfoService } from "@/apis/user"

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

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 32px;
  align-items: start;
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
  background: #f3f5f8;
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
      transition: background 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
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

.table-container {
  margin-top: 8px;

  .apple-table {
    :deep(td.el-table__cell) {
      padding: 24px 0 !important;
      border-bottom: 1px solid var(--oj-line) !important;
      background: transparent !important;
    }
    :deep(.el-table__row:last-child td.el-table__cell) {
      border-bottom: none !important;
    }
    :deep(.el-table__row:hover td.el-table__cell) {
      background: transparent !important;
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
        color: #257653;
        background: #eaf7f1;
        border-color: #caebdc;
      }

      &.medium {
        color: #8b641f;
        background: #fff5df;
        border-color: #f3dfb6;
      }

      &.hard {
        color: #9a4b4b;
        background: #fff0f0;
        border-color: #f0cdcd;
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
    transition: background 0.2s;

    svg {
      transition: transform 0.2s;
    }

    &:hover {
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
    transition: background 0.2s;
    margin: -8px;

    &:hover {
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
  .content-grid {
    grid-template-columns: 1fr;
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
