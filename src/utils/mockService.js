const now = new Date()
const hour = 60 * 60 * 1000
const day = 24 * hour

const formatDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const questions = [
  { questionId: 1001, title: '两数之和', difficulty: 1, timeLimit: 1000, spaceLimit: 262144 },
  { questionId: 1002, title: '最长无重复子串', difficulty: 2, timeLimit: 1500, spaceLimit: 262144 },
  { questionId: 1003, title: '合并 K 个升序链表', difficulty: 3, timeLimit: 2000, spaceLimit: 524288 },
  { questionId: 1004, title: '岛屿数量', difficulty: 2, timeLimit: 1000, spaceLimit: 262144 },
  { questionId: 1005, title: '有效括号', difficulty: 1, timeLimit: 1000, spaceLimit: 131072 },
  { questionId: 1006, title: '最短路径计数', difficulty: 3, timeLimit: 2500, spaceLimit: 524288 },
  { questionId: 1007, title: '区间合并', difficulty: 2, timeLimit: 1200, spaceLimit: 262144 },
  { questionId: 1008, title: '二叉树层序遍历', difficulty: 1, timeLimit: 1000, spaceLimit: 262144 },
]

const exams = [
  {
    examId: 2001,
    title: '春季算法挑战赛',
    startTime: formatDateTime(new Date(now.getTime() + day)),
    endTime: formatDateTime(new Date(now.getTime() + day + 3 * hour)),
    enter: false,
  },
  {
    examId: 2002,
    title: 'Java 后端工程师编程赛',
    startTime: formatDateTime(new Date(now.getTime() - hour)),
    endTime: formatDateTime(new Date(now.getTime() + 2 * hour)),
    enter: true,
  },
  {
    examId: 2003,
    title: '数据结构专项练习赛',
    startTime: formatDateTime(new Date(now.getTime() - 9 * day)),
    endTime: formatDateTime(new Date(now.getTime() - 9 * day + 3 * hour)),
    enter: true,
  },
  {
    examId: 2004,
    title: '校园新生程序设计热身赛',
    startTime: formatDateTime(new Date(now.getTime() + 3 * day)),
    endTime: formatDateTime(new Date(now.getTime() + 3 * day + 4 * hour)),
    enter: true,
  },
  {
    examId: 2005,
    title: '图论与动态规划综合赛',
    startTime: formatDateTime(new Date(now.getTime() - 14 * day)),
    endTime: formatDateTime(new Date(now.getTime() - 14 * day + 4 * hour)),
    enter: true,
  },
]

const user = {
  userId: 3001,
  nickName: 'FlowPilot',
  avatar: '/src/assets/user/head_image.png',
  gender: 1,
  school: '示例大学',
  major: '软件工程',
  phone: '13800000000',
  email: 'devknight@example.com',
  wechat: 'devknight_oj',
  introduce: '热爱算法、工程实践和在线评测系统的全栈学习者。',
}

const ok = (payload = {}) => Promise.resolve({
  data: {
    code: 1000,
    msg: 'mock success',
    ...payload,
  },
})

const pageRows = (rows, params = {}) => {
  const pageNum = Number(params.pageNum || 1)
  const pageSize = Number(params.pageSize || rows.length || 10)
  const start = (pageNum - 1) * pageSize
  return {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
  }
}

const questionDetail = (questionId) => {
  const base = questions.find((item) => String(item.questionId) === String(questionId)) || questions[0]
  return {
    ...base,
    content: `
      <p>给定一个输入集合，请你设计一个时间复杂度合理的算法完成求解。</p>
      <p><strong>输入：</strong>第一行包含若干整数，后续行包含测试数据。</p>
      <p><strong>输出：</strong>输出满足题意的结果。</p>
      <pre>示例输入：2 7 11 15, target = 9<br/>示例输出：0 1</pre>
    `,
    defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello OJ\");\n    }\n}`,
  }
}

export function mockRequest(config) {
  const { url, method = 'get', params = {}, data = {} } = config

  if (url === '/user/code' && method === 'post') return ok()
  if (url === '/user/login' && method === 'post') return ok({ data: 'mock-token' })
  if (url === '/user/logout') return ok()
  if (url === '/user/info') return ok({ data: { nickName: user.nickName, avatar: user.avatar } })
  if (url === '/user/detail') return ok({ data: user })
  if (url === '/user/edit' || url === '/user/avatar/update') return ok({ data })

  if (url === '/question/semiLogin/list') {
    const keyword = params.keyword || ''
    const difficulty = params.difficulty
    const rows = questions.filter((item) => {
      const matchKeyword = !keyword || item.title.includes(keyword)
      const matchDifficulty = !difficulty || String(item.difficulty) === String(difficulty)
      return matchKeyword && matchDifficulty
    })
    return ok(pageRows(rows, params))
  }
  if (url === '/user/question/hot') return ok({ data: questions.slice(0, params.top || 8) })
  if (url === '/question/detail') return ok({ data: questionDetail(params.questionId) })
  if (url === '/question/pre') return ok({ data: questions[0].questionId })
  if (url === '/question/next') return ok({ data: questions[1].questionId })
  if (url === '/user/question/exe/result') {
    return ok({
      data: {
        pass: 1,
        exeMessage: '',
        userExeResultList: [
          { input: '2 7 11 15 / 9', output: '0 1', exeOutput: '0 1' },
          { input: '3 2 4 / 6', output: '1 2', exeOutput: '1 2' },
        ],
      },
    })
  }
  if (url === '/user/question/rabbit/submit') return ok()

  if (url === '/exam/semiLogin/redis/list') {
    const type = Number(params.type || 0)
    const rows = exams.filter((exam) => {
      const finished = new Date(exam.endTime) < now
      return type === 1 ? finished : !finished
    })
    return ok(pageRows(rows, params))
  }
  if (url === '/user/exam/enter') return ok()
  if (url === '/exam/semiLogin/rank/list') {
    return ok(pageRows([
      { examRank: 1, nickName: 'Alice', score: 500 },
      { examRank: 2, nickName: 'FlowPilot', score: 460 },
      { examRank: 3, nickName: 'Bob', score: 420 },
      { examRank: 4, nickName: 'Carol', score: 390 },
    ], params))
  }
  if (url === '/user/exam/list') return ok(pageRows(exams.filter((exam) => exam.enter), params))
  if (url === '/exam/getFirstQuestion') return ok({ data: questions[0].questionId })
  if (url === '/exam/pre') return ok({ data: questions[0].questionId })
  if (url === '/exam/next') return ok({ data: questions[1].questionId })

  if (url === '/user/message/list') {
    return ok(pageRows([
      { title: '竞赛报名成功', content: '你已成功报名春季算法挑战赛，请按时参赛。' },
      { title: '判题结果通知', content: '你提交的“两数之和”已通过全部测试用例。' },
      { title: '系统维护通知', content: '平台将在今晚 23:00 进行短暂维护。' },
    ], params))
  }

  return ok()
}
