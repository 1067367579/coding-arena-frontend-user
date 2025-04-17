import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/c-oj/home/exam"
    },
    {
      path: "/c-oj/login",
      name: 'Login',
      component: () => import("@/views/Login.vue")
    },
    {
      path: "/c-oj/home",
      name: 'Home',
      component: () => import("@/views/Home.vue"),
      children: [
        {
          path: "question",
          name: "Question",
          component: () => import("@/views/Question.vue"),
          meta: {
            showBanner: true
          }
        },
        {
          path: "exam",
          name: "Exam",
          component: () => import("@/views/Exam.vue"),
          meta: {
            showBanner: true
          }
        },
        {
          path: 'user/exam',
          name: "UserExam",
          component: () => import("@/views/UserExam.vue"),
          meta: {
            showBanner: false
          }
        }
      ]
    },
  ],
})

export default router
