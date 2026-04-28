<template>
  <div class="apple-exam-result-page">
    <div class="page-container">
      <div class="header-section">
        <h1 class="page-title">竞赛成绩报告</h1>
        <button class="apple-btn-subtle back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回
        </button>
      </div>

      <div class="result-overview floating-card">
        <div class="score-circle">
          <span class="score">{{ userScore }}</span>
          <span class="label">总得分</span>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-value">第 {{ userRank }} 名</span>
            <span class="stat-label">本次排名</span>
          </div>
          <div class="divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ passCount }} 题</span>
            <span class="stat-label">通过题数</span>
          </div>
          <div class="divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ formatTime(timeSpent) }}</span>
            <span class="stat-label">答题用时</span>
          </div>
        </div>
      </div>

      <div class="rank-list-section floating-card">
        <h2 class="section-title">竞赛总榜单</h2>
        <div class="table-container">
          <el-table :data="rankList" class="apple-table" :show-header="true">
            <el-table-column label="排名" prop="rank" width="80" align="center">
              <template #default="{ row }">
                <span class="rank-number" :class="{'top-rank': row.rank <= 3}">{{ row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column label="参赛者" prop="nickName">
              <template #default="{ row }">
                <div class="user-cell">
                  <div class="avatar" :style="{ background: getAvatarColor(row.nickName) }">
                    {{ row.nickName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="name" :class="{'is-me': row.isMe}">{{ row.nickName }}</span>
                  <span class="me-tag" v-if="row.isMe">我</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="通过题数" prop="passCount" width="120" align="center"></el-table-column>
            <el-table-column label="总分" prop="score" width="100" align="right">
              <template #default="{ row }">
                <span class="score-text">{{ row.score }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const examId = route.query.examId

const userScore = ref(100)
const userRank = ref(1)
const passCount = ref(4)
const timeSpent = ref(3600) // seconds

const rankList = ref([
  { rank: 1, nickName: 'DevKnight', passCount: 4, score: 100, isMe: true },
  { rank: 2, nickName: 'CodeMaster', passCount: 3, score: 85, isMe: false },
  { rank: 3, nickName: 'ByteNinja', passCount: 3, score: 80, isMe: false },
  { rank: 4, nickName: 'AlgoPro', passCount: 2, score: 60, isMe: false },
  { rank: 5, nickName: 'NullPointer', passCount: 1, score: 20, isMe: false },
])

onMounted(() => {
  // In a real app, fetch exam result details using examId
})

function goBack() {
  router.go(-1)
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function getAvatarColor(name) {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff']
  let sum = 0
  for(let i=0; i<name.length; i++) sum += name.charCodeAt(i)
  return colors[sum % colors.length]
}
</script>

<style lang="scss" scoped>
.apple-exam-result-page {
  padding: 40px;
  background: #f5f5f7;
  min-height: 100vh;
  color: #1d1d1f;
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;

  .page-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.04);
    border: none;
    font-size: 14px;
    font-weight: 600;
    color: #1d1d1f;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  }
}

.floating-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.result-overview {
  display: flex;
  align-items: center;
  gap: 48px;

  .score-circle {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1890ff, #0050b3);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 24px rgba(24, 144, 255, 0.3);

    .score {
      font-size: 48px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
    }

    .label {
      font-size: 14px;
      opacity: 0.9;
    }
  }

  .stats-row {
    display: flex;
    flex: 1;
    justify-content: space-around;
    align-items: center;
    background: #fff;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.02);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 13px;
        color: #86868b;
      }
    }

    .divider {
      width: 1px;
      height: 40px;
      background: rgba(0,0,0,0.06);
    }
  }
}

.rank-list-section {
  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px 0;
  }
}

.apple-table {
  --el-table-border-color: rgba(0,0,0,0.04);
  --el-table-header-bg-color: transparent;
  
  :deep(th.el-table__cell) {
    font-weight: 600;
    color: #86868b;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  :deep(td.el-table__cell) {
    border-bottom: 1px solid rgba(0,0,0,0.04);
    padding: 12px 0;
  }
}

.rank-number {
  font-size: 16px;
  font-weight: 700;
  color: #86868b;

  &.top-rank {
    color: #1890ff;
  }
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  .name {
    font-weight: 500;
    color: #1d1d1f;

    &.is-me {
      color: #1890ff;
    }
  }

  .me-tag {
    font-size: 11px;
    padding: 2px 6px;
    background: #e6f7ff;
    color: #1890ff;
    border-radius: 4px;
    font-weight: 600;
  }
}

.score-text {
  font-weight: 700;
  color: #1d1d1f;
  font-size: 15px;
}

@media (max-width: 768px) {
  .apple-exam-result-page {
    padding: 20px;
  }
  
  .result-overview {
    flex-direction: column;
    gap: 24px;
  }
  
  .stats-row {
    width: 100%;
  }
}
</style>
