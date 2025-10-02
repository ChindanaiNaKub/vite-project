<script setup lang="ts">
import InputText from '@/components/InputText.vue'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'
import TokenRefreshService from '@/services/TokenRefreshService'

const authStore = useAuthStore()
const messageStore = useMessageStore()
const router = useRouter()

// Check if user was redirected here due to session expiration
const sessionExpiredMessage = router.currentRoute.value.query.message as string
const redirectPath = router.currentRoute.value.query.redirect as string

if (sessionExpiredMessage) {
  messageStore.updateMessage(sessionExpiredMessage)
  setTimeout(() => {
    messageStore.restMessage()
  }, 5000)
}

const validationSchema = yup.object({
  email: yup.string().required('The email is required'),
  password: yup.string().required('The password is required')
})

const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    email: '',
    password: ''
  }
})

const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit((values) => {
  authStore
    .login(values.email, values.password)
    .then(() => {
      // Start automatic token refresh
      TokenRefreshService.startAutoRefresh()
      
      // Redirect back to where user was, or default to event list
      const destination = redirectPath || '/'
      router.push(destination)
    })
    .catch(() => {
      messageStore.updateMessage('Could not login')
      setTimeout(() => {
        messageStore.restMessage()
      }, 3000)
    })
})
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img
        class="mx-auto h-10 w-auto"
        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
        alt="Your Company"
      />
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>
    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900"
            >Email address</label
          >
          <InputText type="text" v-model="email" placeholder="Email address" :error="errors['email']" />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900"
              >Password</label
            >
            <div class="text-sm">
              <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500"
                >Forgot password?</a
              >
            </div>
          </div>
          <InputText
            v-model="password"
            type="password"
            placeholder="Password"
            :error="errors['password']"
          />
        </div>
        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
        </div>
      </form>
      <p class="mt-10 text-center text-sm text-gray-500">
        Not a member?
        {{ ' ' }}
        <router-link
          to="/register"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Try to register here
        </router-link>
      </p>
    </div>
  </div>
</template>
