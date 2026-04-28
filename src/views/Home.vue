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
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
      width: min(1520px, calc(100% - 48px));
      max-width: 1520px;
      min-height: 186px;
      margin: 18px auto 28px;
      padding: 38px 44px;
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 28px;
      background:
        radial-gradient(120% 120% at 0% 0%, rgba(22, 131, 74, 0.18) 0%, rgba(255, 255, 255, 0) 100%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 245, 0.95) 100%);
      box-shadow: 0 24px 48px -12px rgba(15, 111, 59, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);

      .hero-label {
        display: inline-flex;
        margin-bottom: 16px;
        padding: 6px 14px;
        background: rgba(22, 131, 74, 0.08);
        border-radius: 999px;
        color: var(--oj-primary-strong);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      h2 {
        margin: 0;
        color: var(--oj-ink);
        font-size: 38px;
        font-weight: 900;
        line-height: 1.2;
        letter-spacing: -0.5px;
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
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 12px;

        span {
          min-width: 96px;
          padding: 16px 20px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.6);
          color: var(--oj-muted);
          font-size: 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          backdrop-filter: blur(10px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
          }
        }

        strong {
          display: block;
          margin-bottom: 6px;
          color: var(--oj-ink);
          font-size: 26px;
          font-weight: 900;
        }
      }
    }
  
    .oj-main-layout-header {
      height: 72px;
      position: fixed;
      width: 100%;
      padding: 8px 24px 0;
      box-sizing: border-box;
      background: transparent;
      left: 0;
      top: 0;
      z-index: 10;
    }
  
    .oj-main-layout-nav {
      max-width: 1520px;
      width: 100%;
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
