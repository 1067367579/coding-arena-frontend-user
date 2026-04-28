<template>
    <div class="message-list">
      <div class="message-list-block">
        <div class="message-list-header">
          <span class="ms-title">我的消息</span>
          <span class="message-list-back" @click="goBack()">返回</span>
        </div>
        <div class="mesage-list-content" v-for="(item, index) in messageList" :key="index">
          <img src="@/assets/message/notice.png" width="50px" class="image" />
          <div class="message-content">
            <div class="title-box">
              <div class="title">
                {{ item.title }}
              </div>
            </div>
            <div class="content">{{ item.content }}</div>
          </div>
          <el-button class="mesage-button" type="text" @click.stop="handlerDelete(item)">删除</el-button>
        </div>
        <div class="message-pagination">
          <!-- 增加分页展示器 -->
          <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
            v-model:current-page="params.pageNum" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15, 20]"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { getMessageListService } from "@/apis/message"
  import router from "@/router"
  import { reactive, ref } from "vue"
  
  const messageList = ref([]) //消息列表
  
  const total = ref(0)
  const params = reactive({
    pageNum: 1,
    pageSize: 10,
  })
  
  //消息列表
  async function getMessageList() {
    const ref = await getMessageListService(params)
    messageList.value = ref.rows
    total.value = ref.total
  }
  getMessageList()
  
  const goBack = () => {
    router.go(-1)
  }
  // 分页
  function handleSizeChange(newSize) {
    params.pageNum = 1
    getMessageList()
  }
  
  function handleCurrentChange(newPage) {
    getMessageList()
  }
  </script>
  
  <style lang="scss" scoped>
  .message-list {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
  
    .message-list-block {
      margin: 0 auto;
      margin-bottom: 1px;
      margin-top: 20px;
      width: 100%;
      max-width: 1520px;
  
      .message-pagination {
        display: flex;
        justify-content: flex-end;
        margin: 20px 0 0;
      }
  
      .message-list-header {
        border: 1px solid var(--oj-line);
        border-radius: 18px;
        max-width: 1520px;
        width: 100%;
        padding: 0 20px;
        height: 60px;
        font-size: 25px;
        text-indent: 20px;
        padding-left: 0;
        display: flex;
        align-items: center;
        background: #fff;
        box-sizing: border-box;
        box-shadow: var(--oj-shadow-sm);
  
        .ms-title {
          font-family: PingFangSC, PingFang SC;
          font-weight: 600;
          font-size: 18px;
          color: var(--oj-ink);
          text-align: left;
        }
  
        .message-list-back {
          cursor: pointer;
          color: var(--oj-muted);
          font-size: 15px;
          margin-left: auto;
        }
      }
  
      .mesage-list-content {
        border: 1px solid var(--oj-line);
        box-shadow: var(--oj-shadow-sm);
        background-color: #fff;
        border-radius: 16px;
        margin-top: 20px;
        max-width: 1520px;
        background: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 110px;
        width: 100%;
        padding-left: 20px;
  
        .mesage-button {
          width: 84px;
          height: 44px;
          background: var(--oj-primary-soft);
          border-radius: 22px;
          margin-right: 20px;
          color: var(--oj-primary-strong);
          font-weight: 800;
        }
  
        .message-content {
          color: var(--oj-ink);
          position: relative;
          left: 20px;
          width: calc(100% - 155px);
  
          .title-box {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
  
          .title {
            font-weight: bold;
            font-size: 16px;
          }

          .content {
            color: var(--oj-muted);
            line-height: 1.6;
          }
        }
      }
    }
  }
  </style>
