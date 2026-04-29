import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/c-oj/home/question"
    },
    {
      path: "/c-oj/login",
      name: 'Login',
      component: () => import("@/views/Login.vue")
    },
    {
      path: "/c-oj/home",
      name: 'Home',
      redirect: '/c-oj/home/question',
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
          path: "problem-set/:setId",
          name: "ProblemSetDetail",
          component: () => import("@/views/ProblemSetDetail.vue"),
          meta: {
            showBanner: false
          }
        },
        {
          path: "problem-set-gallery",
          name: "ProblemSetGallery",
          component: () => import("@/views/ProblemSetGallery.vue"),
          meta: {
            showBanner: false
          }
        },
        {
          path: "exam/:examId",
          name: "ContestDetail",
          component: () => import("@/views/ContestDetail.vue"),
          meta: {
            showBanner: false
          }
        },
        {
          path: 'user/exam',
          name: "UserExam",
          component: () => import("@/views/UserExam.vue"),
          meta: {
            showBanner: false
          }
        },
        {
          path: 'user/detail',
          name: "UserDetail",
          component: () => import("@/views/UserDetail.vue"),
          meta: {
            showBanner: false
          }
        },
        {
          path: 'user/message',
          name: "UserMessage",
          component: () => import("@/views/UserMessage.vue"),
          meta: {
            showBanner: false
          }
        }
      ]
    },
    {
      path: "/c-oj/answer",
      name: "Answer",
      component: () => import("@/views/Answer.vue")
    },
    {
      path: "/c-oj/exam/result",
      name: "ExamResult",
      component: () => import("@/views/ExamResult.vue")
    }
  ],
})

export default router
