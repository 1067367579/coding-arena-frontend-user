const STORAGE_KEY = "oj_code_storage";

// 保存代码（自动区分刷题/竞赛模式）
export function saveCode(examId, questionId, code) {
  let storage = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    practice: {}, // 刷题模式（examId为空时）
    exam: {}, // 竞赛模式（examId存在时）
  };

  // 判断存储类型
  const storageType = examId ? "exam" : "practice";
  // 初始化存储层级
  if (storageType === "practice") {
    storage.practice[questionId] = code;
  } else {
    if (!storage.exam[examId]) storage.exam[examId] = {};
    storage.exam[examId][questionId] = code;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

// 加载代码（自动区分刷题/竞赛模式）
export function loadCode(examId, questionId) {
  const storage = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    practice: {},
    exam: {},
  };
  const storageType = examId ? "exam" : "practice";
  return storageType === "practice"
    ? storage.practice[questionId]
    : storage.exam[examId]?.[questionId];
}

// 删除指定题目代码
export function deleteCode(examId, questionId) {
  const storage = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const storageType = examId ? "exam" : "practice";
  if (storageType === "practice") {
    delete storage.practice[questionId];
  } else {
    if (storage.exam[examId]) {
      delete storage.exam[examId][questionId];
      // 清理空竞赛节点
      if (Object.keys(storage.exam[examId]).length === 0) {
        delete storage.exam[examId];
      }
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

// 清理所有存储（如退出页面时）
export function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
