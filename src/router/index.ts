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
import EventService from '@/services/EventService'
import { useEventStore } from '@/stores/event'
import AddEventView from '@/views/event/EventFormView.vue'
import OrganizationFormView from '@/views/OrganizationFormView.vue'
import OrganizationListView from '@/views/OrganizationListView.vue'
import AuctionListView from '@/views/AuctionListView.vue'


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
      path: '/auctions',
      name: 'auction-list',
      component: AuctionListView
    },
    {
      path: '/event/:id',
      name: 'event-layout-view',
      component: EventLayoutView,
      props: true,
      beforeEnter: (to) => {
        // put API call here
        const id = parseInt(to.params.id as string)
        const eventStore = useEventStore()
        return EventService.getEvent(id)
          .then((response) => {
            // need to setup the data for the event
            eventStore.setEvent(response.data)
          })
          .catch((error) => {
            if (error.response && error.response.status === 404) {
              return { name: '404-resource-view', params: { resource: 'event' } }
            }
            return { name: 'network-error-view' }
          })
      },
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
      path: '/add-event',
      name: 'add-event',
      component: AddEventView
    },
    {
      path: '/add-organization',
      name: 'add-organization',
      component: OrganizationFormView
    },
    {
      path: '/organizations',
      name: 'organization-list',
      component: OrganizationListView
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach(() => {
  nProgress.start()
})
router.afterEach(() => {
  nProgress.done()
})

export default router
