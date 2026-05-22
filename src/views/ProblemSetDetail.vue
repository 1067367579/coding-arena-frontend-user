<template>
  <div class="problem-set-detail">
    <button class="back-link" type="button" @click="goBack">
      <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      返回题库
    </button>

    <section class="set-hero" :class="problemSet.gradientClass">
      <div class="hero-glass"></div>
      <div class="hero-copy">
        <span>{{ problemSet.eyebrow }}</span>
        <h1>{{ problemSet.title }}</h1>
        <p>{{ problemSet.description }}</p>
      </div>
      <div class="hero-meta">
        <div>
          <strong>{{ problemSet.total }}</strong>
          <span>题目总数</span>
        </div>
        <div>
          <strong>{{ problemSet.problems.length }}</strong>
          <span>当前收录</span>
        </div>
        <div>
          <strong>{{ problemSet.focus }}</strong>
          <span>训练重点</span>
        </div>
      </div>
    </section>

    <div class="detail-grid">
      <main class="problem-list-panel">
        <div class="panel-heading">
          <div>
            <span>Curated Track</span>
            <h2>题单问题列表</h2>
          </div>
          <button
            class="join-plan-btn"
            :class="{ joined: isJoined, pulsing: successPulse }"
            type="button"
            @click="handleJoinPlan"
          >
            <span class="checkmark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            {{ isJoined ? '已加入学习计划' : 'Join Study Plan' }}
          </button>
        </div>

        <div class="plan-note" :class="{ visible: successPulse }">
          <span class="note-dot"></span>
          已同步到 Daily Goal Tracker，今天可以从这组题开始推进。
        </div>

        <div class="problem-list">
          <article
            v-for="(problem, index) in problemSet.problems"
            :key="problem.questionId"
            class="problem-row"
            :style="{ '--stagger': `${index * 52}ms` }"
          >
            <div class="problem-index">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="problem-main">
              <h3>{{ problem.title }}</h3>
              <div class="problem-meta">
                <span class="difficulty-pill" :class="getDifficultyClass(problem.difficulty)">
                  {{ getDifficultyLabel(problem.difficulty) }}
                </span>
                <span>{{ problem.topic }}</span>
                <span>AC Rate {{ problem.acRate }}</span>
              </div>
            </div>
            <button class="start-btn" type="button" @click="startProblem(problem.questionId)">
              开始
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </article>
        </div>
      </main>

      <aside class="leaderboard-panel">
        <div class="leaderboard-heading">
          <span>Daily Leaderboard</span>
          <h2>Top Achievers</h2>
          <p>过去 24 小时内，本题单 AC 数最多的 10 位用户。</p>
        </div>

        <div class="leaderboard-list">
          <div
            v-for="(user, index) in leaderboard"
            :key="user.name"
            class="leaderboard-row"
            :style="{ '--stagger': `${index * 42}ms` }"
          >
            <div class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</div>
            <div class="avatar">{{ user.avatar }}</div>
            <div class="leader-user">
              <strong>{{ user.name }}</strong>
              <span>Accepted in 24h</span>
            </div>
            <div class="ac-count">{{ user.ac }}</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { getLeaderboardBySetId, getProblemSetById } from '@/data/problemSets'
import { getJoinedStudyPlanId, joinStudyPlan } from '@/utils/studyPlan'

const route = useRoute()
const joinedPlanId = ref(getJoinedStudyPlanId())
const successPulse = ref(false)
let pulseTimer = null

const problemSet = computed(() => getProblemSetById(route.params.setId))
const leaderboard = computed(() => getLeaderboardBySetId(problemSet.value.id))
const isJoined = computed(() => joinedPlanId.value === problemSet.value.id)

function goBack() {
  router.push('/c-oj/home/question')
}

function handleJoinPlan() {
  joinStudyPlan(problemSet.value.id)
  joinedPlanId.value = problemSet.value.id
  successPulse.value = false
  window.requestAnimationFrame(() => {
    successPulse.value = true
    window.clearTimeout(pulseTimer)
    pulseTimer = window.setTimeout(() => {
      successPulse.value = false
    }, 880)
  })
}

function startProblem(questionId) {
  router.push(`/c-oj/answer?questionId=${questionId}`)
}

function getDifficultyClass(difficulty) {
  if (difficulty === 1) return 'easy'
  if (difficulty === 2) return 'medium'
  if (difficulty === 3) return 'hard'
  return ''
}

