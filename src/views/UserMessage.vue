<template>
  <div class="apple-message-page">
    <div class="page-container">
      <div class="header-section">
        <h1 class="page-title">我的消息</h1>
        <button class="apple-btn-subtle back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回
        </button>
      </div>

      <div class="message-list">
        <div class="floating-card message-item" v-for="(item, index) in messageList" :key="index">
          <div class="item-icon">
            <img src="@/assets/message/notice.png" alt="消息通知" />
          </div>
          
          <div class="item-content">
            <h3 class="message-title">{{ item.title }}</h3>
            <p class="message-text">{{ item.content }}</p>
            <div class="message-actions-inline" v-if="item.title.includes('报名成功') || item.title.includes('竞赛结果')">
              <button class="apple-btn-small" v-if="item.title.includes('报名成功')" @click.stop="handleExamEntry(item)">
                进入竞赛
              </button>
              <button class="apple-btn-small" v-if="item.title.includes('竞赛结果')" @click.stop="handleExamResult(item)">
                查看竞赛详情
              </button>
            </div>
          </div>
          
          <div class="item-actions">
            <button class="apple-btn-danger" @click.stop="handlerDelete(item)">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              删除
            </button>
          </div>
        </div>
        
        <div v-if="messageList.length === 0" class="empty-state">
          <p>暂无消息</p>
        </div>
      </div>

      <div class="pagination-container" v-if="total > 0">
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
import { getMessageListService } from "@/apis/message"
import router from "@/router"
import { reactive, ref } from "vue"
import { ElMessage, ElMessageBox } from 'element-plus'

function extractExamId(content) {
  // Try to find a number or some ID from the content or item. Since we don't have schema, we just parse ID if it's there.
  // Alternatively we just pass item.examId if backend provides it.
  return null;
}

function handleExamEntry(item) {
  // Example logic for entering exam
  // In real app, we check if exam started. We mock it here.
  const isStarted = Math.random() > 0.5; // mocked logic
  if (!isStarted) {
    ElMessage.info('竞赛尚未开始，请等候...');
  } else {
    // If we have examId we should pass it, but since we don't know the schema, we use query param if available
    router.push({ path: '/c-oj/home/exam' });
  }
}

function handleExamResult(item) {
  router.push({ path: '/c-oj/exam/result', query: { examId: item.examId || 1 } });
}

const messageList = ref([])
const total = ref(0)
const params = reactive({
  pageNum: 1,
  pageSize: 10,
})

async function getMessageList() {
  try {
    const ref = await getMessageListService(params)
    messageList.value = ref.rows
    total.value = ref.total
  } catch(error) {
    ElMessage.error(error.message)
  }
}
getMessageList()

const goBack = () => {
  router.go(-1)
}

function handleCurrentChange(newPage) {
  getMessageList()
}

function handlerDelete(item) {
  // In a real application, you would call an API here
  ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功')
    // Here you would normally await deleteMessageService(item.id)
    getMessageList()
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.apple-message-page {
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

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--oj-muted);
  font-size: 15px;
  background: var(--oj-surface);
  border-radius: 20px;
  border: 1px dashed var(--oj-line);
}

.message-item {
  display: flex;
  align-items: flex-start;
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
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: var(--oj-surface-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }
  }

  .item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .message-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--oj-ink);
      margin: 0;
      line-height: 1.4;
    }

    .message-text {
      font-size: 15px;
      color: var(--oj-muted);
      margin: 0;
      line-height: 1.6;
    }
  }

  .item-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    .apple-btn-danger {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 40px;
      padding: 0 16px;
      border-radius: 12px;
      background: var(--oj-danger-soft);
      color: var(--oj-danger);
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover { 
        background: var(--oj-danger);
        color: #fff;
      }
      
      &:active { transform: scale(0.96); }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .message-item {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    
    .item-icon {
      display: none;
    }

    .item-actions {
      margin-top: 16px;
    }
  }
}
.message-actions-inline {
  margin-top: 12px;

  .apple-btn-small {
    padding: 6px 14px;
    background: #1890ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #40a9ff;
    }
  }
}
</style>
