# CodeFlow Online Judge API 接口与数据模型说明书

本文档定义了 CodeFlow Online Judge 前端（`oj-c`）与后端网关及模拟服务（Mock Service）之间的接口通信协议、公共数据结构及各个业务接口的详细设计规范。

---

## 1. 协议规范与网络模型

### 1.1 数据通信协议
- **传输层协议**：HTTP/HTTPS
- **内容类型**：`application/json;charset=utf-8`（对于包含文件的上传采用 `multipart/form-data`）
- **基准路径 (Base URL)**：本地开发环境为 `/dev-api`（代理映射至网关服务 `http://127.0.0.1:19090/friend`），生产环境根据配置解析。

### 1.2 统一响应数据结构 (Envelope Model)
所有 API 接口均返回统一的 JSON 报文封包：
```typescript
interface ApiResponse<T = any> {
  code: number;  // 业务状态码：1000 代表成功，3001 代表令牌失效，其他为业务报错
  msg: string;   // 异常或状态描述信息
  data?: T;      // 具体业务实体数据，可为对象、数组或空值
}
```

对于分页查询接口，响应数据的 `data` 域包装为分页对象：
```typescript
interface PageResult<T> {
  rows: T[];     // 当前页数据记录集合
  total: number; // 总记录数
}
```

### 1.3 身份认证与安全头
- 身份令牌（Token）统一通过前端 Cookie 维护，键名为 `authentication`（前缀为 `Bearer `）。
- 当 Token 存在时，`request.js` 拦截器会自动往请求头中加入 `authentication` 字段。

---

## 2. 公共数据模型 (Data Models)

### 2.1 用户模型 (UserModel)
```typescript
interface UserModel {
  userId: number;       // 用户唯一标识
  nickName: string;     // 用户昵称
  avatar: string;       // 头像 URL 地址
  gender: 0 | 1 | 2;    // 性别 (0: 未设置, 1: 男, 2: 女)
  school?: string;      // 毕业/在读学校
  major?: string;       // 专业
  phone: string;        // 手机号码
  email?: string;       // 邮箱地址
  wechat?: string;      // 微信账号
  introduce?: string;   // 个人简介
}
```

### 2.2 题目模型 (QuestionModel)
```typescript
interface QuestionModel {
  questionId: number;   // 题目唯一 ID
  title: string;        // 题目标题
  difficulty: 1 | 2 | 3;// 难度等级 (1: 简单, 2: 中等, 3: 困难)
  timeLimit: number;    // 时间限制 (单位: 毫秒)
  spaceLimit: number;   // 空间限制 (单位: 字节)
  content?: string;     // 题目 HTML 内容描述
  defaultCode?: string; // 题目初始样板代码（如 Java Class Main）
}
```

### 2.3 竞赛模型 (ExamModel)
```typescript
interface ExamModel {
  examId: number;       // 竞赛唯一 ID
  title: string;        // 竞赛名称
  startTime: string;    // 开始时间 (格式: YYYY-MM-DD HH:mm:ss)
  endTime: string;      // 结束时间 (格式: YYYY-MM-DD HH:mm:ss)
  enter: boolean;       // 当前用户是否已报名/进入该比赛
}
```

### 2.4 判题结果模型 (SubmitResultModel)
```typescript
interface SubmitResultModel {
  pass: 0 | 1;          // 评测是否全部通过 (1: 通过, 0: 未通过)
  exeMessage?: string;  // 编译错误或运行异常的详细堆栈信息
  userExeResultList?: TestcaseResult[]; // 各测试用例比对结果列表
}

interface TestcaseResult {
  input: string;        // 输入数据
  output: string;       // 标准输出数据
  exeOutput: string;    // 用户代码实际输出数据
}
```

---

## 3. 业务接口模块定义

### 3.1 用户认证与管理模块 (User API)
文件路径：`src/apis/user.js`

#### 3.1.1 发送登录验证码
- **接口 URL**：`/user/code`
- **请求方式**：`POST`
- **请求负载 (Payload)**：
  ```typescript
  {
    phone: string; // 手机号码
  }
  ```
- **接口说明**：向指定手机号发送一次性短信登录验证码。

#### 3.1.2 验证码登录
- **接口 URL**：`/user/login`
- **请求方式**：`POST`
- **请求负载 (Payload)**：
  ```typescript
  {
    phone: string; // 手机号
    code: string;  // 6位验证码
  }
  ```
- **响应数据 (data)**：返回 JWT 字符串（Token），前端拦截器收到后会自动写入 Cookie 中。

#### 3.1.3 退出登录
- **接口 URL**：`/user/logout`
- **请求方式**：`DELETE`
- **接口说明**：注销当前用户的在线状态并清理服务端缓存。

#### 3.1.4 获取登录状态快照
- **接口 URL**：`/user/info`
- **请求方式**：`GET`
- **响应数据 (data)**：
  ```typescript
  {
    nickName: string;
    avatar: string;
  }
  ```

