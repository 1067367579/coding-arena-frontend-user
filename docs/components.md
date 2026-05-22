# CodeFlow Online Judge 设计系统与核心组件库文档

本文档旨在描述项目的核心设计系统（Design System）和公共组件库的技术细节，供前端工程师进行 UI 协同、样板组件复用以及统一界面设计。

---

## 1. 核心设计系统 (Design System)

项目界面统一使用现代、拟物与扁平相结合的 **Apple-inspired "Glass-mesh"** 视觉设计规范。所有底座色彩与动画曲线全部通过 CSS 变量形式定义在 `src/assets/main.scss` 的 `:root` 命名空间中。

### 1.1 设计 Token 变量一览

| 变量名称 | 映射颜色/值 | 语义与用途描述 |
| :--- | :--- | :--- |
| `--oj-bg` | `#F5F6F9` | 备用底层背景色 |
| `--oj-app-background` | 四重径向渐变混合 + 线性渐变 | 动态流光背景，由冰蓝色、薄荷绿、水蜜桃粉和浅紫色混合而成 |
| `--oj-surface` | `#FFFFFF` | 卡片及前景色底色 |
| `--oj-surface-soft` | `#F5F5F7` | 浅灰色浅色底，常用于输入框悬停、列表交替背景 |
| `--oj-ink` | `#1D1D1F` | 主文本文字颜色（极高对比度） |
| `--oj-muted` | `#86868B` | 副标题、注释、辅助文字颜色 |
| `--oj-line` | `rgba(0, 0, 0, 0.05)` | 极细分割线及浅色框线颜色 |
| `--oj-primary` | `#007AFF` | 苹果标准蓝色，主品牌色，交互按钮及焦点环激活色 |
| `--oj-primary-strong` | `#0056b3` | 激活色深色版本，常用于悬停加深状态 |
| `--oj-primary-soft` | `rgba(0, 122, 255, 0.1)` | 柔和的半透明蓝色，用于高亮选项背景、幽灵按钮 |
| `--oj-accent` | `#FF9500` | 暖橙色，用于警告、高亮状态或竞赛金牌积分 |
| `--oj-danger` | `#FF3B30` | 危险红色，用于退出登录、删除、错误提醒状态 |
| `--oj-success` | `#34C759` | 绿色成功色，用于通过测试（Accepted）、答题热力图高亮 |
| `--oj-radius` | `20px` | 核心大卡片圆角 |
| `--oj-radius-sm` | `14px` | 中小圆角，如输入框、对话框、小按钮 |

### 1.2 物理级弹簧动画 Token

为了获得轻巧且符合直觉的操控感，项目定义了物理级别的三组三阶贝塞尔曲线（弹簧阻尼系数）：

- **常规弹簧曲线 (Spring Curve)**：
  `--motion-spring: cubic-bezier(0.18, 1.18, 0.22, 1)`（拥有轻微的过冲与回弹感，适用于导航项切换、大面板滑出）
- **温和渐淡曲线 (Spring Soft)**：
  `--motion-spring-soft: cubic-bezier(0.2, 0.9, 0.2, 1)`（平缓顺滑，无回冲，适用于背景半透明度变化、输入框投影高亮）
- **瞬时反馈曲线 (Spring Snappy)**：
  `--motion-spring-snappy: cubic-bezier(0.22, 1.35, 0.32, 1)`（极速过冲反应，适用于按钮按压反弹）

### 1.3 核心微交互类

#### 1.3.1 弹簧微缩动作
任何带有点击属性的组件，只需绑定以下 CSS 状态或元素选择器，即可自动启用苹果原生力回馈效果（点击时轻微缩小，松开时回弹）：
```scss
button:active, .el-button:active {
  transform: scale(0.96) !important;
  transition: transform 90ms var(--motion-spring-snappy);
}
```

#### 1.3.2 拟真毛玻璃材质卡片 (`.floating-card`)
全局公共卡片样式类，拥有多重高斯模糊、色彩饱和提升度、内嵌发光高光细边框及悬浮阻尼阴影变换。
- **静态状态**：模糊半径 `20px`，轻质底边白板，带有极细白色高光内边框以塑造边缘质感。
- **Hover 状态**：Y 轴向上偏移 `-5px`，轻微放大 `1.008` 倍，背景不透明度提亮，阴影变换为向外扩散的扩散光（蓝色柔光）。

---

## 2. 核心组件开发规范

项目在 `src/components/` 目录下开发并导出了三款重型/轻型核心组件：

