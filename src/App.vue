<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { mdiAccountPlus, mdiLogin, mdiLogout, mdiAccount } from '@mdi/js'
import TokenRefreshService from '@/services/TokenRefreshService'

const store = useMessageStore()
const authStore = useAuthStore()
const router = useRouter()
const { message } = storeToRefs(store)

// Reload auth state from localStorage
const token = localStorage.getItem('access_token')
const user = localStorage.getItem('user')
if (token && user) {
  authStore.reload(token, JSON.parse(user))
} else {
  authStore.logout()
}

// Start auto token refresh when app loads
onMounted(() => {
  if (authStore.token && authStore.refreshToken) {
    TokenRefreshService.startAutoRefresh()
  }
})

// Stop auto refresh when app unmounts
onUnmounted(() => {
  TokenRefreshService.stopAutoRefresh()
})

function logout() {
  TokenRefreshService.stopAutoRefresh()
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <SpeedInsights />
  <div class="text-center font-sans text-gray-700 antialiased">
    <header class="max-h-screen leading-normal">
      <div id="flashMessage" class="animate-pulse bg-yellow-200 p-4 mb-4" v-if="message">
        <h4 class="text-lg font-semibold">{{ message }}</h4>
      </div>
      <div class="wrapper">
        <nav class="flex justify-between items-center py-6">
          <div class="flex space-x-4">
            <RouterLink
              class="font-bold text-gray-700"
              exact-active-class="text-green-500"
              :to="{ name: 'event-list-view' }"
              >Event</RouterLink
            >
            <RouterLink
              class="font-bold text-gray-700"
              exact-active-class="text-green-500"
              :to="{ name: 'organization-list' }"
              >Organizations</RouterLink
            >
            <RouterLink
              class="font-bold text-gray-700"
              exact-active-class="text-green-500"
              :to="{ name: 'about' }"
              >About</RouterLink
            >
            <span v-if="authStore.isAdmin">
              <RouterLink
                class="font-bold text-gray-700"
                exact-active-class="text-green-500"
                :to="{ name: 'add-event' }"
                >New Event</RouterLink
              >
            </span>
            <RouterLink
              class="font-bold text-gray-700"
              exact-active-class="text-green-500"
              :to="{ name: 'auction-list' }"
              >Auctions</RouterLink
            >
          </div>
          <ul v-if="!authStore.currentUserName" class="flex navbar-nav ml-auto space-x-2">
            <li class="nav-item px-2">
              <router-link to="/register" class="nav-link">
                <div class="flex items-center hover:text-indigo-600">
                  <SvgIcon type="mdi" :path="mdiAccountPlus" />
                  <span class="ml-2">Sign Up</span>
                </div>
              </router-link>
            </li>
            <li class="nav-item px-2">
              <router-link to="/login" class="nav-link">
                <div class="flex items-center hover:text-indigo-600">
                  <SvgIcon type="mdi" :path="mdiLogin" />
                  <span class="ml-2">Login</span>
                </div>
              </router-link>
            </li>
          </ul>
          <ul v-if="authStore.currentUserName" class="flex navbar-nav ml-auto space-x-2">
            <li class="nav-item px-2">
              <router-link to="/profile" class="nav-link">
                <div class="flex items-center hover:text-indigo-600">
                  <SvgIcon type="mdi" :path="mdiAccount" />
                  <span class="ml-2">{{ authStore.currentUserName }}</span>
                </div>
              </router-link>
            </li>
            <li class="nav-item px-2">
              <a class="nav-link hover:cursor-pointer" @click="logout">
                <div class="flex items-center hover:text-indigo-600">
                  <SvgIcon type="mdi" :path="mdiLogout" />
                  <span class="ml-2">LogOut</span>
                </div>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<style>
/* Global styles that can't be easily converted to Tailwind */
h2 {
  font-size: 20px;
}

/* Flash message animation */
@keyframes yellofade {
  from {
    background-color: yellow;
  }
  to {
    background-color: transparent;
  }
}

#flashMessage {
  animation: yellofade 3s ease-in-out;
}
</style>
