import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

/**
 * Route definitions.
 *
 * The landing view is imported eagerly because it is the first paint.
 * Every other view is lazy-loaded so Vite emits a separate chunk per
 * route and the initial bundle stays small.
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home' },
  },
  {
    path: '/courses',
    name: 'courses',
    component: () => import('@/views/CoursesView.vue'),
    meta: { title: 'Browse courses' },
  },
  {
    path: '/courses/:id',
    name: 'course-detail',
    component: () => import('@/views/CourseDetailView.vue'),
    props: true,
    meta: { title: 'Course detail' },
  },
  {
    path: '/my-learning',
    name: 'my-learning',
    component: () => import('@/views/MyLearningView.vue'),
    meta: { title: 'My learning' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'Profile' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page not found' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// Keep the document title in step with the active route for
// screen-reader users and browser history alike.
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · LearnSphere` : 'LearnSphere'
})

export default router
