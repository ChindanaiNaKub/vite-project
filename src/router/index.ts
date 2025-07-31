import { createRouter, createWebHistory } from 'vue-router'
import EventListView from '@/views/EventListView.vue'
import AboutView from '@/views/AboutView.vue'
import EventDetailView from '@/views/EventDetailView.vue'
import EventRegisterView from '@/views/event/RegisterView.vue'
import EventEditView from '@/views/event/EditView.vue'
import EventLayoutView from '@/views/event/LayoutView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import NetworkErrorView from '@/views/NetWorkErrorView.vue'
import nProgress from 'nprogress'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'event-list-view',
      component: EventListView,
      props: (route) => {
        let page = Number(route.query.page)
        if (!page || isNaN(page) || page < 1) page = 1
        let pageSize = Number(route.query.pageSize)
        if (!pageSize || isNaN(pageSize) || pageSize < 1) pageSize = 2
        return { page, pageSize }
      },
    },
    {
      path: '/event/:id',
      name: 'event-layout-view',
      component: EventLayoutView,
      props: true,
      children: [
        { path: '', name: 'event-detail-view', component: EventDetailView, props: true },
        {
          path: 'register',
          name: 'event-register-view',
          component: EventRegisterView,
          props: true,
        },
        { path: 'edit', name: 'event-edit-view', component: EventEditView, props: true },
      ],
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
      path: '/network-error',
      name: 'network-error',
      component: NetworkErrorView,
    },
    {
      path: '/404/:resource',
      name: '404-resource-view',
      component: NotFoundView,
      props: true,
    },
    {
      path: '/:catchAll(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
    {
      path: '/students',
      name: 'Students',
      component: () => import('@/views/StudentListView.vue'),
    },
  ],
})

router.beforeEach(() => {
  nProgress.start()
})
router.afterEach(() => {
  nProgress.done()
})

export default router
