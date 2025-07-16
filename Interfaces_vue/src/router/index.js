import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import AdminPage from '@/views/AdminPage.vue'
import AuthPage from '@/views/AuthPage.vue'
import { useAuthStore } from '@/stores/Auth'
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
      component:AdminPage,
      meta: {
        requiresAuth: true,
        requiredRole: 'admin'
      }
     },
     {
      path: '/auth',
      name: 'auth',
      component: AuthPage
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

// 🔐 Protección de rutas
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Si no hay usuario en memoria, intenta verificar sesión con backend
  if (!auth.user && to.meta.requiresAuth) {
    const valid = await auth.checkSession()
    if (!valid) return next({ name: 'auth' })
  }

  // Redirige si no está autenticado
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'auth' })
  }

  // Verifica rol si se especifica en meta
  if (to.meta.requiredRole && auth.user?.role !== to.meta.requiredRole) {
    return next({ name: 'home' }) // o página 403
  }

  next()
})


export default router