function getDifficultyLabel(difficulty) {
  if (difficulty === 1) return '简单'
  if (difficulty === 2) return '中等'
  if (difficulty === 3) return '困难'
  return '未分级'
}

function getRankClass(index) {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

onBeforeUnmount(() => {
  window.clearTimeout(pulseTimer)
})
</script>

<style lang="scss" scoped>
.problem-set-detail {
  width: 100%;
  padding: 24px 0 80px;
}

.back-link {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--oj-ink);
  background: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition:
    transform var(--motion-mid) var(--motion-spring),
    box-shadow var(--motion-mid) var(--motion-spring-soft),
    background var(--motion-fast) var(--motion-spring-soft);

  &:hover {
    transform: translateY(-2px);
    background: #fff;
    box-shadow: 0 14px 28px rgba(29, 29, 31, 0.08);
  }
}

.set-hero {
  position: relative;
  min-height: clamp(280px, 34vw, 420px);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(240px, 0.85fr);
  gap: 24px;
  align-items: end;
  padding: clamp(26px, 5vw, 48px);
  border-radius: 16px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(29, 29, 31, 0.16);
  animation: cf-slide-fade-up 380ms var(--motion-spring-soft) both;

  &.from-emerald-to-teal {
    background:
      radial-gradient(circle at 76% 14%, rgba(255, 255, 255, 0.34), transparent 30%),
      linear-gradient(135deg, #0f9f6e 0%, #05a7a0 100%);
  }

  &.from-sky-to-indigo {
    background:
      radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.34), transparent 30%),
      linear-gradient(135deg, #0a84ff 0%, #4554d8 100%);
  }

  &.from-indigo-to-violet {
    background:
      radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.32), transparent 28%),
      linear-gradient(135deg, #3f46d8 0%, #8d3ed6 100%);
  }

  &.from-amber-to-rose {
    background:
      radial-gradient(circle at 76% 16%, rgba(255, 255, 255, 0.36), transparent 28%),
      linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%);
  }
}

.hero-glass {
  position: absolute;
  inset: 1px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;

  span {
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 640px;
    margin: 14px 0 16px;
    font-size: clamp(42px, 8vw, 82px);
    font-weight: 950;
    line-height: 0.98;
    letter-spacing: -0.05em;
  }

  p {
    max-width: 560px;
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    font-weight: 650;
    line-height: 1.72;
  }
}

.hero-meta {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;

  div {
    min-height: 76px;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(20px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #fff;
    font-size: 23px;
    font-weight: 900;
    line-height: 1.15;
  }

  span {
    margin-top: 5px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    font-weight: 800;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 30%);
  gap: 24px;
  align-items: start;
  margin-top: 24px;
}

.problem-list-panel,
.leaderboard-panel {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.03), 
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: cf-slide-fade-up 360ms var(--motion-spring-soft) both;
}

.leaderboard-panel {
  animation-delay: 90ms;
}

.problem-list-panel {
  padding: clamp(20px, 4vw, 34px);
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 12px;

  span {
    color: var(--oj-muted);
    font-size: 12px;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    margin: 7px 0 0;
    color: var(--oj-ink);
    font-size: clamp(24px, 3vw, 34px);
    font-weight: 900;
    letter-spacing: -0.02em;
  }
}

.join-plan-btn {
  position: relative;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 18px;
  border-radius: 999px;
  color: #fff;
  background: #007aff;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 18px 36px rgba(0, 122, 255, 0.22);
  transition:
    transform var(--motion-mid) var(--motion-spring),
    box-shadow var(--motion-mid) var(--motion-spring-soft),
    background var(--motion-fast) var(--motion-spring-soft);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 44px rgba(0, 122, 255, 0.3);
  }

  &.joined {
    background: #248a3d;
    box-shadow: 0 18px 36px rgba(36, 138, 61, 0.18);
  }

  &.pulsing {
    animation: join-pop 0.72s cubic-bezier(0.16, 1, 0.3, 1);

    .checkmark {
      animation: check-pulse 0.72s ease;
    }
  }
}

.checkmark {
  width: 24px;
  height: 24px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.plan-note {
  max-height: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  overflow: hidden;
  color: #248a3d;
  font-size: 13px;
  font-weight: 750;
  opacity: 0;
  transition: max-height 0.28s ease, opacity 0.28s ease, margin 0.28s ease;

  &.visible {
    max-height: 42px;
    margin: 8px 0 16px;
    opacity: 1;
  }
}

.note-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #248a3d;
}

