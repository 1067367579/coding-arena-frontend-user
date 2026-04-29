<template>
  <div class="problem-set-gallery">
    <div class="page-container">
      <header class="gallery-header">
        <div class="header-titles">
          <span class="kicker">The Curated Path</span>
          <h1 class="title">题单广场</h1>
          <p class="subtitle">探索社区和官方精心编排的练习主题，跟随高手的脚步。</p>
        </div>
        <div class="sort-control">
          <button class="sort-btn is-active">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
            Heat Ranking
          </button>
        </div>
      </header>

      <div class="category-section" v-for="category in categorizedProblemSets" :key="category.name">
        <h2 class="category-title">{{ category.name }}</h2>
        <div class="gallery-grid">
          <article 
            class="gallery-card" 
            v-for="(set, index) in category.sets" 
            :key="set.id" 
            :style="{ '--stagger': `${index * 50}ms` }" 
            @click="goToDetail(set.id)"
          >
            <div class="card-visual" :class="set.gradientClass">
              <div class="tier-badge" v-if="set.isTrending">
                <span class="pulse-dot"></span>Trending
              </div>
              <div class="tier-badge official" v-else-if="set.author.type === 'official'">
                Official Selection
              </div>
              <!-- Placeholder for spacing if no badge -->
              <div v-else class="tier-badge-placeholder"></div>
              
              <div class="heat-index">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                {{ set.heatScore.toLocaleString() }}
              </div>
            </div>
            
            <div class="card-body">
              <div class="card-content-main">
                <h3 class="card-title">{{ set.title }}</h3>
                <p class="card-desc">{{ set.description }}</p>
              </div>
              <div class="card-author">
                <img :src="set.author.avatar" alt="avatar" class="author-avatar" />
                <div class="author-info">
                  <div class="author-name-row">
                    <span class="author-name">{{ set.author.name }}</span>
                    <span class="author-badge" :class="set.author.type">
                      {{ getAuthorBadgeText(set.author.type) }}
                    </span>
                  </div>
                  <span class="author-stats">⭐ {{ set.stars }} · 📝 {{ set.submissions }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import router from '@/router'

// Mock Data
const gallerySets = [
  {
    id: '1',
    title: 'Top Interview 150',
    description: '必须掌握的 150 道高频面试题，涵盖从数组到动态规划的核心考点。',
    gradientClass: 'from-amber-to-rose',
    stars: 12500,
    submissions: 340000,
    isTrending: true,
    category: 'Interview Prep',
    author: {
      name: 'CodeFlow Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      type: 'official' // official, community, individual
    }
  },
  {
    id: '2',
    title: 'Dynamic Programming Masterclass',
    description: '从入门到精通，彻底攻克动态规划。包含树形DP与状态压缩。',
    gradientClass: 'from-sky-to-indigo',
    stars: 8400,
    submissions: 120000,
    isTrending: false,
    category: 'Advanced Algorithms',
    author: {
      name: 'DpMaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DpMaster',
      type: 'community'
    }
  },
  {
    id: '3',
    title: 'Beginner Array & String',
    description: '新手必练，带你熟悉语言特性和基础遍历。',
    gradientClass: 'from-emerald-to-teal',
    stars: 3200,
    submissions: 85000,
    isTrending: true,
    category: 'Beginner Basics',
    author: {
      name: 'Alex Coder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      type: 'individual'
    }
  },
  {
    id: '4',
    title: 'Graph Theory Algorithms',
    description: '图论核心算法精讲与实战练习，涵盖最短路与最小生成树。',
    gradientClass: 'from-indigo-to-violet',
    stars: 5600,
    submissions: 92000,
    isTrending: false,
    category: 'Advanced Algorithms',
    author: {
      name: 'Graph Guru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guru',
      type: 'community'
    }
  },
  {
    id: '5',
    title: 'SQL 50',
    description: '高频数据库查询题目，应对后端面试。',
    gradientClass: 'from-sky-to-indigo',
    stars: 15600,
    submissions: 292000,
    isTrending: true,
    category: 'Interview Prep',
    author: {
      name: 'CodeFlow Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      type: 'official'
    }
  }
]

// Calculate Heat Score and Group by Category
const categorizedProblemSets = computed(() => {
  const setsWithHeat = gallerySets.map(set => {
    const heatScore = Math.floor(set.stars * 0.6 + (set.submissions / 10) * 0.4)
    return { ...set, heatScore }
  })
  
  const grouped = setsWithHeat.reduce((acc, set) => {
    if (!acc[set.category]) {
      acc[set.category] = []
    }
    acc[set.category].push(set)
    return acc
  }, {})

  // Map to array and sort groups (Custom order: Beginner, Advanced, Interview)
  const categoryOrder = ['Beginner Basics', 'Advanced Algorithms', 'Interview Prep']
  
  return Object.keys(grouped)
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a)
      const indexB = categoryOrder.indexOf(b)
      return (indexA > -1 ? indexA : 99) - (indexB > -1 ? indexB : 99)
    })
    .map(name => ({
      name,
      sets: grouped[name].sort((a, b) => b.heatScore - a.heatScore)
    }))
})

