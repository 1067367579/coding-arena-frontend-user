<template>
    <div class="oj-main-layout">
      <div class="oj-main-layout-header">
        <div class="oj-main-layout-nav">
          <Navbar></Navbar>
        </div>
      </div>
      <div v-if="$route.meta.showBanner" class="practice-hero">
        <div>
          <span class="hero-label">Algorithm Practice</span>
          <h2>题库与竞赛工作台</h2>
          <p>筛选题目、加入竞赛、提交代码，并把训练过程沉淀成稳定的刷题节奏。</p>
        </div>
        <div class="hero-stats">
          <span><strong>128</strong>题目</span>
          <span><strong>12</strong>竞赛</span>
          <span><strong>94%</strong>可用率</span>
        </div>
      </div>
    </div>
    <RouterView />
  </template>
  
  <script setup>
  import Navbar from '@/components/NavBar.vue'
  </script>
  
  <style lang="scss" scoped>
  .el-main {
    padding: 0;
  }
  
  .oj-main-layout {
    padding-top: 0;

    .practice-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      max-width: 1520px;
      min-height: 176px;
      margin: 18px auto 0;
      padding: 32px 36px;
      border: 1px solid rgba(22, 131, 74, 0.12);
      border-radius: 22px;
      background:
        linear-gradient(135deg, rgba(22, 131, 74, 0.14), rgba(245, 158, 11, 0.08)),
        linear-gradient(180deg, #ffffff 0%, #f8faf5 100%);
      box-shadow: var(--oj-shadow-sm);

      .hero-label {
        display: inline-flex;
        margin-bottom: 12px;
        color: var(--oj-primary-strong);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0;
      }

      h2 {
        margin: 0;
        color: var(--oj-ink);
        font-size: 34px;
        line-height: 1.2;
      }

      p {
        max-width: 560px;
        margin: 12px 0 0;
        color: var(--oj-muted);
        font-size: 15px;
        line-height: 1.7;
      }

      .hero-stats {
        display: flex;
        gap: 12px;

        span {
          min-width: 92px;
          padding: 14px 16px;
          border: 1px solid var(--oj-line);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.72);
          color: var(--oj-muted);
          font-size: 13px;
        }

        strong {
          display: block;
          margin-bottom: 4px;
          color: var(--oj-ink);
          font-size: 22px;
        }
      }
    }
  
    .oj-main-layout-header {
      height: 72px;
      position: fixed;
      width: 100%;
      padding: 8px 24px 0;
      background: transparent;
      left: 0;
      top: 0;
      z-index: 10;
    }
  
    .oj-main-layout-nav {
      max-width: 1520px;
      min-width: 100%;
      margin: 0 auto;
      height: 64px;
      background: transparent;
    }
  
    // banner 图
    .oj-ship-banner {
      max-width: 1520px;
      min-width: 1520;
      margin: 0 auto;
      width: 100%;
      height: 100%;
      height: 350px;
      // width: 1677px;
      color: #ffffff;
      background: url("@/assets/index_bg.png") left top no-repeat;
      background-size: cover;
      overflow: hidden;
    }
  }
  </style>
