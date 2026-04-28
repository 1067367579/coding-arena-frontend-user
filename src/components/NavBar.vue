<template>
  <div class="apple-dock-wrapper">
    <div class="apple-dock">
      <!-- Logo & Brand -->
      <div class="dock-brand" @click="goHome">
        <img class="dock-logo" src="@/assets/logo.png" alt="DevKnight" />
        <span class="dock-title">DevKnight</span>
      </div>

      <!-- Navigation Links -->
      <div class="dock-nav">
        <router-link to="/c-oj/home/question" class="dock-item" active-class="is-active">
          题库
        </router-link>
        <router-link to="/c-oj/home/exam" class="dock-item" active-class="is-active">
          竞赛
        </router-link>
      </div>

      <!-- User Actions -->
      <div class="dock-actions">
        <template v-if="isLogin">
          <div class="dock-icon-btn" @click="goMessage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          
          <el-dropdown trigger="click">
            <div class="dock-user">
              <img :src="userInfo.avatar" class="user-avatar" />
              <span class="user-name">{{ userInfo.nickName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="apple-dropdown">
                <el-dropdown-item @click="goUserDetail">个人中心</el-dropdown-item>
                <el-dropdown-item @click="goMyExam">我的竞赛</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout" class="danger-item">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="apple-btn-primary" @click="goLogin">登录</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import router from '@/router';
import { getToken, removeToken } from '@/utils/cookie';
import { logoutService, getUserInfoService } from '@/apis/user';
import { eventBus } from '@/utils/eventBus';
import { clearAllStorage } from '@/utils/codeStorage';
import { ElMessageBox, ElMessage } from 'element-plus';

const isLogin = ref(false);
const userInfo = reactive({
  nickName: '',
  avatar: ''
});

onMounted(() => {
  eventBus.$on('user-info-updated', checkLogin);
});

onUnmounted(() => {
  eventBus.$off('user-info-updated', checkLogin);
});

async function checkLogin() {
  if (getToken()) {
    try {
      const userInfoRes = await getUserInfoService();
      Object.assign(userInfo, userInfoRes.data);
      isLogin.value = true;
    } catch (e) {
      console.error(e);
    }
  }
}
checkLogin();

function goHome() {
  router.push('/c-oj/home');
}
function goLogin() {
  router.push('/c-oj/login');
}
function goMyExam() {
  router.push('/c-oj/home/user/exam');
}
function goUserDetail() {
  router.push('/c-oj/home/user/detail');
}
function goMessage() {
  router.push('/c-oj/home/user/message');
}

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'apple-message-box'
  });
  try {
    await logoutService();
    removeToken();
    clearAllStorage();
    isLogin.value = false;
  } catch (error) {
    ElMessage.error(error.message);
  }
}
</script>

<style lang="scss" scoped>
.apple-dock-wrapper {
  position: fixed;
  top: 24px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 100;
  pointer-events: none; /* Let clicks pass through the wrapper */
}

.apple-dock {
  pointer-events: auto; /* Re-enable clicks for the dock */
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
  gap: 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dock-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding-left: 8px;

  .dock-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
  }

  .dock-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--oj-ink);
    letter-spacing: -0.02em;
  }
}

.dock-nav {
  display: flex;
  align-items: center;
  gap: 8px;

  .dock-item {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 500;
    color: var(--oj-muted);
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      color: var(--oj-ink);
      background: rgba(0, 0, 0, 0.04);
    }

    &.is-active {
      color: var(--oj-ink);
      background: var(--oj-surface);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }
}

.dock-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 8px;

  .dock-icon-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--oj-muted);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--oj-ink);
      background: rgba(0, 0, 0, 0.04);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .dock-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--oj-ink);
    }
  }

  .apple-btn-primary {
    padding: 8px 20px;
    border-radius: 20px;
    background: var(--oj-ink);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.1s ease, opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>

<style lang="scss">
/* Global overrides for Apple-style dropdowns */
.apple-dropdown {
  border-radius: 16px !important;
  padding: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;

  .el-dropdown-menu__item {
    border-radius: 8px;
    margin: 2px 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--oj-ink);

    &:hover {
      background: var(--oj-primary-soft);
      color: var(--oj-primary);
    }
  }

  .danger-item {
    color: var(--oj-danger) !important;
    &:hover {
      background: var(--oj-danger-soft) !important;
      color: var(--oj-danger) !important;
    }
  }
}
</style>