function getAuthorBadgeText(type) {
  if (type === 'official') return '官方'
  if (type === 'community') return '社区'
  return '个人'
}

function goToDetail(setId) {
  router.push(`/c-oj/home/problem-set/${setId}`)
}
</script>

<style lang="scss" scoped>
.problem-set-gallery {
  padding: 40px 0 80px;
  min-height: 100vh;
  background: #fbfbfd;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;

  .header-titles {
    .kicker {
      font-size: 13px;
      font-weight: 700;
      color: var(--oj-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .title {
      font-size: 40px;
      font-weight: 800;
      color: var(--oj-ink);
      margin: 8px 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 16px;
      color: var(--oj-muted);
      margin: 0;
      max-width: 500px;
    }
  }

  .sort-control {
    .sort-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 999px;
      background: var(--oj-surface);
      color: var(--oj-ink);
      font-size: 14px;
      font-weight: 700;
      border: 1px solid var(--oj-line);
      cursor: pointer;
      transition: all 0.2s ease;

      &.is-active {
        background: #fff5e6;
        color: #d97706;
        border-color: #fcd34d;
        svg { color: #f59e0b; }
      }
    }
  }
}

.category-section {
  margin-bottom: 48px;

  .category-title {
    font-size: 24px;
    font-weight: 800;
    color: var(--oj-ink);
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--oj-line);
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

/* Strict Uniform Cards */
.gallery-card {
  display: flex;
  flex-direction: column;
  height: 340px; /* Fixed height for uniformity */
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
  animation: cf-slide-fade-up 400ms var(--motion-spring-soft) both;
  animation-delay: var(--stagger);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
  }

  .card-visual {
    height: 140px; /* Fixed height portion */
    flex-shrink: 0;
    position: relative;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    &.from-amber-to-rose { background: linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%); }
    &.from-sky-to-indigo { background: linear-gradient(135deg, #0a84ff 0%, #4554d8 100%); }
    &.from-emerald-to-teal { background: linear-gradient(135deg, #0f9f6e 0%, #05a7a0 100%); }
    &.from-indigo-to-violet { background: linear-gradient(135deg, #3f46d8 0%, #8d3ed6 100%); }

    .tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 6px 12px;
      border-radius: 12px;
      color: #fff;
      font-size: 12px;
      font-weight: 700;

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ff3b30;
        box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7);
        animation: pulse 1.5s infinite;
      }
    }
    
    .tier-badge-placeholder {
      flex: 1; /* Keeps layout stable if no badge */
    }

    .heat-index {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      padding: 6px 12px;
      border-radius: 12px;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
    }
  }

  .card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex: 1; /* Occupies remaining height */
    min-height: 0; /* Prevents overflow pushing */

    .card-content-main {
      flex: 1; /* Pushes author section to bottom */
      display: flex;
      flex-direction: column;
    }

    .card-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--oj-ink);
      margin: 0 0 8px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-shrink: 0;
    }

    .card-desc {
      font-size: 13px;
      color: var(--oj-muted);
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* Strict 2 lines to ensure uniformity */
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-author {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid var(--oj-line);
      flex-shrink: 0;

      .author-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #f0f0f0;
      }

      .author-info {
        flex: 1;
        min-width: 0;

        .author-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;

          .author-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--oj-ink);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .author-badge {
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;

            &.official { background: #e8f5e9; color: #2e7d32; }
            &.community { background: #e3f2fd; color: #1565c0; }
            &.individual { background: #f3e5f5; color: #7b1fa2; }
          }
        }

        .author-stats {
          font-size: 11px;
          color: var(--oj-subtle);
          font-weight: 600;
        }
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 59, 48, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
}

@keyframes cf-slide-fade-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
