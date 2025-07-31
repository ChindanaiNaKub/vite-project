<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { storeToRefs } from 'pinia'
const store = useMessageStore()
const { message } = storeToRefs(store)
</script>

<template>
  <div class="text-center font-sans text-gray-700 antialiased">
    <header>
      <div id="flashMessage" class="animate-pulse bg-yellow-200 p-4 mb-4" v-if="message">
        <h4 class="text-lg font-semibold">{{ message }}</h4>
      </div>
      <div class="wrapper">
        <nav class="py-6 px-8">
          <RouterLink class="font-bold text-gray-700 hover:text-green-600 transition-colors mx-2" exact-active-class="text-green-500 underline" :to="{ name: 'event-list-view' }">Event</RouterLink>
          <span class="text-gray-400 mx-2">|</span>
          <RouterLink class="font-bold text-gray-700 hover:text-green-600 transition-colors mx-2" exact-active-class="text-green-500 underline" :to="{ name: 'about' }">About</RouterLink>
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
