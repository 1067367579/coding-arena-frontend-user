  <template>
    <div class="index-question">
      <div class="index-question-table-box">
        <div class="left problem-workbench">
          <div class="problem-header">
            <div>
              <span class="section-kicker">Problem Set</span>
              <h1>精选题库</h1>
              <p>按难度和关键词快速筛题，进入答题后专注代码和执行结果。</p>
            </div>
            <div class="progress-card">
              <strong>{{ questionList.length }}/{{ total }}</strong>
              <span>当前结果</span>
            </div>
          </div>
          <el-form :inline="true" ref="formModel" :model="params" class="problem-toolbar">
            <el-form-item class="keyword-field">
              <el-input v-model="params.keyword" placeholder="搜索题目标题或内容" />
            </el-form-item>
            <el-form-item class="difficulty-field">
              <selector v-model="params.difficulty"></selector>
            </el-form-item>
            <el-form-item class="toolbar-actions">
              <el-button type="primary" plain @click="onSearch">搜索</el-button>
              <el-button type="info" plain @click="onReset">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="questionList" height="560px" class="problem-table">
            <el-table-column align="center" width="64px" label="#">
              <template #default="{ $index }">
                {{ (params.pageNum - 1) * params.pageSize + $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column align="left" prop="title" :show-overflow-tooltip="true" label="题目标题" />
            <el-table-column align="center" width="108px" prop="difficulty" label="难度">
              <template #default="{ row }">
                <span class="difficulty-tag easy" v-if="row.difficulty === 1">简单</span>
                <span class="difficulty-tag medium" v-if="row.difficulty === 2">中等</span>
                <span class="difficulty-tag hard" v-if="row.difficulty === 3">困难</span>
              </template>
            </el-table-column>
            <el-table-column label="训练入口" align="center" width="122px">
              <template #default="{ row }">
                <el-button class="solve-button" type="text" plain v-if="isLogin" @click="goQuestTest(row.questionId)">
                  开始答题
                </el-button>
                <span style="color:#9E9E9E;" v-else>请登录后参与答题</span>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页区域 -->
          <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
            v-model:current-page="params.pageNum" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15, 20]"
            @size-change="handleSizeChange" @current-change="handleCurrentChange"
            class="problem-pagination" />
        </div>
        <div class="right">
          <div class="training-card">
            <span class="side-title">今日训练</span>
            <strong>建议完成 3 题</strong>
            <p>优先选择中等难度，保持连续训练节奏。</p>
          </div>
          <div class="top-box">
            <el-calendar v-model="today"> </el-calendar>
          </div>
          <div class="bot-box">
            <div class="title">热门题目</div>
            <div class="hot-list">
              <div class="list-item" v-for="(item, index) in hotQuestionList" :key="'hot_' + index">
                <img class="index-box" v-if="index == 0" src="@/assets/images/icon_1.png" alt="">
                <img class="index-box" v-if="index == 1" src="@/assets/images/icon_2.png" alt="">
                <img class="index-box" v-if="index == 2" src="@/assets/images/icon_3.png" alt="">
                <span class="index-box" v-if="index > 2">{{ index + 1 }}</span>
                <span class="txt" :title="item.title">{{ item.title }}</span>
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
  import { getQuestionListService,getHotQuestionListService } from '@/apis/question'
  import { getToken } from "@/utils/cookie"
  import router from "@/router"
  import { getUserInfoService } from "@/apis/user"
  
  const params = reactive({
    pageNum: 1,
    pageSize: 10,
    difficulty: '',
    keyword: ''
  })
  let today = ref(new Date()) //日历默认今天
  const questionList = ref([]) //题目列表
  const total = ref(0)
  const isLogin = ref(false)
  
  async function checkLogin() {
    if (getToken()) {
      await getUserInfoService()
      isLogin.value = true
    }
  }
  checkLogin()
  
  async function getQuestionList() {
    const result = await getQuestionListService(params)
    questionList.value = result.rows
    total.value = result.total
  }
  getQuestionList()
  
  const hotQuestionList = ref([])
  async function getHotQuestionList(params) {
    const hotRef = await getHotQuestionListService(8)
    hotQuestionList.value = hotRef.data
  }
  
  getHotQuestionList()
  
  // 搜索/重置
  function onSearch() {
    params.pageNum = 1
    getQuestionList()
  }
  
  function onReset() {
    params.pageNum = 1
    params.pageSize = 9
    params.difficulty = ''
    params.keyword = ''
    getQuestionList()
  }
  
  // 分页
  function handleSizeChange(newSize) {
    console.log(params.pageSize)
    params.pageNum = 1
    getQuestionList()
  }
  
  function handleCurrentChange(newPage) {
    getQuestionList()
  }
  
  function goQuestTest(questionId) {
    router.push(`/c-oj/answer?questionId=${questionId}`)
  }
  </script>
  
  <style lang="scss" scoped>
  .index-question-table-box {
    display: flex;
    max-width: 1520px;
    width: min(1520px, calc(100% - 48px));
    justify-content: space-between;
    gap: 20px;
  
    :deep(.el-pagination) {
  
      .el-select .el-select__wrapper,
      .el-input .el-input__wrapper {
        height: 24px;
      }
    }
  
    .right {
      width: 342px;
      flex-shrink: 0;

      .training-card {
        width: 100%;
        margin-bottom: 20px;
        padding: 22px;
        border: 1px solid rgba(22, 131, 74, 0.14);
        border-radius: 18px;
        background:
          linear-gradient(135deg, rgba(22, 131, 74, 0.12), rgba(245, 158, 11, 0.08)),
          #fff;
        box-shadow: var(--oj-shadow-sm);

        .side-title {
          color: var(--oj-primary-strong);
          font-size: 13px;
          font-weight: 800;
        }

        strong {
          display: block;
          margin-top: 12px;
          color: var(--oj-ink);
          font-size: 22px;
        }

        p {
          margin: 10px 0 0;
          color: var(--oj-muted);
          font-size: 14px;
          line-height: 1.7;
        }
      }
  
      :deep(.top-box) {
        width: 100%;
        height: 330px;
        padding-bottom: 16px;
        margin-bottom: 20px;
        border: 1px solid var(--oj-line);
        border-radius: 18px;
        background: #fff;
        box-shadow: var(--oj-shadow-sm);
  
        .el-calendar,
        .el-calendar__body {
          background: transparent;
        }
  
        .el-calendar {
          position: relative;
  
          .el-calendar__title {
            font-weight: bold;
          }
  
          .el-calendar__header {
            border: none;
            padding-bottom: 0;
          }
  
          .el-calendar__button-group {
            text-align: center;
            background: transparent;
  
            .el-button-group>.el-button {
              color: #1f2122;
              border: none;
              background: rgba(255, 255, 255, .1);
            }
          }
  
          .el-calendar-table {
            thead th {
              color: var(--oj-primary);
              font-size: 12px;
              font-weight: bold;
            }
  
            .el-calendar-day {
              height: 40px;
              text-align: center;
            }
  
            td {
              border: none;
            }
          }
        }
  
      }
  
      .bot-box {
        width: 342px;
        border: 1px solid var(--oj-line);
        border-radius: 18px;
        padding-top: 0;
        box-sizing: border-box;
        background: #fff;
        position: relative;
        overflow: hidden;
        box-shadow: var(--oj-shadow-sm);
  
        .title {
          font-weight: bold;
          color: var(--oj-ink);
          position: relative;
          width: 100%;
          height: 58px;
          padding: 20px 20px 0;
          background: #f8faf5;
  
          span {
            position: absolute;
            display: flex;
            right: 20px;
            font-family: PingFangSC, PingFang SC;
            font-weight: 400;
            font-size: 14px;
            color: var(--oj-primary);
            bottom: 20px;
            cursor: pointer;
          }
        }
  
        .hot-list {
          width: calc(100% - 40px);
          margin: 0 auto;
          padding-top: 20px;
          padding-bottom: 20px;
  
          .list-item {
            margin-bottom: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
  
            .index-box {
              display: inline-block;
              text-align: center;
              width: 20px;
              font-family: Tensentype-RuiHeiJ, Tensentype-RuiHeiJ;
              font-weight: normal;
              font-size: 18px;
              color: #999999;
              font-weight: bold;
            }
  
            .txt {
              max-width: calc(100% - 34px);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-left: 10px;
              font-family: PingFangSC, PingFang SC;
              font-weight: 400;
              font-size: 16px;
              color: var(--oj-ink);
              line-height: 22px;
              text-align: left;
              font-style: normal;
            }
  
            &:hover {
              .txt {
                color: var(--oj-primary);
              }
            }
          }
        }
      }
    }
  
    .problem-workbench {
      flex: 1 1 680px;
      min-width: 0;
      border: 1px solid var(--oj-line);
      border-radius: 20px;
      overflow: hidden;
      background: #fff;
      box-shadow: var(--oj-shadow-sm);

      .problem-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 28px 28px 18px;

        .section-kicker {
          color: var(--oj-primary-strong);
          font-size: 13px;
          font-weight: 800;
        }

        h1 {
          margin: 8px 0 8px;
          color: var(--oj-ink);
          font-size: 28px;
          line-height: 1.2;
        }

        p {
          margin: 0;
          color: var(--oj-muted);
          font-size: 14px;
        }

        .progress-card {
          min-width: 112px;
          padding: 14px 16px;
          border: 1px solid var(--oj-line);
          border-radius: 14px;
          background: var(--oj-surface-soft);
          text-align: right;

          strong,
          span {
            display: block;
          }

          strong {
            color: var(--oj-primary-strong);
            font-size: 22px;
          }

          span {
            margin-top: 4px;
            color: var(--oj-muted);
            font-size: 12px;
          }
        }
      }

      .problem-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        padding: 18px 28px;

        :deep(.el-form-item) {
          margin: 0;
        }

        .keyword-field {
          flex: 1 1 240px;
          min-width: 0;
        }

        .difficulty-field {
          flex: 0 0 180px;
        }

        .toolbar-actions {
          flex: 0 0 auto;
        }
      }
  
      .el-table {
        width: 100%;

        th.el-table__cell {
          background-color: transparent !important;
          color: var(--oj-muted);
          font-size: 13px;
          font-weight: 800;
          border-bottom: none !important;
        }
  
        td {
          height: 58px;
          color: var(--oj-ink);
          border-bottom: 1px dashed var(--oj-line);
        }
      }

      .difficulty-tag {
        display: inline-flex;
        justify-content: center;
        min-width: 54px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;

        &.easy {
          background: var(--oj-primary-soft);
          color: var(--oj-primary-strong);
        }

        &.medium {
          background: var(--oj-accent-soft);
          color: #a16207;
        }

        &.hard {
          background: var(--oj-danger-soft);
          color: var(--oj-danger);
        }
      }

      .solve-button {
        color: var(--oj-primary-strong);
        font-weight: 800;
      }

      .problem-pagination {
        margin: 30px 28px 30px 0;
        justify-content: flex-end;
      }

      .el-card__header {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: #222222;
        line-height: 28px;
        text-align: left;
        font-style: normal;
        border: none;
        padding-bottom: 0;
      }
    }
  }
  
  .el-input__wrapper {
    background-color: #fff;
  }
  
  .index-question {
    display: flex;
    justify-content: center;
    margin-top: 22px;
  
    .no-border {
      border: none;
    }
  }
  
  .el-table {
    th {
      word-break: break-word;
      height: 40px;
      font-weight: 700;
      font-size: 14px;
    }
  }

  @media (max-width: 1180px) {
    .index-question-table-box {
      flex-direction: column;

      .right {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 342px);
        gap: 20px;
        width: 100%;

        .training-card {
          grid-column: 1 / -1;
          box-sizing: border-box;
        }

        .bot-box {
          width: 100%;
        }
      }

      .problem-workbench {
        flex-basis: auto;
        width: 100%;
      }
    }
  }

  @media (max-width: 760px) {
    .index-question-table-box {
      width: calc(100% - 24px);

      .right {
        display: block;
      }

      .problem-workbench {
        .problem-header {
          flex-direction: column;
          gap: 16px;
        }

        .problem-toolbar {
          padding: 16px;

          .difficulty-field,
          .toolbar-actions {
            flex-basis: 100%;
          }
        }
      }
    }
  }
  </style>
  
  <!-- npm install ace-builds@1.4.13 -->