.problem-list {
  display: flex;
  flex-direction: column;
}

.problem-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f5f5f7;
  opacity: 0;
  animation: cf-slide-fade-left 340ms var(--motion-spring-soft) both;
  animation-delay: var(--stagger);
  transition:
    transform var(--motion-mid) var(--motion-spring),
    background var(--motion-fast) var(--motion-spring-soft),
    box-shadow var(--motion-mid) var(--motion-spring-soft);

  &:hover {
    transform: translateX(4px);
    background: rgba(0, 122, 255, 0.035);
    box-shadow: inset 3px 0 0 rgba(0, 122, 255, 0.28);
  }

  &:last-child {
    border-bottom: 0;
  }
}

.problem-index {
  color: #a1a1a6;
  font-size: 15px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.problem-main {
  h3 {
    margin: 0 0 10px;
    color: var(--oj-ink);
    font-size: 18px;
    font-weight: 850;
    line-height: 1.28;
  }
}

.problem-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--oj-muted);
  font-size: 12px;
  font-weight: 700;
}

.difficulty-pill {
  min-width: 48px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;

  &.easy { background: #248a3d; }
  &.medium { background: #c65d00; }
  &.hard { background: #d70015; }
}

.start-btn {
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border-radius: 999px;
  color: #007aff;
  background: rgba(0, 122, 255, 0.08);
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
  transition:
    transform var(--motion-mid) var(--motion-spring),
    background var(--motion-fast) var(--motion-spring-soft),
    box-shadow var(--motion-mid) var(--motion-spring-soft);

  svg {
    transition: transform 0.18s ease;
  }

  &:hover {
    transform: translateY(-2px);
    background: rgba(0, 122, 255, 0.12);
    box-shadow: 0 12px 22px rgba(0, 122, 255, 0.12);

    svg {
      transform: translateX(3px);
    }
  }
}

.leaderboard-panel {
  padding: 22px;
  position: sticky;
  top: 112px;
}

.leaderboard-heading {
  margin-bottom: 12px;

  span {
    color: var(--oj-muted);
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    margin: 7px 0 6px;
    color: var(--oj-ink);
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    color: var(--oj-muted);
    font-size: 13px;
    line-height: 1.55;
  }
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
}

.leaderboard-row {
  display: grid;
  grid-template-columns: 28px 38px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid #f5f5f7;
  opacity: 0;
  animation: cf-slide-fade-left 320ms var(--motion-spring-soft) both;
  animation-delay: var(--stagger);
  transition:
    transform var(--motion-mid) var(--motion-spring),
    background var(--motion-fast) var(--motion-spring-soft);

  &:hover {
    transform: translateX(4px);
    background: rgba(0, 122, 255, 0.035);
  }

  &:last-child {
    border-bottom: 0;
  }
}

.rank-badge {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #8e8e93;
  background: #f5f5f7;
  font-size: 12px;
  font-weight: 850;

  &.gold {
    color: #6e4a00;
    background: linear-gradient(135deg, #ffe08a, #ffb340);
  }

  &.silver {
    color: #4c5661;
    background: linear-gradient(135deg, #eef2f7, #c9d2df);
  }

  &.bronze {
    color: #6c3d18;
    background: linear-gradient(135deg, #ffd2a1, #c87435);
  }
}

.avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, #0a84ff, #34c759);
  font-size: 12px;
  font-weight: 900;
}

.leader-user {
  min-width: 0;

  strong,
  span {
    display: block;
  }

  strong {
    overflow: hidden;
    color: var(--oj-ink);
    font-size: 14px;
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    margin-top: 2px;
    color: var(--oj-muted);
    font-size: 11px;
    font-weight: 700;
  }
}

.ac-count {
  color: var(--oj-ink);
  font-size: 18px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

@keyframes join-pop {
  0% { transform: scale(0.96); }
  42% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

@keyframes check-pulse {
  0% { transform: scale(0.72); opacity: 0.5; }
  45% { transform: scale(1.22); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@media (max-width: 1024px) {
  .set-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .leaderboard-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .problem-set-detail {
    padding: 16px 0 56px;
  }

  .set-hero {
    padding: 24px;
  }

  .hero-meta {
    grid-template-columns: 1fr;
  }

  .panel-heading {
    flex-direction: column;
  }

  .join-plan-btn {
    width: 100%;
  }

  .problem-row {
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 12px;

    .start-btn {
      grid-column: 2;
      width: fit-content;
    }
  }
}
</style>
