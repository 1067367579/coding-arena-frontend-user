# CodeFlow — Online Judge 前端平台

> 聚合题库训练、代码评测与在线竞赛的一站式编程学习平台。

CodeFlow 是一个面向算法竞赛与编程面试训练的 Online Judge 前端项目。采用 **Vue 3 + Vite** 技术栈构建，搭配 **Element Plus** 组件库与自研 **Apple 风格毛玻璃设计系统**，为用户提供优雅、现代、高效的编码体验。

---

## 目录

- [技术栈](#技术栈)
- [功能概览](#功能概览)
- [页面说明](#页面说明)
- [项目结构](#项目结构)
- [设计系统](#设计系统)
- [快速开始](#快速开始)
- [构建与部署](#构建与部署)
- [开发规范](#开发规范)

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) | ^3.5 |
| 构建工具 | Vite | ^6.2 |
| 路由 | Vue Router | ^4.5 |
| UI 组件库 | Element Plus (中文本地化) | ^2.9 |
| 代码编辑器 | Ace Editor (ace-builds) | ^1.40 |
| HTTP 客户端 | Axios | ^1.8 |
| CSS 预处理器 | Sass (sass-embedded) | ^1.86 |
| Cookie 管理 | js-cookie | ^3.0 |
| 组件自动导入 | unplugin-auto-import + unplugin-vue-components | — |

---

## 功能概览

- **📝 精选题库** — 分类筛选、难度标签、分页浏览，支持关键词搜索
- **💻 在线代码编辑器** — 集成 Ace Editor 的多语言代码编辑与提交评测
- **🏆 竞赛系统** — 报名参赛、实时排行榜、赛后成绩报告
- **📚 题单系统** — 精心编排的训练题单，支持学习计划跟踪
- **📊 学习仪表盘** — 用户 AC 热力图、每日目标进度、连续打卡记录
- **🤖 AI 洞察** — 个性化学习建议与每日训练推荐
- **💰 Flow Points** — 竞赛积分与激励系统
- **📬 消息中心** — 系统通知与竞赛提醒

---

## 页面说明

### 核心页面

| 页面 | 文件 | 路由 | 说明 |
|------|------|------|------|
| 首页/布局 | `Home.vue` | `/c-oj/home` | 顶层布局容器，包含 Hero 品牌区域、导航 Dock 和子路由出口 |
| 精选题库 | `Question.vue` | `/c-oj/home/question` | 主工作台页面：题目列表、搜索筛选、题单广场入口、AI 洞察侧边栏、AC 热力图 |
| 竞赛广场 | `Exam.vue` | `/c-oj/home/exam` | 竞赛卡片网格、时间筛选、状态标签、Hall of Fame 排行榜侧边栏 |
| 代码编辑器 | `Answer.vue` | `/c-oj/answer` | 全屏 IDE 工作区：左侧题目面板 + 右侧代码编辑器 + 底部控制台 |
| 登录 | `Login.vue` | `/c-oj/login` | 毛玻璃登录卡片，支持账号密码与验证码双模式 |

### 二级页面

| 页面 | 文件 | 路由 | 说明 |
|------|------|------|------|
| 题单广场 | `ProblemSetGallery.vue` | `/c-oj/home/problem-set-gallery` | 全部题单浏览，按分类分组、热度排序 |
| 题单详情 | `ProblemSetDetail.vue` | `/c-oj/home/problem-set/:setId` | 题单问题列表、加入学习计划、每日排行榜 |
| 竞赛详情 | `ContestDetail.vue` | `/c-oj/home/exam/:examId` | 多状态 Hero（赛前/进行中/已结束）、实时排行榜 |
| 竞赛成绩 | `ExamResult.vue` | `/c-oj/exam/result` | 成绩报告、得分环、总排行榜 |
| 个人中心 | `UserDetail.vue` | `/c-oj/home/user/detail` | 个人资料、AC 统计、段位徽章、连续打卡 |
| 我的竞赛 | `UserExam.vue` | `/c-oj/home/user/exam` | 已参加竞赛列表，支持复盘练习 |
| 消息中心 | `UserMessage.vue` | `/c-oj/home/user/message` | 系统通知列表，支持删除与深度链接 |

---

## 项目结构

```
oj-c/
├── index.html                      # 应用入口 HTML
├── vite.config.js                   # Vite 配置（代理、插件、别名）
├── package.json                     # 依赖与脚本
│
├── public/                          # 静态资源
│
└── src/
    ├── main.js                      # 应用入口（挂载 Vue/Router/ElementPlus）
    ├── App.vue                      # 根组件
    │
    ├── assets/                      # 静态资源与样式
    │   ├── main.scss                # 🎨 全局设计系统（设计令牌 + 组件基础样式）
    │   ├── oj-logo.svg              # 品牌 Logo
    │   ├── images/                  # 页面插图
    │   ├── ide/                     # IDE 相关图标
    │   ├── message/                 # 消息图标
    │   └── user/                    # 用户相关图标
    │
    ├── components/                  # 可复用组件
    │   ├── NavBar.vue               # 🧭 顶部导航 Dock（macOS 风格放大动效）
    │   ├── CodeEditor.vue           # 💻 Ace Editor 代码编辑器封装
    │   └── QuestionSelector.vue     # 🔽 难度筛选下拉组件
    │
    ├── views/                       # 页面视图组件（共 12 个）
    │   ├── Home.vue                 # 布局框架 + Hero 区域
    │   ├── Question.vue             # 题库工作台
    │   ├── Exam.vue                 # 竞赛广场
    │   ├── Answer.vue               # 代码编辑工作区
    │   ├── Login.vue                # 登录页
    │   ├── ProblemSetGallery.vue    # 题单广场
    │   ├── ProblemSetDetail.vue     # 题单详情
    │   ├── ContestDetail.vue        # 竞赛详情
    │   ├── ExamResult.vue           # 竞赛成绩
    │   ├── UserDetail.vue           # 个人中心
    │   ├── UserExam.vue             # 我的竞赛
    │   └── UserMessage.vue          # 消息中心
    │
    ├── router/
    │   └── index.js                 # 路由配置（懒加载 + 嵌套路由）
    │
    ├── apis/                        # API 请求模块
    │   ├── question.js              # 题目相关接口
    │   ├── exam.js                  # 竞赛相关接口
    │   ├── user.js                  # 用户相关接口
    │   └── message.js               # 消息相关接口
    │
    ├── data/
    │   └── problemSets.js           # 题单静态数据（含排行榜 Mock）
    │
    └── utils/                       # 工具函数
        ├── request.js               # Axios 实例封装（拦截器 + 错误处理）
        ├── cookie.js                # Token 存取（js-cookie）
        ├── codeStorage.js           # 代码本地持久化（localStorage）
        ├── studyPlan.js             # 学习计划状态管理
        ├── eventBus.js              # 事件总线（发布/订阅模式）
        └── mockService.js           # 开发环境 Mock 数据服务
```

---

## 设计系统

项目采用自研的 **Apple-style Glassmorphism** 设计语言，所有视觉令牌定义于 `src/assets/main.scss`。

### 设计令牌

```scss
// 色彩
--oj-ink: #1D1D1F          // 主文字
--oj-muted: #86868B        // 次要文字
--oj-primary: #007AFF      // 品牌蓝
--oj-accent: #FF9500       // 强调橙
--oj-success: #34C759      // 成功绿
--oj-danger: #FF3B30       // 危险红

// 表面
--oj-surface: #FFFFFF       // 卡片底色
--oj-app-background: ...    // 多色网格渐变背景

// 圆角
--oj-radius: 20px           // 大圆角
--oj-radius-sm: 14px        // 小圆角

// 动效曲线
--motion-spring: cubic-bezier(0.18, 1.18, 0.22, 1)
--motion-spring-soft: cubic-bezier(0.2, 0.9, 0.2, 1)
```

### 核心视觉特性

| 特性 | 实现方式 |
|------|----------|
| **毛玻璃卡片** | `backdrop-filter: blur(20px) saturate(190%)` + 半透明白色背景 + 白色边框 |
| **网格渐变背景** | 4 层径向渐变（蓝/绿/粉/紫）叠加线性渐变，营造柔和的色彩光晕 |
| **弹簧曲线动画** | 所有 hover/transition 使用 spring 贝塞尔曲线，模拟物理弹性 |
| **品牌渐变文字** | CodeFlow 标题使用 `background-clip: text` 实现墨→蓝→紫渐变 |
| **macOS Dock 放大** | 导航栏图标 hover 时 `scale(1.08) translateY(-1px)` |
| **定制滚动条** | 全局 6px 圆角滚动条，hover 时加宽并高亮 |

---

## 快速开始

### 环境要求

- **Node.js** ≥ 18.0
- **npm** ≥ 9.0（或 pnpm / yarn）

### 安装与启动

```bash
# 克隆项目
git clone <repository-url>
cd oj-c

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`。

### 后端代理

开发环境下，API 请求通过 Vite 代理转发到本地后端：

```
/dev-api/* → http://127.0.0.1:19090/friend/*
```

如需修改后端地址，编辑 `vite.config.js` 中的 `server.proxy` 配置。

---

## 构建与部署

```bash
# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

构建产物输出至 `dist/` 目录，可直接部署到任意静态文件服务器（Nginx / Vercel / Netlify 等）。

### 部署注意事项

- 项目使用 **HTML5 History 模式**路由，部署时需配置服务器将所有路径 fallback 到 `index.html`
- Nginx 配置示例：

  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```

---

## 开发规范

### 代码风格

- 使用 **Vue 3 Composition API** + `<script setup>` 语法
- 组件样式使用 **`<style lang="scss" scoped>`**，避免样式污染
- 所有颜色/圆角/阴影/动效 引用全局 CSS 变量（`--oj-*` / `--motion-*`）
- 卡片容器统一使用 `.floating-card` class 继承毛玻璃基础样式

### 组件命名

- 页面组件：`PascalCase`（如 `Question.vue`、`ProblemSetDetail.vue`）
- 复用组件：`PascalCase`（如 `NavBar.vue`、`CodeEditor.vue`）
- 路由 name：与组件名保持一致

### API 约定

- 所有接口函数以 `Service` 后缀命名（如 `getQuestionListService`）
- 统一通过 `utils/request.js` 封装的 Axios 实例发起请求
- Token 通过 `utils/cookie.js` 管理，自动附加至请求头

### Git 分支策略

| 分支 | 用途 |
|------|------|
| `main` | 生产分支，保持稳定可部署 |
| `refactor/ui-beautify` | UI 重构分支 |
| `feature/*` | 功能开发分支 |
| `fix/*` | 缺陷修复分支 |

---

## License

本项目仅供学习交流使用。
