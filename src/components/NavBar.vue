<template>
    <div class="oj-navbar">
      <div class="oj-navbar-menus">
        <div class="oj-navbar-brand">
          <img class="oj-navbar-logo" src="@/assets/logo.png" />
          <div>
            <strong>DevKnight OJ</strong>
            <span>Practice Workbench</span>
          </div>
        </div>
        <el-menu router class="oj-navbar-menu" mode="horizontal">
          <el-menu-item index="/c-oj/home/question">题库</el-menu-item>
          <el-menu-item index="/c-oj/home/exam">竞赛</el-menu-item>
        </el-menu>
      </div>
      <div class="oj-navbar-users">
        <img v-if="isLogin" class="oj-message" @click="goMessage" src="@/assets/message/message.png" />
        <el-dropdown v-if="isLogin">
          <div class="oj-navbar-name">
            <img class="oj-head-image" v-if="isLogin" :src="userInfo.avatar" />
            <span>{{ userInfo.nickName }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goUserDetail">
                <div class="oj-navabar-item">
                  <span>个人中心</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item @click="goMyExam">
                <div class="oj-navabar-item">
                  <span>我的竞赛</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class="oj-navabar-item">
                  <span @click="handleLogout">退出登录</span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span class="oj-navbar-login-btn" v-if="!isLogin" @click="goLogin">登录</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref } from 'vue';
  import router from '@/router';
  import { getToken, removeToken } from '@/utils/cookie';
  import { logoutService, getUserInfoService } from '@/apis/user';
  import { onMounted } from 'vue';
  import { onUnmounted } from 'vue';
  import { eventBus } from '@/utils/eventBus';
import { clearAllStorage } from '@/utils/codeStorage';
  
  const isLogin = ref(false)
  const userInfo = reactive({
    nickName: '',
    avatar: ''
  })

  // 监听全局事件：用户信息更新时重新获取数据
  onMounted(() => {
    eventBus.$on('user-info-updated', checkLogin);
  });

  // 组件卸载时移除监听（避免内存泄漏）
  onUnmounted(() => {
    eventBus.$off('user-info-updated', checkLogin);
  });
  
  async function checkLogin() {
    if (getToken()) {
      //  后端是需要提供一个接口完成，这两件事情的
      //  1. 判断当前token是否过期（判断当前用户是否还处于登录状态）
      //  2. 将当前用户的头像、昵称返回
      const userInfoRes = await getUserInfoService()
      Object.assign(userInfo, userInfoRes.data)
      isLogin.value = true
    }
  }
  checkLogin()
  
  function goLogin() {
    router.push('/c-oj/login')
  }
  
  function goMyExam() {
    router.push('/c-oj/home/user/exam')
  }
  
  function goUserDetail() {
    router.push('/c-oj/home/user/detail')
  }
  
  function goMessage() {
    router.push('/c-oj/home/user/message')
  }
  
  async function handleLogout() {
    await ElMessageBox.confirm(
      '确认退出',
      '温馨提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '退出',
        type: 'warning',
      }
    )
    try {
        await logoutService();
        removeToken();
        clearAllStorage();
        isLogin.value = false;
        //不需要退回到登录页 因为能够进行一部分的操作
    } catch(error) {
        ElMessage.error(error.message);
    }
  }
  
  
  </script>
  
  <style lang="scss" scoped>
  .oj-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    padding: 0 28px;
    box-sizing: border-box;
    max-width: 1520px;
    margin: 0 auto;
    border: 1px solid rgba(229, 231, 220, 0.9);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 10px 34px rgba(17, 24, 39, 0.06);
    backdrop-filter: blur(16px);
  
    .oj-navbar-menus {
      display: flex;
      align-items: center;

      .oj-navbar-brand {
        display: flex;
        align-items: center;
        min-width: 246px;
        margin-right: 30px;

        strong,
        span {
          display: block;
        }

        strong {
          color: var(--oj-ink);
          font-size: 16px;
          line-height: 20px;
        }

        span {
          margin-top: 2px;
          color: var(--oj-muted);
          font-size: 12px;
        }
      }
  
      .el-menu-item {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 15px;
        color: var(--oj-muted);
        line-height: 40px;
        text-align: center;
        min-width: 68px;
        height: 40px;
        margin-right: 8px;
        border-radius: 999px;
      }
    }
  
    .oj-navbar-logo {
      width: 40px;
      height: 40px;
      background: var(--oj-primary);
      border-radius: 12px;
      cursor: pointer;
      object-fit: contain;
      margin-right: 12px;
    }
  
    .oj-navbar-menu {
      width: 280px;
      border: none;
      background: transparent;
  
      .el-menu-item {
        font-size: 15px;
        font-weight: 700;
        background-color: transparent !important;
        transition: none;
        border: none;
        line-height: 40px;

        &:hover,
        &.is-active {
          background: var(--oj-primary-soft) !important;
          color: var(--oj-primary-strong) !important;
        }
      }
    }
  
    .oj-navbar-users {
      display: flex;
      align-items: center;
    }
  
    .oj-navbar-login-btn {
      line-height: 36px;
      margin-right: 0;
      padding: 0 18px;
      border-radius: 999px;
      background: var(--oj-primary);
      display: inline-block;
      font-family: PingFangSC, PingFang SC;
      font-weight: 700;
      font-size: 14px;
      color: #fff;
      text-align: center;
      cursor: pointer;
  
      .line {
        display: inline-block;
        width: 25px;
      }
    }
  
    .oj-message {
      cursor: pointer;
      width: 22px;
      height: 22px;
      opacity: 0.72;
    }
  
    .oj-head-image {
      width: 34px;
      height: 34px;
      border-radius: 30px;
      margin-right: 10px;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1px var(--oj-line);
    }
  
    .oj-navbar-name {
      cursor: pointer;
      margin-right: 0;
      font-weight: 700;
      color: var(--oj-ink);
      margin-left: 15px;
      font-size: 14px;
      width: 132px;
      height: 42px;
      padding: 4px 10px 4px 4px;
      border: 1px solid var(--oj-line);
      border-radius: 999px;
      background: #fff;
      display: flex;
      align-items: center;
    }
  
    .oj-navabar-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 32px;
    }
  }
  </style>
