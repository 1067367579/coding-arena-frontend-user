// src/utils/eventBus.js
export const eventBus = {
    // 存储事件回调的对象
    events: {},
  
    // 监听事件（$on）
    $on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = []; // 初始化事件队列
      }
      this.events[event].push(callback); // 添加回调函数
    },
  
    // 触发事件（$emit）
    $emit(event, ...args) {
      if (this.events[event]) {
        // 遍历并执行所有回调函数
        this.events[event].forEach(callback => callback(...args));
      }
    },
  
    // 移除事件监听（$off）
    $off(event, callback) {
      if (this.events[event]) {
        // 过滤掉指定的回调函数
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      }
    }
  };