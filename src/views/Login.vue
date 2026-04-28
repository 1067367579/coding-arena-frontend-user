<template>
    <div class="login-page">
      <div class="login-shell">
        <section class="brand-panel">
          <div class="brand-mark">
            <img src="@/assets/logo.png">
            <span>DevKnight OJ</span>
          </div>
          <h1>把每一次提交，变成可复盘的训练。</h1>
          <p>面向算法练习、竞赛组织和代码评测的专注型工作台。减少干扰，突出题目、竞赛、代码和结果。</p>
          <div class="brand-metrics">
            <div>
              <strong>128</strong>
              <span>精选题目</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>在线评测</span>
            </div>
            <div>
              <strong>5ms</strong>
              <span>结果反馈</span>
            </div>
          </div>
        </section>
      <div class="login-box">
        <div class="logo-box">
          <img src="@/assets/logo.png">
          <div>
            <div class="sys-name">代码竞技平台</div>
            <div class="sys-sub-name">DevKnight presents</div>
          </div>
        </div>
        <div class="form-box-title">
          <span>验证码登录</span>
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
      display: grid;
      grid-template-columns: minmax(320px, 1fr) minmax(360px, 440px);
      gap: 28px;
      align-items: center;
      width: min(1080px, calc(100vw - 48px));
    }

    .brand-panel {
      min-height: 520px;
      padding: 44px 44px 38px;
      border: 1px solid rgba(22, 131, 74, 0.14);
      border-radius: 28px;
      background:
        linear-gradient(135deg, rgba(22, 131, 74, 0.12), transparent 48%),
        linear-gradient(180deg, #ffffff 0%, #f6f8f1 100%);
      box-shadow: var(--oj-shadow);

      .brand-mark {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        height: 44px;
        padding: 6px 14px 6px 6px;
        border: 1px solid var(--oj-line);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.78);
        color: var(--oj-primary-strong);
        font-weight: 700;

        img {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--oj-primary);
        }
      }

      h1 {
        max-width: 460px;
        margin: 64px 0 22px;
        color: var(--oj-ink);
        font-size: clamp(36px, 4vw, 48px);
        line-height: 1.14;
        letter-spacing: 0;
      }

      p {
        max-width: 460px;
        margin: 0;
        color: var(--oj-muted);
        font-size: 17px;
        line-height: 1.9;
      }

      .brand-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 58px;

        div {
          padding: 18px 16px;
          border: 1px solid var(--oj-line);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.76);
        }

        strong,
        span {
          display: block;
        }

        strong {
          color: var(--oj-primary-strong);
          font-size: 24px;
          line-height: 1;
        }

        span {
          margin-top: 10px;
          color: var(--oj-muted);
          font-size: 13px;
        }
      }
    }

    .login-box {
      width: 100%;
      height: auto;
      min-height: 560px;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: var(--oj-shadow);
      border: 1px solid rgba(229, 231, 220, 0.92);
      border-radius: 24px;
      padding: 48px 48px 0;
      overflow: hidden;
  
      .logo-box {
        display: flex;
        align-items: center;
  
        &.refister-logo {
          margin-bottom: 56px;
        }
  
        img {
          width: 56px;
          height: 56px;
          margin-right: 14px;
          border-radius: 14px;
          background: var(--oj-primary);
        }
  
        .sys-name {
          font-family: PingFangSC, PingFang SC;
          font-weight: 700;
          font-size: 22px;
          color: var(--oj-ink);
          line-height: 30px;
          margin-bottom: 8px;
        }
  
        .sys-sub-name {
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: var(--oj-muted);
          line-height: 20px;
          font-style: italic;
        }
      }
  
      .form-box-title {
        height: 92px;
        display: flex;
        align-items: center;
  
        span {
          font-family: PingFangSC, PingFang SC;
          font-weight: 700;
          font-size: 26px;
          color: var(--oj-ink);
          line-height: 33px;
          display: block;
          height: 33px;
          margin-right: 40px;
          position: relative;
          letter-spacing: 1px;
          cursor: pointer;
  
          &.active {
            font-weight: bold;
  
            &::before {
              position: absolute;
              content: '';
              bottom: -13px;
              left: 0;
              width: 100%;
              height: 5px;
              background: #32C5FF;
              border-radius: 10px;
            }
          }
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
  
          &.refister-submit {
            margin-top: 72px;
          }
  
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
  
          .error-tip {
            position: absolute;
            width: 140px;
            text-align: right;
            padding-right: 12px;
            height: 20px;
            font-family: PingFangSC, PingFang SC;
            font-weight: 400;
            font-size: 14px;
            color: #FD4C40;
            line-height: 20px;
            right: 0;
  
            &.bottom {
              right: 157px;
            }
          }
  
          .el-input {
            width: 360px;
            font-family: PingFangSC, PingFang SC;
            font-weight: 400;
            font-size: 16px;
            color: var(--oj-ink);
          }
  
          .el-input__wrapper {
            border: none;
            box-shadow: none;
            background: transparent;
            width: 230px;
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
      min-height: calc(100vh - 72px);

      .login-shell {
        grid-template-columns: 1fr;
        width: min(520px, calc(100vw - 48px));
        padding: 24px 0;
      }

      .brand-panel {
        min-height: auto;
        padding: 26px;

        h1 {
          margin-top: 28px;
          font-size: 32px;
        }

        p {
          font-size: 15px;
        }

        .brand-metrics {
          margin-top: 28px;
        }
      }

      .login-box {
        min-height: auto;
      }
    }
  }
  </style>
