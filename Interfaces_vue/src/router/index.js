import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import AdminPage from '@/views/AdminPage.vue'
import Error404Page from '@/views/Error_404Page.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
       path: '/',
       name: 'home',
       component: HomePage,
     },
     {
      path:'/administrador',
      name:'administrador',
      component:AdminPage
     },
     {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: Error404Page
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

export default router
