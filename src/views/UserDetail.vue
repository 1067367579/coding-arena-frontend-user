<template>
  <div class="user-info-page">
    <section class="profile-shell">
      <header class="profile-header">
        <div>
          <span class="profile-eyebrow">Account Settings</span>
          <h1>个人资料</h1>
        </div>
        <div class="profile-actions">
          <el-button v-if="isDisabled()" type="primary" plain @click="changeState('updating')">编辑资料</el-button>
          <el-button v-if="!isDisabled()" type="info" plain @click="changeState('normal')">取消</el-button>
          <el-button type="info" plain @click="goBack()">返回</el-button>
        </div>
      </header>

      <div class="profile-layout">
        <aside class="profile-card">
          <div class="avatar-frame">
            <img v-if="!userDetailForm.avatar" src="@/assets/user/head_image.png">
            <img v-else :src="userDetailForm.avatar">
          </div>
          <h2>{{ userDetailForm.nickName || '未设置昵称' }}</h2>
          <p>{{ userDetailForm.introduce || '完善个人信息后，这里会成为你的训练名片。' }}</p>
          <div class="profile-chips">
            <span>{{ getGender(userDetailForm.gender) }}</span>
            <span>{{ userDetailForm.major || '专业未填' }}</span>
          </div>
          <el-upload v-if="!isDisabled()" :action="uploadUrl" :headers="headers"
            :on-error="handleUploadError" :on-success="handleUploadSuccess" :show-file-list="false">
            <el-button type="primary">{{ userDetailForm.avatar ? '更换头像' : '上传头像' }}</el-button>
            <template #tip> </template>
          </el-upload>
        </aside>

        <el-form :model="userDetailForm" label-position="top" status-icon class="profile-form">
          <div class="form-section-title">
            <span>基础信息</span>
            <small>这些信息会用于竞赛报名和个人身份展示</small>
          </div>

          <div class="form-grid">
            <el-form-item label="昵称" prop="nickName">
              <el-input v-if="!isDisabled()" type="text" v-model="userDetailForm.nickName" autocomplete="off"
                placeholder="请填写您的昵称" maxlength="8"></el-input>
              <span :class="userDetailForm.nickName ? 'right-info' : 'right-info gray'" v-else>
                {{ userDetailForm.nickName || "请填写您的昵称" }}
              </span>
            </el-form-item>

            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="userDetailForm.gender" v-if="!isDisabled()">
                <el-radio :label="0">女</el-radio>
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">未知</el-radio>
              </el-radio-group>
              <span :class="userDetailForm.gender != null ? 'right-info' : 'right-info gray'" v-else>
                {{ userDetailForm.gender == null ? "请选择您的性别" : getGender(userDetailForm.gender)}}
              </span>
            </el-form-item>

            <el-form-item label="学校" prop="school">
              <el-input v-if="!isDisabled()" type="text" v-model="userDetailForm.school" autocomplete="off"
                placeholder="请填写您的学校名称"></el-input>
              <span :class="userDetailForm.school ? 'right-info' : 'right-info gray'" v-else>
                {{ userDetailForm.school || "请填写您的学校名称" }}
              </span>
            </el-form-item>

            <el-form-item label="专业" prop="major">
              <el-input v-if="!isDisabled()" type="text" v-model="userDetailForm.major" autocomplete="off"
                placeholder="请填写您的专业名称"></el-input>
              <span :class="userDetailForm.major ? 'right-info' : 'right-info gray'" v-else>
                {{ userDetailForm.major || "请填写您的专业名称" }}
              </span>
            </el-form-item>

            <el-form-item label="手机" prop="phone">
              <el-input v-if="!isDisabled()" type="text" v-model="userDetailForm.phone" autocomplete="off"
                placeholder="请填写常用手机号"></el-input>
              <span :class="userDetailForm.phone ? 'right-info' : 'right-info gray'" v-else>
                {{ userDetailForm.phone || "请填写常用手机号" }}
              </span>
            </el-form-item>

            <el-form-item label="常用邮箱" prop="email">
              <span :class="userDetailForm.email ? 'right-info' : 'right-info gray'">
                {{ userDetailForm.email || "邮箱未绑定" }}
              </span>
            </el-form-item>

            <el-form-item label="微信号码" prop="wechat">
              <el-input v-if="!isDisabled()" type="text" v-model="userDetailForm.wechat" autocomplete="off"
                placeholder="请填写微信号码"></el-input>
              <span :class="userDetailForm.wechat ? 'right-info' : 'right-info gray'" v-else>
                {{ userDetailForm.wechat || "请填写微信号" }}
              </span>
            </el-form-item>

            <el-form-item class="intro-item" label="个人介绍" prop="introduce">
              <el-input v-if="!isDisabled()" :rows="5" type="textarea" v-model="userDetailForm.introduce"
                autocomplete="off" placeholder="请填写个人介绍" maxlength="80" show-word-limit></el-input>
              <span :class="userDetailForm.introduce ? 'right-info intro' : 'right-info intro gray'" v-else>
                {{ userDetailForm.introduce || "请用一段话介绍自己，该简介将会在您的个人主页展示" }}
              </span>
            </el-form-item>
          </div>

          <div class="profile-footer" v-if="!isDisabled()">
            <el-button type="info" plain @click="changeState('normal')">取消</el-button>
            <el-button type="primary" @click="editUser()">保存修改</el-button>
          </div>
        </el-form>
      </div>
    </section>
  </div>