#### 3.1.5 获取用户详细履历
- **接口 URL**：`/user/detail`
- **请求方式**：`GET`
- **响应数据 (data)**：返回完整的 `UserModel`。

#### 3.1.6 修改个人资料
- **接口 URL**：`/user/edit`
- **请求方式**：`PUT`
- **请求负载 (Payload)**：完整的 `UserModel` 属性（可选择性传递要更改的字段）。

#### 3.1.7 更新头像
- **接口 URL**：`/user/avatar/update`
- **请求方式**：`POST`
- **请求负载 (Payload)**：可以使用表单对象形式上传：
  ```typescript
  {
    avatarFile: File; // 用户上传的图片二进制文件
  }
  ```

#### 3.1.8 在线提交答题代码
- **接口 URL**：`/user/question/rabbit/submit`
- **请求方式**：`POST`
- **请求负载 (Payload)**：
  ```typescript
  {
    examId: number | null; // 竞赛环境ID（若是日常刷题则传 null）
    questionId: number;    // 题目 ID
    code: string;          // 提交的源码
    laguage: 'java';       // 提交的编程语言
  }
  ```
- **接口说明**：利用 RabbitMQ 异步消费分发判题，前端发出提交后会在此返回成功，并通过结果查询接口轮询判题最终状态。

---

### 3.2 题库与刷题模块 (Question API)
文件路径：`src/apis/question.js`

#### 3.2.1 获取分页题库列表
- **接口 URL**：`/question/semiLogin/list`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `pageNum`: number（页码，默认 1）
  - `pageSize`: number（每页数，默认 10）
  - `keyword`: string（模糊搜索标题，可选）
  - `difficulty`: number（难度值：1-简单, 2-中等, 3-困难，可选）
- **响应数据 (data)**：返回 `PageResult<QuestionModel>` 结构，其中 rows 属性仅包含基本属性，不包含 HTML 格式的详情内容。

#### 3.2.2 获取最热刷题推荐
- **接口 URL**：`/user/question/hot`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `top`: number（推荐个数限制，例如 8）
- **响应数据 (data)**：返回最热题目数组 `QuestionModel[]`。

#### 3.2.3 获取题目详情
- **接口 URL**：`/question/detail`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `questionId`: number（题目 ID）
- **响应数据 (data)**：返回携带 `content`（富文本描述）与 `defaultCode`（默认代码模版）的完整 `QuestionModel`。

#### 3.2.4 获取上一题/下一题
- **接口 URL**：`/question/pre` 与 `/question/next`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `questionId`: number（当前题目 ID）
- **响应数据 (data)**：返回对应的题目 ID（number）。

#### 3.2.5 轮询获取代码评测结果
- **接口 URL**：`/user/question/exe/result`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `examId`: number | string (若为非竞赛题则不传或传 0)
  - `questionId`: number（题目 ID）
  - `currentTime`: string (用于去重或指示当前提交时间戳)
- **响应数据 (data)**：返回 `SubmitResultModel`。

---

### 3.3 竞赛与考试模块 (Exam API)
文件路径：`src/apis/exam.js`

#### 3.3.1 获取竞赛列表
- **接口 URL**：`/exam/semiLogin/redis/list`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `pageNum`: number
  - `pageSize`: number
  - `type`: 0 | 1（0: 未结束/进行中竞赛, 1: 已结束的历史竞赛）
- **响应数据 (data)**：返回 `PageResult<ExamModel>`。

#### 3.3.2 报名/进入竞赛
- **接口 URL**：`/user/exam/enter`
- **请求方式**：`POST`
- **请求负载 (Payload)**：
  ```typescript
  {
    examId: number; // 竞赛ID
  }
  ```

#### 3.3.3 获取竞赛天梯榜排名
- **接口 URL**：`/exam/semiLogin/rank/list`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `pageNum`: number
  - `pageSize`: number
  - `examId`?: number
- **响应数据 (data)**：返回分页的排名结果列表。

#### 3.3.4 获取已报名的个人历史竞赛
- **接口 URL**：`/user/exam/list`
- **请求方式**：`GET`
- **响应数据 (data)**：返回 `PageResult<ExamModel>`。

#### 3.3.5 获取竞赛下的首个题目的 ID
- **接口 URL**：`/exam/getFirstQuestion`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `examId`: number
- **响应数据 (data)**：题目 ID (number)。

#### 3.3.6 竞赛内切换上一题/下一题
- **接口 URL**：`/exam/pre` 与 `/exam/next`
- **请求参数 (Query Params)**：
  - `examId`: number
  - `questionId`: number
- **响应数据 (data)**：目标题目 ID (number)。

---

### 3.4 系统消息模块 (Message API)
文件路径：`src/apis/message.js`

#### 3.4.1 获取个人系统消息列表
- **接口 URL**：`/user/message/list`
- **请求方式**：`GET`
- **请求参数 (Query Params)**：
  - `pageNum`: number
  - `pageSize`: number
- **响应数据 (data)**：返回分页的消息对象集合，每条消息包含标题 `title`、正文 `content`。
