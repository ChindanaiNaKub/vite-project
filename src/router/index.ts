import { createRouter, createWebHistory } from 'vue-router'
import EventListView from '@/views/EventListView.vue'
import AboutView from '@/views/AboutView.vue'
import EventDetailView from '@/views/EventDetailView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'event-list-view',
      component: EventListView,
      props: route => {
        let page = Number(route.query.page)
        if (!page || isNaN(page) || page < 1) page = 1
        let pageSize = Number(route.query.pageSize)
        if (!pageSize || isNaN(pageSize) || pageSize < 1) pageSize = 2
        return { page, pageSize }
      },
    },
    {
      path: '/event/:id',
      name: 'event-detail-view',
      component: EventDetailView,
      props: true,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: AboutView,
    },
    {
      path: '/students',
      name: 'Students',
      component: () => import('@/views/StudentListView.vue'),
    },
  ],
})

export default router
