# CodeFlow Online Judge 协同开发规范与贡献指南

为了保证 CodeFlow 评测平台前端代码库的长期健康度、组件复用度、代码风格一致性以及团队协同效率，所有前端开发人员在提交代码或创建 Pull Request (PR) 前，必须严格遵守本开发规范。

---

## 1. Git 分支管理与协同工作流

我们采用简化的 **Git Flow** 工作流进行代码版本控制：

### 1.1 分支分类定义
- **`main`（主分支）**：生产环境稳定分支。只接受来自 `develop` 或 `hotfix/*` 的合并，任何情况下不允许在 `main` 分支直接提交代码。
- **`develop`（开发分支）**：日常功能集成与测试分支。
- **`feature/*`（特性分支）**：新功能开发分支（如 `feature/online-ide`）。开发完毕后，需提交 PR 并通过 CI 编译及 Code Review 后方可合并回 `develop`。
- **`bugfix/*` 或 `refactor/*`**：日常问题修复或代码重构分支（如先前创建的 `refactor/ui-beautify`）。
- **`hotfix/*`（紧急修复分支）**：用于线上生产环境紧急 Bug 的修复，直接从 `main` 拉出，修复完毕后同时合并回 `main` 和 `develop`。

### 1.2 分支命名规范
分支名称一律采用小写英文字符，以下划线或中划线分隔，格式为：
`分支类型/功能简述`  
- 正确示例：`feature/user-heatmap`, `bugfix/editor-font-size`, `refactor/navbar-teleport`
- 错误示例：`feature_login`, `test-112`, `lujingxiang-fix`

---

## 2. Git Commit 提交信息规范

所有提交信息统一采用 **Angular Commit 规范**。格式如下：

```text
<type>(<scope>): <subject>

<body>
```

### 2.1 字段定义
- **`type` (必须)**：用于声明本次 commit 的改动类别：
  - `feat`：引入新功能（feature）。
  - `fix`：修复 Bug。
  - `docs`：仅修改了文档相关内容（如当前文档）。
  - `style`：代码格式调整（不影响逻辑的改动，如空格、分号缩进、格式化）。
  - `refactor`：重构代码（既非新增功能也非修复 Bug）。
  - `perf`：提升性能、加载速度或内存占用的修改。
  - `test`：增加或修改测试用例。
  - `chore`：构建流程、辅助开发工具或依赖库升级的改动（如修改了 `package.json`）。
- **`scope` (可选)**：指出本次提交受影响的模块范围（如 `navbar`, `editor`, `router`）。
- **`subject` (必须)**：对本次变动的简短概括（中文，控制在 50 字以内，结尾不加句号）。
- **`body` (可选)**：对本次变动的详细补充说明（动机、实现思路、重大变化等）。

### 2.2 正确示例
- `feat(user): 增加个人中心答题热力图组件`
- `fix(editor): 修复代码编辑器在 Java 语言下行号错位的问题`
- `refactor(style): 重构对话框过渡动画，采用苹果弹簧阻尼曲线`
- `docs(readme): 补充编译部署 Nginx 配置说明`

---

## 3. Vue 3 编码与风格规范

项目基于 Vue 3 核心开发，并强制采用 **Composition API** 编写逻辑。

### 3.1 单文件组件 (SFC) 编写规范
1. **代码顺序结构**：每个 `.vue` 文件内部标签顺序必须统一：
   ```vue
   <template>
     <!-- 结构 HTML -->
   </template>

   <script setup>
     // 业务 JS/TS 逻辑
   </script>

   <style lang="scss" scoped>
     /* 局部样式 CSS/SCSS */
   </style>
   ```
2. **强制使用 scoped 局部样式**：为了防止组件之间的 CSS 选择器相互污染，所有的 `<style>` 标签必须声明 `scoped` 属性。
3. **Element Plus 组件样式重写**：
   如果需要强行重写 Element Plus 的样式，请使用深度选择器 `:deep()`，切勿在不加 `scoped` 的全局样式表中随意涂写。
   - 正确写法：
     ```css
     :deep(.el-input__wrapper) {
       border-radius: var(--oj-radius-sm) !important;
     }
     ```

### 3.2 变量声明与 JavaScript (ES6+) 规范
1. **变量定义限制**：
   - 严禁使用过时的 `var`。
   - 所有不需要被重新赋值的标识符一律声明为 `const`。
   - 可能会被重新赋值的标识符声明为 `let`。
2. **异步控制**：
   - 弃用传统的 Promise 链式嵌套（`then().catch()`），异步请求一律改用 `async/await` 语法配合 `try/catch` 捕获异常，确保代码的可读性与扁平性。
3. **隐式自动导入**：
   - 项目由于引入了 `unplugin-auto-import`，在 `<script setup>` 中，Vue 核心 API（如 `ref`, `reactive`, `computed`, `watch`, `onMounted` 等）可以**直接使用**，无需再在头部手动书写 `import`。

---

## 4. Code Review 与代码提交检查表

在您向代码托管仓库提交 PR 前，请务必执行以下本地自检：

- [ ] **编译测试**：本地运行 `npm run build`，确认打包编译顺利通过，控制台无语法级警告（Warning）和错误（Error）。
- [ ] **清理 Debug 代码**：确认代码中无残留的 `console.log`、`debugger` 语句以及未使用的占位变量。
- [ ] **适配度检查**：检查所有编写的卡片或布局在小屏/移动端下的缩放情况，确保无溢出、无文字重叠。
- [ ] **语义化 HTML**：使用符合语义的 HTML5 标签，如按钮使用 `<button>` 而非用双向绑定的 `<div>`，以便于屏幕阅读器与键盘焦点的无障碍使用。
