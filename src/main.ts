 import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'nprogress/nprogress.css'
import '@/services/AxiosInrceptorSetup.ts'

const app = createApp(App)

import {inject} from '@vercel/analytics'
import {injectSpeedInsights} from '@vercel/speed-insights'

inject()
injectSpeedInsights()

app.use(createPinia())
app.use(router)

app.mount('#app')
