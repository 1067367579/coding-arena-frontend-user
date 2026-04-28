<template>
  <div class="apple-login-page">
    <div class="glass-orb orb-1"></div>
    <div class="glass-orb orb-2"></div>
    
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <div class="logo-wrapper">
            <img src="@/assets/oj-logo.svg" alt="在线判题系统">
          </div>
          <h1 class="brand-title">在线判题系统</h1>
          <p class="brand-subtitle">题库训练 · 在线竞赛 · 代码评测</p>
        </div>

        <div class="hero-text">
          <p>把每一次提交，变成可复盘的训练，减少干扰，专注代码与结果。</p>
        </div>

        <div class="form-section">
          <div class="apple-input-group">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <input v-model="mobileForm.email" type="email" placeholder="请输入邮箱号" class="apple-input">
          </div>

          <div class="apple-input-group verification-group">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <input v-model="mobileForm.code" type="text" placeholder="请输入验证码" class="apple-input">
            <button class="code-btn" @click="getCode" :disabled="isTimerRunning">
              {{ txt }}
            </button>
          </div>

          <button class="apple-btn primary-btn submit-btn" @click="loginFun">
            登录 / 注册
          </button>
        </div>

        <div class="card-footer">
          <p>注册或点击登录代表您同意 <a href="#">服务条款</a> 和 <a href="#">隐私协议</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { setToken } from '@/utils/cookie'
import { sendCodeService, codeLoginService } from '@/apis/user'
import router from '@/router'
import { ElMessage } from 'element-plus'

const mobileForm = reactive({
  email: '',
  code: ''
})

const txt = ref('获取验证码')
const num = ref(0)
let timer = null

const isTimerRunning = computed(() => num.value > 0)

async function getCode() {
  if (isTimerRunning.value) return
  
  if (!mobileForm.email) {
    ElMessage.warning('请输入邮箱')
    return
  }

  try {
    await sendCodeService(mobileForm)
    ElMessage.success("发送验证码成功,2分钟内有效,注意查收!")
    num.value = 59
    txt.value = `${num.value}s`
    
    timer = setInterval(() => {
      num.value--
      if (num.value < 1) {
        txt.value = '重新获取验证码'
        clearInterval(timer)
      } else {
        txt.value = `${num.value}s`
      }
    }, 1000)
  } catch(error) {
    ElMessage.error(error.message || '发送失败')
  }
}

async function loginFun() {
  if (!mobileForm.email || !mobileForm.code) {
    ElMessage.warning('请填写完整的登录信息')
    return
  }
  
  try {
    const loginRef = await codeLoginService(mobileForm)
    setToken(loginRef.data)
    ElMessage.success("登录成功!")
    router.push('/c-oj/home/exam')
  } catch(error) {
    ElMessage.error(error.message || '登录失败')
  }
}
</script>

<style lang="scss" scoped>
.apple-login-page {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: var(--oj-bg);
}

.glass-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  
  &.orb-1 {
    top: -10%;
    left: -10%;
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, rgba(0, 122, 255, 0.2), rgba(52, 199, 89, 0.1));
  }
  
  &.orb-2 {
    bottom: -20%;
    right: -10%;
    width: 800px;
    height: 800px;
    background: linear-gradient(135deg, rgba(255, 149, 0, 0.15), rgba(255, 45, 85, 0.1));
  }
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  padding: 0 24px;
}

.login-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(40px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 48px 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  .logo-wrapper {
    width: 64px;
    height: 64px;
    background: var(--oj-ink);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    
    img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
  }

  .brand-title {
    font-size: 28px;
    font-weight: 800;
    color: var(--oj-ink);
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .brand-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: var(--oj-primary);
    margin: 0;
  }
}

.hero-text {
  padding: 0 48px;
  text-align: center;
  margin-bottom: 32px;

  p {
    font-size: 15px;
    color: var(--oj-muted);
    line-height: 1.6;
    margin: 0;
  }
}

.form-section {
  padding: 0 48px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.apple-input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  height: 56px;
  transition: all 0.2s ease;

  &:focus-within {
    background: #fff;
    border-color: var(--oj-primary);
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
  }

  .input-icon {
    width: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--oj-muted);
  }

  .apple-input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    font-size: 16px;
    color: var(--oj-ink);
    outline: none;
    padding-right: 16px;

    &::placeholder {
      color: var(--oj-subtle);
    }
  }

  &.verification-group {
    padding-right: 6px;

    .code-btn {
      height: 44px;
      padding: 0 16px;
      border-radius: 12px;
      background: var(--oj-ink);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }
      
      &:active:not(:disabled) {
        transform: scale(0.96);
      }

      &:disabled {
        background: var(--oj-surface-soft);
        color: var(--oj-muted);
        cursor: not-allowed;
      }
    }
  }
}

.submit-btn {
  height: 56px;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 600;
  background: var(--oj-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
  box-shadow: 0 8px 16px rgba(0, 122, 255, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 122, 255, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.card-footer {
  background: rgba(0, 0, 0, 0.02);
  padding: 24px;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  p {
    margin: 0;
    font-size: 13px;
    color: var(--oj-muted);

    a {
      color: var(--oj-primary);
      text-decoration: none;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 600px) {
  .login-card {
    border-radius: 24px;
  }
  
  .card-header {
    padding: 32px 24px 16px;
  }
  
  .hero-text {
    padding: 0 24px;
  }
  
  .form-section {
    padding: 0 24px 32px;
  }
}
</style>
