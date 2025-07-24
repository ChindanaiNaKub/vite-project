<script lang="ts" setup>
import { toRefs } from 'vue';
import  { type Event } from '@/types'
import { useRouter } from 'vue-router'
const props = defineProps<{
    event: Event
    id: string
}>()
const { event } = toRefs(props)
const router = useRouter()
const register = () => {
    // if regis api call successful
    // push back to the event details view
    router.push({ name: 'event-detail-view'})
}
</script>

<template>
 <p>Register event here</p>
 <button @click="register">Register</button>
</template>
