import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/c-oj/home"
    },
    {
      path: "/c-oj/login",
      name: 'Login',
      component: () => import("@/views/Login.vue")
    },
    {
      path: "/c-oj/home",
      name: 'Home',
      component: () => import("@/views/Home.vue")
    },
  ],
})

export default router
