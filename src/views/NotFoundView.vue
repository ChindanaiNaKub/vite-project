<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'
const props = withDefaults(
    defineProps<{
       resource: string
    }>(),
    {
        resource: 'page'
    }
)
</script>



<template>
    <h1>Oops!</h1>
    <h3>The {{ resource }} you are looking for is not found.</h3>
    <router-link :to="{name: 'event-list-view'}">Back to home</router-link>
</template>