### 2.1 在线代码编辑器组件 (`CodeEditor.vue`)

该组件对底层 `ace-builds` 进行了响应式集成与风格定制。提供标准的主题切换（默认 One Dark）、行号凹槽亮色高亮、自动语法补全、代码草稿联动等功能。

#### 2.1.1 API 接口定义

##### 属性 (Props)
*暂无显式 Props。该组件通过双向数据绑定 `v-model:value` 同步内容，或由父级直接调度实例方法。*

##### 事件 (Events)
- `@update:value(code: string)`：当编辑器中的源码发生任何字符级别的变更时向外发送该事件，用于双向绑定代码状态。

##### 对外暴露方法 (Exposes)
父组件必须声明 `ref` 句柄引用该组件，才能动态灌入初始化模板：
- `setAceCode(content: string)`：令编辑器实例强行覆盖写入给定的代码文本 `content`，并将光标移动至开头（常用于切换题目或重置草稿）。

#### 2.1.2 核心代码调用示例
```vue
<template>
  <div class="editor-container">
    <!-- 双向绑定 codeData，并挂载 ref 句柄 -->
    <CodeEditor 
      ref="editorRef" 
      v-model:value="codeData" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CodeEditor from '@/components/CodeEditor.vue';

const codeData = ref('');
const editorRef = ref(null);

onMounted(() => {
  // 模拟从接口异步获取题目的默认模版并填入编辑器
  const template = `public class Main {\n    public static void main(String[] args) {\n        \n    }\n}`;
  if (editorRef.value) {
    editorRef.value.setAceCode(template);
  }
});
</script>
```

---

### 2.2 难度分类筛选器组件 (`QuestionSelector.vue`)

针对 Element Plus 原生选择器过于死板的问题，该组件重构了一个自定义弹出式 Dropdown，支持简单、中等、困难三级色彩等级圆角药丸的直接映射和点击操作。

#### 2.2.1 API 接口定义

##### 属性 (Props)
- `modelValue`：`[Number, String]`，默认值为 `''`。当前选中的难度编码。其值与接口协议绑定：
  - `1`：代表“简单”（主题色为：绿色药丸 `#248A3D`）
  - `2`：代表“中等”（主题色为：暖橙药丸 `#C65D00`）
  - `3`：代表“困难”（主题色为：危险红药丸 `#D70015`）

##### 事件 (Events)
- `@update:modelValue(difficulty: number)`：触发与 `v-model` 相关的状态更新。
- `@change(difficulty: number)`：选择项发生真实变动时抛出此事件，传递最新难度编号，可在此直接调用查询列表的 API。

#### 2.2.2 核心代码调用示例
```vue
<template>
  <div class="filter-bar">
    <!-- 使用 v-model 双向绑定 queryParams 里的难度字段 -->
    <QuestionSelector 
      v-model="queryParams.difficulty" 
      @change="handleFilterChange" 
    />
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import QuestionSelector from '@/components/QuestionSelector.vue';

const queryParams = reactive({
  difficulty: '' // 默认为空（不限难度）
});

function handleFilterChange(val) {
  console.log('最新的难度筛选值为：', val);
  // 执行查询 API 重载列表数据
}
</script>
```

---

### 2.3 拟物悬浮导航 Dock 栏 (`NavBar.vue`)

该组件是一个常驻于页面顶部的导航菜单底座。它包含路由切换标签、用户 Flow 积分展示、系统消息入口、头像悬停下拉菜单（包含“个人中心”、“我的竞赛”和“安全退出”）以及带毛玻璃特效的全局 Teleport 对话框。

#### 2.3.1 业务架构与逻辑控制
- **登录状态感知**：
  在挂载阶段（`onMounted`）通过全局事件总线（`eventBus`）绑定 `user-info-updated` 事件监听。一旦检测到用户凭据变更（如成功登录或注销），将执行 `checkLogin` 函数重新发起 `/user/info` 请求更新昵称和头像。
- **本地退出缓存级连清理**：
  当用户确认退出时，在 `/user/logout` 接口调用的基础上，将执行 `clearAllStorage()` 级连删除前端 LocalStorage 中的题目草稿、学习记录，并彻底消除 Cookie 中保存的 `authentication` 会话令牌，最终平滑重定向至 `/c-oj/login`。
- **DOM 脱离挂载 (Teleport)**：
  “退出登录”弹窗使用 `<Teleport to="body">` 语法，使弹窗容器在挂载时直接脱离当前的 Dock 父节点，避免父级毛玻璃 `filter` 引起的滤镜层级和点击穿透问题。
