<template>
  <div class="apple-profile-page">
    <div class="page-container">
      
      <!-- Profile Header -->
      <div class="profile-header floating-card fade-rise">
        <div class="header-content">
          <div class="avatar-wrapper">
            <img :src="userDetailForm.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'" alt="Avatar">
            <div class="rank-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              Lvl 5
            </div>
          </div>
          <div class="user-info">
            <h1 class="user-name">{{ userDetailForm.nickName || 'Code Ninja' }}</h1>
            <p class="user-bio">{{ userDetailForm.introduce || 'Talk is cheap. Show me the code.' }}</p>
            <div class="user-tags">
              <span class="tag"># {{ userDetailForm.major || 'Computer Science' }}</span>
              <span class="tag">Global Rank: {{ mockData.globalRank }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="apple-btn-subtle" @click="goBack">返回</button>
          <button class="apple-btn" @click="editUser">编辑主页</button>
        </div>
      </div>

      <div class="profile-grid">
        <!-- Left Column: Dashboard & Streaks & Recent AC -->
        <div class="left-col fade-rise" style="animation-delay: 100ms;">
          
          <!-- Statistics Dashboard -->
          <div class="stats-card floating-card">
            <h3 class="section-title">Statistics</h3>
            
            <div class="stats-overview">
              <div class="progress-ring-container">
                <svg viewBox="0 0 100 100" class="progress-ring">
                  <circle cx="50" cy="50" r="40" class="bg-circle"></circle>
                  <circle cx="50" cy="50" r="40" class="progress-circle" :stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * mockData.solvedRatio)"></circle>
                </svg>
                <div class="ring-content">
                  <span class="ring-num">{{ mockData.totalSolved }}</span>
                  <span class="ring-label">Solved</span>
                </div>
              </div>
              
              <div class="stats-list">
                <div class="stat-item easy">
                  <span class="diff-label">Easy</span>
                  <span class="diff-val">{{ mockData.solvedEasy }} <span class="diff-total">/ 450</span></span>
                </div>
                <div class="stat-item medium">
                  <span class="diff-label">Medium</span>
                  <span class="diff-val">{{ mockData.solvedMedium }} <span class="diff-total">/ 900</span></span>
                </div>
                <div class="stat-item hard">
                  <span class="diff-label">Hard</span>
                  <span class="diff-val">{{ mockData.solvedHard }} <span class="diff-total">/ 350</span></span>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="metrics-row">
              <div class="metric">
                <span class="val">{{ mockData.contestRating }}</span>
                <span class="lbl">Contest Rating</span>
              </div>
              <div class="metric">
                <span class="val">{{ mockData.globalRank }}</span>
                <span class="lbl">Global Rank</span>
              </div>
            </div>
          </div>

          <!-- Streak & Social Psychology -->
          <div class="streak-card floating-card">
            <div class="streak-item current">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <polyline points="13 2 13 9 22 9 11 22 11 15 2 15 13 2"></polyline>
              </svg>
              <div class="streak-text">
                <span class="streak-lbl">Current Streak</span>
                <span class="streak-val">{{ mockData.currentStreak }} Days</span>
              </div>
            </div>
            <div class="streak-item max">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <div class="streak-text">
                <span class="streak-lbl">Max Streak</span>
                <span class="streak-val">{{ mockData.maxStreak }} Days</span>
              </div>
            </div>
          </div>

          <!-- Recent AC List -->
          <div class="recent-ac-card floating-card">
            <h3 class="section-title">Recent AC</h3>
            <ul class="ac-list">
              <li class="ac-item" v-for="item in mockData.recentAC" :key="item.id">
                <div class="ac-info">
                  <span class="ac-title">{{ item.title }}</span>
                  <span class="ac-time">{{ item.time }}</span>
                </div>
                <span class="ac-diff" :class="item.diff.toLowerCase()">{{ item.diff }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Column: Heatmap & Sets -->
        <div class="right-col fade-rise" style="animation-delay: 200ms;">
          
          <!-- Contribution Heatmap -->
          <div class="heatmap-card floating-card">
            <div class="heatmap-header">
              <h3 class="section-title">
                {{ mockData.submissionsInYear }} submissions in the past year
              </h3>
              <div class="year-selector">2026</div>
            </div>
            
            <div class="heatmap-container">
              <div class="heatmap-grid">
                <div 
                  v-for="(level, index) in heatmapData" 
                  :key="index" 
                  class="heat-cell" 
                  :data-level="level"
                  :title="`${level > 0 ? level * 3 : 0} submissions on this day`"
                ></div>
              </div>
              <div class="heatmap-legend">
                <span>Less</span>
                <div class="heat-cell" data-level="0"></div>
                <div class="heat-cell" data-level="1"></div>
                <div class="heat-cell" data-level="2"></div>
                <div class="heat-cell" data-level="3"></div>
                <div class="heat-cell" data-level="4"></div>
                <span>More</span>
              </div>
            </div>
          </div>

          <!-- Problem Sets Section -->
          <div class="problem-sets-card floating-card">
            <h3 class="section-title">Participated Problem Sets</h3>
            <div class="sets-grid">
              <div class="set-card" v-for="set in mockData.problemSets" :key="set.id">
                <div class="set-icon" :class="set.colorClass">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <div class="set-content">
                  <h4 class="set-title">{{ set.title }}</h4>
                  <p class="set-desc">{{ set.desc }}</p>
                </div>
                <div class="set-progress">
                  <span class="prog-text">{{ set.progress }}%</span>
                  <div class="prog-bar-bg">
                    <div class="prog-bar-fill" :style="{ width: set.progress + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { getUserDetailService } from '@/apis/user'
import router from '@/router'

// API Bindings (Reactive)
const userDetailForm = reactive({})

// Mock Data for new UI (Wait for API expansion in future)
const mockData = reactive({
  totalSolved: 326,
  solvedRatio: 326 / 1700,
  solvedEasy: 142,
  solvedMedium: 145,
  solvedHard: 39,
  globalRank: '14,302',
  contestRating: 1845,
  currentStreak: 14,
  maxStreak: 45,
  submissionsInYear: 1402,
  recentAC: [
    { id: 1, title: 'Two Sum', time: '2 hours ago', diff: 'Easy' },
    { id: 2, title: 'LRU Cache', time: '14 hours ago', diff: 'Medium' },
    { id: 3, title: 'Median of Two Sorted Arrays', time: '1 day ago', diff: 'Hard' },
    { id: 4, title: 'Longest Palindromic Substring', time: '2 days ago', diff: 'Medium' },
    { id: 5, title: 'Trapping Rain Water', time: '3 days ago', diff: 'Hard' }
  ],
  problemSets: [
    { id: 1, title: 'Top Interview 150', desc: 'Curated list of essential interview questions.', progress: 45, colorClass: 'bg-blue' },
    { id: 2, title: 'Dynamic Programming Mastery', desc: 'Learn DP from scratch to advanced.', progress: 12, colorClass: 'bg-purple' }
  ]
})

// Generate realistic looking heatmap data (52 weeks * 7 days = 364 days)
const heatmapData = ref([])
onMounted(() => {
  const data = []
  for (let i = 0; i < 364; i++) {
    // Random distribution heavily weighted towards 0 and 1
    const rand = Math.random()
    let level = 0
    if (rand > 0.6) level = 1
    if (rand > 0.8) level = 2
    if (rand > 0.9) level = 3
    if (rand > 0.96) level = 4
    data.push(level)
  }
  heatmapData.value = data

  getUserDetail()
})

async function getUserDetail() {
  try {
    const userRef = await getUserDetailService()
    Object.assign(userDetailForm, userRef.data)
  } catch(e) {
    console.warn("Using mock data due to missing token or API error.")
  }
}

function goBack() {
  router.go(-1)
}

function editUser() {
  // In a real app, this would open a modal or route to an edit page
  console.log("Edit User Triggered")
}
</script>

<style lang="scss" scoped>
.apple-profile-page {
  padding: 40px 0 80px;
  min-height: 100vh;
  background: #fbfbfd;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.floating-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0,0,0,0.02);
}

.fade-rise {
  animation: cf-slide-fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cf-slide-fade-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Header Section */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;

  .header-content {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .avatar-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .rank-badge {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ff9f0a, #ff375f);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 2px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(255, 55, 95, 0.4);
    }
  }

  .user-info {
    .user-name {
      font-size: 24px;
      font-weight: 800;
      color: var(--oj-ink);
      margin: 0 0 4px;
    }

    .user-bio {
      font-size: 14px;
      color: var(--oj-muted);
      margin: 0 0 12px;
    }

    .user-tags {
      display: flex;
      gap: 12px;
      
      .tag {
        font-size: 12px;
        font-weight: 600;
        color: var(--oj-subtle);
        background: #f5f5f7;
        padding: 4px 10px;
        border-radius: 8px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;

    button {
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      
      &:active { transform: scale(0.96); }
    }

    .apple-btn { background: var(--oj-ink); color: #fff; }
    .apple-btn-subtle { background: #f5f5f7; color: var(--oj-ink); &:hover{ background: #e5e5ea; } }
  }
}

/* Main Grid Layout */
.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .profile-grid { grid-template-columns: 1fr; }
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--oj-ink);
  margin: 0 0 20px;
}

/* Statistics Dashboard */
.stats-card {
  .stats-overview {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .progress-ring-container {
    position: relative;
    width: 80px;
    height: 80px;

    .progress-ring {
      width: 100%; height: 100%;
      transform: rotate(-90deg);

      .bg-circle {
        fill: none;
        stroke: #f5f5f7;
        stroke-width: 6;
      }

      .progress-circle {
        fill: none;
        stroke: #ff9500;
        stroke-width: 6;
        stroke-linecap: round;
        transition: stroke-dashoffset 1s ease-out;
      }
    }

    .ring-content {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      
      .ring-num {
        display: block;
        font-size: 18px;
        font-weight: 800;
        color: var(--oj-ink);
      }
      
      .ring-label {
        font-size: 10px;
        font-weight: 600;
        color: var(--oj-muted);
      }
    }
  }

  .stats-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;

      .diff-total { color: var(--oj-muted); font-size: 11px; }
      
      &.easy { color: #34c759; .diff-val { color: var(--oj-ink); } }
      &.medium { color: #ff9500; .diff-val { color: var(--oj-ink); } }
      &.hard { color: #ff3b30; .diff-val { color: var(--oj-ink); } }
    }
  }

  .divider {
    height: 1px;
    background: #f5f5f7;
    margin: 20px 0;
  }

  .metrics-row {
    display: flex;
    justify-content: space-between;
    
    .metric {
      text-align: center;
      flex: 1;

      &:first-child { border-right: 1px solid #f5f5f7; }

      .val {
        display: block;
        font-size: 20px;
        font-weight: 800;
        color: var(--oj-ink);
        margin-bottom: 2px;
      }

      .lbl {
        font-size: 12px;
        color: var(--oj-muted);
        font-weight: 600;
      }
    }
  }
}

/* Streak Card */
.streak-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  .streak-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
    
    &.current {
      background: linear-gradient(135deg, #fff5e6, #fff);
      color: #ff9500;
    }
    
    &.max {
      background: linear-gradient(135deg, #e8f5e9, #fff);
      color: #34c759;
    }

    .streak-text {
      display: flex;
      flex-direction: column;

      .streak-lbl { font-size: 12px; font-weight: 700; color: var(--oj-muted); }
      .streak-val { font-size: 18px; font-weight: 800; color: var(--oj-ink); }
    }
  }
}

/* Recent AC */
.recent-ac-card {
  .ac-list {
    list-style: none;
    padding: 0; margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .ac-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #fbfbfd;
      border-radius: 12px;

      .ac-info {
        display: flex;
        flex-direction: column;
        
        .ac-title { font-size: 14px; font-weight: 600; color: var(--oj-ink); }
        .ac-time { font-size: 11px; color: var(--oj-muted); margin-top: 4px; }
      }

      .ac-diff {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;

        &.easy { background: rgba(52, 199, 89, 0.1); color: #248A3D; }
        &.medium { background: rgba(255, 149, 0, 0.1); color: #B26800; }
        &.hard { background: rgba(255, 59, 48, 0.1); color: #CC2F26; }
      }
    }
  }
}

/* Heatmap Card */
.heatmap-card {
  .heatmap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .section-title { margin: 0; }
    
    .year-selector {
      font-size: 13px;
      font-weight: 600;
      color: var(--oj-ink);
      background: #f5f5f7;
      padding: 6px 12px;
      border-radius: 8px;
    }
  }

  .heatmap-container {
    overflow-x: auto;
    padding-bottom: 8px;
    
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb { background: #d1d1d6; border-radius: 4px; }
  }

  .heatmap-grid {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
    gap: 4px;
    width: max-content;
  }

  .heat-cell {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    background: #ebedf0;
    transition: transform 0.1s;

    &:hover { transform: scale(1.2); }

    &[data-level="1"] { background: #9be9a8; }
    &[data-level="2"] { background: #40c463; }
    &[data-level="3"] { background: #30a14e; }
    &[data-level="4"] { background: #216e39; }
  }

  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: flex-end;
    margin-top: 16px;
    font-size: 11px;
    color: var(--oj-muted);
    
    span { padding: 0 4px; }
  }
}

/* Problem Sets Card */
.problem-sets-card {
  .sets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .set-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: #fbfbfd;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.03);

    .set-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;

      &.bg-blue { background: linear-gradient(135deg, #0a84ff, #005bb5); }
      &.bg-purple { background: linear-gradient(135deg, #af52de, #5e289c); }
    }

    .set-content {
      flex: 1;
      min-width: 0;
      
      .set-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--oj-ink);
        margin: 0 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .set-desc {
        font-size: 12px;
        color: var(--oj-muted);
        margin: 0 0 12px;
        line-height: 1.4;
      }

      .set-progress {
        display: flex;
        align-items: center;
        gap: 8px;

        .prog-text {
          font-size: 11px;
          font-weight: 700;
          color: var(--oj-muted);
          width: 30px;
        }

        .prog-bar-bg {
          flex: 1;
          height: 6px;
          background: #e5e5ea;
          border-radius: 3px;
          overflow: hidden;

          .prog-bar-fill {
            height: 100%;
            background: #34c759;
            border-radius: 3px;
          }
        }
      }
    }
  }
}
</style>