</template>
  
  <script setup>
  import { getUserDetailService,editUserService, updateAvatarService } from '@/apis/user'
  import { getToken } from '@/utils/cookie'
  
  import router from '@/router'
  import { ElMessage } from 'element-plus';
  import { reactive, ref } from "vue"
  import { eventBus } from '@/utils/eventBus';
  
  const userDetailForm = reactive({})
  const currentState = ref('normal')

  function getGender(gender) {
    if(gender == 0) {
        return "女"
    }
    if(gender == 1) {
        return "男"
    }
    return "未知"
  }
  
  async function getUserDetail() {
    const userRef = await getUserDetailService()
    currentState.value = "normal"
    Object.assign(userDetailForm, userRef.data)
  }
  getUserDetail()
  
  function goBack() {
    router.go(-1)
  }
  
  function changeState(state) {
    currentState.value = state
  }
  
  function isDisabled() {
    return currentState.value === "normal"
  }
  
  async function editUser() {
    await editUserService(userDetailForm)
    getUserDetail()
  }
  //http://127.0.0.1:19090/friend/file/upload
  //上传接口调用
  const uploadUrl = ref("/dev-api/file/upload")
  
  //此处上传接口时el-upload组件直接调用的 不是自定义service发出的请求 所以要在这里加上headers 不会过拦截器
  const headers = ref({
    Authentication: "Bearer " + getToken(),
  })
  
  async function handleUploadSuccess(res) {
    //拦截器拦截不到El-upload的请求
    if (res.code !== 1000) {
      ElMessage.error(res.msg)
    } else {
      const userUpdateDTO = reactive({
        avatar : res.data.name
      })
      //更新接口调用
      await updateAvatarService(userUpdateDTO)
      getUserDetail()
      ElMessage.success("头像上传成功")
      eventBus.$emit('user-info-updated')
    }
  }
  
  </script>
  
<style lang="scss" scoped>
.user-info-page {
  min-height: calc(100vh - 120px);
  padding: 20px 0 34px;
}

.profile-shell {
  width: min(1520px, calc(100% - 40px));
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border: 1px solid var(--oj-line);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--oj-shadow-sm);

  h1 {
    margin: 6px 0 0;
    font-size: 26px;
    line-height: 1.2;
    color: var(--oj-ink);
  }
}

.profile-eyebrow {
  color: var(--oj-primary-strong);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
  margin-top: 18px;
}

.profile-card,
.profile-form {
  border: 1px solid var(--oj-line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--oj-shadow-sm);
}

.profile-card {
  align-self: start;
  padding: 28px;
  text-align: center;

  h2 {
    margin: 18px 0 8px;
    font-size: 22px;
    color: var(--oj-ink);
  }

  p {
    min-height: 48px;
    margin: 0;
    color: var(--oj-muted);
    line-height: 1.6;
  }
}

.avatar-frame {
  width: 112px;
  height: 112px;
  margin: 0 auto;
  padding: 5px;
  border-radius: 50%;
  border: 1px solid rgba(22, 131, 74, 0.16);
  background: linear-gradient(135deg, var(--oj-primary-soft), #fff);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
}

.profile-chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;

  span {
    padding: 7px 10px;
    border-radius: 999px;
    background: #f7f7f2;
    color: var(--oj-muted);
    font-size: 13px;
  }
}

.profile-form {
  padding: 26px;
}

.form-section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;

  span {
    font-size: 18px;
    font-weight: 800;
    color: var(--oj-ink);
  }

  small {
    color: var(--oj-muted);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 22px;
  row-gap: 6px;
}

.intro-item {
  grid-column: 1 / -1;
}

.profile-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--oj-line);
}

.right-info {
  display: flex;
  align-items: center;
  min-height: 42px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--oj-line);
  border-radius: 12px;
  background: #fafaf8;
  color: var(--oj-ink);
  box-sizing: border-box;

  &.gray {
    color: var(--oj-muted);
  }

  &.intro {
    align-items: flex-start;
    min-height: 118px;
    padding-top: 12px;
    line-height: 1.7;
  }
}

:deep(.el-form-item__label) {
  color: var(--oj-muted);
  font-size: 13px;
  font-weight: 800;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 12px;
}

:deep(.el-radio-group) {
  min-height: 42px;
}

@media (max-width: 960px) {
  .profile-shell {
    width: calc(100% - 24px);
  }

  .profile-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-layout {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
