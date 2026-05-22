<template>
  <div class="apple-dock-wrapper">
    <div class="apple-dock">
      <!-- Logo & Brand -->
      <div class="dock-brand" @click="goHome">
        <img class="dock-logo" src="@/assets/oj-logo.svg" alt="CodeFlow" />
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
          <div class="dock-wallet" title="Flow Points">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span class="points">1,250</span>
          </div>

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
                <el-dropdown-item divided @click="openLogoutDialog" class="danger-item">退出登录</el-dropdown-item>
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

  <Teleport to="body">
    <Transition name="logout-modal">
      <div
        v-if="showLogoutDialog"
        class="codeflow-logout-overlay"
        role="presentation"
        aria-modal="true"
      >
        <section class="codeflow-logout-dialog" role="dialog" aria-labelledby="logout-title">
          <div class="logout-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3" />
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
          </div>

          <div class="logout-copy">
            <p class="logout-eyebrow">CodeFlow Session</p>
            <h2 id="logout-title">退出当前账号？</h2>
            <p>退出后会清除本机登录状态和本地代码缓存，可随时重新登录继续练习。</p>
          </div>

          <div class="logout-actions">
            <button class="logout-secondary" type="button" @click="closeLogoutDialog">
              继续使用
            </button>
            <button class="logout-danger" type="button" @click="confirmLogout">
              退出登录
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, watch } from 'vue';
import router from '@/router';
import { getToken, removeToken } from '@/utils/cookie';
import { logoutService, getUserInfoService } from '@/apis/user';
import { eventBus } from '@/utils/eventBus';
import { clearAllStorage } from '@/utils/codeStorage';
import { ElMessage } from 'element-plus';

const isLogin = ref(false);
const showLogoutDialog = ref(false);
const userInfo = reactive({
  nickName: '',
  avatar: ''
});

onMounted(() => {
  eventBus.$on('user-info-updated', checkLogin);
});

onUnmounted(() => {
  eventBus.$off('user-info-updated', checkLogin);
  document.body.classList.remove('codeflow-modal-open');
});

watch(showLogoutDialog, (visible) => {
  document.body.classList.toggle('codeflow-modal-open', visible);
});

