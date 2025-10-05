<script setup lang="ts">
import InputText from '@/components/InputText.vue'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'

const authStore = useAuthStore()
const messageStore = useMessageStore()
const router = useRouter()

const validationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  firstname: yup
    .string()
    .required('First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastname: yup
    .string()
    .required('Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
})

const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: ''
  }
})

const { value: username } = useField<string>('username')
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
const { value: confirmPassword } = useField<string>('confirmPassword')
const { value: firstname } = useField<string>('firstname')
const { value: lastname } = useField<string>('lastname')

const onSubmit = handleSubmit((values) => {
  authStore
    .register({
      username: values.username,
      email: values.email,
      password: values.password,
      firstname: values.firstname,
      lastname: values.lastname
    })
    .then(() => {
      messageStore.updateMessage('Registration successful! Welcome!')
      setTimeout(() => {
        messageStore.restMessage()
      }, 3000)
      
      // Redirect to events page
      router.push({ name: 'event-list-view' })
    })
    .catch((error: any) => {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      messageStore.updateMessage(errorMessage)
      setTimeout(() => {
        messageStore.restMessage()
      }, 5000)
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
        Create your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="onSubmit">
        <!-- Username Field -->
        <div>
          <label for="username" class="block text-sm font-medium leading-6 text-gray-900">
            Username
          </label>
          <InputText
            type="text"
            v-model="username"
            placeholder="Choose a username"
            :error="errors['username']"
          />
        </div>

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
            Email address
          </label>
          <InputText
            type="email"
            v-model="email"
            placeholder="your.email@example.com"
            :error="errors['email']"
          />
        </div>

        <!-- First Name Field -->
        <div>
          <label for="firstname" class="block text-sm font-medium leading-6 text-gray-900">
            First Name
          </label>
          <InputText
            type="text"
            v-model="firstname"
            placeholder="First name"
            :error="errors['firstname']"
          />
        </div>

        <!-- Last Name Field -->
        <div>
          <label for="lastname" class="block text-sm font-medium leading-6 text-gray-900">
            Last Name
          </label>
          <InputText
            type="text"
            v-model="lastname"
            placeholder="Last name"
            :error="errors['lastname']"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
            Password
          </label>
          <InputText
            v-model="password"
            type="password"
            placeholder="Create a password (min 6 characters)"
            :error="errors['password']"
          />
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium leading-6 text-gray-900">
            Confirm Password
          </label>
          <InputText
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            :error="errors['confirmPassword']"
          />
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign up
          </button>
        </div>
      </form>

      <p class="mt-10 text-center text-sm text-gray-500">
        Already have an account?
        {{ ' ' }}
        <router-link
          to="/login"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Sign in here
        </router-link>
      </p>
    </div>
  </div>
</template>
