<template>
  <div class="apple-profile-page">
    <div class="page-container">
      <div class="header-section">
        <div>
          <span class="kicker">Account Settings</span>
          <h1 class="page-title">个人资料</h1>
        </div>
        <div class="header-actions">
          <button v-if="isDisabled()" class="apple-btn" @click="changeState('updating')">
            编辑资料
          </button>
          <button v-if="!isDisabled()" class="apple-btn-subtle" @click="changeState('normal')">
            取消
          </button>
          <button class="apple-btn-subtle" @click="goBack">
            返回
          </button>
        </div>
      </div>

      <div class="profile-content">
        <div class="sidebar-card floating-card">
          <div class="avatar-wrapper">
            <img v-if="!userDetailForm.avatar" src="@/assets/user/head_image.png" alt="Avatar">
            <img v-else :src="userDetailForm.avatar" alt="Avatar">
            
            <el-upload v-if="!isDisabled()" :action="uploadUrl" :headers="headers"
              :on-error="handleUploadError" :on-success="handleUploadSuccess" :show-file-list="false"
              class="avatar-uploader">
              <button class="upload-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
            </el-upload>
          </div>
          
          <h2 class="user-name">{{ userDetailForm.nickName || '未设置昵称' }}</h2>
          <p class="user-bio">{{ userDetailForm.introduce || '完善个人信息后，这里会成为你的训练名片。' }}</p>
          
          <div class="user-tags">
            <span class="tag">{{ getGender(userDetailForm.gender) }}</span>
            <span class="tag">{{ userDetailForm.major || '专业未填' }}</span>
          </div>
        </div>

        <div class="main-card floating-card">
          <div class="card-header">
            <h3>基础信息</h3>
            <p>这些信息会用于竞赛报名和个人身份展示</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>昵称</label>
              <div class="input-wrapper" :class="{ 'is-disabled': isDisabled() }">
                <input v-if="!isDisabled()" type="text" v-model="userDetailForm.nickName" placeholder="请填写您的昵称" maxlength="8">
                <span v-else class="read-only-text">{{ userDetailForm.nickName || "请填写您的昵称" }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>性别</label>
              <div class="input-wrapper radio-wrapper" :class="{ 'is-disabled': isDisabled() }">
                <template v-if="!isDisabled()">
                  <label class="radio-label">
                    <input type="radio" v-model="userDetailForm.gender" :value="0"> 女
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="userDetailForm.gender" :value="1"> 男
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="userDetailForm.gender" :value="2"> 未知
                  </label>
                </template>
                <span v-else class="read-only-text">{{ userDetailForm.gender == null ? "请选择您的性别" : getGender(userDetailForm.gender)}}</span>
              </div>
            </div>

            <div class="form-group">
              <label>学校</label>
              <div class="input-wrapper" :class="{ 'is-disabled': isDisabled() }">
                <input v-if="!isDisabled()" type="text" v-model="userDetailForm.school" placeholder="请填写您的学校名称">
                <span v-else class="read-only-text">{{ userDetailForm.school || "请填写您的学校名称" }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>专业</label>
              <div class="input-wrapper" :class="{ 'is-disabled': isDisabled() }">
                <input v-if="!isDisabled()" type="text" v-model="userDetailForm.major" placeholder="请填写您的专业名称">
                <span v-else class="read-only-text">{{ userDetailForm.major || "请填写您的专业名称" }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>手机</label>
              <div class="input-wrapper" :class="{ 'is-disabled': isDisabled() }">
                <input v-if="!isDisabled()" type="text" v-model="userDetailForm.phone" placeholder="请填写常用手机号">
                <span v-else class="read-only-text">{{ userDetailForm.phone || "请填写常用手机号" }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>常用邮箱</label>
              <div class="input-wrapper is-disabled">
                <span class="read-only-text">{{ userDetailForm.email || "邮箱未绑定" }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>微信号码</label>
              <div class="input-wrapper" :class="{ 'is-disabled': isDisabled() }">
                <input v-if="!isDisabled()" type="text" v-model="userDetailForm.wechat" placeholder="请填写微信号码">
                <span v-else class="read-only-text">{{ userDetailForm.wechat || "请填写微信号" }}</span>
              </div>
            </div>

            <div class="form-group full-width">
              <label>个人介绍</label>
              <div class="input-wrapper textarea-wrapper" :class="{ 'is-disabled': isDisabled() }">
                <textarea v-if="!isDisabled()" v-model="userDetailForm.introduce" placeholder="请填写个人介绍" rows="4" maxlength="80"></textarea>
                <span v-else class="read-only-text">{{ userDetailForm.introduce || "请用一段话介绍自己，该简介将会在您的个人主页展示" }}</span>
              </div>
            </div>
          </div>

          <div class="form-actions" v-if="!isDisabled()">
            <button class="apple-btn-subtle" @click="changeState('normal')">取消</button>
            <button class="apple-btn" @click="editUser">保存修改</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getUserDetailService, editUserService, updateAvatarService } from '@/apis/user'
import { getToken } from '@/utils/cookie'
import router from '@/router'
import { ElMessage } from 'element-plus';
import { reactive, ref } from "vue"
import { eventBus } from '@/utils/eventBus';

const userDetailForm = reactive({})
const currentState = ref('normal')

function getGender(gender) {
  if(gender == 0) return "女"
  if(gender == 1) return "男"
  return "未知"
}

async function getUserDetail() {
  try {
    const userRef = await getUserDetailService()
    currentState.value = "normal"
    Object.assign(userDetailForm, userRef.data)
  } catch(e) {}
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
  try {
    await editUserService(userDetailForm)
    ElMessage.success("修改成功")
    getUserDetail()
  } catch(e) {
    ElMessage.error("修改失败")
  }
}

const uploadUrl = ref("/dev-api/file/upload")

const headers = ref({
  Authentication: "Bearer " + getToken(),
})

async function handleUploadSuccess(res) {
  if (res.code !== 1000) {
    ElMessage.error(res.msg)
  } else {
    const userUpdateDTO = reactive({
      avatar : res.data.name
    })
    await updateAvatarService(userUpdateDTO)
    getUserDetail()
    ElMessage.success("头像上传成功")
    eventBus.$emit('user-info-updated')
  }
}

function handleUploadError() {
  ElMessage.error("头像上传失败")
}
</script>

<style lang="scss" scoped>
.apple-profile-page {
  padding: 40px 0 80px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;

  .kicker {
    font-size: 13px;
    font-weight: 600;
    color: var(--oj-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--oj-ink);
    margin: 8px 0 0;
    letter-spacing: -0.02em;
  }

  .header-actions {
    display: flex;
    gap: 12px;
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

.profile-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

.floating-card {
  background: var(--oj-surface);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.sidebar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  align-self: start;

  .avatar-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    margin-bottom: 24px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .avatar-uploader {
      position: absolute;
      bottom: 0;
      right: 0;

      .upload-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--oj-surface);
        border: 1px solid var(--oj-line);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--oj-ink);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }

  .user-name {
    font-size: 22px;
    font-weight: 700;
    color: var(--oj-ink);
    margin: 0 0 8px;
  }

  .user-bio {
    font-size: 14px;
    color: var(--oj-muted);
    line-height: 1.5;
    margin: 0 0 20px;
  }

  .user-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;

    .tag {
      padding: 6px 12px;
      background: var(--oj-surface-soft);
      color: var(--oj-subtle);
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
    }
  }
}

.main-card {
  .card-header {
    margin-bottom: 32px;

    h3 {
      font-size: 20px;
      font-weight: 700;
      color: var(--oj-ink);
      margin: 0 0 4px;
    }

    p {
      font-size: 14px;
      color: var(--oj-muted);
      margin: 0;
    }
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-size: 14px;
    font-weight: 600;
    color: var(--oj-ink);
    padding-left: 4px;
  }

  .input-wrapper {
    background: var(--oj-surface-soft);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid transparent;
    transition: all 0.2s;

    &:focus-within {
      background: var(--oj-surface);
      border-color: var(--oj-primary);
      box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
    }

    &.is-disabled {
      background: transparent;
      border: 1px solid var(--oj-line);
      
      .read-only-text {
        display: block;
        padding: 12px 16px;
        font-size: 15px;
        color: var(--oj-muted);
      }
    }

    input, textarea {
      width: 100%;
      border: none;
      background: transparent;
      padding: 12px 16px;
      font-size: 15px;
      color: var(--oj-ink);
      outline: none;

      &::placeholder {
        color: var(--oj-subtle);
      }
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    &.radio-wrapper {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 0 16px;
      height: 46px;

      .radio-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
        color: var(--oj-ink);
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--oj-line);

  button {
    height: 44px;
    padding: 0 24px;
    border-radius: 12px;
    font-size: 15px;
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

@media (max-width: 900px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