async function checkLogin() {
  if (getToken()) {
    try {
      const userInfoRes = await getUserInfoService();
      Object.assign(userInfo, userInfoRes.data);
      isLogin.value = true;
    } catch (e) {
      console.error(e);
      isLogin.value = false;
    }
  } else {
    isLogin.value = false;
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

function openLogoutDialog() {
  showLogoutDialog.value = true;
}

function closeLogoutDialog() {
  showLogoutDialog.value = false;
}

async function confirmLogout() {
  try {
    if (getToken()) {
      await logoutService();
    }
  } catch (error) {
    console.warn('Server logout failed, clearing local session anyway.', error);
  } finally {
    removeToken();
    clearAllStorage();
    isLogin.value = false;
    showLogoutDialog.value = false;
    eventBus.$emit('user-info-updated');
    ElMessage.success('已退出登录');
    router.push('/c-oj/login');
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
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: saturate(190%) blur(24px);
  -webkit-backdrop-filter: saturate(190%) blur(24px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.06), 
    0 0 0 1px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  gap: 32px;
  max-width: min(92vw, 760px);
  width: max-content;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dock-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding-left: 2px;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.05) translateY(-1px);
  }

  .dock-logo {
    width: 128px;
    height: 42px;
    border-radius: 16px;
    object-fit: contain;
    filter: drop-shadow(0 10px 18px rgba(44, 166, 112, 0.16));
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
    font-weight: 600;
    color: var(--oj-muted);
    text-decoration: none;
    transition: 
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
      background-color 0.2s, 
      color 0.2s, 
      box-shadow 0.2s;

    &:hover {
      color: var(--oj-ink);
      background: rgba(0, 0, 0, 0.04);
      transform: scale(1.08) translateY(-1px);
    }

    &.is-active {
      color: var(--oj-ink);
      background: var(--oj-surface);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.02);
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
    transition: 
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
      background-color 0.2s, 
      color 0.2s;

    &:hover {
      color: var(--oj-ink);
      background: rgba(0, 0, 0, 0.04);
      transform: scale(1.12) translateY(-1px);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .dock-wallet {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 16px;
    background: linear-gradient(135deg, #2c2c2e, #1c1c1e);
    color: #f5f5f7;
    cursor: pointer;
    transition: 
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
      box-shadow 0.25s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: scale(1.05) translateY(-1px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    }

    svg {
      color: #f59e0b; /* Golden Flow Points color */
    }

    .points {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
  }

  .dock-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    border-radius: 24px;
    cursor: pointer;
    transition: 
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
      background-color 0.2s;
    border: 1px solid transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
      transform: scale(1.04) translateY(-1px);
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
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
    transition: 
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
      opacity 0.2s ease,
      box-shadow 0.2s;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

@media (max-width: 720px) {
  .apple-dock-wrapper {
    top: 12px;
    padding: 0 12px;
  }

  .apple-dock {
    width: 100%;
    max-width: 100%;
    height: 58px;
    gap: 12px;
    padding: 0 10px;
    border-radius: 24px;
  }

  .dock-brand {
    .dock-logo {
      width: 112px;
      height: 38px;
    }
  }

  .dock-nav {
    gap: 4px;

    .dock-item {
      padding: 7px 10px;
      font-size: 14px;
    }
  }

  .dock-actions {
    gap: 8px;
    padding-right: 0;

    .dock-icon-btn {
      width: 32px;
      height: 32px;
    }

    .dock-user {
      padding: 2px;

      .user-name {
        display: none;
      }
    }
  }
}

@media (max-width: 420px) {
  .dock-brand {
    .dock-logo {
      width: 98px;
    }
  }

  .dock-nav .dock-item {
    padding: 7px 8px;
  }
}
</style>

<style lang="scss">
body.codeflow-modal-open {
  overflow: hidden;
}

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

.codeflow-logout-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.62), rgba(246, 247, 250, 0.22) 34%, rgba(18, 28, 45, 0.28) 100%),
    rgba(16, 24, 40, 0.28);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}

.codeflow-logout-dialog {
  width: min(420px, calc(100vw - 32px));
  padding: 28px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 251, 255, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 32px 90px rgba(15, 23, 42, 0.24),
    0 0 0 1px rgba(0, 122, 255, 0.05) inset;
  color: var(--oj-ink);
  text-align: center;
  transform-origin: center;
}

.logout-mark {
  width: 58px;
  height: 58px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(0, 122, 255, 0.14), rgba(52, 199, 89, 0.12)),
    rgba(255, 255, 255, 0.78);
  color: var(--oj-primary);
  box-shadow:
    0 14px 28px rgba(0, 122, 255, 0.14),
    0 0 0 1px rgba(0, 122, 255, 0.1) inset;

  svg {
    width: 28px;
    height: 28px;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.logout-copy {
  .logout-eyebrow {
    margin: 0 0 8px;
    color: #667085;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    color: var(--oj-ink);
    font-size: 24px;
    font-weight: 850;
    line-height: 1.22;
    letter-spacing: 0;
  }

  p:not(.logout-eyebrow) {
    margin: 12px auto 0;
    max-width: 320px;
    color: #667085;
    font-size: 14px;
    line-height: 1.7;
  }
}

.logout-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 26px;

  button {
    min-height: 46px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0;
    transition:
      transform 180ms var(--motion-spring),
      box-shadow 180ms var(--motion-spring-soft),
      background 180ms var(--motion-spring-soft);

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.96);
    }
  }
}

.logout-secondary {
  background: rgba(17, 24, 39, 0.06);
  color: var(--oj-ink);

  &:hover {
    background: rgba(17, 24, 39, 0.09);
  }
}

.logout-danger {
  background: linear-gradient(135deg, #ff3b30 0%, #d70015 100%);
  color: #fff;
  box-shadow: 0 12px 28px rgba(215, 0, 21, 0.2);

  &:hover {
    box-shadow: 0 16px 34px rgba(215, 0, 21, 0.26);
  }
}

.logout-modal-enter-active,
.logout-modal-leave-active {
  transition:
    opacity 220ms var(--motion-spring-soft),
    backdrop-filter 220ms var(--motion-spring-soft);
}

.logout-modal-enter-active .codeflow-logout-dialog,
.logout-modal-leave-active .codeflow-logout-dialog {
  transition:
    opacity 240ms var(--motion-spring-soft),
    transform 240ms var(--motion-spring);
}

.logout-modal-enter-from,
.logout-modal-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
}

.logout-modal-enter-from .codeflow-logout-dialog,
.logout-modal-leave-to .codeflow-logout-dialog {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}

@media (max-width: 520px) {
  .codeflow-logout-overlay {
    padding: 16px;
  }

  .codeflow-logout-dialog {
    padding: 24px 20px 20px;
    border-radius: 22px;
  }

  .logout-actions {
    grid-template-columns: 1fr;
  }
}
</style>
