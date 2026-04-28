<template>
  <div class="apple-layout">
    <Navbar></Navbar>
    
    <main class="apple-main">
      <div v-if="$route.meta.showBanner" class="hero-section">
        <div class="hero-content">
          <span class="hero-eyebrow">Online Judge System</span>
          <h1 class="hero-title">在线判题系统</h1>
          <p class="hero-subtitle">聚合题库训练、代码评测与在线竞赛。<br>让每一次提交都有清晰反馈与复盘价值。</p>
        </div>
        
        <div class="hero-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span class="stat-value">极速判题</span>
            <span class="stat-label">毫秒级评测反馈</span>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <span class="stat-value">海量题库</span>
            <span class="stat-label">覆盖核心算法考点</span>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <span class="stat-value">在线竞赛</span>
            <span class="stat-label">实时天梯排名竞技</span>
          </div>
        </div>
      </div>

      <div class="content-section">
        <RouterView v-slot="{ Component }">
          <transition name="apple-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/NavBar.vue'
</script>

<style lang="scss" scoped>
.apple-layout {
  min-height: 100vh;
  background-color: var(--oj-bg);
  display: flex;
  flex-direction: column;
}

.apple-main {
  flex: 1;
  padding-top: 120px; /* Space for floating dock */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-section {
  width: 100%;
  max-width: 1200px;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 64px;
}

.hero-content {
  max-width: 800px;
  
  .hero-eyebrow {
    display: inline-block;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--oj-muted);
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 64px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--oj-ink);
    margin: 0 0 24px 0;
  }

  .hero-subtitle {
    font-size: 21px;
    line-height: 1.5;
    color: var(--oj-muted);
    margin: 0;
  }
}

.hero-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;

  .stat-card {
    background: var(--oj-surface);
    padding: 32px 48px;
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      color: var(--oj-primary);
      margin-bottom: 8px;
      padding: 12px;
      background: rgba(0, 122, 255, 0.08);
      border-radius: 50%;
    }

    .stat-value {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--oj-ink);
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--oj-muted);
    }
  }
}

.content-section {
  width: 100%;
  max-width: 1200px;
  padding: 0 24px 80px;
  margin: 0 auto;
}

/* Page Transition */
.apple-fade-enter-active,
.apple-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.apple-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.apple-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
