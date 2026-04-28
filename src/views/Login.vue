<template>
    <div class="login-page">
      <div class="login-shell">
        <div class="login-box">
          <div class="logo-box">
            <img src="@/assets/logo.png">
            <div class="sys-name">DevKnight OJ</div>
          </div>
          <div class="login-hero-text">
            <h1>代码竞技平台</h1>
            <p>把每一次提交，变成可复盘的训练，减少干扰，专注代码与结果。</p>
          </div>
          <div class="form-box">
            <div class="form-item">
              <img src="@/assets/images/shouji.png">
              <el-input v-model="mobileForm.email" type="text" placeholder="请输入邮箱号" />
            </div>
            <div class="form-item">
              <img src="@/assets/images/yanzhengma.png">
              <el-input style="width:134px" v-model="mobileForm.code" type="text" placeholder="请输入验证码" />
              <div class="code-btn-box" @click="getCode">
                <span>{{ txt }}</span>
              </div>
            </div>
            <div class="submit-box" @click="loginFun">
              登录/注册
            </div>
          </div>
          <div class="gray-bot">
            <p>注册或点击登录代表您同意 <span>服务条款</span> 和 <span>隐私协议</span></p>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, reactive } from 'vue'
  import { setToken } from '@/utils/cookie'
  import { sendCodeService, codeLoginService } from '@/apis/user'
  import router from '@/router'
  
  // 验证码登录表单
  let mobileForm = reactive({
    email: '',
    code: ''
  })
  let txt = ref('获取验证码')
  let timer = null
  async function getCode() {
    try {
        await sendCodeService(mobileForm)
        ElMessage.success("发送验证码成功,2分钟内有效,注意查收!");
        txt.value = '59s'
        let num = 59
        timer = setInterval(() => {
        num--
        if (num < 1) {
            txt.value = '重新获取验证码'
            clearInterval(timer)
        } else {
            txt.value = num + 's'
        }
        }, 1000)
    } catch(error) {
        ElMessage.error(error.message);
    }
  }
  
  async function loginFun() {
    try {
        const loginRef = await codeLoginService(mobileForm)
        setToken(loginRef.data)
        ElMessage.success("登录成功!");
        router.push('/c-oj/home/exam')
    } catch(error) {
        ElMessage.error(error.message);
    }
  }
  </script>
  <style lang="scss" scoped>
  .login-page {
    width: calc(100vw - 48px);
    min-height: calc(100vh - 72px);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &::before {
      position: absolute;
      inset: 6% 8% auto auto;
      width: 420px;
      height: 420px;
      border-radius: 50%;
      background: rgba(22, 131, 74, 0.08);
      content: '';
    }

    .login-shell {
      position: relative;
      z-index: 1;
      width: min(520px, calc(100vw - 48px));
    }

    .login-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 24px 64px rgba(17, 24, 39, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 28px;
      padding: 48px 48px 0;
      overflow: hidden;
      backdrop-filter: blur(24px);
  
      .logo-box {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
  
        img {
          width: 42px;
          height: 42px;
          margin-right: 12px;
          border-radius: 12px;
          background: var(--oj-primary);
        }
  
        .sys-name {
          font-family: PingFangSC, PingFang SC;
          font-weight: 800;
          font-size: 22px;
          color: var(--oj-ink);
        }
      }

      .login-hero-text {
        text-align: center;
        margin-bottom: 36px;

        h1 {
          margin: 0 0 10px;
          color: var(--oj-ink);
          font-size: 28px;
          font-weight: 900;
        }

        p {
          margin: 0;
          color: var(--oj-muted);
          font-size: 15px;
          line-height: 1.6;
        }
      }
  
      .gray-bot {
        margin: 48px -48px 0;
        text-align: center;
        width: calc(100% + 96px);
        height: 50px;
        background: #fafaf7;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        line-height: 50px;
  
        p {
          margin: 0;
        }
  
        span {
          color: var(--oj-primary);
          cursor: pointer;
        }
      }
  
      :deep(.form-box) {
        .submit-box {
          margin-top: 52px;
          width: 100%;
          height: 50px;
          background: var(--oj-primary);
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: PingFangSC, PingFang SC;
          font-weight: 600;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          box-shadow: 0 12px 24px rgba(22, 131, 74, 0.22);
  
          &:hover {
            background: var(--oj-primary-strong);
          }
        }
  
        .form-item {
          display: flex;
          align-items: center;
          width: 100%;
          height: 52px;
          background: #f7f8f3;
          border: 1px solid var(--oj-line);
          border-radius: 10px;
          margin-bottom: 22px;
          position: relative;
  
          .code-btn-box {
            position: absolute;
            right: 0;
            width: 148px;
            height: 52px;
            background: var(--oj-primary);
            border-radius: 10px;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
  
            span {
              font-family: PingFangSC, PingFang SC;
              font-weight: 400;
              font-size: 16px;
              color: #FFFFFF;
            }
          }
  
          .el-input__wrapper {
            border: none;
            box-shadow: none;
            background: transparent;
            padding-left: 0;
          }
  
          img {
            width: 22px;
            height: 22px;
            margin: 0 18px;
            opacity: 0.7;
          }
        }
      }
    }
  }

  @media (max-width: 720px) {
    .login-page {
      .login-shell {
        width: 100%;
      }
    }
  }
  </style>
