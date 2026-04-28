<template>
  <div class="apple-my-exam-page">
    <div class="page-container">
      <div class="header-section">
        <h1 class="page-title">我的竞赛</h1>
        <button class="apple-btn-subtle back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回
        </button>
      </div>

      <div class="exam-list">
        <div class="floating-card exam-item" v-for="(exam, index) in myExamList" :key="index">
          <div class="item-icon">
            <img src="@/assets/ide/jingsai.png" alt="竞赛图标" />
          </div>
          
          <div class="item-content">
            <h3 class="exam-title">{{ exam.title }}</h3>
            <div class="exam-time">
              <span class="time-label">比赛时间:</span>
              <span class="time-value">{{ exam.startTime }} ~ {{ exam.endTime }}</span>
            </div>
          </div>
          
          <div class="item-actions">
            <template v-if="isHistoryExam(exam)">
              <span class="status-badge closed">已完赛</span>
              <button class="apple-btn-subtle" @click="togglePopover(exam.examId)">查看排名</button>
              <button class="apple-btn" @click="goHistoryExam(exam)">复盘练习</button>
            </template>
            <template v-else-if="isNotStart(exam)">
              <span class="status-badge reserved">未开赛</span>
            </template>
            <template v-else>
              <button class="apple-btn" @click="goExam(exam)">开始答题</button>
            </template>
          </div>
        </div>
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
</template>

<script setup>
import { reactive, ref } from 'vue'
import { getMyExamListService } from "@/apis/exam"
import router from '@/router'
import { ElMessage } from 'element-plus'

const myExamList = ref([])
const total = ref(0)
const params = reactive({
  pageNum: 1,
  pageSize: 10,
  type: 2
})

function handleCurrentChange(newPage) {
  getMyExamList()
}

async function getMyExamList() {
  try {
    const ref = await getMyExamListService(params)
    myExamList.value = ref.rows
    total.value = ref.total
  } catch(error) {
    ElMessage.error(error.message)
  }
}
getMyExamList()

function isHistoryExam(exam) {
  const now = new Date();
  return new Date(exam.endTime) < now;
}

const isNotStart = (exam) => {
  const now = new Date();
  return new Date(exam.startTime) > now;
}

const goBack = () => {
  router.go(-1)
}

function goExam(exam) {
  router.push(`/c-oj/answer?examId=${exam.examId}&examTitle=${exam.title}&examEndTime=${exam.endTime}`)
}

function goHistoryExam(exam) {
  router.push(`/c-oj/answer?examId=${exam.examId}&examTitle=${exam.title}&examEndTime=${exam.endTime}`)
}

function togglePopover(examId) {
  // Can be implemented similar to Exam.vue
}
</script>

<style lang="scss" scoped>
.apple-my-exam-page {
  padding: 40px 0 80px;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--oj-ink);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 16px;
    border-radius: 12px;
    background: var(--oj-surface-soft);
    color: var(--oj-ink);
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover { background: rgba(0, 0, 0, 0.04); }
    &:active { transform: scale(0.96); }
  }
}

.exam-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-item {
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 24px;
  background: var(--oj-surface);
  border-radius: 20px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.06);
  }

  .item-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: var(--oj-surface-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }

  .item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .exam-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--oj-ink);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .exam-time {
      font-size: 14px;
      color: var(--oj-ink);
      
      .time-label {
        color: var(--oj-muted);
        margin-right: 8px;
      }
    }
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;

    .status-badge {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;

      &.closed {
        background: var(--oj-surface-soft);
        color: var(--oj-muted);
      }

      &.reserved {
        background: var(--oj-accent-soft);
        color: #B26800;
      }
    }

    .apple-btn, .apple-btn-subtle {
      height: 40px;
      padding: 0 20px;
      border-radius: 12px;
      font-size: 14px;
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
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .exam-item {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    
    .item-icon {
      display: none;
    }

    .item-actions {
      margin-top: 12px;
      justify-content: flex-end;
    }
  }
}
</style>
