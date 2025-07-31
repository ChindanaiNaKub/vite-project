<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { storeToRefs } from 'pinia'
const store = useMessageStore()
const { message } = storeToRefs(store)
</script>

<template>
  <div id="text-center font-sans text-gray-700 antialias">
    <header>
      <div id="flashMessage" v-if="message">
        <h4>{{ message }}</h4>
      </div>
      <div class="wrapper">
        <nav>
          <RouterLink :to="{ name: 'event-list-view' }">Event</RouterLink>
          <span class="nav-separator">|</span>
          <RouterLink :to="{ name: 'about' }">About</RouterLink>
          <span class="nav-separator">|</span>
          <RouterLink :to="{ name: 'Students' }">Student</RouterLink>
        </nav>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<style>
nav {
  padding: 30px;
  font-weight: bold;
  color: #2c3e50;
}
nav a {
  color: #2c3e50;
  text-decoration: none;
  margin: 0 5px;
  transition: color 0.2s;
}
nav a.router-link-exact-active {
  color: #42b983;
  text-decoration: underline;
}
nav a:hover {
  color: #005a3c;
}
.nav-separator {
  margin: 0 8px;
  color: #888;
}
h2 {
  font-size: 20px;
}
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
