<template>
   <div class="min-h-screen flex items-center justify-center p-6">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-red-600 mb-4">Uh-Oh!</h1>
      <h3 class="text-lg text-gray-700 mb-6">
          It looks like we hit a snag. Please take a breath and
          <a href="#" @click="$router.go(-1)" class="text-blue-500 hover:text-blue-700 underline">Click here</a> to try again.
      </h3>
    </div>
   </div>
</template>