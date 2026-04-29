const problemCatalog = [
  { questionId: 1001, title: '两数之和', difficulty: 1, acRate: '91%', topic: '数组 / 哈希' },
  { questionId: 1002, title: '最长无重复子串', difficulty: 2, acRate: '63%', topic: '滑动窗口' },
  { questionId: 1003, title: '合并 K 个升序链表', difficulty: 3, acRate: '38%', topic: '链表 / 堆' },
  { questionId: 1004, title: '岛屿数量', difficulty: 2, acRate: '58%', topic: 'DFS / BFS' },
  { questionId: 1005, title: '有效括号', difficulty: 1, acRate: '86%', topic: '栈' },
  { questionId: 1006, title: '最短路径计数', difficulty: 3, acRate: '31%', topic: '图论 / 最短路' },
  { questionId: 1007, title: '区间合并', difficulty: 2, acRate: '67%', topic: '排序 / 区间' },
  { questionId: 1008, title: '二叉树层序遍历', difficulty: 1, acRate: '82%', topic: '树 / 队列' },
]

const byId = (ids) => ids.map((id) => problemCatalog.find((item) => item.questionId === id)).filter(Boolean)

export const featuredProblemSets = [
  {
    id: 'beginner-basics',
    eyebrow: 'Beginner Basics',
    title: '新手基础训练',
    description: '用数组、栈、字符串这些高频模型建立第一层算法直觉。',
    total: 4,
    focus: '数组、字符串、栈',
    gradientClass: 'from-emerald-to-teal',
    problems: byId([1001, 1005, 1008, 1007]),
  },
  {
    id: 'interview-core',
    eyebrow: 'Interview Core',
    title: '面试核心 30 题',
    description: '围绕窗口、链表、区间和树结构，训练可迁移的解题范式。',
    total: 6,
    focus: '滑动窗口、链表、树',
    gradientClass: 'from-sky-to-indigo',
    problems: byId([1002, 1003, 1007, 1008, 1001, 1005]),
  },
  {
    id: 'hardcore-algorithms',
    eyebrow: 'Hardcore Algorithms',
    title: '硬核算法进阶',
    description: '面向高阶竞赛与强筛面试，集中突破图论、搜索和复杂结构。',
    total: 5,
    focus: '图论、堆、搜索',
    gradientClass: 'from-indigo-to-violet',
    problems: byId([1006, 1003, 1004, 1002, 1007]),
  },
  {
    id: 'daily-consistency',
    eyebrow: 'Daily Flow',
    title: '每日稳定 AC',
    description: '轻量但连续的每日训练歌单，用小步反馈维持手感。',
    total: 5,
    focus: '综合节奏训练',
    gradientClass: 'from-amber-to-rose',
    problems: byId([1001, 1002, 1005, 1007, 1008]),
  },
]

export const dailyLeaderboards = {
  'beginner-basics': [
    { name: 'FlowPilot', ac: 14, avatar: 'FP' },
    { name: 'ArrayAce', ac: 12, avatar: 'AA' },
    { name: 'StackMuse', ac: 11, avatar: 'SM' },
    { name: 'ByteRiver', ac: 9, avatar: 'BR' },
    { name: 'NovaCode', ac: 8, avatar: 'NC' },
    { name: 'LintWave', ac: 7, avatar: 'LW' },
    { name: 'CodeMint', ac: 7, avatar: 'CM' },
    { name: 'LoopLight', ac: 6, avatar: 'LL' },
    { name: 'RunCase', ac: 5, avatar: 'RC' },
    { name: 'AlgoRay', ac: 5, avatar: 'AR' },
  ],
  'interview-core': [
    { name: 'HeapHero', ac: 13, avatar: 'HH' },
    { name: 'FlowPilot', ac: 12, avatar: 'FP' },
    { name: 'TreeLine', ac: 10, avatar: 'TL' },
    { name: 'DequeLab', ac: 9, avatar: 'DL' },
    { name: 'BitGarden', ac: 8, avatar: 'BG' },
    { name: 'StackMuse', ac: 8, avatar: 'SM' },
    { name: 'MergeWay', ac: 7, avatar: 'MW' },
    { name: 'HashMode', ac: 6, avatar: 'HM' },
    { name: 'QueueNova', ac: 5, avatar: 'QN' },
    { name: 'CodeMint', ac: 4, avatar: 'CM' },
  ],
  'hardcore-algorithms': [
    { name: 'GraphPrime', ac: 9, avatar: 'GP' },
    { name: 'DijkstraX', ac: 8, avatar: 'DX' },
    { name: 'HeapHero', ac: 7, avatar: 'HH' },
    { name: 'FlowPilot', ac: 6, avatar: 'FP' },
    { name: 'SearchLab', ac: 6, avatar: 'SL' },
    { name: 'TopoMuse', ac: 5, avatar: 'TM' },
    { name: 'UnionFind', ac: 5, avatar: 'UF' },
    { name: 'BitGarden', ac: 4, avatar: 'BG' },
    { name: 'AlgoRay', ac: 4, avatar: 'AR' },
    { name: 'RunCase', ac: 3, avatar: 'RC' },
  ],
  'daily-consistency': [
    { name: 'NovaCode', ac: 16, avatar: 'NC' },
    { name: 'FlowPilot', ac: 15, avatar: 'FP' },
    { name: 'LoopLight', ac: 13, avatar: 'LL' },
    { name: 'ArrayAce', ac: 11, avatar: 'AA' },
    { name: 'CodeMint', ac: 10, avatar: 'CM' },
    { name: 'RunCase', ac: 9, avatar: 'RC' },
    { name: 'TreeLine', ac: 8, avatar: 'TL' },
    { name: 'DequeLab', ac: 7, avatar: 'DL' },
    { name: 'HashMode', ac: 6, avatar: 'HM' },
    { name: 'ByteRiver', ac: 5, avatar: 'BR' },
  ],
}

export function getProblemSetById(id) {
  return featuredProblemSets.find((item) => item.id === id) || featuredProblemSets[0]
}

export function getLeaderboardBySetId(id) {
  return dailyLeaderboards[id] || dailyLeaderboards[featuredProblemSets[0].id]
}
